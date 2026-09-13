/* Network reliability only. Imported by the existing notification worker.
 * No account data cache, background sync, mutation queue, or automatic retries.
 */
(() => {
  const CACHE = 'sodafom-network-assets-v1';
  const MAX_ENTRIES = 60;
  const MAX_BYTES = 2 * 1024 * 1024;
  const SLOW_MS = 4000;
  const READ_TIMEOUT_MS = 15000;
  const WRITE_TIMEOUT_MS = 60000;
  const ASSET_PATH = /^\/assets\/[a-zA-Z0-9_./-]+-[a-zA-Z0-9_-]{8,}\.(js|css|woff2?)$/;
  // Keep payment, admin, AI, scanner, authentication and push workflows out
  // of this recovery. Their feature-specific error/retry handling remains the
  // source of truth.
  const EXCLUDED_API_PATH = /^\/api\/(?:admin|ai(?:-teacher)?|auth|chat|checkout|homework-scan|promo|push|stripe|subscription|teacher|webhook)(?:\/|$)/;
  // Do not change the loading/error behaviour of adult, payment, AI, scanner
  // or teacher screens either. The generic offline page is only for the
  // public learning experience.
  const EXCLUDED_NAVIGATION_PATH = /^\/(?:admin(?:-panel)?(?:\/|$)|cart(?:\/|$)|checkout(?:\/|$)|homework-scan(?:\/|$)|subscribe(?:\/|$)|teacher-(?:hub|mode)(?:\/|$)|tutor(?:\/|$))/;
  const cacheableResponses = new WeakSet();
  let sequence = 0;
  let cacheWrites = Promise.resolve();

  const offlinePage = () => new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sodafom — connection paused</title><style>body{font:1.15rem/1.6 system-ui,sans-serif;max-width:36rem;margin:3rem auto;padding:1.5rem}a{display:inline-block;padding:.8rem 1.2rem;border:2px solid currentColor;border-radius:.6rem}h1{font-size:1.8rem}</style><main><h1>The internet connection has paused</h1><p>This page needs the internet to open. An activity already open in another tab can stay open.</p><p>When you are connected again, try opening Sodafom. Ask a grown-up to check any work you were sending before you send it again.</p><a href="/">Try opening Sodafom</a></main></html>`, {
    status: 503,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
    },
  });

  function notify(event, id, state) {
    if (!event.clientId) return;
    // Never send URLs, bodies, names, tokens, or exception details to the page.
    void self.clients.get(event.clientId).then(client => {
      if (client) client.postMessage({ type: 'sodafom-network', id, state });
    }).catch(() => {});
  }

  function failureResponse(write) {
    const message = write
      ? 'The connection paused while sending. Your work may have reached us. Ask a grown-up to check before sending it again.'
      : 'This needs the internet. You can keep an activity already open and try this again when you are connected.';
    return new Response(JSON.stringify({
      ok: false, error: message, message,
      code: 'NETWORK_UNAVAILABLE',
      ...(write ? { submissionStatus: 'unknown' } : {}),
    }), { status: 503, headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    } });
  }

  async function boundedFetch(event, timeoutMs, bufferAsset = false) {
    const request = event.request;
    const controller = new AbortController();
    const id = `${Date.now()}-${++sequence}`;
    let timeout;
    let slow;
    let abortListener;
    let attempted = false;
    const cancelled = new Promise((_, reject) => {
      abortListener = () => {
        controller.abort();
        reject(new Error('cancelled'));
      };
      request.signal.addEventListener('abort', abortListener, { once: true });
    });
    const deadline = new Promise((_, reject) => {
      timeout = setTimeout(() => {
        controller.abort();
        reject(new Error('deadline'));
      }, timeoutMs);
    });
    slow = setTimeout(() => notify(event, id, 'slow'), SLOW_MS);
    try {
      // Exactly one transport attempt. Never replay a POST/PUT/PATCH/DELETE.
      const operation = async () => {
        if (request.signal.aborted) throw new Error('cancelled');
        attempted = true;
        const response = await fetch(request, { signal: controller.signal });
        // Proxy outage pages may contain diagnostics. Do not show them to children.
        if ([502, 503, 504].includes(response.status)) {
          void response.body?.cancel().catch(() => {});
          throw new Error('unavailable');
        }
        // Include JSON body download in the same deadline. Otherwise headers can
        // arrive while response.json() freezes indefinitely after a dropout.
        // Buffer selected public build files too; leave API media/event streams
        // streaming. Those streams retain their feature-owned lifecycle.
        const mime = (response.headers.get('Content-Type') || '').split(';')[0].trim();
        const json = /^(?:application\/json|application\/[a-z0-9.+-]+\+json)$/i.test(mime);
        if (response.body && (json || bufferAsset)) {
          const body = await response.arrayBuffer();
          if (json) JSON.parse(new TextDecoder().decode(body));
          const headers = new Headers(response.headers);
          // fetch() has already decoded compressed content. Do not attach stale
          // encoding/length metadata to the reconstructed decoded JSON body.
          headers.delete('Content-Encoding');
          headers.set('Content-Length', String(body.byteLength));
          const result = new Response(body, { status: response.status, statusText: response.statusText, headers });
          // Rebuilding a Response drops its redirected flag and original length.
          // Evaluate the original headers/redirect before permitting any cache.
          if (bufferAsset && mayCache(response) && body.byteLength <= MAX_BYTES) {
            cacheableResponses.add(result);
          }
          return result;
        }
        return response;
      };
      const response = await Promise.race([operation(), deadline, cancelled]);
      notify(event, id, 'settled');
      return response;
    } catch (_) {
      if (request.signal.aborted) {
        // Cancelling a sent write does not prove the server did not accept it.
        const uncertain = attempted && !['GET', 'HEAD'].includes(request.method);
        notify(event, id, uncertain ? 'uncertain' : 'settled');
        return Response.error();
      }
      const write = !['GET', 'HEAD'].includes(request.method);
      notify(event, id, write ? 'uncertain' : 'unavailable');
      return request.mode === 'navigate' ? offlinePage() : failureResponse(write);
    } finally {
      clearTimeout(timeout);
      clearTimeout(slow);
      request.signal.removeEventListener('abort', abortListener);
    }
  }

  function isPublicAsset(request, url) {
    return request.method === 'GET' && !url.search && !url.hash &&
      ASSET_PATH.test(url.pathname) &&
      !request.headers.has('Authorization') && !request.headers.has('Range') &&
      request.cache !== 'no-store';
  }

  function isControlledApi(url) {
    return (url.pathname === '/api' || url.pathname.startsWith('/api/')) &&
      !EXCLUDED_API_PATH.test(url.pathname);
  }

  function isExcludedNavigation(url) {
    return EXCLUDED_NAVIGATION_PATH.test(url.pathname);
  }

  function mayCache(response) {
    const size = Number(response.headers.get('Content-Length'));
    const policy = response.headers.get('Cache-Control') || '';
    const vary = response.headers.get('Vary') || '';
    const mime = (response.headers.get('Content-Type') || '').split(';')[0].trim().toLowerCase();
    return response.status === 200 && !response.redirected &&
      size > 0 && size <= MAX_BYTES &&
      !/(?:no-store|no-cache|private)/i.test(policy) && !/(?:\*|cookie|authorization)/i.test(vary) &&
      /^(?:text\/(?:css|javascript)|application\/(?:javascript|x-javascript|font-woff)|font\/woff2?)$/.test(mime);
  }

  async function publicAsset(event) {
    const request = event.request;
    try {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(request);
      if (hit) return hit;
    } catch (_) { /* Cache unavailable: normal network still works. */ }
    const response = await boundedFetch(event, READ_TIMEOUT_MS, true);
    if (cacheableResponses.has(response)) {
      const copy = response.clone();
      // Serialize writes and evictions, and touch only this public-asset cache.
      cacheWrites = cacheWrites.then(async () => {
        const cache = await caches.open(CACHE);
        // The bounded download already checked the actual decoded byte count.
        await cache.put(request, copy);
        const keys = await cache.keys();
        for (const key of keys.slice(0, Math.max(0, keys.length - MAX_ENTRIES))) {
          await cache.delete(key);
        }
      }).catch(() => {});
      event.waitUntil(cacheWrites);
    }
    return response;
  }

  self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin || !/^https?:$/.test(url.protocol)) return;
    if (isControlledApi(url)) {
      const write = !['GET', 'HEAD'].includes(event.request.method);
      event.respondWith(boundedFetch(event, write ? WRITE_TIMEOUT_MS : READ_TIMEOUT_MS));
    } else if (event.request.method === 'GET' && event.request.mode === 'navigate' && !isExcludedNavigation(url)) {
      // Never cache HTML, including child/parent/teacher/admin screens.
      event.respondWith(boundedFetch(event, READ_TIMEOUT_MS));
    } else if (isPublicAsset(event.request, url)) {
      event.respondWith(publicAsset(event));
    }
  });
})();

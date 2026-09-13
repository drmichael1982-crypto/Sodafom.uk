/** Loopback-only synthetic fixture. NEVER run as the production app. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { stripTypeScriptTypes } from 'node:module';
import { ROOT, fakeDatabase, routes, invoke } from './agent28-test-support.mjs';
const database = fakeDatabase();
let apiUnavailable = false;
const handlers = await routes(database, async ({ headers }) => {
  const id = /(?:^|;\s*)agent28_fixture_parent=(parent-[ab])(?:;|$)/.exec(headers.get('cookie') ?? '')?.[1];
  return id ? { user: { id } } : null;
});
const moduleCode = stripTypeScriptTypes(fs.readFileSync(path.join(ROOT, 'src/lib/game-level-persistence.ts'), 'utf8'), { mode: 'transform' });
const html = `<!doctype html><meta charset="utf-8"><title>Agent 28 isolated save fixture</title>
<h1>Isolated persistence fixture</h1><p>Synthetic records only. Not the Sodafom application.</p><pre id="state"></pre>
<script type="module">
import {GameLevelPersistence} from '/persistence.js';
window.make = async (userId, childId) => {
  let storage = null; try {storage = window.localStorage;} catch {}
  window.client = new GameLevelPersistence('number-pop', userId && childId ? {userId,childId} : null,
    {storage,fetcher:(...args)=>fetch(...args),apiPrefix:'/api',timeoutMs:2000});
  const show = () => document.getElementById('state').textContent = JSON.stringify(window.client.snapshot(),null,2);
  window.client.subscribe(show); await window.client.load(); show(); return window.client.snapshot();
}; window.fixtureReady = true;
</script>`;
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/persistence.js') {
      res.setHeader('Content-Type', 'text/javascript'); res.end(moduleCode); return;
    }
    if (url.pathname === '/test/fail') { apiUnavailable = url.searchParams.get('value') === '1'; res.end('ok'); return; }
    if (url.pathname === '/test/state') { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(database.state())); return; }
    const match = /^\/api\/children\/(\d+)\/game-level\/([^/]+)$/.exec(url.pathname);
    if (match) {
      if (apiUnavailable) { res.statusCode = 503; res.end('Synthetic outage'); return; }
      const chunks = []; for await (const chunk of req) chunks.push(chunk);
      const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {};
      const result = await invoke(req.method === 'POST' ? handlers.gamePost : handlers.gameGet, {
        childId: match[1], gameSlug: decodeURIComponent(match[2]), body, headers: req.headers,
      });
      for (const [key, value] of Object.entries(result.headers)) res.setHeader(key, value);
      res.setHeader('Content-Type', 'application/json'); res.statusCode = result.code; res.end(JSON.stringify(result.body)); return;
    }
    res.setHeader('Content-Type', 'text/html'); res.setHeader('Cache-Control', 'no-store'); res.end(html);
  } catch { res.statusCode = 500; res.end('Synthetic fixture failure'); }
});
server.listen(0, '127.0.0.1', () => console.log(`AGENT28_FIXTURE_PORT=${server.address().port}`));
const close = () => server.close(() => process.exit(0));
process.on('SIGTERM', close); process.on('SIGINT', close);

/** Connection feedback only: never reload, clear progress, or replay requests. */
export const NETWORK_MESSAGES = {
  offline: 'The internet connection has paused. You can carry on with activities already open. New questions, scans and sending work need the internet. Keep this page open.',
  slow: 'The connection is taking a little longer. Keep this page open. You do not need to press send again.',
  unavailable: 'This needs the internet. Keep your activity open and try again when you are connected.',
  uncertain: 'The connection paused while sending. Your work may have reached us. Ask a grown-up to check before sending it again.',
  online: 'Your connection is back. You can try online activities again.',
} as const;

type NetworkState = keyof typeof NETWORK_MESSAGES;
let stop: (() => void) | undefined;

export function startNetworkSupport(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {};
  if (stop) return stop;
  const app = document.getElementById('app');
  if (!app?.parentNode) return () => {};
  const banner = document.createElement('aside');
  banner.id = 'sodafom-network-status';
  banner.setAttribute('aria-label', 'Internet connection');
  banner.style.cssText = 'box-sizing:border-box;width:100%;padding:12px 16px;font:inherit;line-height:1.5;background:#fff8df;color:#352900;border-bottom:2px solid #d6b866;overflow-wrap:anywhere;';
  banner.hidden = true;
  const message = document.createElement('span');
  message.setAttribute('role', 'status');
  message.setAttribute('aria-live', 'polite');
  message.setAttribute('aria-atomic', 'true');
  let activeState: NetworkState | undefined;
  let dismissedState: NetworkState | undefined;
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = 'Close message';
  close.style.cssText = 'font:inherit;min-height:44px;padding:8px 12px;margin:4px 0 0 12px;border:1px solid currentColor;border-radius:6px;background:transparent;color:inherit;';
  close.addEventListener('click', () => { dismissedState = activeState; banner.hidden = true; });
  banner.append(message, close);
  app.parentNode.insertBefore(banner, app);

  const pending = new Set<string>();
  const completed = new Set<string>();
  let failure: 'uncertain' | 'unavailable' | undefined;
  let dismissTimer: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;
  let registering = false;
  let registered = false;
  const worker = navigator.serviceWorker;
  const show = (state: NetworkState) => {
    clearTimeout(dismissTimer);
    activeState = state;
    if (dismissedState === state) return;
    dismissedState = undefined;
    if (message.textContent !== NETWORK_MESSAGES[state]) message.textContent = NETWORK_MESSAGES[state];
    banner.hidden = false;
  };
  const render = () => {
    if (failure === 'uncertain') show('uncertain');
    else if (navigator.onLine === false) show('offline');
    else if (failure) show(failure);
    else if (pending.size) show('slow');
    else banner.hidden = true;
  };
  const onOffline = () => { dismissedState = undefined; render(); };
  const onOnline = () => {
    // An online signal does not prove an earlier submission succeeded.
    if (failure === 'uncertain') render();
    else {
      failure = undefined;
      if (pending.size) render();
      else {
        show('online');
        dismissTimer = setTimeout(() => { if (!failure && !pending.size) banner.hidden = true; }, 5000);
      }
    }
    register();
  };
  const onMessage = (event: MessageEvent) => {
    const data = event.data;
    if (!data || data.type !== 'sodafom-network' || typeof data.id !== 'string' || data.id.length > 80) return;
    if (!['slow', 'settled', 'unavailable', 'uncertain'].includes(data.state)) return;
    if (data.state === 'slow') {
      if (completed.has(data.id)) return;
      if (pending.size < 100) pending.add(data.id);
    } else {
      pending.delete(data.id);
      completed.add(data.id);
      if (completed.size > 100) completed.delete(completed.values().next().value!);
      if (data.state === 'uncertain') { failure = 'uncertain'; dismissedState = undefined; }
      else if (data.state === 'unavailable' && failure !== 'uncertain') { failure = 'unavailable'; dismissedState = undefined; }
      else if (data.state === 'settled' && failure === 'unavailable') failure = undefined;
    }
    render();
  };
  function register() {
    const nativeApp = Boolean((window as Window & { Capacitor?: unknown }).Capacitor);
    if (stopped || registering || registered || !worker || nativeApp || !window.isSecureContext) return;
    if (!['http:', 'https:'].includes(window.location.protocol)) return;
    registering = true;
    // This is the same worker used by notifications. Registration requests no
    // notification, microphone, or camera permission and never reloads the tab.
    void worker.register('/sw.js', { scope: '/' }).then(() => {
      registered = true;
    }).catch(() => {
      // A first offline visit/private browser may not support registration.
      // The activity and connection messages must still work.
    }).finally(() => { registering = false; });
  }
  window.addEventListener('offline', onOffline);
  window.addEventListener('online', onOnline);
  worker?.addEventListener('message', onMessage);
  render();
  register();
  stop = () => {
    stopped = true;
    clearTimeout(dismissTimer);
    window.removeEventListener('offline', onOffline);
    window.removeEventListener('online', onOnline);
    worker?.removeEventListener('message', onMessage);
    banner.remove();
    pending.clear();
    completed.clear();
    stop = undefined;
  };
  return stop;
}

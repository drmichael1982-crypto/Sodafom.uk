import { afterEach, describe, expect, it, vi } from 'vitest';
import { NETWORK_MESSAGES, startNetworkSupport } from '../network-status';

class FakeServiceWorker extends EventTarget {
  register = vi.fn(async () => ({}));
}

const serviceWorkerDescriptor = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker');
const onlineDescriptor = Object.getOwnPropertyDescriptor(navigator, 'onLine');
const secureDescriptor = Object.getOwnPropertyDescriptor(window, 'isSecureContext');
const capacitorDescriptor = Object.getOwnPropertyDescriptor(window, 'Capacitor');
let stop: (() => void) | undefined;

function setEnvironment(worker: FakeServiceWorker | undefined, online = true, secure = true) {
  document.body.innerHTML = '<div id="app"></div>';
  Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: worker });
  Object.defineProperty(navigator, 'onLine', { configurable: true, value: online });
  Object.defineProperty(window, 'isSecureContext', { configurable: true, value: secure });
  Reflect.deleteProperty(window, 'Capacitor');
}

function message(worker: FakeServiceWorker, id: string, state: 'slow' | 'settled' | 'unavailable' | 'uncertain') {
  worker.dispatchEvent(new MessageEvent('message', { data: { type: 'sodafom-network', id, state } }));
}

afterEach(() => {
  stop?.();
  stop = undefined;
  document.body.innerHTML = '';
  if (serviceWorkerDescriptor) Object.defineProperty(navigator, 'serviceWorker', serviceWorkerDescriptor);
  else Reflect.deleteProperty(navigator, 'serviceWorker');
  if (onlineDescriptor) Object.defineProperty(navigator, 'onLine', onlineDescriptor);
  else Reflect.deleteProperty(navigator, 'onLine');
  if (secureDescriptor) Object.defineProperty(window, 'isSecureContext', secureDescriptor);
  else Reflect.deleteProperty(window, 'isSecureContext');
  if (capacitorDescriptor) Object.defineProperty(window, 'Capacitor', capacitorDescriptor);
  else Reflect.deleteProperty(window, 'Capacitor');
});

describe('connection status feedback', () => {
  it('shows a child-safe offline message and retains the activity root', async () => {
    const worker = new FakeServiceWorker();
    setEnvironment(worker, false);
    const app = document.getElementById('app');
    stop = startNetworkSupport();
    await Promise.resolve();

    const banner = document.getElementById('sodafom-network-status');
    expect(banner).not.toBeNull();
    expect(banner?.textContent).toContain(NETWORK_MESSAGES.offline);
    expect(banner?.hidden).toBe(false);
    expect(document.getElementById('app')).toBe(app);
    expect(worker.register).toHaveBeenCalledWith('/sw.js', { scope: '/' });
  });

  it('uses worker states without treating reconnect as proof that a write succeeded', () => {
    const worker = new FakeServiceWorker();
    setEnvironment(worker);
    stop = startNetworkSupport();
    const banner = document.getElementById('sodafom-network-status')!;

    message(worker, 'read-1', 'slow');
    expect(banner.textContent).toContain(NETWORK_MESSAGES.slow);
    message(worker, 'write-1', 'uncertain');
    expect(banner.textContent).toContain(NETWORK_MESSAGES.uncertain);

    window.dispatchEvent(new Event('online'));
    expect(banner.textContent).toContain(NETWORK_MESSAGES.uncertain);
    message(worker, 'read-1', 'settled');
    expect(banner.textContent).toContain(NETWORK_MESSAGES.uncertain);
  });

  it('allows dismissal until a new relevant failure and ignores malformed messages', () => {
    const worker = new FakeServiceWorker();
    setEnvironment(worker);
    stop = startNetworkSupport();
    const banner = document.getElementById('sodafom-network-status')!;

    message(worker, 'read-1', 'unavailable');
    expect(banner.hidden).toBe(false);
    const close = banner.querySelector('button')!;
    expect(close).toHaveTextContent('Close message');
    close.click();
    expect(banner.hidden).toBe(true);

    worker.dispatchEvent(new MessageEvent('message', { data: { type: 'sodafom-network', id: 'read-1', state: 'not-a-state' } }));
    expect(banner.hidden).toBe(true);
    message(worker, 'write-2', 'uncertain');
    expect(banner.hidden).toBe(false);
    expect(banner.textContent).toContain(NETWORK_MESSAGES.uncertain);
  });

  it('does not register a worker in native or insecure contexts', async () => {
    const nativeWorker = new FakeServiceWorker();
    setEnvironment(nativeWorker);
    Object.defineProperty(window, 'Capacitor', { configurable: true, value: {} });
    stop = startNetworkSupport();
    await Promise.resolve();
    expect(nativeWorker.register).not.toHaveBeenCalled();
    stop();
    stop = undefined;

    const insecureWorker = new FakeServiceWorker();
    setEnvironment(insecureWorker, true, false);
    stop = startNetworkSupport();
    await Promise.resolve();
    expect(insecureWorker.register).not.toHaveBeenCalled();
  });
});

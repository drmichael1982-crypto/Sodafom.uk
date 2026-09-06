/**
 * Sodafom Service Worker — Push Notifications
 * Handles incoming push events and notification clicks.
 */

const CACHE_NAME = 'sodafom-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// ── Push handler ──────────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: 'Sodafom', body: 'You have a new notification!', icon: '/favicon.ico', url: '/' };
  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch (_) { /* use defaults */ }

  const options = {
    body: data.body,
    icon: data.icon || '/favicon.ico',
    badge: '/favicon.ico',
    data: { url: data.url || '/' },
    vibrate: [200, 100, 200],
    requireInteraction: false,
    tag: data.tag || 'sodafom-notification',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ── Notification click ────────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus existing tab if open
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open new tab
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

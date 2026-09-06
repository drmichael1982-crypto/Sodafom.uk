/**
 * usePushNotifications — manages browser push subscription lifecycle.
 *
 * State machine:
 *   'unsupported'  — browser doesn't support push
 *   'loading'      — checking current permission / subscription
 *   'denied'       — user blocked notifications
 *   'subscribed'   — active push subscription saved to server
 *   'unsubscribed' — supported but not yet opted in
 */
import React, { useState, useEffect, useCallback } from 'react';
import { API_PREFIX } from '@/lib/config';

export type PushState = 'unsupported' | 'loading' | 'denied' | 'subscribed' | 'unsubscribed';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function usePushNotifications() {
  const [state, setState] = useState<PushState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [vapidKey, setVapidKey] = useState<string | null>(null);

  // Check support & current state on mount
  React.useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported');
      return;
    }

    async function check() {
      try {
        // Fetch VAPID public key
        const res = await fetch(`${API_PREFIX}/push/vapid-public-key`);
        if (res.ok) {
          const data = await res.json() as { publicKey: string };
          setVapidKey(data.publicKey);
        }

        const perm = Notification.permission;
        if (perm === 'denied') { setState('denied'); return; }

        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        setState(existing ? 'subscribed' : 'unsubscribed');
      } catch {
        setState('unsubscribed');
      }
    }

    void check();
  }, []);

  const subscribe = useCallback(async () => {
    if (!vapidKey) { setError('VAPID key not loaded'); return; }
    setState('loading');
    setError(null);
    try {
      // Register service worker
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Request permission
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { setState('denied'); return; }

      // Subscribe to push
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as unknown as string,
      });

      // Save to server
      const res = await fetch(`${API_PREFIX}/push/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subscription: sub.toJSON(), deviceLabel: navigator.userAgent.slice(0, 80) }),
      });

      if (!res.ok) throw new Error('Server rejected subscription');
      setState('subscribed');
    } catch (err) {
      setError(String(err));
      setState('unsubscribed');
    }
  }, [vapidKey]);

  const unsubscribe = useCallback(async () => {
    setState('loading');
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch(`${API_PREFIX}/push/unsubscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState('unsubscribed');
    } catch (err) {
      setError(String(err));
      setState('subscribed'); // revert
    }
  }, []);

  return { state, error, subscribe, unsubscribe };
}

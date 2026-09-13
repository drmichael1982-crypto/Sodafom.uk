/**
 * Compatibility hook for legacy callers.
 *
 * Push setup is intentionally unavailable until an approved, signed-parent
 * consent and real-device delivery rollout exists. In particular, this hook
 * never registers a worker, requests browser permission, calls an API, or
 * reads a push subscription.
 */
import { useCallback } from 'react';

export type PushState = 'unsupported' | 'loading' | 'denied' | 'subscribed' | 'unsubscribed';

const DISABLED_MESSAGE = 'Push notifications are unavailable until a parent-consented device rollout is approved.';

export function usePushNotifications() {
  const subscribe = useCallback(async () => undefined, []);
  const unsubscribe = useCallback(async () => undefined, []);

  return {
    state: 'unsupported' as const satisfies PushState,
    error: DISABLED_MESSAGE,
    subscribe,
    unsubscribe,
  };
}

import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePushNotifications } from '@/hooks/usePushNotifications';

describe('usePushNotifications', () => {
  it('remains unavailable and does not request browser permission', async () => {
    const requestPermission = vi.fn();
    const original = Object.getOwnPropertyDescriptor(window, 'Notification');
    Object.defineProperty(window, 'Notification', {
      configurable: true,
      value: { requestPermission },
    });

    try {
      const { result } = renderHook(() => usePushNotifications());

      await result.current.subscribe();
      await result.current.unsubscribe();

      expect(result.current.state).toBe('unsupported');
      expect(result.current.error).toContain('parent-consented device rollout');
      expect(requestPermission).not.toHaveBeenCalled();
    } finally {
      if (original) Object.defineProperty(window, 'Notification', original);
      else Reflect.deleteProperty(window, 'Notification');
    }
  });
});

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PushNotificationBanner from '@/components/PushNotificationBanner';

describe('PushNotificationBanner', () => {
  it('does not render a child-facing prompt or request browser permission', () => {
    const requestPermission = vi.fn();
    const original = Object.getOwnPropertyDescriptor(window, 'Notification');
    Object.defineProperty(window, 'Notification', {
      configurable: true,
      value: { requestPermission },
    });

    try {
      const { container } = render(<PushNotificationBanner />);

      expect(container).toBeEmptyDOMElement();
      expect(requestPermission).not.toHaveBeenCalled();
    } finally {
      if (original) Object.defineProperty(window, 'Notification', original);
      else Reflect.deleteProperty(window, 'Notification');
    }
  });
});

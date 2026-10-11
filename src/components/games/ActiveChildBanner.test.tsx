import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

const { setActiveChild } = vi.hoisted(() => ({ setActiveChild: vi.fn() }));

vi.mock('@/hooks/useChildAge', () => ({
  useChildAge: () => ({
    child: {
      id: 7,
      name: 'Alexandria-Montgomery A Very Long Learner Name',
      ageGroup: '8-10',
      avatarEmoji: '🦊',
    },
    ageGroup: '8-10',
    tier: 2,
  }),
  setActiveChild,
}));

import ActiveChildBanner from './ActiveChildBanner';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it('keeps a long learner name contained and gives Change a 44px touch target', () => {
  const { container } = render(<ActiveChildBanner />);

  expect(container.firstElementChild).toHaveClass('grid-cols-[minmax(0,1fr)_auto]');
  expect(screen.getByText('Alexandria-Montgomery A Very Long Learner Name')).toHaveClass(
    'min-w-0',
    'max-w-full',
    'break-words',
  );

  const change = screen.getByRole('button', { name: 'Change' });
  expect(change).toHaveClass('min-h-11', 'min-w-11', 'shrink-0');
  fireEvent.click(change);
  expect(setActiveChild).toHaveBeenCalledOnce();
  expect(setActiveChild).toHaveBeenCalledWith(null);
});

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('virtual:content', () => ({ games: { games: [] } }));
vi.mock('motion/react', async () => {
  const ReactModule = await import('react');
  const motion = new Proxy({}, {
    get: (_target, tag: string) => ReactModule.forwardRef<HTMLElement, Record<string, unknown>>((props, ref) => {
      const { children, initial, animate, exit, transition, variants, whileHover, whileInView, viewport, ...htmlProps } = props;
      void initial; void animate; void exit; void transition; void variants; void whileHover; void whileInView; void viewport;
      return ReactModule.createElement(tag, { ...htmlProps, ref }, children as React.ReactNode);
    }),
  });
  return { motion, AnimatePresence: ({ children }: { children: React.ReactNode }) => children };
});

import { AddChildModal, normalizeHubChildren } from './index';

describe('Parent Hub learner response', () => {
  it('keeps learners from the supported legacy response envelope', () => {
    expect(normalizeHubChildren({ children: [{
      id: 7,
      name: 'Ava',
      age_group: '8-10',
      avatar_emoji: '🦊',
      total_stars: 12,
    }] })).toEqual([{
      id: 7,
      name: 'Ava',
      ageGroup: '8-10',
      avatarEmoji: '🦊',
      totalStars: 12,
    }]);
  });
});

describe('Add learner dialog', () => {
  it('keeps all controls reachable on short phone and tablet viewports', () => {
    const onClose = vi.fn();
    render(<AddChildModal onClose={onClose} onAdded={vi.fn()} />);

    const dialog = screen.getByRole('dialog', { name: 'Add a learner' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveClass('max-h-[calc(100dvh-2rem)]', 'overflow-y-auto', 'overscroll-contain', 'p-5', 'sm:p-8');
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add learner' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ages 11–13/ })).toHaveClass('min-h-11');

    const avatar = screen.getByRole('button', { name: 'Choose ⭐ avatar' });
    expect(avatar).toHaveClass('w-11', 'h-11');
    expect(avatar).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

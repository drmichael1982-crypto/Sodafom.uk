import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@dr.pogodin/react-helmet', () => ({ Helmet: () => null }));
vi.mock('motion/react', async () => {
  const ReactModule = await import('react');
  const motion = new Proxy({}, {
    get: (_target, tag: string) => ReactModule.forwardRef<HTMLElement, Record<string, unknown>>((props, ref) => {
      const { children, initial, animate, transition, variants, whileHover, whileInView, viewport, ...htmlProps } = props;
      void initial; void animate; void transition; void variants; void whileHover; void whileInView; void viewport;
      return ReactModule.createElement(tag, { ...htmlProps, ref }, children as React.ReactNode);
    }),
  });
  return { motion };
});
vi.mock('virtual:content', () => ({
  games: {
    games: ['maths', 'spelling', 'reading', 'science'].map((subject) => ({
      id: `game-${subject}`,
      slug: `${subject}-test-game`,
      title: `${subject} test game`,
      subject,
      emoji: '⭐',
      description: 'A learning game',
    })),
  },
}));

import MathsSubjectPage from './maths';
import ReadingSubjectPage from './reading';
import ScienceSubjectPage from './science';
import SpellingSubjectPage from './spelling';

afterEach(cleanup);

describe.each([
  ['maths', MathsSubjectPage],
  ['spelling', SpellingSubjectPage],
  ['reading', ReadingSubjectPage],
  ['science', ScienceSubjectPage],
] as const)('%s subject page in free testing mode', (subject, Page) => {
  it('uses playable routes and shows no paid trial links', () => {
    render(<MemoryRouter><Page /></MemoryRouter>);

    expect(screen.getByRole('link', { name: 'Play now' })).toHaveAttribute('href', `/games/${subject}-test-game`);
    expect(screen.getByRole('link', { name: /Browse free games/i })).toHaveAttribute('href', `/games?subject=${subject}`);
    expect(screen.getByRole('link', { name: /Play free now/i })).toHaveAttribute('href', `/games?subject=${subject}`);

    const destinations = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(destinations).not.toContain('/subscribe');
    expect(destinations.some((href) => href?.includes('undefined'))).toBe(false);
    expect(screen.queryByText(/free trial/i)).not.toBeInTheDocument();
  });
});

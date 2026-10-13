import { cleanup, render, screen } from '@testing-library/react';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { MemoryRouter } from 'react-router';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('virtual:content', () => ({
  games: {
    games: [{
      id: 'game-angle-explorer',
      title: 'Angle Explorer',
      subject: 'maths',
      emoji: '📐',
      description: 'Explore angles.',
      ageGroups: ['9–11', '12–13'],
      slug: 'angle-explorer',
    }],
  },
}));

import GameOfTheWeekPage from './game-of-the-week';

afterEach(cleanup);

beforeAll(() => {
  vi.stubGlobal('IntersectionObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
});

afterAll(() => vi.unstubAllGlobals());

describe('Game of the Week in open testing', () => {
  it('uses the selected game age bands and offers free play without trial claims', async () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <GameOfTheWeekPage />
        </MemoryRouter>
      </HelmetProvider>,
    );

    expect(await screen.findByRole('heading', { name: 'Angle Explorer' })).toBeInTheDocument();
    expect(screen.getByText('9–11 · 12–13')).toBeInTheDocument();
    expect(screen.getByText('Age groups')).toBeInTheDocument();
    expect(screen.getByText('The featured game and the full learning catalogue are free during testing.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Play now' })).toHaveAttribute('href', '/games/angle-explorer');
    expect(screen.queryByText(/free trial/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/all 118 games/i)).not.toBeInTheDocument();
  });
});

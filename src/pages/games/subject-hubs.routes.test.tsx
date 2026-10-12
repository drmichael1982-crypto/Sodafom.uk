import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen, fireEvent } from '@testing-library/react';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { MemoryRouter, useLocation } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import catalog from '@/lib/archie/game-catalog.json';
import { ArchieProvider } from '@/contexts/ArchieContext';
vi.mock('@/hooks/useSubscription', () => ({
  useSubscription: () => ({ subscribed: true }),
  isDemoGameId: () => false,
}));
import MathsHubPage from './maths-hub';
import SpellingHubPage from './spelling-hub';
import ReadingHubPage from './reading-hub';

function CurrentRoute() { return <output aria-label="Current route">{useLocation().pathname}</output>; }

it('every catalogue game has a unique identity and a registered playable route', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/routes.tsx'), 'utf8');
  const registered = new Set([...source.matchAll(/path:\s*['"]([^'"]+)['"]/g)].map(match => match[1]));
  expect(new Set(catalog.map(game => game.id)).size).toBe(catalog.length);
  const missing = catalog.filter(game => !registered.has(game.route)).map(game => ({ id: game.id, route: game.route }));
  expect(missing).toEqual([]);
  expect(catalog.find(game => game.id === 'game-tricky-words')?.route).toBe('/games/tricky-word-hunt');
});

describe.each([
  { subject: 'maths', Page: MathsHubPage, subjects: ['maths'] },
  { subject: 'spelling', Page: SpellingHubPage, subjects: ['spelling'] },
  { subject: 'reading', Page: ReadingHubPage, subjects: ['reading', 'stories'] },
])('$subject catalogue navigation', ({ subject, Page, subjects }) => {
  it('every displayed Play action reaches its registered destination', () => {
    render(<HelmetProvider><MemoryRouter initialEntries={['/games/' + subject]}><ArchieProvider>
      <Page /><CurrentRoute />
    </ArchieProvider></MemoryRouter></HelmetProvider>);
    const games = catalog.filter(game => subjects.includes(game.subject));
    expect(screen.getAllByRole('article')).toHaveLength(games.length);
    for (const game of games) {
      fireEvent.click(screen.getByRole('button', { name: 'Play ' + game.title }));
      expect(screen.getByLabelText('Current route').textContent).toBe(game.route);
    }
    if (subject === 'maths') {
      expect(screen.getByRole('heading', { name: 'Star Trail' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Number Planets' })).toBeInTheDocument();
    }
  }, 30_000);
});

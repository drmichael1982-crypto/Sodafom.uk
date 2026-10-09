import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, expect, it } from 'vitest';
import catalog from '@/lib/archie/game-catalog.json';
import AdminGameCatalog from './AdminGameCatalog';
afterEach(cleanup);
it('links every catalog game to its registered app route without claiming a live test', () => {
  render(<MemoryRouter><AdminGameCatalog /></MemoryRouter>);
  const source = readFileSync(resolve(process.cwd(), 'src/routes.tsx'), 'utf8');
  const registered = new Set([...source.matchAll(/path:\s*['"]([^'"]+)['"]/g)].map(match => match[1]));
  expect(screen.getAllByRole('link')).toHaveLength(catalog.length);
  for (const game of catalog) {
    expect(registered.has(game.route), game.title).toBe(true);
    expect(screen.getByRole('link', { name: `Open ${game.title}` })).toHaveAttribute('href', game.route);
  }
  expect(screen.getAllByText('Available in catalog')).toHaveLength(catalog.length);
  expect(screen.getByText(/not a live test or a quality rating/)).toBeInTheDocument();
});
it('combines subject and text filters and shows an honest empty result', () => {
  render(<MemoryRouter><AdminGameCatalog /></MemoryRouter>);
  fireEvent.change(screen.getByLabelText('Filter by subject'), { target: { value: 'science' } });
  const science = catalog.filter(game => game.subject === 'science');
  expect(screen.getAllByRole('link')).toHaveLength(science.length);
  fireEvent.change(screen.getByLabelText('Search games'), { target: { value: science[0].title } });
  expect(screen.getByRole('link', { name: `Open ${science[0].title}` })).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Search games'), { target: { value: 'no-such-fictional-game-xyz' } });
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent(`Showing 0 of ${catalog.length} games.`);
});

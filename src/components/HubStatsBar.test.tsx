import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, expect, it, vi } from 'vitest';
import HubStatsBar from './HubStatsBar';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('shows family stars from the canonical children API response', async () => {
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url === '/api/children') return { json: async () => [{
      id: 7,
      name: 'Ava',
      ageGroup: '8-10',
      avatarEmoji: '🦊',
      totalStars: 42,
    }] };
    if (url === '/api/children/7/progress?summary=1') return {
      ok: true,
      json: async () => ({ recent: [], summaries: [], totalStars: 42 }),
    };
    throw new Error(`Unexpected fetch: ${url}`);
  }));

  render(<MemoryRouter><HubStatsBar /></MemoryRouter>);

  expect(await screen.findByText('42')).toBeInTheDocument();
  expect(screen.getByText('Total stars')).toBeInTheDocument();
});

/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import SodafomAdventurePage from '../SodafomAdventurePage';

describe('SodafomAdventurePage Books Library entry', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('opens the shelf experience from the existing Archie Stories menu card', async () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <SodafomAdventurePage />
        </MemoryRouter>
      </HelmetProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /archie’s stories/i }));

    await screen.findByRole('heading', { name: /archie’s book library/i });
    expect(screen.getByRole('heading', { name: /archie’s book library/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /from the library$/i })).toHaveLength(16);
  });
});

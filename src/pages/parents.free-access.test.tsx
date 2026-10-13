import { fireEvent, render, screen } from '@testing-library/react';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import ParentsPage from './parents';

afterEach(cleanup);

beforeAll(() => {
  vi.stubGlobal('IntersectionObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
});

describe('Parents page in open testing mode', () => {
  it('describes free access without advertising a trial or subscription', () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <ParentsPage />
        </MemoryRouter>
      </HelmetProvider>,
    );

    expect(screen.getAllByText('Free').length).toBeGreaterThan(0);
    expect(screen.getByText('Current access')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse free games' })).toHaveAttribute('href', '/games');
    expect(screen.getByRole('link', { name: '🎉 Start learning free' })).toHaveAttribute('href', '/games');
    expect(screen.getByText('No card required · payment collection is off')).toBeInTheDocument();
    expect(screen.queryByText(/Start 7-day free trial/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/From £1\/month/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'How much does it cost?' }));
    expect(screen.getByText(/free to explore in this release/i)).toBeInTheDocument();
    expect(screen.queryByText(/costs just £1 per month/i)).not.toBeInTheDocument();
  });
});

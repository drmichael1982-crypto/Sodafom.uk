import { act, fireEvent, render, screen } from '@testing-library/react';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { MemoryRouter, useLocation } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import ApprovedArtworkPage from '../ApprovedArtworkPage';

function LocationProbe() {
  const location = useLocation();
  return <output aria-label="current route">{location.pathname}{location.search}</output>;
}

describe('Approved artwork navigation', () => {
  it('shows the locked home artwork and connects its main buttons', () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/']}>
          <ApprovedArtworkPage variant="home" />
          <LocationProbe />
        </MemoryRouter>
      </HelmetProvider>,
    );

    expect(screen.getByRole('img')).toHaveAttribute('src', '/assets/approved/home-fire-v2.png');
    expect(screen.getByRole('button', { name: "Open Archie's Stories" })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: "Open Archie's Lessons" })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ask Archie' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open Game Islands' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open Homework Helper' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: "Open Archie's Lessons" }));
    expect(screen.getByLabelText('current route')).toHaveTextContent('/lessons');
  });

  it('connects an illustrated subject door directly to its lesson', () => {
    vi.useFakeTimers();
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/lessons']}>
          <ApprovedArtworkPage variant="lessons" />
          <LocationProbe />
        </MemoryRouter>
      </HelmetProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Start a Maths lesson' }));
    expect(screen.getByText(/let's go to our Maths lesson/i)).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1550));
    expect(screen.getByLabelText('current route')).toHaveTextContent('/tutor?subject=Maths&direct=1');
    vi.useRealTimers();
  });

  it('connects the Settings admin cog to protected Admin Access', () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/sodafom-settings']}>
          <ApprovedArtworkPage variant="settings" />
          <LocationProbe />
        </MemoryRouter>
      </HelmetProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open protected Admin Access' }));
    expect(screen.getByLabelText('current route')).toHaveTextContent('/admin-panel');
  });
});

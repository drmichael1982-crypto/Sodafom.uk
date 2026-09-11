import { fireEvent, render, screen } from '@testing-library/react';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { MemoryRouter, useLocation } from 'react-router';
import { describe, expect, it } from 'vitest';

import ApprovedArtworkPage from '../ApprovedArtworkPage';

function LocationProbe() {
  return <output aria-label="current route">{useLocation().pathname}</output>;
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

    expect(screen.getByRole('img')).toHaveAttribute('src', '/assets/approved/home.png');
    expect(screen.getByRole('button', { name: "Open Archie's Stories" })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: "Open Archie's Lessons" })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ask Archie' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open Game Islands' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open Homework Helper' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: "Open Archie's Lessons" }));
    expect(screen.getByLabelText('current route')).toHaveTextContent('/lessons');
  });

  it('connects the illustrated lesson classroom to the working lesson chooser', () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/lessons']}>
          <ApprovedArtworkPage variant="lessons" />
          <LocationProbe />
        </MemoryRouter>
      </HelmetProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Choose a structured lesson' }));
    expect(screen.getByLabelText('current route')).toHaveTextContent('/lesson-library');
  });
});

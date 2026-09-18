import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { MemoryRouter } from 'react-router';
import LessonsPage from '../LessonsPage';

function renderLessons() {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <LessonsPage />
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe("Archie's lesson browser", () => {
  beforeEach(() => localStorage.clear());

  it('offers the agreed one-year age bands from 5 through 12', () => {
    renderLessons();
    for (const band of ['5–6', '6–7', '7–8', '8–9', '9–10', '10–11', '11–12']) {
      expect(screen.getByRole('button', { name: new RegExp(`Ages ${band}`) })).toBeInTheDocument();
    }
    expect(screen.queryByText(/11–13/)).not.toBeInTheDocument();
  });

  it('offers every supported lesson length and core subject', () => {
    renderLessons();
    for (const duration of [15, 20, 30, 60]) {
      expect(screen.getByRole('button', { name: `${duration} min` })).toBeInTheDocument();
    }
    for (const subject of ['Maths', 'English', 'Reading', 'Spelling', 'Science', 'History', 'Geography', 'PE']) {
      expect(screen.getByRole('heading', { name: subject })).toBeInTheDocument();
    }
  });
});

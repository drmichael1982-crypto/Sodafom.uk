import { fireEvent, render, screen } from '@testing-library/react';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { MemoryRouter, useLocation } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import LessonsPage from '../LessonsPage';

vi.mock('@/components/FeaturePageShell', () => ({
  default: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

vi.mock('@/lib/voice-context', () => ({
  ttsSpeak: vi.fn(),
  stopTts: vi.fn(),
}));

function LocationProbe() {
  const location = useLocation();
  return <output aria-label="current route">{location.pathname}{location.search}</output>;
}

describe("Archie's lesson launcher", () => {
  beforeEach(() => localStorage.clear());

  it('offers all lesson durations and subjects', () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <LessonsPage />
        </MemoryRouter>
      </HelmetProvider>,
    );

    for (const duration of [15, 20, 30, 60]) {
      expect(screen.getByRole('button', { name: `${duration} min` })).toBeInTheDocument();
    }
    for (const subject of ['Maths', 'English', 'Reading', 'Spelling', 'Science', 'Geography', 'History', 'Technology', 'French', 'German']) {
      expect(screen.getByRole('button', { name: new RegExp(`^${subject}\\b`, 'i') })).toBeInTheDocument();
    }
  });

  it('saves a selected age, clamped day, duration and subject before opening tutor mode', () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={['/lesson-library']}>
          <LessonsPage />
          <LocationProbe />
        </MemoryRouter>
      </HelmetProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Ages 5–7/i }));
    fireEvent.change(screen.getByLabelText('Learning path day'), { target: { value: '900' } });
    fireEvent.click(screen.getByRole('button', { name: '60 min' }));
    fireEvent.click(screen.getByRole('button', { name: /Maths/i }));

    expect(screen.getByLabelText('current route')).toHaveTextContent('/tutor');
    expect(localStorage.getItem('sodafom_lesson_subject')).toBe('Maths');
    expect(localStorage.getItem('sodafom_lesson_minutes')).toBe('60');
    expect(localStorage.getItem('sodafom_lesson_age')).toBe('5-7');
    expect(localStorage.getItem('sodafom_lesson_day')).toBe('365');
  });
});

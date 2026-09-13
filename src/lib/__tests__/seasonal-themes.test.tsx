import { fireEvent, render, screen } from '@testing-library/react';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { SeasonalCoverDecorations } from '@/components/SeasonalCoverDecorations';
import SeasonalThemesPage from '@/pages/SeasonalThemesPage';
import {
  DEFAULT_SEASONAL_THEME_ID,
  getSeasonalTheme,
  getStoredSeasonalThemeId,
  SEASONAL_THEME_CHANGE_EVENT,
  SEASONAL_THEME_KEY,
  SEASONAL_THEMES,
  setSeasonalTheme,
} from '../seasonal-themes';

describe('seasonal cover switcher', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('includes the original covers and every requested new celebration cover', () => {
    expect(SEASONAL_THEMES.map(theme => theme.id)).toEqual([
      'everyday',
      'christmas',
      'easter',
      'bedtime',
      'birthday',
      'mothers-day',
      'fathers-day',
      'grandparents',
      'teacher-thank-you',
    ]);
    expect(getSeasonalTheme('grandparents').description).toMatch(/Nan, Nanny, Grandad/);
  });

  it('keeps a chosen cover locally and broadcasts a change for either home screen', () => {
    const changes: string[] = [];
    const recordChange = (event: Event) => {
      changes.push((event as CustomEvent<string>).detail);
    };
    window.addEventListener(SEASONAL_THEME_CHANGE_EVENT, recordChange);

    setSeasonalTheme('bedtime');

    expect(localStorage.getItem(SEASONAL_THEME_KEY)).toBe('bedtime');
    expect(getStoredSeasonalThemeId()).toBe('bedtime');
    expect(changes).toContain('bedtime');
    window.removeEventListener(SEASONAL_THEME_CHANGE_EVENT, recordChange);
  });

  it('removes the stored key when Everyday / remove cover is chosen', () => {
    localStorage.setItem(SEASONAL_THEME_KEY, 'birthday');

    setSeasonalTheme(DEFAULT_SEASONAL_THEME_ID);

    expect(localStorage.getItem(SEASONAL_THEME_KEY)).toBeNull();
    expect(getStoredSeasonalThemeId()).toBe(DEFAULT_SEASONAL_THEME_ID);
  });

  it('falls back safely to the ordinary cover when storage has an unknown value', () => {
    localStorage.setItem(SEASONAL_THEME_KEY, 'not-a-real-cover');

    expect(getStoredSeasonalThemeId()).toBe(DEFAULT_SEASONAL_THEME_ID);
  });

  it('renders decorative cover layers only for a selected celebration cover', () => {
    const { rerender } = render(<SeasonalCoverDecorations theme={getSeasonalTheme('christmas')} />);
    expect(screen.getByTestId('seasonal-cover-decorations')).toHaveAttribute('data-seasonal-cover', 'christmas');

    rerender(<SeasonalCoverDecorations theme={getSeasonalTheme('everyday')} />);
    expect(screen.queryByTestId('seasonal-cover-decorations')).not.toBeInTheDocument();
  });

  it('selects a cover from the keyboard-friendly picker and restores Everyday', () => {
    render(
      <HelmetProvider>
        <MemoryRouter><SeasonalThemesPage /></MemoryRouter>
      </HelmetProvider>
    );

    const everyday = screen.getByRole('button', { name: /Everyday Rainbow/i });
    const christmas = screen.getByRole('button', { name: /Christmas/i });
    const bedtime = screen.getByRole('button', { name: /Bedtime Stars/i });

    everyday.focus();
    fireEvent.keyDown(everyday, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(christmas);

    fireEvent.click(bedtime);
    expect(localStorage.getItem(SEASONAL_THEME_KEY)).toBe('bedtime');
    expect(bedtime).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: /Everyday \/ remove cover/i }));
    expect(localStorage.getItem(SEASONAL_THEME_KEY)).toBeNull();
    expect(everyday).toHaveAttribute('aria-pressed', 'true');
  });
});

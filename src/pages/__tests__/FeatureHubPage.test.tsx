import { render, screen } from '@testing-library/react';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import FeatureHubPage from '../FeatureHubPage';
import LessonsPage from '../LessonsPage';
import HomeworkHelperPage from '../HomeworkHelperPage';
import PocketMoneyPage from '../PocketMoneyPage';
import BirthdayPage from '../BirthdayPage';
import ArchieOutfitPage from '../ArchieOutfitPage';
import SeasonalThemesPage from '../SeasonalThemesPage';
import HolidayTravelPage from '../HolidayTravelPage';
import ReadingPage from '../ReadingPage';
import ParentAreaPage from '../ParentAreaPage';

function renderPage(page: React.ReactNode) {
  return render(<HelmetProvider><MemoryRouter>{page}</MemoryRouter></HelmetProvider>);
}

describe("Archie's new feature menu", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());
  it('shows all approved sections and marks travel as a future plan', () => {
    const view = renderPage(<FeatureHubPage />);
    for (const label of [
      "Archie's Lessons",
      'Games',
      'Reading',
      'Homework Helper',
      'Ask Archie',
      'Birthday',
      'Pocket Money & Chores',
      'Parent Chore Setup',
      "Design Archie's Outfit",
      'Seasonal Themes',
      'Parent Area',
      'Holiday & Travel',
    ]) {
      expect(screen.getByRole('heading', { name: label })).toBeInTheDocument();
    }
    expect(screen.getByText('Future plan')).toBeInTheDocument();
    expect(view.container.textContent).not.toMatch(/Cadbury|Moonpig|cakes|uniforms|shoes/i);
  });

  it('offers every requested lesson subject and duration', () => {
    renderPage(<LessonsPage />);
    for (const subject of ['Maths', 'English', 'Science', 'Geography', 'History', 'Technology', 'PE', 'Spelling', 'French', 'German']) {
      expect(screen.getByRole('heading', { name: subject })).toBeInTheDocument();
    }
    for (const duration of [15, 20, 30, 60]) {
      expect(screen.getByRole('button', { name: `${duration} min` })).toBeInTheDocument();
    }
  });

  it.each([
    ['Homework Helper', <HomeworkHelperPage />],
    ['Pocket Money & Chores', <PocketMoneyPage />],
    ['Birthday Countdown', <BirthdayPage />],
    ['Characters & Outfits', <ArchieOutfitPage />],
    ['Seasonal Themes', <SeasonalThemesPage />],
    ['Holiday & Travel', <HolidayTravelPage />],
    ['Reading With Archie', <ReadingPage />],
    ['Parent Area', <ParentAreaPage />],
  ])('renders the %s page without crashing', (heading, page) => {
    renderPage(page);
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
  });

  it('keeps an existing Archie outfit while adding character choices', () => {
    localStorage.setItem('sodafom_archie_outfit_v1', JSON.stringify({
      colour: '#16a34a',
      badge: '📚',
      accessory: '🎧',
    }));

    renderPage(<ArchieOutfitPage />);

    expect(screen.getByRole('button', { name: 'Hero Green' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '📚' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '🎧' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Annual Sign-up Outfit/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /Birthday Outfit/i })).toBeDisabled();
  });

});

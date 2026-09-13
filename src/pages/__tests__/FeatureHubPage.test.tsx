import { fireEvent, render, screen } from '@testing-library/react';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
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

  it('runs the local Birthday Party Room activities', () => {
    renderPage(<BirthdayPage />);

    expect(screen.getByRole('heading', { name: 'Birthday Party Room' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Play music' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Party music volume' })).toHaveValue('0.45');

    for (let index = 1; index <= 6; index += 1) {
      fireEvent.click(screen.getByRole('button', { name: `Pop balloon ${index}` }));
    }
    expect(screen.getByText(/You popped them all!/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Play again' }));
    expect(screen.getByText(/6 left\./)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Blow out candles' }));
    expect(screen.getByRole('button', { name: 'Light candles again' })).toBeInTheDocument();
    expect(screen.getByText(/Great wish!/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Start dancing' }));
    expect(screen.getByRole('button', { name: 'FREEZE!' })).toBeInTheDocument();
    expect(screen.getByText(/Dance, dance, dance!/)).toBeInTheDocument();

    fireEvent.change(screen.getByRole('slider', { name: 'Party music volume' }), { target: { value: '0.75' } });
    expect(screen.getByRole('slider', { name: 'Party music volume' })).toHaveValue('0.75');
  });

  it.each([
    ['Homework Helper', <HomeworkHelperPage />],
    ['Pocket Money & Chores', <PocketMoneyPage />],
    ['Birthday Party Room', <BirthdayPage />],
    ["Design Archie's Outfit", <ArchieOutfitPage />],
    ['Seasonal Themes', <SeasonalThemesPage />],
    ['Holiday & Travel', <HolidayTravelPage />],
    ['Reading With Archie', <ReadingPage />],
    ['Parent Area', <ParentAreaPage />],
  ])('renders the %s page without crashing', (heading, page) => {
    renderPage(page);
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
  });
});

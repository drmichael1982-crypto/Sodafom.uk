import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { MemoryRouter, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ComponentType } from 'react';

const controls = vi.hoisted(() => ({ year: 1, preview: true }));
const fixtures = vi.hoisted(() => {
  const bands: { name: string; ages: string[] }[] = [
    { name: 'early', ages: ['4–6'] },
    { name: 'young', ages: ['5–7'] },
    { name: 'middle', ages: ['8-10'] },
    { name: 'older', ages: ['11–13'] },
    { name: 'shared', ages: ['5–7', '8–10', '11–13'] },
    { name: 'unsupported', ages: ['14–16'] },
    { name: 'missing age', ages: [] },
  ];
  return ['maths', 'spelling', 'reading', 'stories'].flatMap(subject => bands.map(band => ({
    id: `fixture-${subject}-${band.name.replace(' ', '-')}`,
    title: `${subject} ${band.name}`,
    subject, description: 'A practice game.', emoji: '⭐',
    ageGroups: band.ages,
    route: `/games/fixture-${subject}-${band.name.replace(' ', '-')}`,
  })));
});
vi.mock('@/lib/config', () => ({ get ARCHIE_PREVIEW() { return controls.preview; } }));
vi.mock('@/lib/archie/storage', () => ({ useArchieData: () => ({ settings: { year: controls.year } }) }));
vi.mock('@/lib/archie/game-catalog.json', () => ({ default: fixtures }));
vi.mock('@/hooks/useSubscription', () => ({ useSubscription: () => ({ subscribed: true }), isDemoGameId: () => false }));
vi.mock('@/components/games/GameHubHelp', () => ({ default: () => <div>Menu help</div> }));

import MathsHubPage from './maths-hub';
import SpellingHubPage from './spelling-hub';
import ReadingHubPage from './reading-hub';

function CurrentRoute() { return <output aria-label="Current route">{useLocation().pathname}</output>; }
function Contents({ Page }: { Page: ComponentType }) {
  return <HelmetProvider><MemoryRouter><Page /><CurrentRoute /></MemoryRouter></HelmetProvider>;
}
beforeEach(() => { controls.year = 1; controls.preview = true; localStorage.removeItem('sodafom_active_child'); });
afterEach(() => { cleanup(); localStorage.removeItem('sodafom_active_child'); });

describe.each([
  { subject: 'maths', Page: MathsHubPage, included: ['maths'] },
  { subject: 'spelling', Page: SpellingHubPage, included: ['spelling'] },
  { subject: 'reading', Page: ReadingHubPage, included: ['reading', 'stories'] },
])('$subject preview practice years', ({ subject, Page, included }) => {
  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9])('shows only supported cards for saved Year %i, with artwork and usable controls', year => {
    controls.year = year;
    render(<Contents Page={Page} />);
    // Independent expected teaching-age ranges, not the predicate under test.
    const band = year <= 3 ? 'young' : year <= 6 ? 'middle' : 'older';
    const expectedNames = included.flatMap(item => [`${item} ${band}`, `${item} shared`, ...(year <= 2 ? [`${item} early`] : [])]);
    const articles = screen.getAllByRole('article');
    expect(articles).toHaveLength(expectedNames.length);
    expect(articles.map(article => within(article).getByRole('heading', { level: 2 }).textContent).sort()).toEqual(expectedNames.sort());
    expect(screen.getByRole('region', { name: 'Your practice level' })).toHaveTextContent(`Games for Year ${year}`);
    expect(screen.getByRole('link', { name: 'Change practice year with a grown-up' })).toHaveAttribute('href', '/parents');
    expect(screen.getByRole('main')).toHaveClass('soda-gamehub');
    for (const title of expectedNames) {
      const article = screen.getByRole('article', { name: title });
      expect(article.querySelector('.scene-art[aria-hidden="true"] img')).not.toBeNull();
      expect(within(article).getByRole('button', { name: `Read about ${title}` })).toHaveAttribute('type', 'button');
      fireEvent.click(within(article).getByRole('button', { name: `Play ${title}` }));
      expect(screen.getByLabelText('Current route').textContent).toBe(fixtures.find(game => game.title === title)!.route);
    }
    expect(screen.queryByRole('heading', { name: /unsupported|missing age/ })).not.toBeInTheDocument();
  });

  it('refreshes cards when the saved year changes and ignores a stale active profile in the preview', () => {
    localStorage.setItem('sodafom_active_child', JSON.stringify({ id: 1, name: 'Test learner', ageGroup: '5-7', avatarEmoji: '⭐' }));
    const view = render(<Contents Page={Page} />);
    expect(screen.getByRole('heading', { name: `${subject} young` })).toBeInTheDocument();
    controls.year = 9; view.rerender(<Contents Page={Page} />);
    expect(screen.queryByRole('heading', { name: `${subject} young` })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: `${subject} older` })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Your practice level' })).toHaveTextContent('Games for Year 9');
  });

  it('keeps every subject card and the legacy menu presentation outside the preview', () => {
    controls.preview = false; controls.year = 9;
    render(<Contents Page={Page} />);
    expect(screen.getAllByRole('article')).toHaveLength(fixtures.filter(game => included.includes(game.subject)).length);
    expect(screen.getByRole('heading', { name: `${subject} young` })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: `${subject} unsupported` })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Your practice level' })).not.toBeInTheDocument();
    expect(screen.getByRole('main')).not.toHaveClass('soda-gamehub');
    expect(screen.getByRole('article', { name: `${subject} young` }).querySelector('.scene-art')).toBeNull();
  });
});

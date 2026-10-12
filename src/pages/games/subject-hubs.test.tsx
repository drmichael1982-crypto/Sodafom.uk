import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { MemoryRouter, useLocation } from 'react-router';
import { ArchieProvider } from '@/contexts/ArchieContext';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const subscription = vi.hoisted(() => ({ subscribed: false }));
vi.mock('@/hooks/useSubscription', () => ({
  useSubscription: () => subscription,
  isDemoGameId: (id: string) => ['game-number-pop', 'game-word-wizard', 'game-phonics-parrot'].includes(id),
}));
vi.mock('@/lib/archie/game-catalog.json', () => ({ default: [
  { id: 'game-number-pop', route: '/games/number-pop', title: 'Number Pop', description: 'Count the bubbles.', subject: 'maths', ageGroups: ['5-7'] },
  { id: 'game-fraction-pizza', route: '/games/fraction-pizza', title: 'Fraction Pizza', description: 'Share equal slices.', subject: 'maths', ageGroups: ['8-10'] },
  { id: 'game-word-wizard', route: '/games/word-wizard', title: 'Word Wizard', description: 'Build a word.', subject: 'spelling', ageGroups: ['5-7'] },
  { id: 'game-spelling-bee', route: '/games/spelling-bee', title: 'Spelling Bee', description: 'Spell a new word.', subject: 'spelling', ageGroups: ['8-10'] },
  { id: 'game-phonics-parrot', route: '/games/phonics-parrot', title: 'Phonics Parrot', description: 'Listen to sounds.', subject: 'reading', ageGroups: ['5-7'] },
  { id: 'game-reading-quest', route: '/games/reading-quest', title: 'Reading Quest', description: 'Read a short story.', subject: 'reading', ageGroups: ['8-10'] },
] }));
import MathsHubPage from './maths-hub';
import SpellingHubPage from './spelling-hub';
import ReadingHubPage from './reading-hub';

const speak = vi.fn();
const cancel = vi.fn();
function CurrentRoute() { return <output aria-label="Current route">{useLocation().pathname}</output>; }

beforeEach(() => {
  subscription.subscribed = false;
  vi.stubGlobal('speechSynthesis', { speak, cancel });
  vi.stubGlobal('SpeechSynthesisUtterance', class {
    constructor(public text: string) {}
  });
  speak.mockImplementation((utterance: SpeechSynthesisUtterance) => utterance.onstart?.(new Event('start') as SpeechSynthesisEvent));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

describe.each([
  { subject: 'maths', Page: MathsHubPage, freeTitle: 'Number Pop', freeRoute: '/games/number-pop', paidTitle: 'Fraction Pizza', paidRoute: '/games/fraction-pizza' },
  { subject: 'spelling', Page: SpellingHubPage, freeTitle: 'Word Wizard', freeRoute: '/games/word-wizard', paidTitle: 'Spelling Bee', paidRoute: '/games/spelling-bee' },
  { subject: 'reading', Page: ReadingHubPage, freeTitle: 'Phonics Parrot', freeRoute: '/games/phonics-parrot', paidTitle: 'Reading Quest', paidRoute: '/games/reading-quest' },
])('$subject hub independent card actions', ({ subject, Page, freeTitle, freeRoute, paidTitle, paidRoute }) => {
  function showHub() {
    return render(<HelmetProvider><MemoryRouter initialEntries={['/games/' + subject]}>
      <ArchieProvider><Page /><CurrentRoute /></ArchieProvider>
    </MemoryRouter></HelmetProvider>);
  }

  it('exposes a heading and separate keyboard narration/play actions; narration never navigates', async () => {
    const user = userEvent.setup();
    const { container } = showHub();
    const card = screen.getByRole('article', { name: freeTitle });
    expect(within(card).getByRole('heading', { name: freeTitle })).toBeInTheDocument();
    expect(within(card).getAllByRole('button')).toHaveLength(2);
    expect(container.querySelector('button button, button a, button [tabindex]')).toBeNull();
    const read = within(card).getByRole('button', { name: 'Read about ' + freeTitle });
    read.focus();
    await user.keyboard('{Enter}');
    expect(speak).toHaveBeenCalledTimes(1);
    expect(speak.mock.calls[0][0].text).toContain(freeTitle + '. ');
    expect(screen.getByLabelText('Current route')).toHaveTextContent('/games/' + subject);
    expect(within(card).getByRole('button', { name: 'Stop reading about ' + freeTitle })).toHaveFocus();
    await user.keyboard(' ');
    expect(speak).toHaveBeenCalledTimes(1);
    expect(cancel).toHaveBeenCalledTimes(2);
    expect(read).toHaveAccessibleName('Read about ' + freeTitle);
    await user.tab();
    expect(within(card).getByRole('button', { name: 'Play ' + freeTitle })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByLabelText('Current route')).toHaveTextContent(freeRoute);
    expect(speak).toHaveBeenCalledTimes(1);
  });

  it('keeps locked games on the existing subscription route', async () => {
    const user = userEvent.setup(); showHub();
    await user.click(screen.getByRole('button', { name: 'Unlock ' + paidTitle }));
    expect(screen.getByLabelText('Current route')).toHaveTextContent('/subscribe');
    expect(speak).not.toHaveBeenCalled();
  });

  it('keeps subscribed games on their existing play route', async () => {
    subscription.subscribed = true;
    const user = userEvent.setup(); showHub();
    await user.click(screen.getByRole('button', { name: 'Play ' + paidTitle }));
    expect(screen.getByLabelText('Current route')).toHaveTextContent(paidRoute);
    expect(speak).not.toHaveBeenCalled();
  });
});

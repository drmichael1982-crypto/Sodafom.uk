import type { ComponentType, HTMLAttributes, ReactNode } from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const progression = vi.hoisted(() => ({ recordGameCompletion: vi.fn() }));
const archie = vi.hoisted(() => ({ setGameContext: vi.fn(), clearGameContext: vi.fn() }));

vi.mock('@/lib/auth/auth-client', () => ({
  useSession: () => ({ session: null }),
  signOut: vi.fn(),
}));
vi.mock('@/contexts/ArchieContext', () => ({ useArchieContext: () => archie }));
vi.mock('@/contexts/ProgressionContext', () => ({
  useProgression: () => ({ ...progression, level: 1, gamesRemainingForNextLevel: 9 }),
}));
vi.mock('@/components/games/PaywallGate', () => ({ default: ({ children }: { children: ReactNode }) => children }));
vi.mock('@/components/games/ActiveChildBanner', () => ({ default: () => null }));
vi.mock('@/components/games/ConfettiCanvas', () => ({ default: () => null }));
vi.mock('@/components/ShareBar', () => ({ default: () => null }));
vi.mock('@/hooks/useCountUp', () => ({ useCountUp: (target: number) => target }));
vi.mock('@dr.pogodin/react-helmet', () => ({ Helmet: () => null }));
vi.mock('html-to-image', () => ({ toPng: vi.fn() }));
vi.mock('virtual:content', () => ({
  games: { games: [
    { title: 'Number Pop', slug: 'number-pop', subject: 'maths' },
    { title: 'Times Table Race', slug: 'times-table-race', subject: 'maths' },
  ] },
}));
vi.mock('motion/react', async () => {
  const React = await import('react');
  const cache = new Map<string, ComponentType<HTMLAttributes<HTMLElement>>>();
  return {
    AnimatePresence: ({ children }: { children: ReactNode }) => children,
    motion: new Proxy({}, {
      get(_target, tag: string) {
        if (!cache.has(tag)) {
          cache.set(tag, ({ children, ...props }: HTMLAttributes<HTMLElement>) => {
            const domProps = Object.fromEntries(Object.entries(props).filter(([key]) => ![
              'initial', 'animate', 'transition', 'exit', 'variants', 'whileHover', 'whileTap',
            ].includes(key)));
            return React.createElement(tag, domProps, children);
          });
        }
        return cache.get(tag);
      },
    }),
  };
});

import NumberPopGame from '@/pages/games/number-pop';
import GameShell, { type GameResult } from '../GameShell';

function Location() {
  const location = useLocation();
  return <output aria-label="Current route">{location.pathname}</output>;
}

function openNumberPop() {
  return render(<MemoryRouter initialEntries={['/games/number-pop']}><NumberPopGame /><Location /></MemoryRouter>);
}

function finishNumberPop(correctAnswers: number) {
  for (let questionIndex = 0; questionIndex < 10; questionIndex++) {
    expect(screen.getByText(`Question ${questionIndex + 1} of 10`)).toBeInTheDocument();
    const question = screen.getByText(/^\d+ [+-] \d+ = \?$/).textContent!;
    const [, left, operator, right] = question.match(/^(\d+) ([+-]) (\d+) = \?$/)!;
    const answer = operator === '+' ? Number(left) + Number(right) : Number(left) - Number(right);
    const shouldBeCorrect = questionIndex < correctAnswers;
    const button = screen.getAllByRole('button', { name: /^Pop balloon / }).find((candidate) =>
      (Number(candidate.textContent) === answer) === shouldBeCorrect,
    );
    expect(button).toBeDefined();
    fireEvent.click(button!);
    expect(screen.getAllByRole('button', { name: /^Pop balloon / }).every((candidate) => candidate.hasAttribute('disabled'))).toBe(true);
    act(() => vi.advanceTimersByTime(900));
  }
  // Include the delayed celebration banner in all wording assertions.
  act(() => vi.advanceTimersByTime(1100));
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  localStorage.clear();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('GameShell results from actual Number Pop rounds', () => {
  it.each([
    { correct: 0, stars: 0, headline: 'Keep practising!' },
    { correct: 1, stars: 0, headline: 'Keep practising!' },
    { correct: 8, stars: 2, headline: 'Great job!' },
    { correct: 9, stars: 3, headline: 'Amazing! Three stars!' },
    { correct: 10, stars: 3, headline: 'Amazing! Perfect score!' },
  ])('$correct/10 has accurate feedback and $stars earned stars', ({ correct, stars, headline }) => {
    openNumberPop();
    finishNumberPop(correct);

    expect(screen.getByText(`${correct * 10}%`)).toBeInTheDocument();
    expect(screen.getByText(`${correct} correct out of 10 questions`)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 }).textContent).toContain(headline);
    expect(progression.recordGameCompletion).toHaveBeenCalledTimes(1);

    if (correct === 10) {
      expect(screen.getByText('You got every question right!')).toBeInTheDocument();
      expect(screen.getByText('⭐ Perfect Score! ⭐')).toBeInTheDocument();
    } else {
      expect(screen.queryAllByText(/perfect|every question right/i)).toHaveLength(0);
    }

    if (stars > 0) {
      expect(screen.getByText(new RegExp(`You earned ${stars} stars!`))).toBeInTheDocument();
      expect(JSON.parse(localStorage.getItem('sodafom_game_stars')!)).toEqual({ 'game-number-pop': stars });
    } else {
      expect(screen.queryByText(/You earned \d stars!/)).not.toBeInTheDocument();
    }

    const certificateButton = screen.queryByRole('button', { name: /View Certificate/ });
    if (stars >= 2) {
      expect(certificateButton).toBeInTheDocument();
      fireEvent.click(certificateButton!);
      const certificate = document.getElementById('auto-cert-print')!;
      expect(within(certificate).getByText('Certificate of Achievement')).toBeInTheDocument();
      expect(within(certificate).getByText('⭐'.repeat(stars), { exact: true })).toBeInTheDocument();
      expect(within(certificate).queryByText(/perfect|every question right/i)).not.toBeInTheDocument();
    } else {
      expect(certificateButton).not.toBeInTheDocument();
    }
  });

  it('clears the previous perfect result and starts a fresh ten-question round', () => {
    openNumberPop();
    finishNumberPop(10);
    fireEvent.click(screen.getByRole('button', { name: /^Next 10/ }));
    expect(screen.getByText('Question 1 of 10')).toBeInTheDocument();
    expect(screen.getByText('⭐ 0 correct')).toBeInTheDocument();
    expect(screen.queryAllByText(/perfect|every question right/i)).toHaveLength(0);

    finishNumberPop(0);
    expect(screen.getByText('0 correct out of 10 questions')).toBeInTheDocument();
    expect(screen.queryAllByText(/perfect|every question right/i)).toHaveLength(0);
    expect(progression.recordGameCompletion).toHaveBeenCalledTimes(2);
    // Replaying must not erase a child's previously earned best star total.
    expect(JSON.parse(localStorage.getItem('sodafom_game_stars')!)).toEqual({ 'game-number-pop': 3 });
  });

  it('pauses automatic replay while the certificate is open and resumes after closing', () => {
    openNumberPop();
    finishNumberPop(9);
    fireEvent.click(screen.getByRole('button', { name: /View Certificate/ }));
    act(() => vi.advanceTimersByTime(30_000));
    expect(screen.getByText('9 correct out of 10 questions')).toBeInTheDocument();
    expect(document.getElementById('auto-cert-print')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    for (let second = 0; second < 8; second++) act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText('Question 1 of 10')).toBeInTheDocument();
    expect(screen.getByText('⭐ 0 correct')).toBeInTheDocument();
    expect(document.getElementById('auto-cert-print')).not.toBeInTheDocument();
  });

  it('keeps the next-game route working after a three-star result', () => {
    openNumberPop();
    finishNumberPop(9);
    fireEvent.click(screen.getByRole('button', { name: /Play Next: Times Table Race/ }));
    expect(screen.getByLabelText('Current route')).toHaveTextContent('/games/times-table-race');
  });
});

describe('perfect-score wording requires a complete and consistent result', () => {
  it.each([
    { correct: 9, total: 10, score: 100 },
    { correct: 10, total: 10, score: 95 },
    { correct: 0, total: 0, score: 100 },
  ])('does not claim perfection for $correct/$total with $score%', (result) => {
    render(<MemoryRouter><GameShell title="Number Pop" emoji="🎈" subject="maths" ageGroups={['8–10']}>
      {(complete) => <button onClick={() => complete({ ...result, stars: 3 } satisfies GameResult)}>Finish test round</button>}
    </GameShell></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Finish test round' }));
    act(() => vi.advanceTimersByTime(1100));
    expect(screen.queryAllByText(/perfect|every question right/i)).toHaveLength(0);
  });
});

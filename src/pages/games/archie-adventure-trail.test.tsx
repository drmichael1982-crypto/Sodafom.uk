import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

const mocks = vi.hoisted(() => ({
  tier: 1 as 1 | 2 | 3,
  complete: vi.fn(), speak: vi.fn(), stop: vi.fn(), shell: vi.fn(),
}));
vi.mock('@/components/games/GameShell', () => ({
  default: (props: { children: (complete: typeof mocks.complete) => ReactNode }) => {
    mocks.shell(props);
    return props.children(mocks.complete);
  },
  useChildAge: () => ({ tier: mocks.tier }),
}));
vi.mock('@/lib/voice-context', () => ({ useVoice: () => ({ speak: mocks.speak, stop: mocks.stop }) }));

import ArchieAdventureTrailGame, {
  ADVENTURE_QUESTIONS, ADVENTURE_TITLE, AdventureTrailPlay,
  advanceAdventurePosition, rollAdventureDie,
} from './archie-adventure-trail';
import { submitGameVoiceAnswer } from '@/lib/archie/game-voice';

// These expected values are worked out independently of the implementation's answer IDs.
const ANSWERS = {
  1: ['4', '4', '10', '6', '4', '7', '11', '10'],
  2: ['24', '5', '40', '1/2', '8', '65', '12', '225'],
  3: ['24', '10', '6', '5', '1/2', '34', '8', '12'],
};
beforeEach(() => {
  mocks.tier = 1;
  vi.clearAllMocks();
  vi.spyOn(Math, 'random').mockReturnValue(0.4); // A real three-square roll.
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); });

describe('Archie’s finite dice adventure', () => {
  it('uses all six dice faces and bounds movement to the finite board', () => {
    for (let face = 1; face <= 6; face++) {
      expect(rollAdventureDie(() => (face - 0.5) / 6)).toBe(face);
      expect(advanceAdventurePosition(7, face)).toBe(7 + face);
    }
    expect(rollAdventureDie(() => 0)).toBe(1);
    expect(rollAdventureDie(() => 0.99999)).toBe(6);
    expect(rollAdventureDie(() => NaN)).toBe(1);
    expect(advanceAdventurePosition(47, 6)).toBe(48);
    expect(advanceAdventurePosition(48, 1)).toBe(48);
    for (const invalid of [0, 7, 2.5, NaN]) expect(advanceAdventurePosition(7, invalid)).toBe(7);
  });

  it('has distinct question/choice identities, unambiguous choices and independent correct maths', () => {
    const ids = new Set<string>();
    const optionIds = new Set<string>();
    for (const tier of [1, 2, 3] as const) {
      const questions = ADVENTURE_QUESTIONS[tier];
      expect(questions).toHaveLength(8);
      questions.forEach((question, index) => {
        expect(ids.has(question.id)).toBe(false); ids.add(question.id);
        expect(new Set(question.options.map(option => option.label)).size).toBe(3);
        expect(question.options.filter(option => option.id === question.answerId)).toHaveLength(1);
        expect(question.options.find(option => option.id === question.answerId)?.label).toBe(ANSWERS[tier][index]);
        expect(question.hint.length).toBeGreaterThan(15);
        expect(question.explanation.length).toBeGreaterThan(15);
        for (const option of question.options) {
          expect(optionIds.has(option.id)).toBe(false); optionIds.add(option.id);
        }
      });
    }
    expect(ids.size).toBe(24); expect(optionIds.size).toBe(72);
  });

  it.each([1, 2, 3] as const)('completes tier %i only after eight solved clues and explicit moves/finish', tier => {
    mocks.tier = tier;
    render(<ArchieAdventureTrailGame />);
    for (let round = 0; round < 8; round++) {
      fireEvent.click(screen.getByRole('button', { name: 'Roll the die' }));
      const shellProps = mocks.shell.mock.lastCall![0];
      expect(shellProps.title).toBe(ADVENTURE_TITLE);
      expect(shellProps.currentQuestion).toBe(ADVENTURE_QUESTIONS[tier][round].prompt);
      expect(shellProps.currentOptions).toContain(ANSWERS[tier][round]);
      fireEvent.click(screen.getByRole('button', { name: ANSWERS[tier][round] }));
      expect(screen.getByText(round === 0 ? 'Your explorer: base camp' : `Your explorer: square ${round * 3} of 48`)).toBeInTheDocument();
      expect(mocks.complete).not.toHaveBeenCalled();
      const move = screen.getByRole('button', { name: 'Move 3 squares' });
      fireEvent.click(move); fireEvent.click(move);
      expect(screen.getByText(`Your explorer: square ${(round + 1) * 3} of 48`)).toBeInTheDocument();
      expect(mocks.complete).not.toHaveBeenCalled();
      if (round < 7) fireEvent.click(screen.getByRole('button', { name: 'Next adventure' }));
    }
    expect(screen.getByText('Eight clues explored!')).toBeInTheDocument();
    const finish = screen.getByRole('button', { name: 'See my stars' });
    fireEvent.click(finish); fireEvent.click(finish);
    expect(mocks.complete).toHaveBeenCalledExactlyOnceWith({ score: 100, correct: 8, total: 8, stars: 3 });
  });

  it('keeps a wrong clue for retry, retains solved feedback over time and scores first-try practice separately', () => {
    vi.useFakeTimers();
    const complete = vi.fn(); render(<AdventureTrailPlay tier={1} onComplete={complete} />);
    for (let round = 0; round < 8; round++) {
      fireEvent.click(screen.getByRole('button', { name: 'Roll the die' }));
      if (round === 0) {
        fireEvent.click(screen.getByRole('button', { name: '3' }));
        expect(screen.getByRole('heading', { name: '3 shells and 1 more shell. How many shells altogether?' })).toBeInTheDocument();
        expect(screen.getByText('Start at three. Count one more.')).toBeVisible();
        act(() => vi.advanceTimersByTime(30000));
        expect(screen.getByText('Your explorer: base camp')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Move 3 squares' })).not.toBeInTheDocument();
      }
      fireEvent.click(screen.getByRole('button', { name: ANSWERS[1][round] }));
      act(() => vi.advanceTimersByTime(30000));
      expect(screen.getByRole('status')).toHaveTextContent('Clue solved!');
      expect(screen.getByRole('button', { name: 'Move 3 squares' })).toBeInTheDocument();
      expect(complete).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole('button', { name: 'Move 3 squares' }));
      if (round < 7) fireEvent.click(screen.getByRole('button', { name: 'Next adventure' }));
    }
    act(() => vi.advanceTimersByTime(30000)); expect(complete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'See my stars' }));
    expect(complete).toHaveBeenCalledExactlyOnceWith({ score: 88, correct: 7, total: 8, stars: 2 });
  });

  it('hands keyboard focus along explicit controls, while a wrong answer stays focused', async () => {
    const user = userEvent.setup(); render(<AdventureTrailPlay tier={1} onComplete={vi.fn()} />);
    const roll = screen.getByRole('button', { name: 'Roll the die' }); roll.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('heading', { name: '3 shells and 1 more shell. How many shells altogether?' })).toHaveFocus();
    const wrong = screen.getByRole('button', { name: '3' }); wrong.focus();
    await user.keyboard(' '); expect(wrong).toHaveFocus();
    screen.getByRole('button', { name: '4' }).focus();
    await user.keyboard('{Enter}'); expect(screen.getByRole('button', { name: 'Move 3 squares' })).toHaveFocus();
    await user.keyboard(' '); expect(screen.getByRole('button', { name: 'Next adventure' })).toHaveFocus();
    await user.keyboard('{Enter}'); expect(screen.getByRole('button', { name: 'Roll the die' })).toHaveFocus();
    expect(screen.getByText('Your explorer: square 3 of 48')).toBeInTheDocument();
  });

  it('provides written board position, opt-in narration and a persistent controlled hint', () => {
    render(<ArchieAdventureTrailGame />);
    const board = screen.getByRole('img', { name: /A winding trail of 48 numbered squares/ });
    expect(board).toHaveAccessibleName(/at base camp, before square 1/);
    expect(mocks.speak).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Roll the die' }));
    expect(board).toHaveAccessibleName(/die shows 3; the next stop is square 3, after solving the clue and choosing Move/);
    const hint = screen.getByRole('button', { name: 'Show hint' });
    expect(hint).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(hint);
    expect(screen.getByRole('button', { name: 'Hide hint' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Start at three. Count one more.')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Read the clue' }));
    expect(mocks.speak).toHaveBeenCalledExactlyOnceWith('read:archie-adventure-trail', '3 shells and 1 more shell. How many shells altogether? Your choices are 4, 3, 5');
    fireEvent.click(screen.getByRole('button', { name: 'Take a break' }));
    expect(mocks.shell.mock.lastCall![0].currentOptions).toEqual([]);
    expect(mocks.shell.mock.lastCall![0].currentQuestion).toBe('Adventure paused. Resume when you are ready.');
    fireEvent.click(screen.getByRole('button', { name: 'Resume adventure' }));
    expect(screen.getByText('Start at three. Count one more.')).toBeVisible();
    expect(board).toHaveAccessibleName(/die shows 3/);
  });

  it('pauses without changing the clue, rejects general/stale speech and preserves tutor focus', () => {
    const { unmount } = render(<><input aria-label="Tutor answer" /><AdventureTrailPlay tier={1} onComplete={vi.fn()} /></>);
    expect(document.body).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Roll the die' }));
    let reply: string | undefined;
    act(() => { reply = submitGameVoiceAnswer('Star Trail', 'four'); }); expect(reply).toBeUndefined();
    act(() => { reply = submitGameVoiceAnswer(ADVENTURE_TITLE, 'why is the answer four?'); }); expect(reply).toBeUndefined();
    fireEvent.click(screen.getByRole('button', { name: 'Take a break' }));
    act(() => { reply = submitGameVoiceAnswer(ADVENTURE_TITLE, 'four'); }); expect(reply).toBeUndefined();
    expect(screen.queryByRole('button', { name: '4' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Resume adventure' }));
    expect(screen.getByRole('heading', { name: '3 shells and 1 more shell. How many shells altogether?' })).toBeInTheDocument();
    const tutor = screen.getByRole('textbox', { name: 'Tutor answer' }); tutor.focus();
    act(() => { reply = submitGameVoiceAnswer(ADVENTURE_TITLE, 'my answer is four'); });
    expect(reply).toContain('3 + 1 = 4'); expect(tutor).toHaveFocus();
    expect(screen.getByText('Your explorer: base camp')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Move 3 squares' })).toBeInTheDocument();
    unmount();
    expect(submitGameVoiceAnswer(ADVENTURE_TITLE, 'four')).toBeUndefined();
    expect(mocks.stop).toHaveBeenCalled();
  });

  it('does not transfer answer focus while an open native tutor dialog owns interaction', () => {
    render(<><dialog open aria-label="Archie tutor"><input aria-label="Ask Archie" /></dialog><AdventureTrailPlay tier={1} onComplete={vi.fn()} /></>);
    fireEvent.click(screen.getByRole('button', { name: 'Roll the die' }));
    const answer = screen.getByRole('button', { name: '4' }); answer.focus();
    fireEvent.click(answer);
    expect(screen.getByRole('button', { name: 'Move 3 squares' })).not.toHaveFocus();
    const tutor = screen.getByRole('textbox', { name: 'Ask Archie' }); tutor.focus();
    expect(tutor).toHaveFocus();
  });
});

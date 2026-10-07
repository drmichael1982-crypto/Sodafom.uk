import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GameResult } from '@/components/games/GameShell';

const { onComplete } = vi.hoisted(() => ({ onComplete: vi.fn() }));
vi.mock('@/components/games/GameShell', () => ({
  default: ({ children }: { children: (complete: (result: GameResult) => void) => React.ReactNode }) => children(onComplete),
}));
vi.mock('@dr.pogodin/react-helmet', () => ({ Helmet: () => null }));
import TellingTimeGame, { AnalogClock } from './telling-time';

beforeEach(() => {
  onComplete.mockClear();
  vi.spyOn(Math, 'random').mockReturnValue(0.5);
});
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

describe('analogue clock information', () => {
  it.each([
    [3, 0, 'Analogue clock. The short hour hand points to 3. The long minute hand points to 12.'],
    [2, 30, 'Analogue clock. The short hour hand is between 2 and 3. The long minute hand points to 6.'],
    [4, 15, 'Analogue clock. The short hour hand is between 4 and 5. The long minute hand points to 3.'],
    [8, 45, 'Analogue clock. The short hour hand is between 8 and 9. The long minute hand points to 9.'],
    [12, 30, 'Analogue clock. The short hour hand is between 12 and 1. The long minute hand points to 6.'],
    [12, 0, 'Analogue clock. The short hour hand points to 12. The long minute hand points to 12.'],
  ] as const)('describes both hands at %i:%i', (hours, minutes, description) => {
    render(<AnalogClock hours={hours} minutes={minutes} />);
    expect(screen.getByRole('img', { name: description })).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });

  it('replaces the hand description when the clock time changes', () => {
    const view = render(<AnalogClock hours={3} minutes={0} />);
    const before = 'Analogue clock. The short hour hand points to 3. The long minute hand points to 12.';
    expect(screen.getByRole('img', { name: before })).toBeInTheDocument();

    view.rerender(<AnalogClock hours={8} minutes={45} />);
    expect(screen.queryByRole('img', { name: before })).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Analogue clock. The short hour hand is between 8 and 9. The long minute hand points to 9.' })).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });
});

describe('child-controlled clock feedback', () => {
  it.each(["3 o'clock", "6 o'clock"])('keeps feedback for %s until the child continues', (choice) => {
    vi.useFakeTimers();
    render(<TellingTimeGame />);
    fireEvent.click(screen.getByRole('button', { name: choice }));
    act(() => vi.advanceTimersByTime(30000));
    expect(screen.getByText('1/10')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent("The time is 3 o'clock.");
    expect(screen.getByRole('button', { name: 'Next clock' })).toBeEnabled();
    expect(screen.getByRole('button', { name: choice })).toBeDisabled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('continues with the keyboard, advances once and focuses the newly mounted question', async () => {
    const user = userEvent.setup();
    render(<TellingTimeGame />);
    expect(document.body).toHaveFocus();
    screen.getByRole('button', { name: "6 o'clock" }).focus();
    await user.keyboard('{Enter}');
    const next = screen.getByRole('button', { name: 'Next clock' });
    expect(next).toHaveFocus();
    await user.keyboard('{Enter}');
    fireEvent.click(next); // The exiting card must not accept a second advance.
    await screen.findByRole('button', { name: "7 o'clock" });
    expect(screen.getByText('2/10')).toBeInTheDocument();
    expect(screen.getByText('What time does the clock show?')).toHaveFocus();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    screen.getByRole('button', { name: "7 o'clock" }).focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'Next clock' })).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('Correct!');
  });

  it('preserves another control’s focus after an unfocused answer and continuation', async () => {
    render(<><input aria-label="Tutor message" /><TellingTimeGame /></>);
    const tutor = screen.getByRole('textbox', { name: 'Tutor message' });
    tutor.focus();
    fireEvent.click(screen.getByRole('button', { name: "3 o'clock" }));
    expect(tutor).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Next clock' }));
    await screen.findByRole('button', { name: "7 o'clock" });
    expect(tutor).toHaveFocus();
  });

  it.each(['tutor', 'dialog'])('does not steal %s focus while the old card exits', async (destination) => {
    render(<><input aria-label="Tutor message" /><TellingTimeGame /></>);
    const answer = screen.getByRole('button', { name: "3 o'clock" });
    answer.focus(); fireEvent.click(answer);
    const next = screen.getByRole('button', { name: 'Next clock' });
    expect(next).toHaveFocus();
    fireEvent.click(next);
    const tutor = screen.getByRole('textbox', { name: 'Tutor message' });
    if (destination === 'tutor') tutor.focus();
    else tutor.setAttribute('role', 'dialog'); // An open dialog also blocks the body fallback.
    await screen.findByRole('button', { name: "7 o'clock" });
    if (destination === 'tutor') expect(tutor).toHaveFocus();
    else expect(screen.getByText('What time does the clock show?')).not.toHaveFocus();
  });

  it.each([[10, 3], [9, 3], [6, 2], [3, 1], [0, 0]])('waits at the finish and awards %i correct answers their original %i stars once', async (correct, stars) => {
    const answers = ["3 o'clock", "7 o'clock", 'Half past 2', 'Quarter past 4', 'Quarter to 9', 'Quarter past 11', 'Quarter to 7', 'Twenty past 5', 'Twenty to 11', 'Twenty-five past 1'];
    render(<TellingTimeGame />);
    for (let round = 0; round < answers.length; round++) {
      const right = await screen.findByRole('button', { name: answers[round] });
      const choice = round < correct ? right : screen.getAllByRole('button').find(button => button !== right)!;
      fireEvent.click(choice);
      expect(screen.getByText(`${round + 1}/10`)).toBeInTheDocument();
      expect(onComplete).not.toHaveBeenCalled();
      if (round < answers.length - 1) fireEvent.click(screen.getByRole('button', { name: 'Next clock' }));
    }
    const finish = screen.getByRole('button', { name: 'See my stars' });
    fireEvent.click(finish); fireEvent.click(finish);
    await waitFor(() => expect(onComplete).toHaveBeenCalledExactlyOnceWith({ score: correct * 10, correct, total: 10, stars, maxScore: 100, durationSeconds: 0 }));
  }, 15000);
});

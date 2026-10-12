import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { GameResult } from '@/components/games/GameShell';

const { onComplete } = vi.hoisted(() => ({ onComplete: vi.fn() }));
vi.mock('@/components/games/GameShell', () => ({
  default: ({ children }: { children: (complete: (result: GameResult) => void) => React.ReactNode }) => children(onComplete),
}));
vi.mock('@dr.pogodin/react-helmet', () => ({ Helmet: () => null }));
vi.mock('@/components/games/ArchieGameHelper', () => ({ default: () => null }));
import MoneyMathsGame from './money-maths';

afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); onComplete.mockClear(); });

async function tabTo(user: ReturnType<typeof userEvent.setup>, target: HTMLElement) {
  for (let step = 0; step <= screen.getAllByRole('button').length; step++) {
    if (document.activeElement === target) return;
    await user.tab();
  }
  expect(target).toHaveFocus();
}


describe('child-controlled Money Maths feedback', () => {
  it('continues with the keyboard exactly once and focuses the incoming question', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const user = userEvent.setup();
    render(<MoneyMathsGame />);
    expect(document.body).toHaveFocus();
    const answer = screen.getByRole('button', { name: '4p' });
    await tabTo(user, answer);
    await user.keyboard('{Enter}');
    const next = screen.getByRole('button', { name: 'Next money question' });
    expect(next).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('The answer is 5p.');
    await user.keyboard(' ');
    fireEvent.click(next);
    await screen.findByRole('button', { name: '17p' });
    expect(screen.getByText('2/10')).toBeInTheDocument();
    expect(screen.getByText('How much money is this?')).toHaveFocus();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    const right = screen.getByRole('button', { name: '17p' });
    await tabTo(user, right);
    await user.keyboard(' ');
    expect(screen.getByRole('button', { name: 'Next money question' })).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('10p + 5p + 2p = 17p');
  });

  it('preserves tutor focus after an unfocused answer and continuation', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    render(<><input aria-label="Tutor message" /><MoneyMathsGame /></>);
    const tutor = screen.getByRole('textbox', { name: 'Tutor message' });
    tutor.focus();
    fireEvent.click(screen.getByRole('button', { name: '5p' }));
    expect(tutor).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Next money question' }));
    await screen.findByRole('button', { name: '17p' });
    expect(tutor).toHaveFocus();
  });

  it.each(['tutor', 'dialog'])('preserves %s interaction while the answered card exits', async (destination) => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    render(<><input aria-label="Tutor message" /><MoneyMathsGame /></>);
    const answer = screen.getByRole('button', { name: '5p' });
    answer.focus(); fireEvent.click(answer);
    const next = screen.getByRole('button', { name: 'Next money question' });
    expect(next).toHaveFocus();
    fireEvent.click(next);
    const tutor = screen.getByRole('textbox', { name: 'Tutor message' });
    if (destination === 'tutor') tutor.focus();
    else tutor.setAttribute('role', 'dialog');
    await screen.findByRole('button', { name: '17p' });
    if (destination === 'tutor') expect(tutor).toHaveFocus();
    else expect(screen.getByText('How much money is this?')).not.toHaveFocus();
  });

  it.each([[10, 3], [9, 3], [6, 2], [3, 1], [0, 0]])('waits at the finish and awards %i correct answers their original %i stars once', async (correct, stars) => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const answers = ['5p', '17p', '80p', '15p', '80p', '£1.25', '35p', '£1 + £1 + 50p', '75p', '£1.55'];
    render(<MoneyMathsGame />);
    for (let round = 0; round < answers.length; round++) {
      const right = await screen.findByRole('button', { name: answers[round] });
      const choice = round < correct ? right : screen.getAllByRole('button').find(button => button !== right)!;
      fireEvent.click(choice);
      expect(screen.getByText(`${round + 1}/10`)).toBeInTheDocument();
      expect(onComplete).not.toHaveBeenCalled();
      if (round < answers.length - 1) fireEvent.click(screen.getByRole('button', { name: 'Next money question' }));
    }
    const finish = screen.getByRole('button', { name: 'See my stars' });
    fireEvent.click(finish); fireEvent.click(finish);
    await waitFor(() => expect(onComplete).toHaveBeenCalledExactlyOnceWith({ score: correct * 10, correct, total: 10, stars, maxScore: 100, durationSeconds: 0 }));
  }, 15000);
  it.each(['5p', '4p'])('retains the complete explanation for %s until explicit continuation', (choice) => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    render(<MoneyMathsGame />);
    const status = screen.getByRole('status');
    fireEvent.click(screen.getByRole('button', { name: choice }));
    act(() => vi.advanceTimersByTime(30000));
    expect(screen.getByText('1/10')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBe(status);
    expect(status).toHaveAttribute('aria-atomic', 'true');
    expect(status).toHaveTextContent('Five 1p coins = 5p');
    expect(screen.getByRole('button', { name: choice })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next money question' })).toBeEnabled();
    expect(onComplete).not.toHaveBeenCalled();
  });

});

describe('Money Maths answer information', () => {
  it.each([
    ['5p', '✓ Correct! Five 1p coins = 5p'],
    ['4p', 'The answer is 5p. Five 1p coins = 5p'],
  ])('updates the pre-existing status with the complete explanation for %s', (choice, expected) => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    render(<><input aria-label="Tutor message" /><MoneyMathsGame /></>);
    const status = screen.getByRole('status');
    expect(status).toBeEmptyDOMElement();
    expect(status).toHaveAttribute('aria-atomic', 'true');
    const tutor = screen.getByRole('textbox', { name: 'Tutor message' });
    tutor.focus();
    fireEvent.click(screen.getByRole('button', { name: choice }));
    expect(screen.getByRole('status')).toBe(status);
    expect(status).toHaveTextContent(expected);
    expect(tutor).toHaveFocus();
    expect(screen.getByRole('button', { name: choice })).toBeDisabled();
    expect(screen.getByText('1/10')).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();
  });
});

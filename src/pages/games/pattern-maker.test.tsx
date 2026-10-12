import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { completed } = vi.hoisted(() => ({ completed: vi.fn() }));
vi.mock('@/components/games/GameShell', () => ({
  default: ({ children }: any) => children(completed),
}));
vi.mock('@dr.pogodin/react-helmet', () => ({ Helmet: () => null }));
// Scoring and pacing tests retain real React state. Animation is removed
// so an exit transition cannot stall a synthetic 15-question journey.
vi.mock('motion/react', async () => {
  const { createElement } = await import('react');
  const element = (tag: string) => ({ children, initial, animate, exit, transition, whileHover, whileTap, ...props }: any) => createElement(tag, props, children);
  return {
    motion: { div: element('div'), svg: element('svg'), button: element('button') },
    AnimatePresence: ({ children }: any) => children,
  };
});
import PatternMakerGame from './pattern-maker';

const answers = ['blue circle', 'yellow square', 'red circle', 'blue circle', 'purple circle', 'green triangle', 'yellow star', '10', '25', '\u{1f7e1}', '25', '32', '13', '243', '60'];
const wrongAnswers = ['red circle', 'green square', 'red triangle', 'yellow star', 'orange square', 'red circle', 'pink diamond', '9', '22', '\u{1f534}', '20', '24', '10', '162', '55'];

beforeEach(() => {
  completed.mockReset();
  vi.useFakeTimers();
  vi.stubGlobal('speechSynthesis', undefined);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function playFirstFourteen(correctCount: number) {
  for (let round = 0; round < 14; round++) {
    expect(screen.getByText(`${round + 1}/15`)).toBeInTheDocument();
    const right = round < correctCount;
    fireEvent.click(screen.getByRole('button', { name: right ? answers[round] : wrongAnswers[round] }));
    expect(completed).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Next pattern' }));
  }
  expect(screen.getByText('15/15')).toBeInTheDocument();
}

describe('Pattern Maker final-answer tally', () => {
  it.each([
    { previousCorrect: 14, points: 150, score: 100, correct: 15, stars: 3 },
    { previousCorrect: 13, points: 140, score: 93, correct: 14, stars: 3 },
    { previousCorrect: 8, points: 90, score: 60, correct: 9, stars: 2 },
    { previousCorrect: 4, points: 50, score: 33, correct: 5, stars: 1 },
  ])('includes the final correct answer after $previousCorrect earlier successes', ({ previousCorrect, points, score, correct, stars }) => {
    render(<PatternMakerGame />);
    playFirstFourteen(previousCorrect);
    fireEvent.click(screen.getByRole('button', { name: '60' }));
    expect(within(screen.getByText('15/15').parentElement!).getByText(String(points), { exact: true })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(30000));
    expect(completed).not.toHaveBeenCalled();
    const finish = screen.getByRole('button', { name: 'See my stars' });
    act(() => { fireEvent.click(finish); fireEvent.click(finish); });
    expect(completed).toHaveBeenCalledExactlyOnceWith({ score, correct, total: 15, stars, maxScore: 100, durationSeconds: 0 });
    expect(screen.queryByRole('button', { name: 'Skip' })).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(10000));
    expect(completed).toHaveBeenCalledTimes(1);
  });

  it('includes five points and a correct-answer count for a hinted final answer', () => {
    render(<PatternMakerGame />);
    playFirstFourteen(14);
    fireEvent.click(screen.getByRole('button', { name: 'Show hint' }));
    expect(screen.getByText('Count backwards in 10s!')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '60' }));
    expect(within(screen.getByText('15/15').parentElement!).getByText('145', { exact: true })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(30000));
    expect(completed).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'See my stars' }));
    expect(completed).toHaveBeenCalledExactlyOnceWith({ score: 97, correct: 15, total: 15, stars: 3, maxScore: 100, durationSeconds: 0 });
  });

  it('preserves preceding totals when the final answer is wrong', () => {
    render(<PatternMakerGame />);
    playFirstFourteen(14);
    fireEvent.click(screen.getByRole('button', { name: '55' }));
    act(() => vi.advanceTimersByTime(30000));
    expect(completed).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'See my stars' }));
    expect(completed).toHaveBeenCalledExactlyOnceWith({ score: 93, correct: 14, total: 15, stars: 3, maxScore: 100, durationSeconds: 0 });
  });

  it('preserves preceding totals when the final question is skipped', () => {
    render(<PatternMakerGame />);
    playFirstFourteen(14);
    const skip = screen.getByRole('button', { name: 'Skip' });
    act(() => { fireEvent.click(skip); fireEvent.click(skip); });
    expect(completed).toHaveBeenCalledExactlyOnceWith({ score: 93, correct: 14, total: 15, stars: 3, maxScore: 100, durationSeconds: 0 });
  });

  it('cannot complete an answered final question after unmounting', () => {
    const view = render(<PatternMakerGame />);
    playFirstFourteen(14);
    fireEvent.click(screen.getByRole('button', { name: '60' }));
    view.unmount();
    act(() => vi.advanceTimersByTime(10000));
    expect(completed).not.toHaveBeenCalled();
  });
});

describe('child-controlled Pattern Maker feedback', () => {
  it.each([
    ['blue circle', 'Correct! Well done! (+10 points)', '10'],
    ['red circle', 'Not quite! The answer was blue circle', '0'],
  ])('retains feedback for %s until explicit continuation', (answer, message, points) => {
    render(<PatternMakerGame />);
    const status = screen.getByRole('status');
    expect(status).toBeEmptyDOMElement();
    expect(screen.queryByRole('button', { name: 'Next pattern' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: answer }));
    act(() => vi.advanceTimersByTime(30000));
    expect(screen.getByText('1/15')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBe(status);
    expect(status).toHaveAttribute('aria-atomic', 'true');
    expect(status).toHaveTextContent(message);
    expect(within(screen.getByText('1/15').parentElement!).getByText(points, { exact: true })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next pattern' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'green circle' }));
    expect(status).toHaveTextContent(message);
    expect(completed).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Next pattern' }));
    expect(screen.getByText('2/15')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it.each(['blue circle', 'red circle'])('continues a focused %s answer by keyboard to the incoming heading', async answer => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<PatternMakerGame />);
    const choice = screen.getByRole('button', { name: answer });
    for (let step = 0; step <= screen.getAllByRole('button').length && document.activeElement !== choice; step++) await user.tab();
    expect(choice).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'Next pattern' })).toHaveFocus();
    await user.keyboard(' ');
    expect(screen.getByText('2/15')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'What comes next?' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Read aloud' })).toHaveFocus();
  });

  it('preserves tutor focus for an unfocused answer and continuation', () => {
    render(<><input aria-label="Tutor message" /><PatternMakerGame /></>);
    const tutor = screen.getByRole('textbox', { name: 'Tutor message' });
    tutor.focus();
    fireEvent.click(screen.getByRole('button', { name: 'blue circle' }));
    expect(tutor).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Next pattern' }));
    expect(screen.getByText('2/15')).toBeInTheDocument();
    expect(tutor).toHaveFocus();
  });

  it('blocks focus handoffs while a dialog is open and does not retry after it closes', () => {
    const view = render(<><div role="dialog">Game help</div><PatternMakerGame /></>);
    const answer = screen.getByRole('button', { name: 'blue circle' });
    answer.focus(); fireEvent.click(answer);
    const next = screen.getByRole('button', { name: 'Next pattern' });
    expect(answer).toHaveFocus();
    next.focus(); fireEvent.click(next);
    expect(screen.getByText('2/15')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'What comes next?' })).not.toHaveFocus();
    view.rerender(<><div>Game help</div><PatternMakerGame /></>);
    expect(screen.getByRole('heading', { name: 'What comes next?' })).not.toHaveFocus();
  });

  it('does not focus the question on initial render or unfocused Skip', () => {
    render(<PatternMakerGame />);
    expect(document.body).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Skip' }));
    expect(screen.getByText('2/15')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'What comes next?' })).not.toHaveFocus();
  });

  it('guards rapid continuation so one activation advances only one question', () => {
    render(<PatternMakerGame />);
    fireEvent.click(screen.getByRole('button', { name: 'blue circle' }));
    const next = screen.getByRole('button', { name: 'Next pattern' });
    act(() => { fireEvent.click(next); fireEvent.click(next); });
    expect(screen.getByText('2/15')).toBeInTheDocument();
    expect(screen.queryByText('3/15')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'yellow square' })).toHaveAttribute('aria-disabled', 'false');
  });
});

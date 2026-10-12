import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const complete = vi.hoisted(() => vi.fn());
vi.mock('@/components/games/GameShell', () => ({ default: ({ children }: { children: (callback: typeof complete) => React.ReactNode }) => children(complete) }));
vi.mock('@dr.pogodin/react-helmet', () => ({ Helmet: () => null }));
import StorySequence from './story-sequence';
const puppy = ['A small puppy wandered away from home.', 'A kind girl found the puppy shivering in the rain.', 'She took the puppy inside and dried it with a towel.', 'The next day, she found the owner and returned the puppy safely.'];
const science = ['The teacher handed out the equipment.', 'The children mixed the chemicals carefully.', 'The mixture fizzed and turned bright blue!', 'Everyone wrote up their results in their books.'];
const choose = (sentences: string[]) => { for (const sentence of sentences) fireEvent.click(screen.getByRole('button', { name: sentence })); };
beforeEach(() => { vi.useFakeTimers(); complete.mockClear(); });
afterEach(() => { cleanup(); vi.useRealTimers(); });
describe('actual story sequencing', () => {
  it('replaces all puppy sentences with the second story and resets reused sentence IDs', () => {
    render(<StorySequence />);
    choose(puppy);
    expect(screen.getByRole('status')).toHaveTextContent('Correct order!');
    act(() => vi.advanceTimersByTime(1200));
    expect(screen.getByText('The Science Experiment')).toBeInTheDocument();
    for (const sentence of puppy) expect(screen.queryByRole('button', { name: new RegExp(sentence) })).not.toBeInTheDocument();
    for (const sentence of science) expect(screen.getByRole('button', { name: sentence })).toBeEnabled();
    choose(science);
    act(() => vi.advanceTimersByTime(1200));
    expect(complete).toHaveBeenCalledExactlyOnceWith({ score: 100, correct: 2, total: 2, stars: 3 });
  });
  it('keeps a wrong sequence on the same story with a clue until retry, and records honest first-attempt results', () => {
    render(<StorySequence />);
    choose([puppy[1], puppy[0], puppy[2], puppy[3]]);
    expect(screen.getByRole('status')).toHaveTextContent('Use the clue and try again');
    expect(screen.getByText(/puppy wanders away before someone finds it/)).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByText('The Lost Puppy')).toBeInTheDocument();
    expect(complete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Try the same story again' }));
    for (const sentence of puppy) expect(screen.getByRole('button', { name: sentence })).toBeEnabled();
    choose(puppy); act(() => vi.advanceTimersByTime(1200));
    choose(science); act(() => vi.advanceTimersByTime(1200));
    expect(complete).toHaveBeenCalledExactlyOnceWith({ score: 50, correct: 1, total: 2, stars: 1 });
  });
  it('cancels pending story completion when the game is left', () => {
    const view = render(<StorySequence />);
    choose(puppy); act(() => vi.advanceTimersByTime(1200));
    choose(science); view.unmount(); act(() => vi.advanceTimersByTime(5000));
    expect(complete).not.toHaveBeenCalled();
  });
});

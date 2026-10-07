import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ tier: 1 }));
vi.mock('@/components/games/GameShell', () => ({ default: () => null, useChildAge: () => ({ tier: state.tier }) }));
vi.mock('motion/react', () => ({ AnimatePresence: ({ children }: any) => children, motion: {
  div: ({ children, initial, animate, exit, ...props }: any) => <div {...props}>{children}</div>,
  button: ({ children, whileTap, ...props }: any) => <button {...props}>{children}</button>,
} }));
import { BingoInner, generateCard, hasBingo } from './maths-bingo';
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); state.tier = 1; });
describe('bounded, age-appropriate Maths Bingo cards', () => {
  it.each([0, 0.5, 0.999])('generates unique playable cards even when random values repeat (%s)', random => {
    vi.spyOn(Math, 'random').mockReturnValue(random);
    for (const tier of [1, 2, 3] as const) {
      const card = generateCard(tier);
      expect(card).toHaveLength(tier === 1 ? 9 : 16);
      expect(new Set(card).size).toBe(card.length);
      expect(card.every(value => value >= 1 && value <= (tier === 1 ? 10 : tier === 2 ? 25 : 64))).toBe(true);
    }
  });
  it.each([9, 16])('recognises complete rows and columns on a %i-cell card without accepting partial lines', size => {
    const card = Array.from({ length: size }, (_, index) => index + 1);
    const side = Math.sqrt(size);
    for (let line = 0; line < side; line++) {
      const row = card.slice(line * side, (line + 1) * side);
      const column = Array.from({ length: side }, (_, index) => card[index * side + line]);
      expect(hasBingo(card, new Set(row))).toBe(true);
      expect(hasBingo(card, new Set(column))).toBe(true);
      expect(hasBingo(card, new Set(row.slice(1)))).toBe(false);
    }
  });
  it.each([1, 2])('tier %i renders, accepts answers and completes once using its actual card size', tier => {
    vi.useFakeTimers(); vi.spyOn(Math, 'random').mockReturnValue(0.5); state.tier = tier;
    const complete = vi.fn(); const context = vi.fn();
    render(<BingoInner onComplete={complete} onQuestionChange={context}/>);
    const total = tier === 1 ? 9 : 16;
    expect(screen.getAllByRole('button', { name: /^Bingo number/ })).toHaveLength(total);
    const first = context.mock.calls.at(-1)!;
    const sum = first[0].match(/^(\d+) \+ (\d+) = \?$/)!;
    const answer = Number(sum[1]) + Number(sum[2]);
    const wrong = screen.getAllByRole('button', { name: /^Bingo number/ }).find(button => button.getAttribute('aria-label') !== `Bingo number ${answer}`)!;
    fireEvent.click(wrong); expect(context.mock.calls.at(-1)![0]).toBe(first[0]);
    for (let round = 0; round < total && !screen.queryByText('🎱 BINGO!'); round++) {
      const question = context.mock.calls.at(-1)![0].match(/^(\d+) \+ (\d+) = \?$/)!;
      fireEvent.click(screen.getByRole('button', { name: `Bingo number ${Number(question[1]) + Number(question[2])}` }));
    }
    expect(screen.getByText('🎱 BINGO!')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1500));
    expect(complete).toHaveBeenCalledTimes(1);
    expect(complete.mock.calls[0][0].total).toBe(total);
  });
});

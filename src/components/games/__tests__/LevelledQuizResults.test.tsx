import type { ComponentType, HTMLAttributes, ReactNode } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const level = vi.hoisted(() => ({ recordResult: vi.fn(), speak: vi.fn() }));

vi.mock('@/hooks/useGameLevel', () => ({
  useGameLevel: () => ({ level: 1, loading: false, recordResult: level.recordResult }),
}));
vi.mock('@/hooks/useChildAge', () => ({ useChildAge: () => ({ tier: 1 }) }));
vi.mock('@/lib/voice-context', () => ({ useVoice: () => ({ speak: level.speak }) }));
vi.mock('@/components/games/ArchieReadAloudButton', () => ({ default: () => null }));
vi.mock('@/components/games/ArchieGameHelper', () => ({ default: () => null }));
vi.mock('@/components/games/LevelBadge', () => ({ default: () => null }));
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

import LevelledQuizEngine from '../LevelledQuizEngine';
import QuizEngine, { type QuizQuestion } from '../QuizEngine';

function questionBank(count: number): QuizQuestion[] {
  return Array.from({ length: count }, (_, index) => ({
    question: `Test question ${index + 1}`,
    options: [`Right ${index + 1}`, `Wrong ${index + 1}`],
    answer: `Right ${index + 1}`,
  }));
}

function openLevelled(questions: QuizQuestion[], complete = vi.fn()) {
  const view = render(<LevelledQuizEngine
    gameSlug="test-quiz" title="Test Quiz" emoji="📖" subject="reading"
    questionsByLevel={[questions]} onComplete={complete}
  />);
  return { ...view, complete };
}

async function answerRound(correct: number, total: number) {
  for (let index = 0; index < total; index++) {
    expect(screen.getByText(`${index + 1} / ${total}`)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: index < correct ? /^Right / : /^Wrong / }));
    act(() => vi.advanceTimersByTime(900));
  }
  expect(screen.getByRole('heading')).toHaveTextContent(`${correct}/${total} correct!`);
  await act(async () => vi.advanceTimersByTime(1200));
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  localStorage.clear();
  level.recordResult.mockResolvedValue(1);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('LevelledQuizEngine exact round results', () => {
  it.each([
    { correct: 0, total: 10, score: 0, stars: 0 },
    { correct: 1, total: 10, score: 10, stars: 0 },
    { correct: 3, total: 10, score: 30, stars: 1 },
    { correct: 6, total: 10, score: 60, stars: 2 },
    { correct: 8, total: 10, score: 80, stars: 2 },
    { correct: 9, total: 10, score: 90, stars: 3 },
    { correct: 10, total: 10, score: 100, stars: 3 },
    { correct: 1, total: 3, score: 33, stars: 1 },
    { correct: 2, total: 3, score: 67, stars: 2 },
    { correct: 3, total: 3, score: 100, stars: 3 },
    { correct: 0, total: 1, score: 0, stars: 0 },
    { correct: 1, total: 1, score: 100, stars: 3 },
  ])('reports $correct/$total as $score%, keeping $stars quiz stars', async (result) => {
    const { complete } = openLevelled(questionBank(result.total));
    await answerRound(result.correct, result.total);

    expect(complete).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalledWith(result);
    expect(level.recordResult).toHaveBeenCalledTimes(1);
    expect(level.recordResult).toHaveBeenCalledWith(result.stars);
  });

  it('uses the actual unique selected question count rather than the bank size', async () => {
    const bank = questionBank(3);
    const { complete } = openLevelled([...bank, ...bank]);
    await answerRound(2, 3);
    expect(complete).toHaveBeenCalledWith({ correct: 2, total: 3, score: 67, stars: 2 });
  });

  it('still caps longer question banks at ten questions', async () => {
    const { complete } = openLevelled(questionBank(12));
    await answerRound(9, 10);
    expect(complete).toHaveBeenCalledWith({ correct: 9, total: 10, score: 90, stars: 3 });
  });

  it('shows an empty-bank message without awarding results or progress', async () => {
    const { complete } = openLevelled([]);
    expect(screen.getByRole('status')).toHaveTextContent('No questions are ready for this game yet.');
    await act(async () => vi.advanceTimersByTime(30_000));
    expect(complete).not.toHaveBeenCalled();
    expect(level.recordResult).not.toHaveBeenCalled();
    expect(screen.queryByText(/NaN|Infinity/)).not.toBeInTheDocument();
  });

  it('does not record a partially played round when the child leaves', async () => {
    const { complete, unmount } = openLevelled(questionBank(10));
    fireEvent.click(screen.getByRole('button', { name: /^Right / }));
    act(() => vi.advanceTimersByTime(900));
    expect(screen.getByText('2 / 10')).toBeInTheDocument();
    unmount();
    await act(async () => vi.advanceTimersByTime(30_000));
    expect(complete).not.toHaveBeenCalled();
    expect(level.recordResult).not.toHaveBeenCalled();
  });
});

it('keeps the original QuizEngine stars callback argument for existing consumers', async () => {
  const complete = vi.fn((stars: number) => stars);
  render(<QuizEngine title="Legacy Quiz" emoji="📖" questions={questionBank(3)} onComplete={complete} />);
  await answerRound(2, 3);
  expect(complete).toHaveBeenCalledTimes(1);
  expect(complete).toHaveBeenCalledWith(2, { correct: 2, total: 3, score: 67, stars: 2 });
});

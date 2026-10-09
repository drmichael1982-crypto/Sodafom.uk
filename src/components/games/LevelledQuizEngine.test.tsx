import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const { recordResult, speak } = vi.hoisted(() => ({
  recordResult: vi.fn(async () => 1),
  speak: vi.fn(),
}));
vi.mock('@/hooks/useGameLevel', () => ({ useGameLevel: () => ({ level: 1, loading: false, recordResult }) }));
vi.mock('@/hooks/useChildAge', () => ({ useChildAge: () => ({ tier: 1 }) }));
vi.mock('@/lib/voice-context', () => ({ useVoice: () => ({ speak }) }));
vi.mock('./LevelBadge', () => ({ default: () => null }));
vi.mock('./ArchieGameHelper', () => ({ default: () => null }));
vi.mock('./ArchieReadAloudButton', () => ({ default: () => null }));
import LevelledQuizEngine from './LevelledQuizEngine';

beforeEach(() => { vi.useFakeTimers(); vi.clearAllMocks(); });
afterEach(() => { cleanup(); localStorage.clear(); vi.useRealTimers(); });

it.each([
  { total: 10, misses: 1, score: 90, correct: 9, stars: 3 },
  { total: 1, misses: 1, score: 0, correct: 0, stars: 0 },
  { total: 3, misses: 0, score: 100, correct: 3, stars: 3 },
])('reports exact first-attempt accuracy for $correct/$total, including retries', async ({ total, misses, score, correct, stars }) => {
  const onComplete = vi.fn();
  const questions = Array.from({ length: total }, (_, i) => ({
    question: `Question ${i + 1}`, options: ['Right', 'Wrong'], answer: 'Right', hint: 'Think again.',
  }));
  render(<LevelledQuizEngine gameSlug="accuracy-test" title="Accuracy" emoji="⭐" questionsByLevel={[questions]} onComplete={onComplete} />);
  for (let i = 0; i < total; i++) {
    if (i < misses) {
      fireEvent.click(screen.getByRole('button', { name: 'Wrong' }));
      fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    }
    fireEvent.click(screen.getByRole('button', { name: 'Right' }));
    await act(async () => { vi.advanceTimersByTime(2000); });
  }
  await act(async () => { vi.advanceTimersByTime(1200); });
  expect(recordResult).toHaveBeenCalledExactlyOnceWith(stars);
  expect(onComplete).toHaveBeenCalledExactlyOnceWith({ score, correct, total, stars });
});

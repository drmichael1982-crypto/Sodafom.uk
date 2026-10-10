import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PhonicsParrotPlay } from './phonics-parrot';

vi.mock('motion/react', () => ({
  motion: new Proxy({}, { get: (_target, tag: string) => tag }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

const ANSWERS: Record<string, string> = {
  S: 'sun', A: 'apple', T: 'tiger', P: 'parrot', I: 'insect', N: 'nest',
  SH: 'ship', CH: 'chair', TH: 'thumb', OO: 'moon', EE: 'bee', AI: 'rain',
};

function currentAnswer() {
  const letter = screen.getByText((content, element) =>
    element?.tagName === 'DIV' && Object.hasOwn(ANSWERS, content),
  ).textContent!;
  return ANSWERS[letter];
}

describe('Phonics Parrot completion', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('keeps the four answer choices in place while showing feedback', () => {
    const random = vi.spyOn(Math, 'random');
    render(<PhonicsParrotPlay onComplete={vi.fn()} />);

    const answerButtons = screen.getAllByRole('button').filter(button => !button.textContent?.includes('Hear the sound'));
    const labelsBefore = answerButtons.map(button => button.textContent);
    const callsBefore = random.mock.calls.length;

    fireEvent.click(answerButtons[0]);

    const labelsAfter = screen.getAllByRole('button')
      .filter(button => !button.textContent?.includes('Hear the sound'))
      .map(button => button.textContent?.replace(' ✅', '').replace(' ❌', ''));
    expect(labelsAfter).toEqual(labelsBefore);
    expect(random).toHaveBeenCalledTimes(callsBefore);
  });

  it('awards three stars once for a perfect ten-answer run', () => {
    const onComplete = vi.fn();
    render(<PhonicsParrotPlay onComplete={onComplete} />);

    for (let round = 0; round < 10; round += 1) {
      const answer = currentAnswer();
      const button = screen.getByRole('button', { name: new RegExp(answer, 'i') });
      fireEvent.click(button);
      // A rapid second tap must not create another round or completion timer.
      fireEvent.click(button);
      act(() => vi.advanceTimersByTime(1000));
    }

    expect(onComplete).toHaveBeenCalledExactlyOnceWith({ score: 100, correct: 10, total: 10, stars: 3 });
  });
});

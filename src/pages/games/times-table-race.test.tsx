import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('motion/react', () => ({
  motion: new Proxy({}, { get: (_target, tag) => tag }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('@/lib/archie/picture-pause', () => ({ usePicturePuzzlePause: () => true }));

import { TimesTablePlay } from './times-table-race';

describe('Times Table Race phone layout', () => {
  afterEach(cleanup);

  it('keeps the countdown and every answer reachable in one scrolling game region', () => {
    render(
      <TimesTablePlay
        level={1}
        onComplete={vi.fn()}
        onLevelChange={vi.fn()}
      />,
    );

    const game = screen.getByLabelText('Times Table Race game');
    expect(game).toHaveClass('h-full', 'min-h-0', 'overflow-y-auto', 'overscroll-contain');
    expect(screen.getByTestId('times-table-race-status')).toHaveClass('sticky', 'top-0');

    const answers = within(game).getAllByRole('button');
    expect(answers).toHaveLength(4);
    answers.forEach(answer => expect(answer).toHaveClass('py-5'));
  });
});

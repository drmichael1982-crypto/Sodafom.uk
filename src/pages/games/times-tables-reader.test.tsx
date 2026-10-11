import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

vi.mock('motion/react', () => ({
  motion: new Proxy({}, { get: (_target, tag: string) => tag }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

import { TimesTablesInner } from './times-tables-reader';

afterEach(cleanup);

it('keeps the learning and quiz controls large enough to tap', () => {
  render(<TimesTablesInner onComplete={vi.fn()} />);

  expect(screen.getByRole('button', { name: '2' })).toHaveClass('w-11', 'h-11');
  expect(screen.getByRole('button', { name: 'Read whole table aloud' })).toHaveClass('min-w-11', 'min-h-11');
  expect(screen.getByRole('button', { name: 'Read 2 times 1' })).toHaveClass('min-w-11', 'min-h-11');

  fireEvent.click(screen.getByRole('button', { name: /Test the 2× table!/ }));

  expect(screen.getByRole('button', { name: 'Hear the question' })).toHaveClass('min-h-11');
  expect(screen.getByRole('button', { name: 'Back to table' })).toHaveClass('min-h-11');
});

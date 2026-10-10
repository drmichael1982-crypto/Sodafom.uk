import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/archie/picture-pause', () => ({ usePicturePuzzlePause: () => true }));
import { MultiplicationGridInner } from './multiplication-grid';

describe('Multiplication Grid phone layout', () => {
  afterEach(cleanup);

  it('keeps the timer and all controls in one reachable scroll region', () => {
    render(<MultiplicationGridInner onComplete={vi.fn()} />);
    const region = screen.getByLabelText('Multiplication Grid game');
    expect(region).toHaveClass('h-full', 'min-h-0', 'overflow-y-auto', 'overscroll-contain');
    expect(screen.getByTestId('multiplication-timer')).toHaveClass('sticky', 'top-0');
    expect(screen.getAllByRole('spinbutton')).toHaveLength(25);
    expect(screen.getByRole('button', { name: 'Submit answers ✓' })).toBeInTheDocument();
  });
});

/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import BooksLibrary, { BOOKS_PER_SHELF, STORY_BOOKS, buildLibraryShelves } from '../BooksLibrary';

describe('BooksLibrary', () => {
  it('keeps every current Archie Stories choice on balanced shelves', () => {
    const shelves = buildLibraryShelves(STORY_BOOKS);

    expect(STORY_BOOKS).toHaveLength(16);
    expect(shelves).toHaveLength(4);
    expect(shelves.every(shelf => shelf.length === BOOKS_PER_SHELF)).toBe(true);
    expect(shelves.flat()).toEqual(STORY_BOOKS);
    expect(STORY_BOOKS.map(book => book.title)).toEqual(expect.arrayContaining([
      'Rendlesham Forest Adventure',
      'Archie and the Lost Key',
      'Archie’s Future Dreams',
    ]));
  });

  it('guards against an invalid shelf size', () => {
    expect(buildLibraryShelves(STORY_BOOKS, 0)).toEqual([]);
    expect(buildLibraryShelves(STORY_BOOKS, 1.5)).toEqual([]);
  });

  it('opens a cover into the Archie step-out welcome and returns to the shelves', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();

    render(<BooksLibrary onBack={onBack} />);

    expect(screen.getByRole('heading', { name: /archie’s book library/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /from the library$/i })).toHaveLength(STORY_BOOKS.length);

    await user.click(screen.getByRole('button', { name: 'Open Archie and the Lost Key from the library' }));

    expect(screen.getByText(/Archie has stepped out of the cover to welcome you/i)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Archie holding golden key/i })).toBeInTheDocument();
    expect(screen.getAllByText('Archie and the Lost Key')).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: /explore the shelves/i }));
    expect(screen.getByRole('heading', { name: /archie’s book library/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /back to home/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});

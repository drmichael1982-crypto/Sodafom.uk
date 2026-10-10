import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { afterEach, expect, it, vi } from 'vitest';
import { SiteSearch } from './SiteSearch';

function CurrentRoute() {
  return <output aria-label="Current route">{useLocation().pathname}</output>;
}

afterEach(cleanup);

it('opens Tricky Word Hunt at its registered game route', () => {
  render(<MemoryRouter initialEntries={['/']}><SiteSearch open onClose={vi.fn()} /><CurrentRoute /></MemoryRouter>);
  fireEvent.change(screen.getByPlaceholderText('Search games, subjects, pages…'), { target: { value: 'tricky' } });
  fireEvent.click(screen.getByRole('button', { name: /Tricky Word Hunt/ }));
  expect(screen.getByLabelText('Current route')).toHaveTextContent('/games/tricky-word-hunt');
});

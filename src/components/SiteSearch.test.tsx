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

it('does not advertise pricing while open testing mode keeps learning free', () => {
  render(<MemoryRouter initialEntries={['/']}><SiteSearch open onClose={vi.fn()} /></MemoryRouter>);
  fireEvent.change(screen.getByPlaceholderText('Search games, subjects, pages…'), { target: { value: 'pricing' } });
  expect(screen.queryByRole('button', { name: /Pricing & Plans/ })).not.toBeInTheDocument();
  expect(screen.getByText('No results for "pricing"')).toBeInTheDocument();
});

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { expect, it } from 'vitest';
import Footer from './Footer';

it('keeps owner administration out of public navigation and uses verifiable learning claims', () => {
  render(<MemoryRouter><Footer /></MemoryRouter>);

  expect(screen.queryByRole('button', { name: /Admin access/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /Admin access/i })).not.toBeInTheDocument();
  expect(screen.getByText('Interactive learning games')).toBeInTheDocument();
  expect(screen.getByText('Progress saved for each learner')).toBeInTheDocument();
  expect(screen.queryByText(/Millions of stars earned/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/special offers/i)).not.toBeInTheDocument();
});

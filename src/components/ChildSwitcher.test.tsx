import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import ChildSwitcher from './ChildSwitcher';

const children = [
  { id: 1, name: 'Mia', ageGroup: '5-7', avatarEmoji: '⭐', totalStars: 4 },
  { id: 2, name: 'Leo', ageGroup: '11-13', avatarEmoji: '🚀', totalStars: 9 },
];

function ControlledSwitcher() {
  const [activeChildId, setActiveChildId] = useState(1);
  return <ChildSwitcher children={children} activeChildId={activeChildId} onAddChild={vi.fn()} onSelect={setActiveChildId} />;
}

beforeEach(() => localStorage.clear());

it('updates the visible active learner after a same-page switch', () => {
  render(<ControlledSwitcher />);
  const switcher = screen.getByRole('button', { name: /currently Mia/ });
  expect(switcher).toHaveClass('min-h-11');
  fireEvent.click(switcher);
  fireEvent.click(screen.getByRole('option', { name: /Leo/ }));

  expect(screen.getByRole('button', { name: /currently Leo/ })).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem('sodafom_active_child') || '{}')).toMatchObject({ id: 2, name: 'Leo' });

  fireEvent.click(screen.getByRole('button', { name: /currently Leo/ }));
  expect(screen.getByRole('option', { name: /Leo/ })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('option', { name: /Mia/ })).toHaveAttribute('aria-selected', 'false');
  expect(screen.getByRole('button', { name: 'Add another child' })).toHaveClass('min-h-11');
});

it('marks the displayed fallback learner as selected', () => {
  render(<ChildSwitcher children={children} activeChildId={null} onAddChild={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: /currently Mia/ }));

  expect(screen.getByRole('option', { name: /Mia/ })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('option', { name: /Leo/ })).toHaveAttribute('aria-selected', 'false');
});

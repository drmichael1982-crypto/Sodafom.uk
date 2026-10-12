import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import AdminGameIdeas from './AdminGameIdeas';
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const idea = { id: 'idea-one', title: 'Fractions garden', subject: 'maths', description: 'Share flowers into equal groups.', createdAt: '2026-10-09T16:00:00.000Z' };
it('loads saved drafts, adds a private idea and uses only the allowed request fields', async () => {
  const fetcher = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ ideas: [], editable: true }) }).mockResolvedValueOnce({ ok: true, json: async () => ({ ideas: [idea], editable: true }) });
  vi.stubGlobal('fetch', fetcher);
  render(<AdminGameIdeas />);
  fireEvent.change(await screen.findByLabelText('Idea title'), { target: { value: idea.title } });
  fireEvent.change(screen.getByLabelText('What would you like to add?'), { target: { value: idea.description } });
  fireEvent.click(screen.getByRole('button', { name: 'Save game idea' }));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('No game was created or published.'));
  expect(fetcher.mock.calls[1][0]).toBe('/api/admin/game-ideas');
  expect(fetcher.mock.calls[1][1].method).toBe('PUT');
  expect(JSON.parse(fetcher.mock.calls[1][1].body)).toEqual({ title: idea.title, subject: idea.subject, description: idea.description });
  expect(screen.getByRole('heading', { name: idea.title })).toBeInTheDocument();
  expect(screen.getByLabelText('Idea title')).toHaveValue('');
  expect(screen.getByText('Draft')).toBeInTheDocument();
});
it('does not show a form when backend owner access is denied', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, json: async () => ({ error: 'Owner account required.' }) })));
  render(<AdminGameIdeas />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Owner account required.');
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
it('keeps storage-disabled drafts read-only and renders draft text without executing markup', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ ideas: [{ ...idea, description: '<script>fictional()</script>' }], editable: false }) })));
  const { container } = render(<AdminGameIdeas />);
  expect(await screen.findByRole('button', { name: 'Save game idea' })).toBeDisabled();
  expect(screen.getByText('<script>fictional()</script>')).toBeInTheDocument();
  expect(container.querySelector('script')).toBeNull();
});
it('retains an unsaved draft after storage errors and does not announce success', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ ideas: [], editable: true }) }).mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({ error: 'Storage unavailable.' }) }));
  render(<AdminGameIdeas />);
  fireEvent.change(await screen.findByLabelText('Idea title'), { target: { value: idea.title } });
  fireEvent.change(screen.getByLabelText('What would you like to add?'), { target: { value: idea.description } });
  fireEvent.click(screen.getByRole('button', { name: 'Save game idea' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Storage unavailable.');
  expect(screen.getByLabelText('Idea title')).toHaveValue(idea.title);
  expect(screen.queryByText(/Idea saved as/)).not.toBeInTheDocument();
});

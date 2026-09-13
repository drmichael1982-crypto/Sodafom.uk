import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { API_PREFIX } from '@/lib/config';
import AdminAccountsAndVisits from './AdminAccountsAndVisits';

const visits = { trafficToday: 3, trafficThisWeek: 12, trafficThisMonth: 44 };

afterEach(() => vi.unstubAllGlobals());

describe('AdminAccountsAndVisits', () => {
  it('shows visit figures without requesting account data in authorised-code test mode', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(<AdminAccountsAndVisits visits={visits} canViewAccounts={false} />);

    expect(screen.getByText('Visits today')).toBeInTheDocument();
    expect(screen.getByText('Authorised code testing remains available for visit figures.', { exact: false })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /load accounts/i })).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('loads only a signed-in administrator’s permitted account fields after an explicit click', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ users: [{ id: 'one', name: 'Ada', email: 'ada@example.test', created_at: '2026-09-01T12:00:00.000Z', passwordHash: 'not-rendered' }] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<AdminAccountsAndVisits visits={visits} canViewAccounts />);
    fireEvent.click(screen.getByRole('button', { name: 'Load accounts' }));

    await screen.findByText('ada@example.test');
    expect(screen.queryByText('not-rendered')).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(`${API_PREFIX}/admin/list-users`, expect.objectContaining({ credentials: 'include' }));
  });

  it('does not expose server errors to the account table', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    render(<AdminAccountsAndVisits visits={visits} canViewAccounts />);

    fireEvent.click(screen.getByRole('button', { name: 'Load accounts' }));
    await waitFor(() => expect(screen.getByText('Account details are not available for this session.')).toBeInTheDocument());
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import CheckoutSuccess from './success';

function response(body: unknown, ok = true): Response {
  return { ok, json: async () => body } as Response;
}

function renderSuccessPage() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/checkout/success?session_id=cs_test_safe123']}>
        <CheckoutSuccess />
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('checkout success verification', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('accepts a completed subscription trial only after account activation succeeds', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({
        success: true,
        session: { status: 'complete', paymentStatus: 'no_payment_required', mode: 'subscription' },
      }))
      .mockResolvedValueOnce(response({ success: true }));
    vi.stubGlobal('fetch', fetchMock);

    renderSuccessPage();

    expect(await screen.findByRole('heading', { name: /you.re in/i })).toBeInTheDocument();
    expect(screen.getByText(/7-day free trial has started/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not claim success when account activation fails', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({
        success: true,
        session: { status: 'complete', paymentStatus: 'paid', mode: 'subscription' },
      }))
      .mockResolvedValueOnce(response({ success: false }, false));
    vi.stubGlobal('fetch', fetchMock);

    renderSuccessPage();

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Payment issue' })).toBeInTheDocument());
    expect(screen.getByText(/account access could not be activated/i)).toBeInTheDocument();
  });
});

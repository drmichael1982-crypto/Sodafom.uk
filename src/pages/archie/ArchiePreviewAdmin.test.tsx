import type { ReactNode } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./ArchiePages', () => ({ Page: ({ title, children }: { title: string; children: ReactNode }) => <main><h1>{title}</h1>{children}</main> }));
import ArchiePreviewAdmin from './ArchiePreviewAdmin';

const draftKey = 'sodafom_preview_price_draft_v1';
const network = vi.fn();
const stripe = vi.fn();
function show() { return render(<MemoryRouter><ArchiePreviewAdmin /></MemoryRouter>); }
async function unlock(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Preview code'), '1182');
  await user.click(screen.getByRole('button', { name: 'Open preview controls' }));
}
beforeEach(() => {
  localStorage.removeItem(draftKey);
  network.mockReset(); stripe.mockReset();
  vi.stubGlobal('fetch', network); vi.stubGlobal('Stripe', stripe);
});
afterEach(() => {
  cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); localStorage.removeItem(draftKey);
});

describe('device-only preview controls', () => {
  it('blocks the wrong code and distinguishes the local code from an online administrator login', async () => {
    const user = userEvent.setup();
    show();
    expect(screen.getByRole('heading', { name: 'Open device-only preview controls' })).toBeInTheDocument();
    expect(screen.getByText(/not a secure online admin login/)).toBeInTheDocument();
    await user.type(screen.getByLabelText('Preview code'), '1111');
    await user.click(screen.getByRole('button', { name: 'Open preview controls' }));
    expect(screen.getByRole('status')).toHaveTextContent('Check the preview code and try again.');
    expect(screen.queryByLabelText('Draft price in pounds (£)')).not.toBeInTheDocument();
    expect(network).not.toHaveBeenCalled(); expect(stripe).not.toHaveBeenCalled();
  });

  it('opens with 1182 but exposes only preview review and local pricing preparation', async () => {
    const user = userEvent.setup();
    show(); await unlock(user);
    expect(screen.getByRole('heading', { name: 'School preview review' })).toBeInTheDocument();
    expect(screen.getByText('Payments are off in this school preview.')).toBeInTheDocument();
    expect(screen.getByText(/never create a charge or enable a live checkout/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Review page and game artwork' })).toHaveAttribute('href', '/artwork');
    expect(screen.getByRole('link', { name: 'Open teacher lessons' })).toHaveAttribute('href', '/teacher');
    expect(screen.getByRole('link', { name: 'Parent and AI setup' })).toHaveAttribute('href', '/parents');
    expect(screen.getByRole('link', { name: 'Try the clock lab' })).toHaveAttribute('href', '/time-lab');
    expect(localStorage.getItem(draftKey)).toBeNull();
    expect(network).not.toHaveBeenCalled(); expect(stripe).not.toHaveBeenCalled();
  });

  it('persists exact pence and period locally, restores them after reopening, and never calls checkout', async () => {
    const user = userEvent.setup();
    const page = show(); await unlock(user);
    await user.clear(screen.getByLabelText('Draft price in pounds (£)'));
    await user.type(screen.getByLabelText('Draft price in pounds (£)'), '19.99');
    await user.selectOptions(screen.getByLabelText('Billing period'), 'year');
    await user.click(screen.getByRole('button', { name: 'Save pricing draft' }));
    expect(JSON.parse(localStorage.getItem(draftKey)!)).toEqual({ amountPence: 1999, interval: 'year', currency: 'gbp' });
    expect(screen.getByRole('status')).toHaveTextContent('Draft saved on this device: £19.99 per year. No price or checkout has been changed in Stripe.');
    page.unmount(); show(); await unlock(user);
    expect(screen.getByLabelText('Draft price in pounds (£)')).toHaveValue('19.99');
    expect(screen.getByLabelText('Billing period')).toHaveValue('year');
    expect(network).not.toHaveBeenCalled(); expect(stripe).not.toHaveBeenCalled();
  });

  it.each(['0', '-1', '0.001', '1000.01', '10000', '1e3'])('rejects invalid price %s without replacing the saved draft', async value => {
    const user = userEvent.setup();
    const original = { amountPence: 499, interval: 'month', currency: 'gbp' };
    localStorage.setItem(draftKey, JSON.stringify(original));
    show(); await unlock(user);
    const store = vi.spyOn(Storage.prototype, 'setItem');
    fireEvent.change(screen.getByLabelText('Draft price in pounds (£)'), { target: { value } });
    await user.click(screen.getByRole('button', { name: 'Save pricing draft' }));
    expect(screen.getByRole('status')).toHaveTextContent(/Enter a price in pounds|Choose a draft price between/);
    expect(store).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem(draftKey)!)).toEqual(original);
    expect(network).not.toHaveBeenCalled(); expect(stripe).not.toHaveBeenCalled();
  });

  it.each([['0.01', 1], ['1000.00', 100000]] as const)('accepts the valid £%s boundary with exact pence', async (amount, pence) => {
    const user = userEvent.setup();
    show(); await unlock(user);
    fireEvent.change(screen.getByLabelText('Draft price in pounds (£)'), { target: { value: amount } });
    await user.click(screen.getByRole('button', { name: 'Save pricing draft' }));
    expect(JSON.parse(localStorage.getItem(draftKey)!)).toEqual({ amountPence: pence, interval: 'month', currency: 'gbp' });
    expect(network).not.toHaveBeenCalled(); expect(stripe).not.toHaveBeenCalled();
  });

  it('reports a failed browser save without claiming a Stripe change', async () => {
    const user = userEvent.setup();
    show(); await unlock(user);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => { throw new Error('storage unavailable'); });
    await user.click(screen.getByRole('button', { name: 'Save pricing draft' }));
    expect(screen.getByRole('status')).toHaveTextContent('The browser could not save this draft. No Stripe setting was changed.');
    expect(localStorage.getItem(draftKey)).toBeNull();
    expect(network).not.toHaveBeenCalled(); expect(stripe).not.toHaveBeenCalled();
  });

  it('locks back to an empty code field without granting server authority or deleting a pricing draft', async () => {
    const user = userEvent.setup();
    show(); await unlock(user);
    await user.click(screen.getByRole('button', { name: 'Save pricing draft' }));
    const original = localStorage.getItem(draftKey);
    await user.click(screen.getByRole('button', { name: 'Lock preview controls' }));
    expect(screen.getByLabelText('Preview code')).toHaveValue('');
    expect(screen.queryByRole('button', { name: 'Save pricing draft' })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(localStorage.getItem(draftKey)).toBe(original);
    expect(network).not.toHaveBeenCalled(); expect(stripe).not.toHaveBeenCalled();
  });
});

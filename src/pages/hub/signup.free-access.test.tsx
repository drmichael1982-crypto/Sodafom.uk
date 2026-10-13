import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const auth = vi.hoisted(() => ({ email: vi.fn() }));

vi.mock('@/lib/auth/auth-client.tsx', () => ({
  signUp: { email: auth.email },
}));

import SignupPage from './signup';

function show(entry = '/hub/signup') {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route path="/hub/signup" element={<SignupPage />} />
          <Route path="/hub" element={<p>Parent hub destination</p>} />
          <Route path="/subscribe" element={<p>Payment page destination</p>} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

beforeEach(() => {
  auth.email.mockReset();
  auth.email.mockResolvedValue({ data: { user: { id: 'parent-test' } }, error: null });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('free parent signup', () => {
  it('presents one free account step with labelled, phone-friendly controls', () => {
    show();

    expect(screen.getByText('Your details — learning is free during testing')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create free account' })).toBeInTheDocument();
    expect(screen.getByText('Free during testing')).toBeInTheDocument();
    expect(screen.getByLabelText('Full name')).toBeRequired();
    expect(screen.getByLabelText('Email address')).toBeRequired();
    expect(screen.getByLabelText(/Phone number/)).toHaveAttribute('type', 'tel');
    expect(screen.getByLabelText('Password')).toHaveAttribute('minlength', '8');
    expect(screen.getByRole('button', { name: 'Show password' })).toHaveClass('min-h-11', 'min-w-11');
    expect(screen.queryByText(/Step 1 of 2/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/choose a plan/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Cancel anytime/i)).not.toBeInTheDocument();
  });

  it('keeps a legacy subscribe return inside the free parent hub after signup', async () => {
    const user = userEvent.setup();
    show('/hub/signup?redirect=%2Fsubscribe');

    expect(screen.getByText('Create your free account to continue. No plan or payment is needed.')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Full name'), 'Test Parent');
    await user.type(screen.getByLabelText('Email address'), 'parent@example.test');
    await user.type(screen.getByLabelText('Password'), 'A-safe-test-password');
    await user.click(screen.getByRole('button', { name: 'Create free account' }));

    await waitFor(() => expect(screen.getByText('Parent hub destination')).toBeInTheDocument());
    expect(screen.queryByText('Payment page destination')).not.toBeInTheDocument();
    expect(auth.email).toHaveBeenCalledWith({
      name: 'Test Parent',
      email: 'parent@example.test',
      password: 'A-safe-test-password',
      phoneNumber: '',
    });
  });
});

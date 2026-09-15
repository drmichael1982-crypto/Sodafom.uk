// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
const fake = vi.hoisted(() => ({
  current: { data: null as any, isPending: false, error: null as any, refetch: vi.fn() },
  signOut: vi.fn(), signIn: vi.fn(), signUp: vi.fn(), getSession: vi.fn(), resetPassword: vi.fn(),
}));
vi.mock('better-auth/react', () => ({ createAuthClient: () => ({
  useSession: () => fake.current, signOut: fake.signOut,
  signIn: { email: fake.signIn }, signUp: { email: fake.signUp },
  getSession: fake.getSession, resetPassword: fake.resetPassword,
}) }));
vi.mock('@/lib/config', () => ({ API_PREFIX: '/api', API_BASE_URL: 'https://wrong-host.example' }));
vi.mock('@/lib/testing-mode', () => ({ OPEN_TESTING_MODE: true }));
vi.mock('@dr.pogodin/react-helmet', () => ({ Helmet: () => null }));
vi.mock('motion/react', async () => {
  const React = await import('react');
  const cache = new Map();
  return { AnimatePresence: ({ children }: any) => children,
    motion: new Proxy({}, { get(_target, tag: string) {
      if (!cache.has(tag)) cache.set(tag, ({ children, initial, animate, transition, exit, variants, ...props }: any) => React.createElement(tag, props, children));
      return cache.get(tag);
    } }),
  };
});
import { AccountAccessBoundary, LogoutButton } from '@/lib/auth/auth-client';
import LoginPage from '@/pages/hub/login';
import SignupPage from '@/pages/hub/signup';
import ResetPasswordPage from '@/pages/hub/reset-password';
function fresh(role = 'parent') {
  return { user: { id: 'test-account', role, isAdmin: false }, session: { expiresAt: new Date(Date.now()+3_600_000) } };
}
function Position() { const location=useLocation(); return <output data-testid="location">{location.pathname}{location.search}</output>; }
function Shell({ path = '/hub' }: { path?: string }) {
  return <MemoryRouter initialEntries={[path]}><Position/><Routes>
    <Route path="/hub/login" element={<LoginPage/>}/>
    <Route path="/hub/signup" element={<AccountAccessBoundary><SignupPage/></AccountAccessBoundary>}/>
    <Route path="/hub/reset-password" element={<ResetPasswordPage/>}/>
    <Route path="*" element={<AccountAccessBoundary><p>Protected adult content</p><LogoutButton/></AccountAccessBoundary>}/>
  </Routes></MemoryRouter>;
}
beforeEach(() => {
  vi.clearAllMocks(); fake.current={data:fresh(),isPending:false,error:null,refetch:vi.fn().mockResolvedValue(undefined)};
  fake.signOut.mockResolvedValue({data:{success:true},error:null});
  fake.signIn.mockResolvedValue({data:{},error:null});
  fake.signUp.mockResolvedValue({data:{},error:null});
  fake.getSession.mockImplementation(async()=>({data:fake.current.data,error:fake.current.error}));
  fake.resetPassword.mockResolvedValue({data:{success:true},error:null});
  vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new Error('Unexpected network request in UI unit test')));
  localStorage.clear(); sessionStorage.clear();
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
test('healthy parent session renders protected content',()=>{render(<Shell/>);expect(screen.queryByText('Protected adult content')).not.toBeNull();});
for (const path of ['/hub','/parent-area','/admin-panel','/teacher-hub']) {
  test(`child cannot render adult content at ${path}`,()=>{fake.current.data=fresh('child');render(<Shell path={path}/>);expect(screen.queryByText('Protected adult content')).toBeNull();expect(screen.queryByRole('alert')).not.toBeNull();});
}
test('session error does not automatically reset cookies or reload',async()=>{
  vi.useFakeTimers();fake.current.error={status:503};render(<Shell/>);
  await act(async()=>{vi.advanceTimersByTime(31_000);});
  expect(screen.queryByText('Protected adult content')).toBeNull();expect(fetch).not.toHaveBeenCalled();
});
test('a healthy result recovers after the loading timeout',async()=>{
  vi.useFakeTimers();fake.current={data:null,isPending:true,error:null,refetch:vi.fn()};const view=render(<Shell/>);
  await act(async()=>{vi.advanceTimersByTime(30_001);});expect(screen.queryByRole('alert')).not.toBeNull();
  fake.current={data:fresh(),isPending:false,error:null,refetch:vi.fn()};view.rerender(<Shell/>);
  expect(screen.queryByText('Protected adult content')).not.toBeNull();
});
test('expired session redirects to the actual login page rather than a blank screen',()=>{
  fake.current.data={user:{id:'test-account',role:'parent'},session:{expiresAt:new Date(Date.now()-1)}};
  render(<Shell/>);expect(screen.getByTestId('location').textContent).toBe('/hub/login');expect(screen.queryByText('Welcome back')).not.toBeNull();
});
test('returned logout error remains visible and does not navigate away',async()=>{
  fake.signOut.mockResolvedValue({error:{status:503}});render(<Shell/>);
  await act(async()=>{fireEvent.click(screen.getByRole('button',{name:'Logout'}));});
  expect(screen.queryByRole('alert')).not.toBeNull();expect(screen.getByTestId('location').textContent).toBe('/hub');
});
test('confirmed logout navigates through the router',async()=>{
  render(<Shell/>);await act(async()=>{fireEvent.click(screen.getByRole('button',{name:'Logout'}));});
  expect(screen.getByTestId('location').textContent).toBe('/hub/login');
});
test('login renders when browser storage is blocked',()=>{
  vi.spyOn(window,'localStorage','get').mockImplementation(()=>{throw new Error('Storage disabled');});
  vi.spyOn(window,'sessionStorage','get').mockImplementation(()=>{throw new Error('Storage disabled');});
  render(<Shell path="/hub/login"/>);expect(screen.queryByText('Welcome back')).not.toBeNull();
});
test('login confirms the session and preserves an internal return path',async()=>{
  const view=render(<Shell path="/hub/login?from=%2Fparent-area"/>);
  fireEvent.change(screen.getByPlaceholderText('you@example.com'),{target:{value:'TEST@EXAMPLE.TEST'}});
  fireEvent.change(screen.getByPlaceholderText('••••••••'),{target:{value:'Test-only-password'}});
  await act(async()=>{fireEvent.submit(view.container.querySelector('form')!);});
  expect(fake.signIn).toHaveBeenCalledWith({email:'test@example.test',password:'Test-only-password'});
  expect(fake.getSession).toHaveBeenCalled();expect(screen.getByTestId('location').textContent).toBe('/parent-area');
});
test('login does not enter a redirect loop when the cookie session was not saved',async()=>{
  fake.getSession.mockResolvedValue({data:null,error:null});const view=render(<Shell path="/hub/login"/>);
  fireEvent.change(screen.getByPlaceholderText('you@example.com'),{target:{value:'test@example.test'}});
  fireEvent.change(screen.getByPlaceholderText('••••••••'),{target:{value:'Test-only-password'}});
  await act(async()=>{fireEvent.submit(view.container.querySelector('form')!);});
  expect(screen.getByTestId('location').textContent).toBe('/hub/login');expect(screen.queryByRole('alert')).not.toBeNull();
});
test('signup rejects external/privileged return paths before rendering its existing form',()=>{
  render(<Shell path="/hub/signup?redirect=https%3A%2F%2Fbad.example"/>);
  const location=new URL(screen.getByTestId('location').textContent!,'https://sodafom.uk');
  expect(location.searchParams.get('redirect')).toBe('/hub');expect(screen.queryByText('Create your account')).not.toBeNull();
});
test('the existing signup form completes with an isolated successful auth response',async()=>{
  const view=render(<Shell path="/hub/signup"/>);
  fireEvent.change(screen.getByPlaceholderText('e.g. Sarah Johnson'),{target:{value:'Test Parent'}});
  fireEvent.change(screen.getByPlaceholderText('you@example.com'),{target:{value:'test@example.test'}});
  fireEvent.change(screen.getByPlaceholderText('At least 8 characters'),{target:{value:'Test-only-password'}});
  await act(async()=>{fireEvent.submit(view.container.querySelector('form')!);});
  expect(fake.signUp).toHaveBeenCalled();expect(screen.getByTestId('location').textContent).toBe('/hub');expect(fetch).not.toHaveBeenCalled();
});
test('a missing reset token has a visible explanation and recovery link',()=>{
  render(<Shell path="/hub/reset-password?error=INVALID_TOKEN"/>);
  expect(screen.queryByRole('alert')).not.toBeNull();expect(screen.queryByRole('link',{name:'Request a new reset link'})).not.toBeNull();
  expect((screen.getByRole('button',{name:'Update password'}) as HTMLButtonElement).disabled).toBe(true);
});

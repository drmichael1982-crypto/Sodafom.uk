import React from 'react';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
const mocks = vi.hoisted(() => ({ local: vi.fn(), speak: vi.fn(), photo: vi.fn(), child: vi.fn(), setChild: vi.fn() }));
vi.mock('react-router', () => ({ useNavigate: () => vi.fn() }));
vi.mock('@/lib/config', () => ({ API_PREFIX: '/api' }));
vi.mock('@/lib/voice-context', () => ({ ttsSpeak: mocks.speak }));
vi.mock('@/lib/archie-local', () => ({ tryLocalArchieResponse: mocks.local }));
vi.mock('@/lib/learning-photo', () => ({ prepareLearningPhoto: mocks.photo }));
vi.mock('@/hooks/useChildAge', () => ({ getActiveChild: mocks.child, setActiveChild: mocks.setChild }));
import AITeacherPage from '../AITeacherPage';
beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); mocks.local.mockReturnValue(null); mocks.child.mockReturnValue(null); vi.stubGlobal('fetch', vi.fn()); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.useRealTimers(); });
function ask(text: string) {
  const input = screen.getByPlaceholderText('What would you like Archie to teach?');
  fireEvent.change(input, { target: { value: text } });
  fireEvent.click(input.parentElement!.querySelector('button')!);
}
it('answers locally using the selected age without requesting a paid model', async () => {
  mocks.local.mockReturnValue({ text: 'Twelve divided by three is four.', intent: 'maths' });
  render(<AITeacherPage />);
  fireEvent.change(screen.getByLabelText('How old is the learner?'), { target: { value: '12' } });
  ask('12 / 3');
  expect(mocks.local).toHaveBeenCalledWith('12 / 3', { age: 12 });
  expect(fetch).not.toHaveBeenCalled();
  expect(screen.getByText('Local Archie')).toBeTruthy();
});
it('failed online fallback neither repeats nor speaks raw user input', async () => {
  vi.mocked(fetch).mockResolvedValue(new Response('Unavailable', { status: 403 }));
  render(<AITeacherPage />); ask('private sample sentence that should not be echoed');
  await screen.findByText('The online teacher is unavailable. Your question has not been answered.');
  expect(mocks.speak).not.toHaveBeenCalled();
  expect(screen.queryByText('Local Archie')).toBeNull();
  expect(screen.queryByText(/regarding.*private sample/)).toBeNull();
  expect(vi.mocked(fetch).mock.calls[0][1]).toMatchObject({ credentials: 'include' });
});
it('photo failure does not claim that Archie saw or read the page', async () => {
  mocks.photo.mockResolvedValue('data:image/jpeg;base64,prepared');
  vi.mocked(fetch).mockResolvedValue(new Response('Unavailable', { status: 403 }));
  const { container } = render(<AITeacherPage />);
  fireEvent.change(container.querySelector('input[type=file]')!, { target: { files: [new File(['fake'], 'page.jpg', { type: 'image/jpeg' })] } });
  await screen.findByText(/I could not read the words in this photograph/);
  expect(screen.queryByText(/I have looked/)).toBeNull(); expect(mocks.speak).not.toHaveBeenCalled();
  expect(screen.getByText('Reading guidance')).toBeTruthy();
  const options = vi.mocked(fetch).mock.calls[0][1]!;
  expect(options.credentials).toBe('include'); expect(JSON.parse(options.body as string).image).toBe('data:image/jpeg;base64,prepared');
});
it('unreadable photo is rejected before any network request', async () => {
  mocks.photo.mockRejectedValue(new Error('Cannot decode'));
  const { container } = render(<AITeacherPage />);
  fireEvent.change(container.querySelector('input[type=file]')!, { target: { files: [new File(['bad'], 'page.jpg', { type: 'image/jpeg' })] } });
  await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
  expect(fetch).not.toHaveBeenCalled();
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}
it('aborts on unmount, clears its timeout and suppresses a late online answer', async () => {
  vi.useFakeTimers();
  const pending = deferred<Response>();
  vi.mocked(fetch).mockReturnValue(pending.promise);
  const { unmount } = render(<AITeacherPage />);
  ask('an unsupported question');
  const signal = vi.mocked(fetch).mock.calls[0][1]!.signal!;
  expect(signal.aborted).toBe(false);
  expect(vi.getTimerCount()).toBeGreaterThan(0);
  unmount();
  expect(signal.aborted).toBe(true);
  expect(vi.getTimerCount()).toBe(0);
  await act(async () => { pending.resolve(new Response('Late online answer')); });
  expect(mocks.speak).not.toHaveBeenCalled();
});
it('does not upload a photo that finishes preparing after unmount', async () => {
  const pending = deferred<string>(); mocks.photo.mockReturnValue(pending.promise);
  const { container, unmount } = render(<AITeacherPage />);
  fireEvent.change(container.querySelector('input[type=file]')!, { target: { files: [new File(['photo'], 'page.jpg', { type: 'image/jpeg' })] } });
  unmount();
  await act(async () => { pending.resolve('data:image/jpeg;base64,prepared'); });
  expect(fetch).not.toHaveBeenCalled(); expect(mocks.speak).not.toHaveBeenCalled();
});
it('uses one shared synchronous guard for rapid question and photo actions', () => {
  vi.mocked(fetch).mockReturnValue(new Promise(() => {}));
  const { container } = render(<AITeacherPage />);
  const input = screen.getByPlaceholderText('What would you like Archie to teach?');
  fireEvent.change(input, { target: { value: 'unsupported question' } });
  const button = input.parentElement!.querySelector('button')!;
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fireEvent.change(container.querySelector('input[type=file]')!, { target: { files: [new File(['photo'], 'page.jpg', { type: 'image/jpeg' })] } });
  });
  expect(fetch).toHaveBeenCalledTimes(1); expect(mocks.photo).not.toHaveBeenCalled();
});
it('changing guest age never creates a pretend active child', () => {
  render(<AITeacherPage />);
  fireEvent.change(screen.getByLabelText('How old is the learner?'), { target: { value: '7' } });
  expect(mocks.setChild).not.toHaveBeenCalled();
  expect((screen.getByLabelText('How old is the learner?') as HTMLSelectElement).value).toBe('7');
});
it('changing age preserves an existing child identity', () => {
  const child = { id: 42, name: 'Test child', avatarEmoji: '⭐', ageGroup: '8-10' };
  mocks.child.mockReturnValue(child); render(<AITeacherPage />);
  fireEvent.change(screen.getByLabelText('How old is the learner?'), { target: { value: '12' } });
  expect(mocks.setChild).toHaveBeenCalledWith({ ...child, ageGroup: '11-13' });
});

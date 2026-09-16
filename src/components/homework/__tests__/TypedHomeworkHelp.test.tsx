import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as routing from '@/lib/archie-routing';
import { ArchieRoutingError, localArchieReply } from '@/lib/archie-routing-core';
import { clearActivePendingQuestion, getActivePendingQuestion, setActivePendingQuestion } from '@/lib/tutor/engine';
import { CURRICULUM_LESSONS } from '@/lib/tutor/curriculum';
import TypedHomeworkHelp from '../TypedHomeworkHelp';
import { localHomeworkHelp } from '../homework-help';

const originalQuestion = 'Please explain 7 × 8 with a simple example.';
const input = () => screen.getByRole('textbox', { name: 'Your homework question' });
const askButton = () => screen.getByRole('button', { name: 'Ask Archie' });

function enter(question = originalQuestion) {
  fireEvent.change(input(), { target: { value: question } });
}

beforeEach(() => {
  localStorage.clear();
  clearActivePendingQuestion();
  vi.spyOn(routing, 'askArchie');
  vi.stubGlobal('fetch', vi.fn(() => { throw new Error('Network is forbidden in homework tests'); }));
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  clearActivePendingQuestion();
});

describe('typed homework help', () => {
  it('answers the audited typed-only question through the real local route without a photo, network or charge', async () => {
    const save = vi.spyOn(Storage.prototype, 'setItem');
    render(<TypedHomeworkHelp />);
    expect(askButton()).toBeDisabled();
    enter();
    fireEvent.click(askButton());
    expect(await screen.findByRole('heading', { name: 'Archie’s homework help' })).toBeInTheDocument();
    expect(screen.getByText(/7 × 8 = 56\./)).toBeInTheDocument();
    expect(screen.getByText(/Picture 7 bags with 8 counters/)).toBeInTheDocument();
    expect(screen.getByText('Local AI · No vouchers used')).toBeInTheDocument();
    expect(input()).toHaveValue(originalQuestion);
    expect(routing.askArchie).toHaveBeenCalledWith(expect.objectContaining({
      messages: [{ role: 'user', content: originalQuestion }], allowOpenAiFallback: false,
    }));
    expect(fetch).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it('gives a hint without replacing the original question or revealing the total', async () => {
    render(<TypedHomeworkHelp />);
    enter();
    fireEvent.click(screen.getByRole('button', { name: 'Give me a hint' }));
    expect(await screen.findByRole('heading', { name: 'Archie’s hint' })).toBeInTheDocument();
    expect(screen.getByText(/Picture 7 bags with 8 counters/)).toBeInTheDocument();
    expect(screen.queryByText(/56/)).not.toBeInTheDocument();
    expect(input()).toHaveValue(originalQuestion);
    fireEvent.click(askButton());
    expect(await screen.findByText(/7 × 8 = 56\./)).toBeInTheDocument();
    expect(input()).toHaveValue(originalQuestion);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('shows thinking feedback, blocks duplicate sends, then renders a result', async () => {
    let resolve!: (value: routing.ArchieReply) => void;
    vi.mocked(routing.askArchie).mockReturnValueOnce(new Promise(done => { resolve = done; }));
    render(<TypedHomeworkHelp />);
    enter();
    fireEvent.click(askButton());
    expect(screen.getByRole('status')).toHaveTextContent('Archie is thinking');
    expect(askButton()).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Give me a hint' })).toBeDisabled();
    fireEvent.click(askButton());
    expect(routing.askArchie).toHaveBeenCalledTimes(1);
    await act(async () => resolve(localArchieReply('7 × 8 = 56.')));
    expect(screen.getByText('7 × 8 = 56.')).toBeInTheDocument();
    expect(askButton()).toBeEnabled();
    expect(screen.queryByText(/Archie is thinking/)).not.toBeInTheDocument();
  });

  it('shows an error and retries with the original question after a failure', async () => {
    vi.mocked(routing.askArchie).mockRejectedValueOnce(new ArchieRoutingError('LOCAL_UNAVAILABLE'));
    render(<TypedHomeworkHelp />);
    enter();
    fireEvent.click(askButton());
    expect(await screen.findByRole('alert')).toHaveTextContent('My local learning help is having a little trouble');
    expect(input()).toHaveValue(originalQuestion);
    expect(screen.queryByRole('heading', { name: 'Archie’s homework help' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText(/7 × 8 = 56\./)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(routing.askArchie).toHaveBeenCalledTimes(2);
  });

  it('honestly rejects an unknown question and preserves it without using a paid fallback', async () => {
    render(<TypedHomeworkHelp />);
    enter('Tell me the secret answer to page 93 of my homework book.');
    fireEvent.click(askButton());
    expect(await screen.findByRole('alert')).toHaveTextContent('I do not know that one locally yet');
    expect(input()).toHaveValue('Tell me the secret answer to page 93 of my homework book.');
    expect(routing.askArchie).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('explains when no useful hint is available instead of replacing the question with generic text', async () => {
    render(<TypedHomeworkHelp />);
    enter('What is gravity?');
    fireEvent.click(screen.getByRole('button', { name: 'Give me a hint' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('I have not got a useful hint');
    expect(input()).toHaveValue('What is gravity?');
    fireEvent.click(askButton());
    expect(await screen.findByText(/Gravity is a force/)).toBeInTheDocument();
  });

  it('can cancel and ignores a cancelled request that resolves after the next answer', async () => {
    let finishOld!: (value: routing.ArchieReply) => void;
    vi.mocked(routing.askArchie).mockReturnValueOnce(new Promise(done => { finishOld = done; }));
    render(<TypedHomeworkHelp />);
    enter();
    fireEvent.click(askButton());
    const signal = vi.mocked(routing.askArchie).mock.calls[0][0].signal!;
    fireEvent.click(screen.getByRole('button', { name: 'Cancel typed question' }));
    expect(signal.aborted).toBe(true);
    expect(screen.getByRole('status')).toHaveTextContent('Your question was stopped');
    expect(input()).toHaveValue(originalQuestion);
    enter('3 + 4');
    fireEvent.click(askButton());
    expect(await screen.findByText(/3 \+ 4 = 7\./)).toBeInTheDocument();
    await act(async () => finishOld(localArchieReply('Old answer that must not be shown')));
    expect(screen.queryByText('Old answer that must not be shown')).not.toBeInTheDocument();
    expect(screen.getByText(/3 \+ 4 = 7\./)).toBeInTheDocument();
  });

  it('aborts an in-flight request when editing or leaving the page', () => {
    vi.mocked(routing.askArchie).mockImplementation(() => new Promise(() => {}));
    const view = render(<TypedHomeworkHelp />);
    enter(); fireEvent.click(askButton());
    const firstSignal = vi.mocked(routing.askArchie).mock.calls[0][0].signal!;
    enter('2 + 3');
    expect(firstSignal.aborted).toBe(true);
    fireEvent.click(askButton());
    const secondSignal = vi.mocked(routing.askArchie).mock.calls[1][0].signal!;
    view.unmount();
    expect(secondSignal.aborted).toBe(true);
  });

  it('times out visibly instead of leaving a question spinning forever', async () => {
    vi.useFakeTimers();
    vi.mocked(routing.askArchie).mockImplementation(() => new Promise(() => {}));
    render(<TypedHomeworkHelp />);
    enter(); fireEvent.click(askButton());
    const signal = vi.mocked(routing.askArchie).mock.calls[0][0].signal!;
    await act(async () => vi.advanceTimersByTime(15000));
    expect(signal.aborted).toBe(true);
    expect(screen.getByRole('alert')).toHaveTextContent('That took too long');
    expect(input()).toHaveValue(originalQuestion);
    expect(askButton()).toBeEnabled();
  });

  it('rejects an empty answer instead of showing an empty success panel', async () => {
    vi.mocked(routing.askArchie).mockResolvedValueOnce(localArchieReply('   '));
    render(<TypedHomeworkHelp />);
    enter(); fireEvent.click(askButton());
    expect(await screen.findByRole('alert')).toHaveTextContent('I could not read that answer properly');
  });

  it('does not consume an unrelated pending lesson question or save homework as a quiz result', async () => {
    const lesson = CURRICULUM_LESSONS.find(item => item.questions.length)!;
    setActivePendingQuestion(lesson.subject, lesson.topic, lesson.questions[0]);
    const pending = getActivePendingQuestion();
    const save = vi.spyOn(Storage.prototype, 'setItem');
    render(<TypedHomeworkHelp />);
    enter('What is gravity?'); fireEvent.click(askButton());
    await screen.findByText(/Gravity is a force/);
    expect(getActivePendingQuestion()).toBe(pending);
    expect(save).not.toHaveBeenCalled();
  });

  it('keeps whitespace-only questions disabled', () => {
    render(<TypedHomeworkHelp />);
    enter('   \n ');
    expect(askButton()).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Give me a hint' })).toBeDisabled();
  });
});

describe('local homework examples', () => {
  it.each([
    ['Explain 7 × 8 with a simple example.', '7 × 8 = 56.'],
    ['Please explain 8 plus 7 step by step.', '8 + 7 = 15.'],
    ['What is 9 minus 4?', '9 − 4 = 5.'],
    ['Help me with 24 divided by 6.', '24 ÷ 6 = 4.'],
    ['0 times 7', '0 × 7 = 0.'],
  ])('returns an accurate short example for %s', (question, answer) => {
    expect(localHomeworkHelp(question, false)).toContain(answer);
  });

  it.each(['Explain 7 × 8 + 3 with a simple example.', 'I have 7 × 8 sweets, then eat 3. How many are left?', 'Explain 7 ÷ 0.', 'Explain 7.5 × 8.'])('does not extract a misleading simple sum from %s', question => {
    expect(localHomeworkHelp(question, false)).toBeNull();
    expect(localHomeworkHelp(question, true)).toBeNull();
  });
});

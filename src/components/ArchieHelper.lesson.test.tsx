import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LessonCoachContext } from '@/lib/archie/lesson-coach';
const { speak, stop, navigate, ctx } = vi.hoisted(() => ({ speak: vi.fn(), stop: vi.fn(), navigate: vi.fn(), ctx: { lesson: null as LessonCoachContext | null } }));
vi.mock('@/lib/voice-context', () => ({ useVoice: () => ({ speak, stop, playing: false }) }));
vi.mock('react-router', () => ({ useNavigate: () => navigate, useLocation: () => ({ pathname: '/courses/x' }) }));
vi.mock('@/contexts/ArchieContext', () => ({ useArchieContext: () => ({ isOpen: true, draft: '', voiceOnOpen: false, openArchie: vi.fn(), closeArchie: vi.fn(), gameTitle: 'Adding on', subject: 'Maths', currentQuestion: 'What is 3 + 4?', currentOptions: ['6', '7', '8'], lesson: ctx.lesson }) }));
import ArchieHelper from './ArchieHelper';

const practice: LessonCoachContext = { phase: 'practice', phaseLabel: 'Play and practise', subject: 'maths', objective: 'Add by counting on', hint: 'Start at 4 and count on 3.', correctOption: '7', answeredCorrectly: false, wrongAttempts: 0, workedExample: { prompt: '2 + 3', explanation: 'Start at 3 and count on 2 more.' } };
beforeEach(() => {
  localStorage.clear();
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
  HTMLElement.prototype.scrollIntoView = vi.fn();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks(); ctx.lesson = null; });
async function ask(question: string) {
  render(<ArchieHelper />);
  fireEvent.change(screen.getByLabelText('Your question for Archie'), { target: { value: question } });
  fireEvent.click(screen.getByLabelText('Send question'));
  return screen.findByText((_, element) => element?.tagName === 'P' && element.classList.contains('chat-assistant'));
}
describe('Archie during lesson practice', () => {
  it('shows the current phase in the helper header', () => {
    ctx.lesson = practice;
    render(<ArchieHelper />);
    expect(screen.getByText('Helping with Adding on · Play and practise')).toBeInTheDocument();
  });
  it.each(['What is the answer?', 'What is 3 + 4?', 'just tell me'])('does not reveal the correct choice for "%s" before a correct answer', async (question) => {
    ctx.lesson = practice;
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    const reply = await ask(question);
    expect(reply.textContent).not.toMatch(/(^|[^0-9])7([^0-9]|$)/);
    expect(reply.textContent).toContain('Start at 4 and count on 3.');
    expect(fetch).not.toHaveBeenCalled();
    expect(localStorage.getItem('sodafom_archie_learning_v1')).toBeNull();
  });
  it('still answers the same maths freely once the child has answered correctly', async () => {
    ctx.lesson = { ...practice, answeredCorrectly: true, explanation: '4 and 3 more make 7.' };
    const reply = await ask('What is 3 + 4?');
    expect(reply.textContent).toMatch(/7/);
  });
  it('keeps an opted-in online reply from giving away the answer, and never sends the answer', async () => {
    ctx.lesson = practice;
    localStorage.setItem('sodafom_archie_design_v1', JSON.stringify({ settings: { year: 4, sound: false, largeText: false, onlineHelp: true }, activities: [], stickers: [] }));
    const fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => 'The answer is 7!' }); vi.stubGlobal('fetch', fetch);
    const reply = await ask('Do pirates like adding numbers');
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.systemExtra).toContain('Lesson phase: Play and practise');
    expect(body.systemExtra).toContain('never state or confirm which choice is correct');
    expect(reply.textContent).not.toContain('The answer is 7');
  });
});

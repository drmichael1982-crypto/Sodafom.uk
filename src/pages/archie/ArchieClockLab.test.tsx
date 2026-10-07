import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ year: 1, speak: vi.fn(), stop: vi.fn(), context: vi.fn(), clear: vi.fn() }));
vi.mock('./ArchiePages', () => ({ Page: ({ children, title }: { children: ReactNode; title: string }) => <main><h1>{title}</h1>{children}</main> }));
vi.mock('@/lib/archie/storage', () => ({ useArchieData: () => ({ settings: { year: mocks.year } }) }));
vi.mock('@/lib/voice-context', () => ({ useVoice: () => ({ speak: mocks.speak, stop: mocks.stop }) }));
vi.mock('@/contexts/ArchieContext', () => ({ useArchieContext: () => ({ setGameContext: mocks.context, clearGameContext: mocks.clear }) }));
import ArchieClockLab, { LabClock, clockAngles, clockDescription, digitalTime, timeChallenges } from './ArchieClockLab';

beforeEach(() => { mocks.year = 1; vi.clearAllMocks(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });
function setClock(hour: number, minute: number) {
  fireEvent.change(screen.getByRole('combobox', { name: 'Clock hour' }), { target: { value: String(hour) } });
  fireEvent.change(screen.getByRole('combobox', { name: 'Clock minute' }), { target: { value: String(minute) } });
}
const EARLY = [[2, 0], [7, 30], [10, 0], [4, 30]];
const FIVE_MINUTE = [[3, 15], [6, 45], [8, 20], [11, 55]];
const FULL_DAY = [[13, 7], [0, 0], [12, 30], [21, 42]];

describe('child-controlled time lab', () => {
  it('draws fractional hour angles and matching accessible hands at noon, wraparound and individual minutes', () => {
    expect(clockAngles(12, 30)).toEqual({ hour: 15, minute: 180 });
    expect(clockAngles(13, 7)).toEqual({ hour: 33.5, minute: 42 });
    expect(clockAngles(21, 42)).toEqual({ hour: 291, minute: 252 });
    expect(digitalTime(0, 0, true)).toBe('00:00'); expect(digitalTime(0, 0)).toBe('12:00');
    const view = render(<LabClock hour={12} minute={30} fullDay={false} />);
    expect(screen.getByRole('img')).toHaveAccessibleName('The clock shows 12:30. The short blue hour hand is between 12 and 1. The long gold minute hand points to 6.');
    expect(view.container.querySelector('[data-hand="hour"]')).toHaveAttribute('transform', 'rotate(15 120 120)');
    expect(view.container.querySelector('[data-hand="minute"]')).toHaveAttribute('transform', 'rotate(180 120 120)');
    view.rerender(<LabClock hour={13} minute={7} fullDay />);
    expect(screen.getByRole('img')).toHaveAccessibleName('The clock shows 13:07 on the 24-hour clock. The short blue hour hand is between 1 and 2. The long gold minute hand is 2 small ticks after 1.');
    expect(view.container.querySelector('[data-hand="hour"]')).toHaveAttribute('transform', 'rotate(33.5 120 120)');
    expect(view.container.querySelector('[data-hand="minute"]')).toHaveAttribute('transform', 'rotate(42 120 120)');
    expect(clockDescription(23, 59, true)).toContain('between 11 and 12');
    expect(clockDescription(23, 59, true)).toContain('4 small ticks after 11');
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9])('uses saved Year %i for finite starter/five-minute/full-day practice', year => {
    mocks.year = year; render(<ArchieClockLab />);
    const minute = screen.getByRole('combobox', { name: 'Clock minute' });
    const expectedStep = year <= 2 ? 30 : year === 3 ? 5 : 1;
    expect([...minute.querySelectorAll('option')].map(option => Number(option.value))).toEqual(Array.from({ length: 60 / expectedStep }, (_, i) => i * expectedStep));
    expect(screen.getByRole('combobox', { name: 'Clock hour' }).querySelectorAll('option')).toHaveLength(year >= 4 ? 24 : 12);
    expect(timeChallenges(year).map(({ hour, minute: m }) => [hour, m])).toEqual(year <= 2 ? EARLY : year === 3 ? FIVE_MINUTE : FULL_DAY);
    expect(timeChallenges(year)).toHaveLength(4);
    expect(mocks.speak).not.toHaveBeenCalled();
  });

  it.each([1, 3, 4, 9])('requires checks and explicit next/finish for all four Year %i challenges', year => {
    mocks.year = year; render(<ArchieClockLab />);
    fireEvent.click(screen.getByRole('button', { name: 'Try four time challenges' }));
    const answers = year <= 2 ? EARLY : year === 3 ? FIVE_MINUTE : FULL_DAY;
    answers.forEach(([hour, minute], index) => {
      expect(screen.getByRole('heading', { name: new RegExp(`Challenge ${index + 1} of 4:`) })).toBeInTheDocument();
      setClock(hour, minute); fireEvent.click(screen.getByRole('button', { name: 'Check my clock' }));
      expect(screen.getByRole('status')).toHaveTextContent('You set it correctly:');
      expect(screen.getByRole('combobox', { name: 'Clock hour' })).toBeDisabled();
      expect(screen.queryByRole('heading', { name: 'Four challenges explored!' })).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: index === 3 ? 'Finish time practice' : 'Next time challenge' }));
    });
    expect(screen.getByRole('heading', { name: 'Four challenges explored!' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Check my clock' })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Take a break');
    fireEvent.click(screen.getByRole('button', { name: 'Explore the clock' }));
    expect(screen.getByRole('combobox', { name: 'Clock hour' })).toBeEnabled();
    expect(screen.queryByRole('heading', { name: 'Four challenges explored!' })).not.toBeInTheDocument();
  });

  it('retains wrong and solved feedback over time, supports a break and waits for explicit progression', () => {
    vi.useFakeTimers(); render(<ArchieClockLab />);
    fireEvent.click(screen.getByRole('button', { name: 'Try four time challenges' }));
    fireEvent.click(screen.getByRole('button', { name: 'Check my clock' }));
    expect(screen.getByRole('status')).toHaveTextContent('Good try. This is the same challenge');
    expect(screen.getByText('Put the short hand at 2 and the long hand at 12.')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Take a clock break' }));
    expect(screen.getByRole('combobox', { name: 'Clock hour' })).toBeDisabled();
    act(() => vi.advanceTimersByTime(30000));
    expect(screen.getByLabelText('Digital clock')).toHaveTextContent('12:00');
    fireEvent.click(screen.getByRole('button', { name: 'Resume clock practice' }));
    setClock(2, 0); fireEvent.click(screen.getByRole('button', { name: 'Check my clock' }));
    act(() => vi.advanceTimersByTime(30000));
    expect(screen.getByRole('heading', { name: "Challenge 1 of 4: Show 2 o'clock." })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next time challenge' })).toBeInTheDocument();
  });

  it('moves minutes across an hour/day boundary, and speaks only the authored currently shown clock on request', () => {
    mocks.year = 4; render(<ArchieClockLab />);
    setClock(23, 59); fireEvent.click(screen.getByRole('button', { name: 'Forward 1 minute' }));
    expect(screen.getByLabelText('Digital clock')).toHaveTextContent('00:00');
    fireEvent.click(screen.getByRole('button', { name: 'Back 1 minute' }));
    expect(screen.getByLabelText('Digital clock')).toHaveTextContent('23:59');
    setClock(13, 7); expect(mocks.speak).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Read this clock aloud' }));
    const expected = 'The clock shows 13:07 on the 24-hour clock. The short blue hour hand is between 1 and 2. The long gold minute hand is 2 small ticks after 1.';
    expect(screen.getByRole('img')).toHaveAccessibleName(expected);
    expect(mocks.speak).toHaveBeenCalledExactlyOnceWith('read:time-lab-clock', expected);
    expect(mocks.context.mock.lastCall![4]).toMatchObject({ readText: expected });
  });

  it('hands keyboard focus from check to next and preserves another control for pointer/helper-style submissions', async () => {
    const user = userEvent.setup(); render(<ArchieClockLab />);
    fireEvent.click(screen.getByRole('button', { name: 'Try four time challenges' })); setClock(2, 0);
    screen.getByRole('button', { name: 'Check my clock' }).focus(); await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'Next time challenge' })).toHaveFocus();
    await user.keyboard(' '); expect(screen.getByRole('button', { name: 'Check my clock' })).toHaveFocus();
    setClock(7, 30);
    const read = screen.getByRole('button', { name: 'Read this clock aloud' }); read.focus();
    fireEvent.click(screen.getByRole('button', { name: 'Check my clock' })); expect(read).toHaveFocus();
  });

  it('does not transfer focus past an open tutor dialog or save answers/start a microphone', () => {
    const storage = vi.spyOn(Storage.prototype, 'setItem');
    const network = vi.fn(); const microphone = vi.fn();
    vi.stubGlobal('fetch', network); vi.stubGlobal('SpeechRecognition', microphone); vi.stubGlobal('webkitSpeechRecognition', microphone);
    render(<><dialog open aria-label="Archie tutor"><input aria-label="Tutor message" /></dialog><ArchieClockLab /></>);
    fireEvent.click(screen.getByRole('button', { name: 'Try four time challenges' })); setClock(2, 0);
    const tutorMessage = screen.getByLabelText('Tutor message');
    tutorMessage.focus();
    expect(tutorMessage).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Check my clock' }));
    expect(screen.getByRole('status')).toHaveTextContent('You set it correctly: 02:00.');
    expect(tutorMessage).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Next time challenge' })).not.toHaveFocus();
    expect(storage).not.toHaveBeenCalled(); expect(network).not.toHaveBeenCalled(); expect(microphone).not.toHaveBeenCalled();
  });
});

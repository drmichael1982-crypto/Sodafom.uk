import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Page } from './ArchiePages';
import { useArchieData } from '@/lib/archie/storage';
import { useArchieContext } from '@/contexts/ArchieContext';
import { useVoice } from '@/lib/voice-context';
import './ArchieClockLab.css';

type Time = { hour: number; minute: number };
export type TimeChallenge = Time & { instruction: string; hint: string };
export function clockAngles(hour: number, minute: number) {
  return { hour: (hour % 12) * 30 + minute / 2, minute: minute * 6 };
}
export function digitalTime(hour: number, minute: number, fullDay = false) {
  return `${String(fullDay ? hour : hour % 12 || 12).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
export function clockDescription(hour: number, minute: number, fullDay = false) {
  const h = hour % 12 || 12;
  const next = h % 12 + 1;
  const minuteHand = minute === 0 ? 'points to 12' : minute % 5 === 0 ? `points to ${minute / 5}` : `is ${minute % 5} small ticks after ${Math.floor(minute / 5) || 12}`;
  return `The clock shows ${digitalTime(hour, minute, fullDay)}${fullDay ? ' on the 24-hour clock' : ''}. The short blue hour hand ${minute === 0 ? `points to ${h}` : `is between ${h} and ${next}`}. The long gold minute hand ${minuteHand}.`;
}
// Starter revision followed by five-minute and minute/24-hour practice.
// DfE: https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study
export function timeChallenges(year: number): TimeChallenge[] {
  if (year <= 2) return [
    { hour: 2, minute: 0, instruction: "Show 2 o'clock.", hint: 'Put the short hand at 2 and the long hand at 12.' },
    { hour: 7, minute: 30, instruction: 'Show half past 7.', hint: 'Half an hour is 30 minutes. The long hand points to 6; the short hand is halfway from 7 to 8.' },
    { hour: 10, minute: 0, instruction: "Show 10 o'clock.", hint: 'At a whole hour, the long hand points to 12.' },
    { hour: 4, minute: 30, instruction: 'Show half past 4.', hint: 'Start at 4, then add 30 minutes. The hour hand moves halfway towards 5.' },
  ];
  if (year === 3) return [
    { hour: 3, minute: 15, instruction: 'Show quarter past 3.', hint: 'A quarter hour is 15 minutes. The long hand points to 3.' },
    { hour: 6, minute: 45, instruction: 'Show quarter to 7.', hint: 'It is 15 minutes before 7: the hour is still 6 and the minutes are 45.' },
    { hour: 8, minute: 20, instruction: 'Show twenty past 8.', hint: 'Four groups of five minutes make twenty. The long hand points to 4.' },
    { hour: 11, minute: 55, instruction: 'Show five to 12.', hint: 'It is five minutes before 12: start from 11 and choose 55 minutes.' },
  ];
  return [
    { hour: 13, minute: 7, instruction: 'Show 1:07 pm using the 24-hour clock.', hint: 'For an afternoon hour from 1 to 11, add 12. Seven minutes is two small ticks after the 1.' },
    { hour: 0, minute: 0, instruction: 'Show midnight using the 24-hour clock.', hint: 'The new day starts at 00:00. Both hands point to 12.' },
    { hour: 12, minute: 30, instruction: 'Show half past noon using the 24-hour clock.', hint: 'Noon is 12:00, and half an hour adds 30 minutes.' },
    { hour: 21, minute: 42, instruction: 'Show 9:42 pm using the 24-hour clock.', hint: 'Add 12 to the evening hour. Forty-two minutes is two small ticks after the 8.' },
  ];
}
export function LabClock({ hour, minute, fullDay }: Time & { fullDay: boolean }) {
  const angles = clockAngles(hour, minute);
  return <svg className="clock-lab-face" viewBox="0 0 240 240" role="img" aria-label={clockDescription(hour, minute, fullDay)}>
    <g aria-hidden="true">
      <circle cx="120" cy="120" r="112" fill="#fff" stroke="#17355f" strokeWidth="5" />
      {Array.from({ length: 60 }, (_, i) => <line key={i} x1="120" y1={i % 5 === 0 ? 12 : 17} x2="120" y2="23" stroke="#47637e" strokeWidth={i % 5 === 0 ? 3 : 1} transform={`rotate(${i * 6} 120 120)`} />)}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = i * Math.PI / 6;
        return <text key={i} x={120 + 80 * Math.sin(angle)} y={120 - 80 * Math.cos(angle)} textAnchor="middle" dominantBaseline="central" fill="#17355f" fontSize="19" fontWeight="800">{i || 12}</text>;
      })}
      <line data-hand="hour" x1="120" y1="120" x2="120" y2="66" stroke="#0962ce" strokeWidth="9" strokeLinecap="round" transform={`rotate(${angles.hour} 120 120)`} />
      <line data-hand="minute" x1="120" y1="120" x2="120" y2="40" stroke="#9a6800" strokeWidth="5" strokeLinecap="round" transform={`rotate(${angles.minute} 120 120)`} />
      <circle cx="120" cy="120" r="7" fill="#17355f" />
    </g>
  </svg>;
}
function moveFocus(origin: HTMLButtonElement | null, target: HTMLElement | null) {
  if (!origin || !target || document.querySelector('dialog[open], [role="dialog"], [role="alertdialog"]')) return;
  if (document.activeElement !== origin && !(document.activeElement === document.body && (!origin.isConnected || origin.disabled))) return;
  target.focus({ preventScroll: true }); target.scrollIntoView?.({ behavior: 'instant', block: 'nearest' });
}
function ClockWorkbench({ year }: { year: number }) {
  const { speak, stop } = useVoice();
  const { setGameContext, clearGameContext } = useArchieContext();
  const [time, setTime] = useState<Time>({ hour: 12, minute: 0 });
  const [challengeMode, setChallengeMode] = useState(false);
  const [index, setIndex] = useState(0);
  const [solved, setSolved] = useState(false);
  const [finished, setFinished] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hint, setHint] = useState(false);
  const [feedback, setFeedback] = useState('Explore by moving the hands with the buttons or choosing numbers.');
  const step = year <= 2 ? 30 : year === 3 ? 5 : 1;
  const fullDay = year >= 4;
  const challenges = timeChallenges(year);
  const challenge = challenges[index];
  const description = clockDescription(time.hour, time.minute, fullDay);
  const nextRef = useRef<HTMLButtonElement>(null);
  const checkRef = useRef<HTMLButtonElement>(null);
  const endRef = useRef<HTMLHeadingElement>(null);
  const focusOrigin = useRef<HTMLButtonElement | null>(null);
  const checked = useRef(false);
  const advanced = useRef(-1);
  useEffect(() => () => stop(), [stop]);
  useEffect(() => {
    moveFocus(focusOrigin.current, finished ? endRef.current : solved ? nextRef.current : checkRef.current);
    focusOrigin.current = null;
  }, [solved, index, finished]);
  useEffect(() => {
    setGameContext('Time lab', 'Maths', paused ? 'Clock practice paused.' : finished ? 'Four time challenges completed.' : challengeMode ? challenge.instruction : description, [], {
      activityId: `time-lab-year-${year}`, questionId: challengeMode ? `clock-${year}-${index}` : null,
      stepId: challengeMode ? `clock-challenge-${index}` : 'explore',
      status: paused ? 'paused' : finished ? 'finished' : solved ? 'answered' : 'learning',
      readText: description,
      teachingText: 'The short hand shows hours and moves gradually between numbers. The long hand shows minutes: each small tick is one minute and each number is five minutes.',
      hintText: challengeMode ? challenge.hint : 'Try moving the minute hand and watch the short hour hand move too.',
    });
    return clearGameContext;
  }, [year, index, challengeMode, paused, finished, solved, description, challenge.instruction, challenge.hint, setGameContext, clearGameContext]);
  function remember(event: MouseEvent<HTMLButtonElement>) { focusOrigin.current = event.currentTarget === document.activeElement ? event.currentTarget : null; }
  function change(next: Time) { if (paused || solved || finished) return; stop(); setTime(next); setFeedback('The hands and digital time now show the same time.'); }
  function adjustMinutes(delta: number) {
    const total = ((time.hour * 60 + time.minute + delta) % 1440 + 1440) % 1440;
    change({ hour: Math.floor(total / 60), minute: total % 60 });
  }
  function start() { stop(); setChallengeMode(true); setIndex(0); setSolved(false); setFinished(false); setPaused(false); setHint(false); setTime({ hour: 12, minute: 0 }); setFeedback('Four challenges, with no timer. Set the clock, then check it.'); checked.current = false; advanced.current = -1; }
  function check(event: MouseEvent<HTMLButtonElement>) {
    if (paused || solved || finished || checked.current) return;
    const rightHour = fullDay ? time.hour === challenge.hour : time.hour % 12 === challenge.hour % 12;
    if (rightHour && time.minute === challenge.minute) {
      checked.current = true; remember(event); setSolved(true);
      setFeedback(`You set it correctly: ${digitalTime(time.hour, time.minute, fullDay)}. Notice how both hands agree with the digital clock. Choose the next step when you are ready.`);
    } else { setHint(true); setFeedback('Good try. This is the same challenge: adjust your clock and check again. ' + challenge.hint); }
  }
  function next(event: MouseEvent<HTMLButtonElement>) {
    if (!solved || paused || finished || advanced.current === index) return;
    advanced.current = index; remember(event); stop();
    if (index === 3) { setFinished(true); setFeedback('Four time challenges explored. Take a break, or return to free clock play when you choose.'); }
    else { checked.current = false; setIndex(value => value + 1); setSolved(false); setHint(false); setTime({ hour: 12, minute: 0 }); setFeedback('A new time to explore. There is no hurry.'); }
  }
  const locked = paused || solved || finished;
  return <Page title="Time lab" back="/" scene="maths" intro="Move the hands, read the time and try a few challenges. Your clock only changes when you choose.">
    <section className="clock-lab" aria-label="Interactive clock practice">
      <p className="clock-lab-level">Year {year} · {year <= 2 ? 'Hour and half-hour starter practice' : year === 3 ? 'Quarters and five-minute practice' : 'Minute and 24-hour practice'}</p>
      <div className="clock-lab-toolbar"><button type="button" aria-pressed={!challengeMode} onClick={() => { stop(); setChallengeMode(false); setSolved(false); setFinished(false); setPaused(false); setFeedback('Explore the clock freely. Try comparing the short and long hands.'); }}>Explore the clock</button><button type="button" aria-pressed={challengeMode} onClick={start}>Try four time challenges</button><button type="button" onClick={() => { stop(); setPaused(value => !value); }}>{paused ? 'Resume clock practice' : 'Take a clock break'}</button></div>
      {finished && <h2 ref={endRef} tabIndex={-1}>Four challenges explored!</h2>}
      {paused ? <h2>Time for a breather</h2> : challengeMode && !finished && <h2>Challenge {index + 1} of 4: {challenge.instruction}</h2>}
      <div className="clock-lab-layout"><figure><LabClock {...time} fullDay={fullDay} /><figcaption>Short blue hand: hours. Long gold hand: minutes. Lengths and words help you tell them apart.</figcaption><p className="clock-lab-digital" aria-label="Digital clock">{digitalTime(time.hour, time.minute, fullDay)}{fullDay && <small>24-hour time</small>}</p><p className="clock-lab-description">{description}</p><button type="button" disabled={paused} onClick={() => speak('read:time-lab-clock', description)}>Read this clock aloud</button></figure>
      <section className="clock-lab-controls" aria-label="Set your clock"><h3>Set your clock</h3><div className="clock-lab-field"><label>Hour<select aria-label="Clock hour" value={fullDay ? time.hour : time.hour % 12 || 12} disabled={locked} onChange={event => change({ ...time, hour: Number(event.target.value) })}>{Array.from({ length: fullDay ? 24 : 12 }, (_, i) => fullDay ? i : i + 1).map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}</option>)}</select></label><label>Minute<select aria-label="Clock minute" value={time.minute} disabled={locked} onChange={event => change({ ...time, minute: Number(event.target.value) })}>{Array.from({ length: 60 / step }, (_, i) => i * step).map(m => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}</select></label></div><div className="clock-lab-adjust"><button type="button" disabled={locked} onClick={() => change({ ...time, hour: (time.hour + 23) % 24 })}>Back 1 hour</button><button type="button" disabled={locked} onClick={() => change({ ...time, hour: (time.hour + 1) % 24 })}>Forward 1 hour</button><button type="button" disabled={locked} onClick={() => adjustMinutes(-step)}>Back {step} {step === 1 ? 'minute' : 'minutes'}</button><button type="button" disabled={locked} onClick={() => adjustMinutes(step)}>Forward {step} {step === 1 ? 'minute' : 'minutes'}</button></div><p>A full turn of the minute hand is 60 minutes. The hour hand moves towards the next hour as the minutes pass.</p>{challengeMode && !finished && <><button type="button" aria-expanded={hint} aria-controls="clock-lab-hint" disabled={paused} onClick={() => setHint(value => !value)}>{hint ? 'Hide clock hint' : 'Show clock hint'}</button><p id="clock-lab-hint" className="clock-lab-hint" hidden={!hint}>{challenge.hint}</p>{!solved ? <button ref={checkRef} type="button" disabled={paused} onClick={check}>Check my clock</button> : <button ref={nextRef} type="button" disabled={paused} onClick={next}>{index === 3 ? 'Finish time practice' : 'Next time challenge'}</button>}</>}</section></div>
      <p role="status" aria-atomic="true" className="clock-lab-feedback">{paused ? 'Clock practice paused. Your clock and challenge are kept here.' : feedback}</p>
      <p className="clock-lab-note">This is a short practice visit, not a timed test. No stars or personal answers are saved here. Take a break whenever you need one.</p>
    </section>
  </Page>;
}
export default function ArchieClockLab() {
  const { settings } = useArchieData();
  return <ClockWorkbench key={settings.year} year={settings.year} />;
}

/** One shared, context-aware assistant for the home, lessons and existing games. */
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Mic, Send, Volume2, X, MessageCircle } from 'lucide-react';
import { API_PREFIX } from '@/lib/config';
import { useArchieContext } from '@/contexts/ArchieContext';
import { useVoice } from '@/lib/voice-context';
import { getRememberedChildName, tryLocalArchieResponse } from '@/lib/archie-local';
import { answerFromDevice, answerLessonReply, saveLearningTurn } from '@/lib/archie/device-learning';
import catalog from '@/lib/archie/game-catalog.json';
import '@/pages/archie/archie.css';

type Message = { role: 'user' | 'assistant'; content: string };
function cleanTutorText(text: string) {
  return text.replaceAll('**', '').replaceAll('__', '').replaceAll('~~', '')
    .replaceAll('`', '').replace(/\\[PLAY:[^\\]]+\\]/g, '').trim();
}
function getLearnerAge() {
  if (typeof window === 'undefined') return 9;
  try {
    const app = JSON.parse(localStorage.getItem('sodafom_archie_design_v1') || '{}');
    const year = Number(app.settings?.year);
    if (year >= 1 && year <= 9) return year + 4;
  } catch { /* use the next available local learner setting */ }
  const selected = Number(localStorage.getItem('sodafom_ai_teacher_age'));
  if (selected >= 5 && selected <= 13) return selected;
  try {
    const profile = JSON.parse(localStorage.getItem('sodafom_tutor_memory') || '{}');
    if (profile.ageGroup === '5-7') return 6;
    if (profile.ageGroup === '11-13') return 12;
  } catch { /* use the app's default learner age */ }
  return 9;
}

const DESTINATIONS: Array<[RegExp, string]> = [
  [/\b(lesson|teacher|tutor)\b/i, '/lesson'], [/\b(math|maths|numbers)\b/i, '/games?subject=maths'],
  [/\b(spelling)\b/i, '/games?subject=spelling'], [/\b(reading|read)\b/i, '/library'],
  [/\b(science)\b/i, '/games?subject=science'], [/\b(cartoon|cartoons|theatre)\b/i, '/cartoons'],
  [/\b(sticker|stickers)\b/i, '/stickers'], [/\b(reward|rewards|stars)\b/i, '/rewards'],
  [/\b(progress)\b/i, '/progress'], [/\b(homework)\b/i, '/homework'],
  [/\b(parent|parents|settings)\b/i, '/parents'], [/\b(world)\b/i, '/world'],
  [/\b(games)\b/i, '/games'], [/\b(home)\b/i, '/'],
];
export function destinationFor(text: string): string | undefined {
  if (!/\b(open|play|start|go to|take me to|show|watch)\b/i.test(text)) return;
  const normalized = text.toLowerCase().replace(/[^a-z0-9 ]/g, '');
  const game = catalog.find(g => normalized.includes(g.title.toLowerCase().replace(/[^a-z0-9 ]/g, '')));
  return game?.route ?? DESTINATIONS.find(([pattern]) => pattern.test(text))?.[1];
}
export default function ArchieHelper({ hideLauncher = false }: { hideLauncher?: boolean; gameMode?: boolean }) {
  const { isOpen, draft, voiceOnOpen, openArchie, closeArchie, gameTitle, subject, currentQuestion, currentOptions } = useArchieContext();
  const { speak, stop, playing } = useVoice();
  const navigate = useNavigate();
  const location = useLocation();
  const dialog = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognition = useRef<any>(null);
  const pending = useRef<AbortController | null>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceLesson, setVoiceLesson] = useState(false);
  const voiceLessonRef = useRef(false);
  const busyRef = useRef(false);
  const sendRef = useRef<(text: string) => Promise<void>>(async () => {});
  const [notice, setNotice] = useState('');
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isOpen) { setInput(draft); if (!dialog.current?.open) dialog.current?.showModal(); inputRef.current?.focus(); if (voiceOnOpen) startVoiceLesson(); }
    else { voiceLessonRef.current = false; setVoiceLesson(false); dialog.current?.close(); recognition.current?.abort(); setListening(false); pending.current?.abort(); pending.current = null; setBusy(false); stop(); }
  }, [isOpen, draft, voiceOnOpen]);
  useEffect(() => {
    pending.current?.abort(); pending.current = null; setBusy(false); setMessages([]); setNotice(''); recognition.current?.abort(); setListening(false);
    return () => pending.current?.abort();
  }, [location.pathname]);
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }); }, [messages]);
  const read = (text: string) => speak('read:archie-ai', cleanTutorText(text));
  const close = () => { closeArchie(); stop(); };
  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    const history: Message[] = [...messages, { role: 'user', content: question }];
    setMessages(history); setInput(''); setNotice(''); setBusy(true); busyRef.current = true;
    const controller = new AbortController(); pending.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const destination = destinationFor(question);
      if (destination) { navigate(destination); close(); return; }
      const deviceAnswer = answerFromDevice(question, getLearnerAge());
      const lessonAnswer = answerLessonReply(question, currentQuestion || '', subject);
      if (lessonAnswer?.startsWith('Brilliant!')) window.dispatchEvent(new Event('archie-spelling-correct'));
      const local = deviceAnswer ? { text: deviceAnswer } : lessonAnswer ? { text: lessonAnswer } : tryLocalArchieResponse(question);
      const hint = /\b(hint|help|instructions|what do i do)\b/i.test(question);
      let reply = local?.text;
      if (!reply && hint && gameTitle) {
        reply = currentQuestion
          ? `Let's work on ${gameTitle}. ${currentQuestion} Try one small step first. What do you notice?${currentOptions?.length ? ` Your choices are ${currentOptions.join(', ')}.` : ''}`
          : `You are on ${gameTitle}. Read the instructions, then try one step. You can type the question here and we can work it out together.`;
      }
      if (reply) { const childName = getRememberedChildName(); if (childName && !reply.toLowerCase().includes(childName.toLowerCase())) reply = `${childName}, ${reply}`; setNotice('Answered on this device.'); }
      else {
        const response = await fetch(`${API_PREFIX}/chat`, { method: 'POST', credentials: 'include', signal: controller.signal,
          headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history.slice(-12),
            systemExtra: `Learning activity: ${gameTitle || 'Sodafom home'}. Subject: ${subject || 'general learning'}. Current question: ${currentQuestion || 'none'}. Choices: ${currentOptions?.join(', ') || 'none'}.` }) });
        if (!response.ok) throw new Error('Learning service unavailable');
        reply = (await response.text()).trim();
        if (!reply) throw new Error('Empty reply');
        setNotice('Answered by the learning service.');
      }
      if (!controller.signal.aborted) { saveLearningTurn(question, reply, getLearnerAge()); setMessages([...history, { role: 'assistant', content: cleanTutorText(reply) }]); read(reply); }
    } catch {
      if (pending.current !== controller) return;
      const reply = 'The online teacher is unavailable right now. I can still help on this device with maths, spelling and finding a game. Try “What is 8 plus 4?” or “Spell Wednesday”.';
      setNotice('Using the built-in learning helper.');
      saveLearningTurn(question, reply, getLearnerAge());
      setMessages([...history, { role: 'assistant', content: cleanTutorText(reply) }]);
    } finally { window.clearTimeout(timeout); if (pending.current === controller) { setBusy(false); busyRef.current = false; } }
  }
  useEffect(() => { sendRef.current = send; });
  useEffect(() => { voiceLessonRef.current = voiceLesson; }, [voiceLesson]);
  function listenForLesson() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setVoiceLesson(false); setNotice('Voice conversation is not supported here. You can still type to Archie.'); return; }
    if (!voiceLessonRef.current || busyRef.current || playing || listening || !isOpen) return;
    const listener = new SpeechRecognition(); recognition.current = listener;
    listener.lang = 'en-GB'; listener.interimResults = false; listener.continuous = false;
    listener.onresult = (event: any) => {
      const words = String(event.results?.[0]?.[0]?.transcript || '').trim();
      if (words) { setInput(words); window.setTimeout(() => { void sendRef.current(words); }, 0); }
    };
    listener.onerror = (event: any) => { setListening(false); if (['not-allowed','service-not-allowed','audio-capture'].includes(event?.error)) { voiceLessonRef.current = false; setVoiceLesson(false); setNotice('Microphone access is unavailable. You can type to Archie or check microphone permission.'); } else { setNotice('I could not hear that. Archie will listen again, or you can type.'); } };
    listener.onend = () => setListening(false);
    try { listener.start(); setListening(true); setNotice('Listening for your answer…'); }
    catch { setListening(false); }
  }
  useEffect(() => {
    if (voiceLesson && isOpen && !busy && !playing && !listening) {
      const timer = window.setTimeout(listenForLesson, 450);
      return () => window.clearTimeout(timer);
    }
  }, [voiceLesson, isOpen, busy, playing, listening]);
  function startVoiceLesson() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setNotice('Voice conversation is not supported here. You can still type to Archie.'); return; }
    voiceLessonRef.current = true; setVoiceLesson(true); setNotice('Starting your spoken lesson…'); if (currentQuestion) read(currentQuestion);
  }
  function stopVoiceLesson() {
    voiceLessonRef.current = false; setVoiceLesson(false); recognition.current?.abort(); setListening(false); setNotice('Spoken lesson paused.');
  }
  function listen() {
    if (listening) { recognition.current?.stop(); return; }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setNotice('This browser does not support voice input. Please type your question.'); inputRef.current?.focus(); return; }
    stop();
    const listener = new SpeechRecognition(); recognition.current = listener;
    listener.lang = 'en-GB'; listener.interimResults = false; listener.continuous = false;
    listener.onresult = (e: any) => { setInput(e.results[0][0].transcript); setNotice('Check your words, then tap Send.'); };
    listener.onend = () => setListening(false);
    listener.onerror = () => { setListening(false); setNotice('I could not hear you. You can type your question instead.'); };
    try { listener.start(); setListening(true); } catch { setNotice('The microphone is busy. Try typing your question.'); }
  }
  return <>
    {!hideLauncher && !isOpen && <button className="archie-launcher" onClick={() => openArchie()} aria-label="Ask Archie"><MessageCircle size={23} aria-hidden="true"/> Ask Archie</button>}
    <dialog ref={dialog} className="archie-dialog" onCancel={close} onClose={closeArchie} aria-labelledby="archie-title">
      <header><div><h2 id="archie-title">Ask Archie</h2><p>{gameTitle ? `Helping with ${gameTitle}` : 'Your learning helper'}</p></div><button aria-label="Close Ask Archie" onClick={close}><X /></button></header>
      <div className="archie-chat-history" role="log" aria-live="polite">
        {!messages.length && <p>Hi! Ask me about this game or lesson. You can type or tap the microphone.</p>}
        {messages.map((m,i) => <p key={i} className={`chat-${m.role}`}><strong>{m.role === 'user' ? 'You' : 'Archie'}: </strong>{m.role === 'assistant' && /\b(correct|spot on|brilliant|well done|excellent|right answer)\b/i.test(m.content) && <span className="archie-correct-tick" aria-label="Correct">✓</span>}{m.role === 'assistant' ? <>{m.content.split(/(\s+)/).map((part,wordIndex) => /^\s+$/.test(part) ? part : <span className="archie-word" style={{ animationDelay: `${Math.min(wordIndex, 24) * 22}ms` }} key={wordIndex}>{part}</span>)}<button type="button" className="archie-quick" aria-label="Listen to Archie" onClick={() => read(m.content)}><Volume2 size={18}/> Listen</button></> : m.content.replace(/\[PLAY:[^\]]+\]/g, '')}</p>)}
        {busy && <p>Archie is thinking…</p>}<div ref={end}/>
      </div>
      <button className="archie-quick" disabled={busy || listening} onClick={voiceLesson ? stopVoiceLesson : startVoiceLesson}>{voiceLesson ? 'Stop spoken lesson' : 'Start spoken lesson'}</button>
      {currentQuestion && <button className="archie-quick" onClick={() => read(`${currentQuestion} ${currentOptions?.join('. ') || ''}`)}><Volume2 size={18}/> Read the question</button>}
      {gameTitle && <button className="archie-quick" disabled={busy} onClick={() => send('Give me a hint please')}>Give me a hint</button>}
      <p className="archie-notice" role="status">{listening ? 'Listening…' : voiceLesson ? 'Spoken lesson running — answer aloud when Archie asks.' : notice}</p>
      <form onSubmit={e => { e.preventDefault(); void send(input); }}>
        <button type="button" onClick={listen} aria-label={listening ? 'Stop microphone' : 'Talk to Archie'} aria-pressed={listening}><Mic/></button>
        <input ref={inputRef} aria-label="Your question for Archie" placeholder="Type your question…" value={input} maxLength={2000} onChange={e => setInput(e.target.value)}/>
        <button disabled={busy || !input.trim()} aria-label="Send question"><Send/></button>
      </form>
      {playing && <button className="archie-quick" onClick={stop}>Stop reading</button>}
    </dialog>
  </>;
}

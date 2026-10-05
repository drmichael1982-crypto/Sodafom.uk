/** One shared, context-aware assistant for the home, lessons and existing games. */
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Mic, Send, Volume2, X, MessageCircle } from 'lucide-react';
import { API_PREFIX } from '@/lib/config';
import { useArchieContext } from '@/contexts/ArchieContext';
import { useVoice } from '@/lib/voice-context';
import { getRememberedChildName, tryLocalArchieResponse } from '@/lib/archie-local';
import { tryRememberChildInterest } from '@/lib/interest-themes';
import { answerFromDevice, answerLessonReply, saveLearningTurn } from '@/lib/archie/device-learning';
import catalog from '@/lib/archie/game-catalog.json';
import { useArchieData } from '@/lib/archie/storage';
import '@/pages/archie/archie.css';
import { blockedLearningText, FRIENDLY_REDIRECT, safeLearningReply } from '@/lib/archie/learning-safety';
import { submitGameVoiceAnswer } from '@/lib/archie/game-voice';
import { coachLessonReply, guardPracticeReply, lessonContextForService, subjectMethod } from '@/lib/archie/lesson-coach';

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
  [/\b(quest|quests)\b/i, '/quests'], [/\b(history)\b/i, '/courses?subject=history'], [/\b(adventure|course|lesson|teacher|tutor)\b/i, '/courses'], [/\b(math|maths|numbers)\b/i, '/games?subject=maths'],
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
  const { isOpen, draft, voiceOnOpen, openArchie, closeArchie, gameTitle, subject, currentQuestion, currentOptions, lesson } = useArchieContext();
  const { speak, stop, playing } = useVoice();
  const { settings } = useArchieData();
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
  const [voiceConversation, setVoiceConversation] = useState(false);
  const conversationRef = useRef(false);
  const busyRef = useRef(false);
  const playingRef = useRef(playing);
  const openRef = useRef(isOpen);
  const restartTimer = useRef<number | null>(null);
  const previousRoute = useRef(`${location.pathname}${location.search || ''}`);
  const sendRef = useRef<(text: string) => Promise<void>>(async () => {});
  const [notice, setNotice] = useState('');
  const end = useRef<HTMLDivElement>(null);
  playingRef.current = playing;
  openRef.current = isOpen;
  function clearRestartTimer() {
    if (restartTimer.current !== null) window.clearTimeout(restartTimer.current);
    restartTimer.current = null;
  }
  function retireMicrophone() {
    const active = recognition.current;
    recognition.current = null;
    // Clear ownership before abort: delayed events cannot submit or restart.
    if (active) { try { active.abort(); } catch { /* already ended */ } }
    setListening(false);
  }
  function stopVoiceConversation(message = 'Voice conversation stopped. You can still type to Archie.') {
    conversationRef.current = false;
    clearRestartTimer();
    retireMicrophone();
    setVoiceConversation(false);
    stop();
    setNotice(message);
  }
  useEffect(() => {
    if (isOpen) { setInput(draft); if (!dialog.current?.open) dialog.current?.showModal(); inputRef.current?.focus(); if (voiceOnOpen && !conversationRef.current) startVoiceConversation(); }
    else { stopVoiceConversation(''); busyRef.current = false; dialog.current?.close(); pending.current?.abort(); pending.current = null; setBusy(false); }
  }, [isOpen, draft, voiceOnOpen]);
  useEffect(() => {
    const route = `${location.pathname}${location.search || ''}`;
    if (previousRoute.current === route) return;
    previousRoute.current = route;
    stopVoiceConversation(conversationRef.current || recognition.current ? 'Voice conversation stopped after changing activity.' : '');
    pending.current?.abort(); pending.current = null; busyRef.current = false; setBusy(false); setMessages([]);
  }, [location.pathname, location.search]);
  useEffect(() => () => {
    conversationRef.current = false;
    openRef.current = false;
    clearRestartTimer();
    const active = recognition.current; recognition.current = null;
    if (active) { try { active.abort(); } catch { /* already ended */ } }
    pending.current?.abort(); pending.current = null;
    stop();
  }, [stop]);
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }); }, [messages]);
  const read = (text: string) => { clearRestartTimer(); retireMicrophone(); speak('read:archie-ai', cleanTutorText(text)); };
  const close = () => { stopVoiceConversation(''); pending.current?.abort(); pending.current = null; closeArchie(); };
  async function send(text: string) {
    const question = text.trim();
    if (!question || busyRef.current || !openRef.current) return;
    const conversationTurn = conversationRef.current;
    const readReply = (reply:string) => { if (!conversationTurn || conversationRef.current) read(reply); };
    clearRestartTimer();
    retireMicrophone();
    if (blockedLearningText(question)) {
      setInput('');setNotice('Keep learning kind and private.');
      setMessages([...messages,{role:'assistant',content:FRIENDLY_REDIRECT}]);readReply(FRIENDLY_REDIRECT);return;
    }
    const history: Message[] = [...messages, { role: 'user', content: question }];
    setMessages(history); setInput(''); setNotice(''); setBusy(true); busyRef.current = true;
    const controller = new AbortController(); pending.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const interestReply = tryRememberChildInterest(question);
      if (interestReply) {
        setNotice('Handled on this device.');
        setMessages([...history, { role: 'assistant', content: cleanTutorText(interestReply) }]);
        readReply(interestReply);
        return;
      }
      const destination = destinationFor(question);
      if (destination) { navigate(destination); close(); return; }
      const gameAnswer=submitGameVoiceAnswer(gameTitle||'',question);
      // Lesson-aware coaching from the supplied lesson content (works offline).
      const coachAnswer = gameAnswer ? null : coachLessonReply(question, lesson);
      const deviceAnswer = gameAnswer || coachAnswer || answerFromDevice(question, getLearnerAge());
      const lessonAnswer = answerLessonReply(question, currentQuestion || '', subject);
      if (lessonAnswer?.startsWith('Brilliant!')) window.dispatchEvent(new Event('archie-spelling-correct'));
      const local = deviceAnswer ? { text: deviceAnswer } : lessonAnswer ? { text: lessonAnswer } : tryLocalArchieResponse(question);
      const hint = /\b(hint|help|instructions|what do i do)\b/i.test(question);
      let reply = local?.text;
      let rememberReply = !gameAnswer && !coachAnswer;
      if (!reply && hint && gameTitle) {
        reply = currentQuestion
          ? `Let's work on ${gameTitle}. ${currentQuestion} Try one small step first. What do you notice?${currentOptions?.length ? ` Your choices are ${currentOptions.join(', ')}.` : ''}`
          : `You are on ${gameTitle}. Read the instructions, then try one step. You can type the question here and we can work it out together.`;
      }
      if (reply) { const childName = getRememberedChildName(); if (childName && !reply.toLowerCase().includes(childName.toLowerCase())) reply = `${childName}, ${reply}`; setNotice('Answered on this device.'); }
      else if (!settings.onlineHelp) {
        rememberReply = false;
        reply = lesson
          ? `Online learning help is off, but I can still help with this lesson. Ask me for a hint, or ask me to explain the worked example. ${subjectMethod(lesson.subject)}`
          : 'Online learning help is off. I can still help with maths, spelling and finding a game. Ask a grown-up about wider questions, or try a learning quest.';
        setNotice('Online learning help is off on this device.');
      } else {
        const response = await fetch(`${API_PREFIX}/chat`, { method: 'POST', credentials: 'include', signal: controller.signal,
          headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history.slice(-12), learnerAge:getLearnerAge(),
            systemExtra: `Learning activity: ${gameTitle || 'Sodafom home'}. Subject: ${subject || 'general learning'}. Current question: ${currentQuestion || 'none'}. Choices: ${currentOptions?.join(', ') || 'none'}. ${lessonContextForService(lesson)}`.trim() }) });
        if (!response.ok) throw new Error('Learning service unavailable');
        reply = (await response.text()).trim();
        if (!reply) throw new Error('Empty reply');
        setNotice('Answered by the learning service.');
      }
      if (!gameAnswer) {
        // During independent practice, never give away the correct choice before the child finds it.
        const guarded = guardPracticeReply(reply, lesson);
        if (guarded !== reply) { reply = guarded; rememberReply = false; }
      }
      if (!controller.signal.aborted) { const checkedReply=safeLearningReply(reply);if (rememberReply && checkedReply===reply) saveLearningTurn(question, reply, getLearnerAge()); setMessages([...history, { role: 'assistant', content: cleanTutorText(checkedReply) }]); readReply(checkedReply); }
    } catch {
      if (pending.current !== controller) return;
      const reply = 'The online teacher is unavailable right now. I can still help on this device with maths, spelling and finding a game. Try “What is 8 plus 4?” or “Spell Wednesday”.';
      setNotice('Using the built-in learning helper.');
      setMessages([...history, { role: 'assistant', content: cleanTutorText(reply) }]);
      readReply(reply);
    } finally { window.clearTimeout(timeout); if (pending.current === controller) { setBusy(false); busyRef.current = false; } }
  }
  useEffect(() => { sendRef.current = send; });
  function listenForConversation() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { stopVoiceConversation('Voice conversation is not supported here. You can still type to Archie.'); return; }
    if (!conversationRef.current || busyRef.current || playingRef.current || recognition.current || !openRef.current) return;
    const listener = new SpeechRecognition(); recognition.current = listener;
    listener.lang = 'en-GB'; listener.interimResults = false; listener.continuous = false;
    listener.onresult = (event: any) => {
      if (recognition.current !== listener || !conversationRef.current || busyRef.current || playingRef.current || !openRef.current) return;
      const words = String(event.results?.[0]?.[0]?.transcript || '').trim();
      if (words) { setInput(words); void sendRef.current(words); }
    };
    listener.onerror = (event: any) => {
      if (recognition.current !== listener) return;
      if (event?.error === 'no-speech') { setNotice('I did not hear words. I will listen again; you can also stop or type.'); return; }
      stopVoiceConversation(['not-allowed','service-not-allowed','audio-capture'].includes(event?.error)
        ? 'Microphone access is unavailable. You can type to Archie or ask a grown-up to check microphone permission.'
        : 'Voice conversation could not continue in this browser. You can still type to Archie.');
    };
    listener.onend = () => {
      if (recognition.current !== listener) return;
      recognition.current = null;
      setListening(false);
    };
    try { listener.start(); setListening(true); setNotice('Listening for your question or answer…'); }
    catch { stopVoiceConversation('The microphone could not start. You can still type to Archie.'); }
  }
  useEffect(() => {
    clearRestartTimer();
    if (playing && recognition.current) retireMicrophone();
    if (voiceConversation && isOpen && !busy && !playing && !listening) {
      restartTimer.current = window.setTimeout(() => { restartTimer.current = null; listenForConversation(); }, 450);
    }
    return clearRestartTimer;
  }, [voiceConversation, isOpen, busy, playing, listening]);
  function startVoiceConversation() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setNotice('Voice conversation is not supported here. You can still type to Archie.'); return; }
    clearRestartTimer(); retireMicrophone();
    conversationRef.current = true; setVoiceConversation(true);
    setNotice(settings.sound ? 'Voice conversation started. Archie listens again after each reply.' : 'Voice conversation started. Sound is off, so replies appear as text. Turn sound on to hear Archie.');
    read(currentQuestion ? `${currentQuestion} ${currentOptions?.join('. ') || ''}` : 'Hi! What would you like to learn? Ask your question after I finish speaking.');
  }
  function listen() {
    if (conversationRef.current) { stopVoiceConversation(); return; }
    if (busyRef.current) return;
    if (listening) { recognition.current?.stop(); return; }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setNotice('This browser does not support voice input. Please type your question.'); inputRef.current?.focus(); return; }
    stop();
    const listener = new SpeechRecognition(); recognition.current = listener;
    listener.lang = 'en-GB'; listener.interimResults = false; listener.continuous = false;
    listener.onresult = (e: any) => { if (recognition.current !== listener || !openRef.current) return; setInput(e.results?.[0]?.[0]?.transcript || ''); setNotice('Check your words, then tap Send.'); };
    listener.onend = () => { if (recognition.current !== listener) return; recognition.current = null; setListening(false); };
    listener.onerror = () => { if (recognition.current !== listener) return; retireMicrophone(); setNotice('I could not hear you. You can type your question instead.'); };
    try { listener.start(); setListening(true); } catch { retireMicrophone(); setNotice('The microphone is busy. Try typing your question.'); }
  }
  return <>
    {!hideLauncher && !isOpen && <button className="archie-launcher" onClick={() => openArchie()} aria-label="Ask Archie"><MessageCircle size={23} aria-hidden="true"/> Ask Archie</button>}
    <dialog ref={dialog} className="archie-dialog" onCancel={close} onClose={close} aria-labelledby="archie-title">
      <header><div><h2 id="archie-title">Ask Archie</h2><p>{gameTitle ? `Helping with ${gameTitle}${lesson?.phaseLabel ? ` · ${lesson.phaseLabel}` : ''}` : 'Your learning helper'}</p></div><button aria-label="Close Ask Archie" onClick={close}><X /></button></header>
      <div className="archie-chat-history" role="log" aria-live="polite">
        {!messages.length && <p>Hi! Ask me about this game or lesson. You can type or tap the microphone.</p>}
        {messages.map((m,i) => <p key={i} className={`chat-${m.role}`}><strong>{m.role === 'user' ? 'You' : 'Archie'}: </strong>{m.role === 'assistant' && /\b(correct|spot on|brilliant|well done|excellent|right answer)\b/i.test(m.content) && <span className="archie-correct-tick" aria-label="Correct">✓</span>}{m.role === 'assistant' ? <>{m.content.split(/(\s+)/).map((part,wordIndex) => /^\s+$/.test(part) ? part : <span className="archie-word" style={{ animationDelay: `${Math.min(wordIndex, 24) * 22}ms` }} key={wordIndex}>{part}</span>)}<button type="button" className="archie-quick" aria-label="Listen to Archie" onClick={() => read(m.content)}><Volume2 size={18}/> Listen</button></> : m.content.replace(/\[PLAY:[^\]]+\]/g, '')}</p>)}
        {busy && <p>Archie is thinking…</p>}<div ref={end}/>
      </div>
      <button className="archie-quick" disabled={!voiceConversation && busy} onClick={voiceConversation ? () => stopVoiceConversation() : startVoiceConversation}>{voiceConversation ? 'Stop voice conversation' : 'Start voice conversation'}</button>
      <p className="archie-notice">Press Start once to talk back and forth. Archie waits until he finishes speaking before listening again. Your browser may process speech online. You can stop at any time.</p>
      {currentQuestion && <button className="archie-quick" onClick={() => read(`${currentQuestion} ${currentOptions?.join('. ') || ''}`)}><Volume2 size={18}/> Read the question</button>}
      {gameTitle && <button className="archie-quick" disabled={busy} onClick={() => send('Give me a hint please')}>Give me a hint</button>}
      <p className="archie-notice" role="status">{listening ? 'Listening…' : voiceConversation && playing ? 'Archie is speaking. He will listen again after his reply.' : notice}</p>
      <form onSubmit={e => { e.preventDefault(); void send(input); }}>
        <button type="button" disabled={busy && !voiceConversation} onClick={listen} aria-label={listening ? 'Stop microphone' : 'Talk to Archie'} aria-pressed={listening}><Mic/></button>
        <input ref={inputRef} aria-label="Your question for Archie" placeholder="Type your question…" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} value={input} maxLength={2000} onChange={e => setInput(e.target.value)}/>
        <button disabled={busy || !input.trim()} aria-label="Send question"><Send/></button>
      </form>
      {playing && <button className="archie-quick" onClick={stop}>Stop reading</button>}
    </dialog>
  </>;
}

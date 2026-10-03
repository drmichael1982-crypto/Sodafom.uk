/** One shared, context-aware assistant for the home, lessons and existing games. */
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Mic, Send, Volume2, X, MessageCircle } from 'lucide-react';
import { API_PREFIX } from '@/lib/config';
import { useArchieContext } from '@/contexts/ArchieContext';
import { useVoice } from '@/lib/voice-context';
import { tryLocalArchieResponse } from '@/lib/archie-local';
import { answerFromDevice, saveLearningTurn } from '@/lib/archie/device-learning';
import catalog from '@/lib/archie/game-catalog.json';
import '@/pages/archie/archie.css';

type Message = { role: 'user' | 'assistant'; content: string };
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
  const { isOpen, draft, openArchie, closeArchie, gameTitle, subject, currentQuestion, currentOptions } = useArchieContext();
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
  const [notice, setNotice] = useState('');
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isOpen) { setInput(draft); if (!dialog.current?.open) dialog.current?.showModal(); inputRef.current?.focus(); }
    else { dialog.current?.close(); recognition.current?.abort(); setListening(false); pending.current?.abort(); pending.current = null; setBusy(false); stop(); }
  }, [isOpen, draft]);
  useEffect(() => {
    pending.current?.abort(); pending.current = null; setBusy(false); setMessages([]); setNotice(''); recognition.current?.abort(); setListening(false);
    return () => pending.current?.abort();
  }, [location.pathname]);
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }); }, [messages]);
  const read = (text: string) => speak('read:archie-ai', text);
  const close = () => { closeArchie(); stop(); };
  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    const history: Message[] = [...messages, { role: 'user', content: question }];
    setMessages(history); setInput(''); setNotice(''); setBusy(true);
    const controller = new AbortController(); pending.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const destination = destinationFor(question);
      if (destination) { navigate(destination); close(); return; }
      const deviceAnswer = answerFromDevice(question);
      const local = deviceAnswer ? { text: deviceAnswer } : tryLocalArchieResponse(question);
      const hint = /\b(hint|help|instructions|what do i do)\b/i.test(question);
      let reply = local?.text;
      if (!reply && hint && gameTitle) {
        reply = currentQuestion
          ? `Let's work on ${gameTitle}. ${currentQuestion} Try one small step first. What do you notice?${currentOptions?.length ? ` Your choices are ${currentOptions.join(', ')}.` : ''}`
          : `You are on ${gameTitle}. Read the instructions, then try one step. You can type the question here and we can work it out together.`;
      }
      if (reply) setNotice('Answered on this device.');
      else {
        const response = await fetch(`${API_PREFIX}/chat`, { method: 'POST', credentials: 'include', signal: controller.signal,
          headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history.slice(-12),
            systemExtra: `Learning activity: ${gameTitle || 'Sodafom home'}. Subject: ${subject || 'general learning'}. Current question: ${currentQuestion || 'none'}. Choices: ${currentOptions?.join(', ') || 'none'}.` }) });
        if (!response.ok) throw new Error('Learning service unavailable');
        reply = (await response.text()).trim();
        if (!reply) throw new Error('Empty reply');
        setNotice('Answered by the learning service.');
      }
      if (!controller.signal.aborted) { saveLearningTurn(question, reply); setMessages([...history, { role: 'assistant', content: reply }]); read(reply); }
    } catch {
      if (pending.current !== controller) return;
      const reply = 'The online teacher is unavailable right now. I can still help on this device with maths, spelling and finding a game. Try “What is 8 plus 4?” or “Spell Wednesday”.';
      setNotice('Using the built-in learning helper.');
      saveLearningTurn(question, reply);
      setMessages([...history, { role: 'assistant', content: reply }]);
    } finally { window.clearTimeout(timeout); if (pending.current === controller) setBusy(false); }
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
        {messages.map((m,i) => <p key={i} className={`chat-${m.role}`}><strong>{m.role === 'user' ? 'You' : 'Archie'}: </strong>{m.content.replace(/\[PLAY:[^\]]+\]/g, '')}</p>)}
        {busy && <p>Archie is thinking…</p>}<div ref={end}/>
      </div>
      {currentQuestion && <button className="archie-quick" onClick={() => read(`${currentQuestion} ${currentOptions?.join('. ') || ''}`)}><Volume2 size={18}/> Read the question</button>}
      {gameTitle && <button className="archie-quick" disabled={busy} onClick={() => send('Give me a hint please')}>Give me a hint</button>}
      <p className="archie-notice" role="status">{listening ? 'Listening…' : notice}</p>
      <form onSubmit={e => { e.preventDefault(); void send(input); }}>
        <button type="button" onClick={listen} aria-label={listening ? 'Stop microphone' : 'Talk to Archie'} aria-pressed={listening}><Mic/></button>
        <input ref={inputRef} aria-label="Your question for Archie" placeholder="Type your question…" value={input} maxLength={2000} onChange={e => setInput(e.target.value)}/>
        <button disabled={busy || !input.trim()} aria-label="Send question"><Send/></button>
      </form>
      {playing && <button className="archie-quick" onClick={stop}>Stop reading</button>}
    </dialog>
  </>;
}

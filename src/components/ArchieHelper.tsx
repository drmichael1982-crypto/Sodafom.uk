/** One shared, context-aware assistant for the home, lessons and existing games. */
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Mic, Send, Volume2, X, MessageCircle } from 'lucide-react';
import { API_PREFIX } from '@/lib/config';
import { useArchieContext, type LessonTutorContext } from '@/contexts/ArchieContext';
import { useVoice } from '@/lib/voice-context';
import { getRememberedChildName, tryLocalArchieResponse } from '@/lib/archie-local';
import { tryRememberChildInterest } from '@/lib/interest-themes';
import { answerFromDevice, answerLessonReply, saveLearningTurn } from '@/lib/archie/device-learning';
import catalog from '@/lib/archie/game-catalog.json';
import { useArchieData } from '@/lib/archie/storage';
import '@/pages/archie/archie.css';
import { blockedLearningText, FRIENDLY_REDIRECT, safeLearningReply } from '@/lib/archie/learning-safety';
import { normaliseVoiceAnswer, submitGameVoiceAnswer } from '@/lib/archie/game-voice';
import { coachLessonReply, guardPracticeReply, lessonContextForService, subjectMethod } from '@/lib/archie/lesson-coach';
import { loadTutorMemory } from '@/lib/tutor/memory';
import { resolveLearningAge } from '@/lib/learning-age';
import { clearActivePendingQuestion } from '@/lib/tutor/engine';

import type { CourseLesson, CourseSubject } from '@/lib/archie/course-types';

type Message = { role: 'user' | 'assistant'; content: string };
/** Keep locally remembered names out of an opted-in online conversation. */
export function privateServiceHistory(messages: Message[], childName: string | null): Message[] {
  const name = childName?.trim();
  if (!name) return messages;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const named = new RegExp(`(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`, 'gi');
  return messages.map(message => ({
    ...message,
    content: message.content.replace(named, (_match, prefix: string) => `${prefix}the learner`),
  }));
}
/** Lesson help uses the authored source; only the lesson's handler can grade an answer. */
export function authoredLessonReply(text: string, lesson: LessonTutorContext, unmatched = false): string | null {
  if (lesson.status === 'paused') return 'Your lesson is paused. Resume it when you are ready; your place is kept.';
  if (lesson.status === 'finished') return 'This lesson is finished. Choose another lesson or practise it again when you are ready.';
  if (/\b(hint|help|instructions|what do i do)\b/i.test(text)) return lesson.hintText || lesson.readText;
  if (/\b(repeat|read this|read the|say it again)\b/i.test(text)) return lesson.readText;
  if (/^(?:next|continue|finish)(?:\s+(?:question|lesson|key))?[.!?]*$/i.test(text.trim()))
    return 'Use the lesson’s next or finish button when you are ready. I will keep your place here.';
  const asksQuestion = /^(?:why|what|how|when|where|who|can|could|please|explain|tell|describe)\b/i.test(text.trim()) || text.includes('?');
  if (asksQuestion || lesson.status === 'learning')
    return 'Here is what this lesson explains. ' + lesson.teachingText +
      (lesson.hintText && lesson.hintText !== lesson.readText ? ' ' + lesson.hintText : '');
  if (lesson.status === 'answered') return 'This answer has already been checked. ' + (lesson.hintText || '') + ' Continue with the lesson button when you are ready.';
  return unmatched ? 'I could not match that to one answer choice. Say the full choice, or choose its button. You can ask for a hint.' : null;
}
function cleanTutorText(text: string) {
  return text.replaceAll('**', '').replaceAll('__', '').replaceAll('~~', '')
    .replaceAll('`', '').replace(/\\[PLAY:[^\\]]+\\]/g, '').trim();
}
export function getLearnerAge() {
  if (typeof window === 'undefined') return 9;
  const learningAge = resolveLearningAge();
  if (learningAge !== null) return learningAge;
  try {
    const app = JSON.parse(localStorage.getItem('sodafom_archie_design_v1') || '{}');
    const year = Number(app.settings?.year);
    if (year >= 1 && year <= 9) return year + 4;
  } catch { /* use the next available local learner setting */ }
  const selected = Number(localStorage.getItem('sodafom_ai_teacher_age'));
  if (selected >= 5 && selected <= 13) return selected;
  const ageGroup = loadTutorMemory().ageGroup;
  if (ageGroup === '5-7') return 6;
  if (ageGroup === '11-13') return 12;
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
export interface LessonLaunch { subject: CourseSubject; egypt: boolean; spoken: boolean }
/** Only explicit navigation commands launch lessons; answers and questions stay in their activity. */
export function lessonLaunchFor(text: string): LessonLaunch | null {
  const words = text.trim().toLowerCase().replace(/[.!?]+$/, '');
  if (!/^(?:(?:please|can you|could you)\s+)?(?:start|begin|open|go to|take me to)\b/.test(words) || /\bgames?\b/.test(words)) return null;
  const egypt = /\b(?:ancient )?egypt\b/.test(words);
  const subject: CourseSubject | undefined = egypt || /\bhistory\b/.test(words) ? 'history'
    : /\bmaths?\b/.test(words) ? 'maths' : /\benglish\b/.test(words) ? 'english'
    : /\bscience\b/.test(words) ? 'science' : undefined;
  return subject ? {subject, egypt, spoken:/\b(start|begin)\b/.test(words)} : null;
}
export function lessonForLaunch(command: LessonLaunch, year: number, lessons: CourseLesson[], completed: string[]): CourseLesson | undefined {
  const eligible = lessons.filter(item => item.year === year && item.subject === command.subject && !item.sensitive &&
    (!command.egypt || /\begypt(?:ian)?\b/i.test(item.unit + ' ' + item.title)))
    .sort((a,b)=>a.week-b.week || a.session-b.session);
  return eligible.find(item => !completed.includes('course-' + item.id)) || eligible[0];
}
export default function ArchieHelper({ hideLauncher = false }: { hideLauncher?: boolean; gameMode?: boolean }) {
  const { isOpen, draft, voiceOnOpen, openArchie, closeArchie, gameTitle, subject, currentQuestion, currentOptions, lessonTutor, lesson, requestLessonVoice } = useArchieContext();
  const { speak, stop, playing } = useVoice();
  const { settings, activities } = useArchieData();
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
  const microphoneTimer = useRef<number | null>(null);
  const quietSessions = useRef(0);
  const launchedLessonRoute = useRef<string | null>(null);
  const previousRoute = useRef(`${location.pathname}${location.search || ''}`);
  const previousLearningYear = useRef(settings.year);
  const contextKey = JSON.stringify([gameTitle, subject, currentQuestion, currentOptions,
    lessonTutor?.activityId, lessonTutor?.questionId, lessonTutor?.stepId,
    lessonTutor?.status === 'paused', lessonTutor?.status === 'finished', lesson?.phase]);
  const contextKeyRef = useRef(contextKey);
  const previousContext = useRef(contextKey);
  const previousLessonId = useRef(lessonTutor?.activityId);
  contextKeyRef.current = contextKey;
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
    if (microphoneTimer.current !== null) window.clearTimeout(microphoneTimer.current);
    microphoneTimer.current = null;
    const active = recognition.current;
    recognition.current = null;
    // Clear ownership before abort: delayed events cannot submit or restart.
    if (active) { try { active.abort(); } catch { /* already ended */ } }
    setListening(false);
  }
  function stopVoiceConversation(message = 'Voice conversation stopped. You can still type to Archie.') {
    conversationRef.current = false;
    pending.current?.abort(); pending.current = null; busyRef.current = false; setBusy(false);
    clearRestartTimer();
    retireMicrophone();
    setVoiceConversation(false);
    stop();
    setNotice(message);
  }
  useEffect(() => {
    const route = `${location.pathname}${location.search || ''}`;
    if (previousRoute.current === route) return;
    previousRoute.current = route;
    if (launchedLessonRoute.current !== route) requestLessonVoice?.(null);
    launchedLessonRoute.current = null;
    stopVoiceConversation(conversationRef.current || recognition.current ? 'Voice conversation stopped after changing activity.' : '');
    pending.current?.abort(); pending.current = null; busyRef.current = false; setBusy(false); setMessages([]);
  }, [location.pathname, location.search]);
  useEffect(() => {
    const resetForLearner = () => {
      clearActivePendingQuestion();
      requestLessonVoice?.(null);
      stopVoiceConversation('Learner changed. Start a new conversation when you are ready.');
      pending.current?.abort(); pending.current = null; busyRef.current = false; setBusy(false);
      setInput(''); setMessages([]);
    };
    window.addEventListener('sodafom:active-child-changed', resetForLearner);
    return () => window.removeEventListener('sodafom:active-child-changed', resetForLearner);
  });
  useEffect(() => {
    if (previousLearningYear.current === settings.year) return;
    previousLearningYear.current = settings.year;
    clearActivePendingQuestion();
    requestLessonVoice?.(null);
    stopVoiceConversation('Learning year changed. Start a new conversation when you are ready.');
    setInput(''); setMessages([]);
  }, [settings.year]);
  useEffect(() => {
    if (previousContext.current === contextKey) return;
    const sameLesson = !!lessonTutor && previousLessonId.current === lessonTutor.activityId;
    previousContext.current = contextKey;
    previousLessonId.current = lessonTutor?.activityId;
    pending.current?.abort(); pending.current = null;
    busyRef.current = false; setBusy(false);
    if (conversationRef.current && sameLesson && lessonTutor && lessonTutor.status !== 'paused' && lessonTutor.status !== 'finished') {
      // Explicit Next changes the authored part. Retire the old microphone before reading the new one.
      clearRestartTimer(); retireMicrophone(); quietSessions.current = 0;
      setNotice('The lesson part changed. Listen, then tell Archie what you think.');
      read(lessonTutor.readText);
    } else if (conversationRef.current || recognition.current) {
      stopVoiceConversation('The activity changed or paused. Start voice conversation again when you are ready.');
    }
  }, [contextKey]);
  useEffect(() => {
    if (isOpen) { setInput(draft); if (!dialog.current?.open) dialog.current?.showModal(); inputRef.current?.focus(); if (voiceOnOpen && !conversationRef.current) startVoiceConversation(); }
    else { stopVoiceConversation(''); busyRef.current = false; dialog.current?.close(); pending.current?.abort(); pending.current = null; setBusy(false); }
  }, [isOpen, draft, voiceOnOpen]);
  useEffect(() => {
    const leave = () => {
      if (document.visibilityState === 'hidden') {
        requestLessonVoice?.(null);
        stopVoiceConversation('Voice stopped while the app was hidden. Press Start when you return.');
      }
    };
    const pageLeave = () => { requestLessonVoice?.(null); stopVoiceConversation('Voice stopped after leaving this page.'); };
    document.addEventListener('visibilitychange', leave);
    window.addEventListener('pagehide', pageLeave);
    return () => { document.removeEventListener('visibilitychange', leave); window.removeEventListener('pagehide', pageLeave); };
  }, [stop, requestLessonVoice]);
  useEffect(() => () => {
    conversationRef.current = false;
    openRef.current = false;
    clearRestartTimer();
    if (microphoneTimer.current !== null) window.clearTimeout(microphoneTimer.current);
    const active = recognition.current; recognition.current = null;
    if (active) { try { active.abort(); } catch { /* already ended */ } }
    pending.current?.abort(); pending.current = null;
    stop();
  }, [stop]);
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }); }, [messages]);
  const read = (text: string) => { clearRestartTimer(); retireMicrophone(); speak('read:archie-ai', cleanTutorText(text)); };
  const close = () => { requestLessonVoice?.(null); stopVoiceConversation(''); pending.current?.abort(); pending.current = null; closeArchie(); };
  async function send(text: string) {
    const question = text.trim();
    if (/^(?:stop|stop listening|stop voice conversation|stop talking)[.!?]*$/i.test(question)) {
      requestLessonVoice?.(null); stopVoiceConversation(); setInput(''); return;
    }
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
      // A real answer choice takes priority over words such as “help” or “show”.
      const isLessonChoice = (lessonTutor ? lessonTutor.status === 'answering' : lesson?.phase === 'practice' && !lesson.answeredCorrectly) && currentOptions?.some(
        option => normaliseVoiceAnswer(option) === normaliseVoiceAnswer(question),
      );
      const interestReply = isLessonChoice ? null : tryRememberChildInterest(question);
      if (interestReply) {
        setNotice('Handled on this device.');
        setMessages([...history, { role: 'assistant', content: cleanTutorText(interestReply) }]);
        readReply(interestReply);
        return;
      }
      const launch = isLessonChoice ? null : lessonLaunchFor(question);
      if (launch) {
        const { COURSE_LESSONS } = await import('@/pages/archie/ArchieCourses');
        if (controller.signal.aborted || pending.current !== controller || !openRef.current) return;
        const chosen = lessonForLaunch(launch, settings.year, COURSE_LESSONS, (activities || []).map(item=>item.id));
        if (!chosen) {
          const reply = launch.egypt ? `Ancient Egypt is not in this resource's Year ${settings.year} history path. Open history lessons to choose an adventure for your year.`
            : `There is no available ${launch.subject} lesson for Year ${settings.year}. Choose another subject from lessons.`;
          setNotice('Checked the lessons on this device.');setMessages([...history,{role:'assistant',content:reply}]);readReply(reply);return;
        }
        const destination = '/courses/' + chosen.id;
        if (chosen.id === lessonTutor?.activityId && location.pathname === destination) {
          if (launch.spoken) startVoiceConversation();
          else { setNotice('This lesson is already open.'); readReply(lessonTutor.readText); }
          return;
        }
        close();
        if (launch.spoken) requestLessonVoice?.(chosen.id);
        launchedLessonRoute.current = destination;
        navigate(destination); return;
      }
      const destination = isLessonChoice ? undefined : destinationFor(question);
      if (destination) { navigate(destination); close(); return; }
      const lessonUnavailable = lessonTutor?.status === 'paused';
      // Pausing wins over coaching; a real choice wins over help-request words.
      const coachAnswer = !isLessonChoice && !lessonUnavailable ? coachLessonReply(question, lesson) : null;
      const authored = lessonTutor && !isLessonChoice
        ? (lessonUnavailable ? authoredLessonReply(question, lessonTutor) : coachAnswer || authoredLessonReply(question, lessonTutor)) : null;
      const gameAnswer = !authored && (!lessonTutor || lessonTutor.status === 'answering')
        ? submitGameVoiceAnswer(lessonTutor?.answerTarget || gameTitle || '', question) : undefined;
      const courseAnswer = lessonTutor ? gameAnswer || authored || authoredLessonReply(question, lessonTutor, true) : null;
      const deviceAnswer = lessonTutor ? null : gameAnswer || coachAnswer || answerFromDevice(question, getLearnerAge());
      const lessonAnswer = lessonTutor || lesson ? null : answerLessonReply(question, currentQuestion || '', subject);
      if (lessonAnswer?.startsWith('Brilliant!')) window.dispatchEvent(new Event('archie-spelling-correct'));
      const local = courseAnswer ? { text: courseAnswer } : deviceAnswer ? { text: deviceAnswer } : lessonAnswer ? { text: lessonAnswer } : tryLocalArchieResponse(question);
      const hint = /\b(hint|help|instructions|what do i do)\b/i.test(question);
      let reply = local?.text;
      // A bare answer such as “six” must never become a reusable general grading reply.
      let rememberReply = !gameAnswer && !lessonAnswer && !lessonTutor && !coachAnswer;
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
        const serviceHistory = privateServiceHistory(history.slice(-12), getRememberedChildName());
        const response = await fetch(`${API_PREFIX}/chat`, { method: 'POST', credentials: 'include', signal: controller.signal,
          headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: serviceHistory, learnerAge:getLearnerAge(),
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
    if (!conversationRef.current || busyRef.current || playingRef.current || recognition.current || !openRef.current || document.visibilityState === 'hidden') return;
    const listener = new SpeechRecognition(); recognition.current = listener;
    const listeningContext = contextKeyRef.current;
    let heardWords = false;
    listener.lang = 'en-GB'; listener.interimResults = false; listener.continuous = false;
    listener.onresult = (event: any) => {
      if (recognition.current !== listener || listeningContext !== contextKeyRef.current || !conversationRef.current || busyRef.current || playingRef.current || !openRef.current) return;
      const result=event.results?.[0]?.[0];
      const confidence=Number(result?.confidence);
      if(Number.isFinite(confidence)&&confidence>0&&confidence<.45){setNotice('I could not hear those words clearly. Please try again a little closer to the microphone.');return;}
      const words = String(result?.transcript || '').trim();
      if (words) { heardWords = true; quietSessions.current = 0; setInput(words); void sendRef.current(words); }
    };
    listener.onerror = (event: any) => {
      if (recognition.current !== listener) return;
      if (event?.error === 'no-speech') { setNotice('I did not hear words. I can try again briefly; you can also stop or type.'); return; }
      stopVoiceConversation(['not-allowed','service-not-allowed','audio-capture'].includes(event?.error)
        ? 'Microphone access is unavailable. You can type to Archie or ask a grown-up to check microphone permission.'
        : 'Voice conversation could not continue in this browser. You can still type to Archie.');
    };
    listener.onend = () => {
      if (recognition.current !== listener) return;
      recognition.current = null;
      if (microphoneTimer.current !== null) window.clearTimeout(microphoneTimer.current);
      microphoneTimer.current = null;
      if (!heardWords && ++quietSessions.current >= 3) {
        stopVoiceConversation('I did not hear words after three tries. Press Start to try again, or type your question.'); return;
      }
      setListening(false);
    };
    try {
      listener.start(); setListening(true); setNotice('Listening for your question or answer…');
      microphoneTimer.current = window.setTimeout(()=>{
        if (recognition.current === listener) stopVoiceConversation('The microphone session ended. Press Start again, or type your question.');
      }, 20000);
    }
    catch { stopVoiceConversation('The microphone could not start. You can still type to Archie.'); }
  }
  useEffect(() => {
    clearRestartTimer();
    if (playing && recognition.current) retireMicrophone();
    if (voiceConversation && isOpen && !busy && !playing && !listening) {
      restartTimer.current = window.setTimeout(() => { restartTimer.current = null; listenForConversation(); }, 250);
    }
    return clearRestartTimer;
  }, [voiceConversation, isOpen, busy, playing, listening]);
  function startVoiceConversation() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setNotice('Voice conversation is not supported here. You can still type to Archie.'); return; }
    if (document.visibilityState === 'hidden') { setNotice('Return to this page, then press Start to talk.'); return; }
    clearRestartTimer(); retireMicrophone(); quietSessions.current = 0;
    conversationRef.current = true; setVoiceConversation(true);
    setNotice(settings.sound ? 'Voice conversation started. Archie listens again after each reply.' : 'Voice conversation started. Sound is off, so replies appear as text. Turn sound on to hear Archie.');
    const lessonRead = lessonTutor && (lessonTutor.status === 'paused' || lessonTutor.status === 'finished')
      ? authoredLessonReply('', lessonTutor) : lessonTutor?.readText;
    read(lessonRead || (currentQuestion ? `${currentQuestion} ${currentOptions?.join('. ') || ''}` : 'Hi! What would you like to learn? Ask your question after I finish speaking.'));
  }
  function listen() {
    if (conversationRef.current) { stopVoiceConversation(); return; }
    if (busyRef.current) return;
    if (listening) { recognition.current?.stop(); return; }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setNotice('This browser does not support voice input. Please type your question.'); inputRef.current?.focus(); return; }
    stop();
    const listener = new SpeechRecognition(); recognition.current = listener;
    const listeningContext = contextKeyRef.current;
    listener.lang = 'en-GB'; listener.interimResults = false; listener.continuous = false;
    listener.onresult = (e: any) => { if (recognition.current !== listener || listeningContext !== contextKeyRef.current || !openRef.current) return; setInput(e.results?.[0]?.[0]?.transcript || ''); setNotice('Check your words, then tap Send.'); };
    listener.onend = () => { if (recognition.current !== listener) return; recognition.current = null; setListening(false); };
    listener.onerror = () => { if (recognition.current !== listener) return; retireMicrophone(); setNotice('I could not hear you. You can type your question instead.'); };
    try { listener.start(); setListening(true); } catch { retireMicrophone(); setNotice('The microphone is busy. Try typing your question.'); }
  }
  return <>
    {!hideLauncher && !isOpen && <button className="archie-launcher" onClick={() => openArchie()} aria-label="Ask Archie"><MessageCircle size={23} aria-hidden="true"/> Ask Archie</button>}
    <dialog ref={dialog} className="archie-dialog" onCancel={close} onClose={() => { if (openRef.current) close(); }} aria-labelledby="archie-title">
      <header><div><h2 id="archie-title">Ask Archie</h2><p>{gameTitle ? `Helping with ${gameTitle}${lesson?.phaseLabel ? ` · ${lesson.phaseLabel}` : ''}` : 'Your learning helper'}</p></div><button aria-label="Close Ask Archie" onClick={close}><X /></button></header>
      <div className="archie-chat-history" role="log" aria-live="polite">
        {!messages.length && <p>Hi{settings.childNickname ? `, ${settings.childNickname}` : ''}! Ask me about this game or lesson. You can type or tap the microphone.</p>}
        {messages.map((m,i) => <p key={i} className={`chat-${m.role}`}><strong>{m.role === 'user' ? 'You' : 'Archie'}: </strong>{m.role === 'assistant' ? <>{m.content.split(/(\s+)/).map((part,wordIndex) => /^\s+$/.test(part) ? part : <span className="archie-word" style={{ animationDelay: `${Math.min(wordIndex, 24) * 22}ms` }} key={wordIndex}>{part}</span>)}<button type="button" className="archie-quick" aria-label="Listen to Archie" onClick={() => read(m.content)}><Volume2 size={18}/> Listen</button></> : m.content.replace(/\[PLAY:[^\]]+\]/g, '')}</p>)}
        {busy && <p>Archie is thinking…</p>}<div ref={end}/>
      </div>
      <button className="archie-quick" disabled={!voiceConversation && busy} onClick={voiceConversation ? () => { requestLessonVoice?.(null); stopVoiceConversation(); } : startVoiceConversation}>{voiceConversation ? 'Stop voice conversation' : 'Start voice conversation'}</button>
      <p className="archie-notice">Press Start once to talk back and forth. Archie waits until he finishes speaking before listening again. Try “Start maths lesson” or “Open history lesson”. If no words are heard, listening stops after a few tries. Your browser may process speech online. You can stop at any time.</p>
      {currentQuestion && <button className="archie-quick" onClick={() => read(lessonTutor?.readText || `${currentQuestion} ${currentOptions?.join('. ') || ''}`)}><Volume2 size={18}/> {lessonTutor ? 'Read this lesson part' : 'Read the question'}</button>}
      {gameTitle && <button className="archie-quick" disabled={busy} onClick={() => send('Give me a hint please')}>Give me a hint</button>}
      <p className="archie-notice" role="status">{listening ? 'Listening…' : voiceConversation && playing ? 'Archie is speaking. He will listen again after his reply.' : notice}</p>
      <form onSubmit={e => { e.preventDefault(); void send(input); }}>
        <button type="button" disabled={busy && !voiceConversation} onClick={listen} aria-label={listening ? 'Stop microphone' : 'Talk to Archie'} aria-pressed={listening}><Mic/></button>
        <input ref={inputRef} aria-label="Your question for Archie" placeholder="Type your question…" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} value={input} maxLength={2000} onChange={e => setInput(e.target.value)}/>
        <button disabled={busy || !input.trim()} aria-label="Send question"><Send/></button>
      </form>
      {playing && <button className="archie-quick" onClick={() => { requestLessonVoice?.(null); stopVoiceConversation('Reading stopped. Press Start to talk again, or type.'); }}>Stop reading</button>}
    </dialog>
  </>;
}

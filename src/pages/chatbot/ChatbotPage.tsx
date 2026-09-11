/**
 * Archie Chat Page — Sodafom's AI learning buddy
 * Kid-friendly chat interface powered by OpenAI via /api/chat
 */

import React, { useState, useRef, type FormEvent } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, RotateCcw, BookOpen, Calculator, FlaskConical, Pencil, Palette, History, X, Play, Mic, Square, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { archie_chat } from 'virtual:content';
import { ArchieCharacter } from '../../components/ArchieCharacter';
import { API_PREFIX } from '@/lib/config';
import { ttsSpeak, stopTts } from '@/lib/voice-context';
import { tryLocalArchieResponse } from '@/lib/archie-local';
import { OPEN_TESTING_MODE } from '@/lib/testing-mode';

// ── Parse [PLAY:slug|label] markers out of Archie's message ──────────────────
interface PlayButton { slug: string; label: string; }
interface ParsedMessage { text: string; buttons: PlayButton[]; }

function parseArchieMessage(content: string): ParsedMessage {
  const buttons: PlayButton[] = [];
  const text = content.replace(/\[PLAY:([^\]|]+)\|([^\]]+)\]/g, (_match, slug, label) => {
    buttons.push({ slug: slug.trim(), label: label.trim() });
    return '';
  }).trim();
  return { text, buttons };
}

// Subject → first recommended game slug for quick-launch
const SUBJECT_GAME_SLUGS: Record<string, string> = {
  Maths:   'mental-maths-sprint',
  Spelling:'spelling-bee',
  Reading: 'reading-quest',
  Science: 'animal-kingdom',
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  source?: 'local' | 'openai' | 'limit';
}

const HISTORY_KEY = 'sodafom_archie_history';
const MAX_HISTORY = 40;
const AI_DAILY_LIMIT = 20;
const AI_USAGE_KEY = 'sodafom_archie_ai_daily_usage';

function getAiUsageToday() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const parsed = JSON.parse(localStorage.getItem(AI_USAGE_KEY) || '{}');
    return parsed?.date === today ? Number(parsed.count || 0) : 0;
  } catch { return 0; }
}

function incrementAiUsageToday() {
  const today = new Date().toISOString().slice(0, 10);
  const count = getAiUsageToday() + 1;
  try { localStorage.setItem(AI_USAGE_KEY, JSON.stringify({ date: today, count })); } catch { /* ignore */ }
  return count;
}

const SUBJECT_PROMPTS: { label: string; icon: React.ReactNode; color: string; prompts: string[] }[] = [
  {
    label: 'Maths',
    icon: <Calculator size={13} />,
    color: 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200',
    prompts: [
      'Can you explain times tables in a fun way?',
      'What is a fraction? Give me an easy example.',
      'Help me understand long division step by step.',
      'What are prime numbers?',
    ],
  },
  {
    label: 'Spelling',
    icon: <Pencil size={13} />,
    color: 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200',
    prompts: [
      'Give me 5 tricky spelling words to practise.',
      'What is a silent letter? Give me examples.',
      'Help me remember how to spell "necessary".',
      'What are some common spelling rules?',
    ],
  },
  {
    label: 'Reading',
    icon: <BookOpen size={13} />,
    color: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200',
    prompts: [
      'What is a simile? Give me a fun example.',
      'Help me understand what a main character is.',
      'What does "inference" mean in reading?',
      'Can you recommend a book for my age?',
    ],
  },
  {
    label: 'Science',
    icon: <FlaskConical size={13} />,
    color: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200',
    prompts: [
      'How do plants make food from sunlight?',
      'What is the water cycle?',
      'Why is the sky blue?',
      'Tell me about the planets in our solar system.',
    ],
  },
  {
    label: 'Art',
    icon: <Palette size={13} />,
    color: 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200',
    prompts: [
      'What are the primary colours?',
      'How do I draw a cartoon face?',
      'What is perspective in art?',
      'Tell me about a famous painting.',
    ],
  },
  {
    label: 'Encouragement',
    icon: <Sparkles size={13} />,
    color: 'bg-pink-100 text-pink-800 border-pink-300 hover:bg-pink-200',
    prompts: [
      'Can you tell me something nice?',
      'I need a boost today, Archie!',
      'Why is learning fun?',
      'Tell me why I am doing a great job!',
    ],
  },
];

export default function ChatbotPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? (JSON.parse(raw) as Message[]) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversationMode, setConversationMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recorderStreamRef = useRef<MediaStream | null>(null);
  const conversationModeRef = useRef(false);
  const processingRef = useRef(false);
  const speakingRef = useRef(false);
  const restartTimerRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  // Persist chat history
  React.useEffect(() => {
    console.log('ChatbotPage mounted');
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-MAX_HISTORY)));
    } catch { /* ignore */ }
  }, [messages]);

  // Auto-scroll to latest message
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
  }, [messages]);

  // Clean up microphone/TTS when leaving Ask Archie. Never listen in the background.
  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      conversationModeRef.current = false;
      if (restartTimerRef.current !== null) window.clearTimeout(restartTimerRef.current);
      try { recognitionRef.current?.abort?.(); } catch { /* ignore */ }
      try { recorderRef.current?.stop(); } catch { /* ignore */ }
      recorderStreamRef.current?.getTracks().forEach(track => track.stop());
      recognitionRef.current = null;
      stopTts();
    };
  }, []);

  function setConversationEnabled(enabled: boolean) {
    conversationModeRef.current = enabled;
    setConversationMode(enabled);
    console.info(enabled ? 'ARCHIE_CONVERSATION_MODE_ON' : 'ARCHIE_CONVERSATION_MODE_OFF');
  }

  function scheduleListeningRestart(delay = 450) {
    if (!conversationModeRef.current || processingRef.current || speakingRef.current || !mountedRef.current) return;
    if (restartTimerRef.current !== null) window.clearTimeout(restartTimerRef.current);
    restartTimerRef.current = window.setTimeout(() => {
      restartTimerRef.current = null;
      if (!conversationModeRef.current || processingRef.current || speakingRef.current || !mountedRef.current) return;
      console.info('ARCHIE_LISTENING_RESTARTED');
      startListening(false);
    }, delay);
  }

  function speakArchie(text: string) {
    // Archie must never listen to his own speaker output.
    try { recognitionRef.current?.abort?.(); } catch { /* ignore */ }
    recognitionRef.current = null;
    setIsListening(false);
    speakingRef.current = true;
    setIsSpeaking(true);
    console.info('ARCHIE_LISTENING_PAUSED_FOR_TTS');
    console.info('ARCHIE_TTS_STARTED');
    ttsSpeak(text, () => {
      speakingRef.current = false;
      if (mountedRef.current) setIsSpeaking(false);
      console.info('ARCHIE_TTS_FINISHED');
      scheduleListeningRestart(500);
    });
  }

  function stopArchieSpeakingAndResume() {
    stopTts();
    speakingRef.current = false;
    setIsSpeaking(false);
    if (conversationModeRef.current) scheduleListeningRestart(250);
  }

  function stopConversation() {
    setConversationEnabled(false);
    if (restartTimerRef.current !== null) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    try { recognitionRef.current?.abort?.(); } catch { /* ignore */ }
    recognitionRef.current = null;
    setIsListening(false);
    stopTts();
    speakingRef.current = false;
    setIsSpeaking(false);
  }

  async function sendMessage(text: string, fromVoice = false) {
    const trimmed = text.trim();
    if (!trimmed || processingRef.current) return;

    // Navigation requests are actions, not learning questions. This makes
    // spoken phrases such as “take me back to the main menu” work immediately.
    if (/\b(?:take|go|back|return)\b.*\b(?:home|main menu)\b|^(?:home|main menu)$/i.test(trimmed)) {
      stopConversation();
      navigate('/');
      return;
    }
    processingRef.current = true;

    const userMessage: Message = { id: `user-${Date.now()}`, role: 'user', content: trimmed };
    const assistantId = `assistant-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: assistantId, role: 'assistant', content: '' },
    ]);
    setInput('');
    setIsLoading(true);
    setError(null);

    const local = tryLocalArchieResponse(trimmed);
    if (local) {
      console.info('ARCHIE_RESPONSE_SOURCE_LOCAL', local.intent);
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: local.text, source: 'local' } : m))
      );
      speakArchie(local.text);
      setIsLoading(false);
      processingRef.current = false;
      return;
    }

    if (OPEN_TESTING_MODE && getAiUsageToday() >= AI_DAILY_LIMIT) {
      const limitMessage = "Archie's AI questions are finished for today, but I can still help with lots of free learning activities. Try maths, spelling, reading, app help or your learning games!";
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: limitMessage, source: 'limit' } : m)));
      speakArchie(limitMessage);
      setIsLoading(false);
      processingRef.current = false;
      return;
    }

    try {
      console.log(`[Chatbot] START sendMessage: "${trimmed}"`);
      // Filter out empty messages from history
      const history = [...messages, userMessage]
        .filter(m => m.content && m.content.trim().length > 0)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));
      console.log(`[Chatbot] Sanitized history length: ${history.length}`);

      const fetchUrl = `${API_PREFIX}/chat`;
      console.log(`[Chatbot] Fetching URL: ${fetchUrl}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn('[Chatbot] Request TIMEOUT triggered (45s)');
        controller.abort();
      }, 45000);

      if (OPEN_TESTING_MODE) {
        const used = incrementAiUsageToday();
        console.info('ARCHIE_AI_TEST_USAGE', { used, limit: AI_DAILY_LIMIT });
      }
      console.log('[Chatbot] Calling fetch...');
      const response = await fetch(fetchUrl, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/plain, */*'
        },
        body: JSON.stringify({ messages: history }),
      }).catch(e => {
        clearTimeout(timeoutId);
        console.error(`[Chatbot] Fetch CATCH block:`, e);
        if (e.name === 'AbortError') throw new Error('Request timed out. Please try again!');
        throw new Error(`Connection failed: ${e.message || 'Check internet'}.`);
      });

      clearTimeout(timeoutId);
      console.log(`[Chatbot] Fetch COMPLETED. Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errText = await response.text().catch(() => 'no body');
        console.error(`[Chatbot] Response NOT OK. Status: ${response.status}. Body: ${errText}`);
        throw new Error(`Server error: HTTP ${response.status}. ${errText.slice(0, 100)}`);
      }

      let fullContent = '';
      const contentType = response.headers.get('content-type');
      console.log(`[Chatbot] Content-Type: ${contentType}`);

      // Only treat as stream if explicitly told so by the server
      const isStream = contentType?.includes('text/event-stream');
      console.log(`[Chatbot] isStream: ${isStream}`);

      if (isStream && response.body && typeof (response.body as any).getReader === 'function') {
        console.log('[Chatbot] Starting STREAM processing...');
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let chunkCount = 0;
        for (let result = await reader.read(); !result.done; result = await reader.read()) {
          const chunk = decoder.decode(result.value, { stream: true });
          chunkCount++;
          console.log(`[Chatbot] Received chunk #${chunkCount} (${chunk.length} chars)`);
          // Buffer stream chunks and update the message once at the end. Re-rendering
          // the whole chat on every tiny chunk caused visible flashing in Android WebView.
          fullContent += chunk;
        }
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: fullContent, source: 'openai' } : m))
        );
        console.log(`[Chatbot] STREAM finished. Total length: ${fullContent.length}`);
      } else {
        console.log('[Chatbot] Starting BUFFERED processing (text)...');
        fullContent = await response.text();
        console.log(`[Chatbot] BUFFERED finished. Length: ${fullContent?.length}`);
        if (!fullContent) {
           console.warn('[Chatbot] Received EMPTY content from server');
           throw new Error('Received empty response from Archie.');
        }

        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: fullContent, source: 'openai' } : m))
        );
      }

      console.info('ARCHIE_RESPONSE_SOURCE_OPENAI');
      console.log(`[Chatbot] Parsing Archie message...`);
      const { text } = parseArchieMessage(fullContent);
      console.log(`[Chatbot] Final parsed text length: ${text?.length}`);
      if (text) {
        console.log(`[Chatbot] Triggering TTS speak...`);
        speakArchie(text);
      } else {
        console.warn('[Chatbot] No text to speak after parsing.');
      }
    } catch (err) {
      console.error('Chatbot API Error:', err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      speakArchie("Oops! I'm having a little trouble connecting right now. Please check your internet and try again! 😊");
    } finally {
      setIsLoading(false);
      processingRef.current = false;
      // Focusing the text box after a voice response makes the Android keyboard
      // repeatedly appear/disappear, which caused the visible screen flicker.
      if (!fromVoice && !conversationModeRef.current) inputRef.current?.focus();
      if (conversationModeRef.current && !speakingRef.current) scheduleListeningRestart();
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    sendMessage(input);
  }

  function toggleListening() {
    if (conversationModeRef.current) {
      stopConversation();
      return;
    }
    setConversationEnabled(true);
    startListening(false);
  }

  function startListening(enableConversation = false) {
    if (enableConversation) setConversationEnabled(true);
    if (!conversationModeRef.current || processingRef.current || speakingRef.current) {
      console.log('startListening skipped:', { conversationMode: conversationModeRef.current, processing: processingRef.current, speaking: speakingRef.current });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    console.log('SpeechRecognition check:', { supported: !!SpeechRecognition });
    if (!SpeechRecognition) {
      void recordAndTranscribeForFire();
      return;
    }

    // Do not create multiple recognition sessions at once.
    if (recognitionRef.current) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.interimResults = true;
    recognition.continuous = false; // Android ends naturally; we restart while Conversation Mode is on.
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
    let submitted = false;

    recognition.onstart = () => {
      if (!mountedRef.current) return;
      setIsListening(true);
      setError(null);
      console.info('ARCHIE_LISTENING_STARTED');
    };

    recognition.onresult = (event: any) => {
      let finalText = '';
      let interimText = '';
      for (let i = event.resultIndex ?? 0; i < event.results.length; i++) {
        const part = event.results[i]?.[0]?.transcript ?? '';
        if (event.results[i].isFinal) finalText += part;
        else interimText += part;
      }

      const visibleText = (finalText || interimText).trim();
      if (visibleText) setInput(visibleText);

      if (finalText.trim() && !submitted) {
        submitted = true;
        const heard = finalText.trim();
        console.info('ARCHIE_SPEECH_DETECTED');
        // Pause recognition while we think/speak so Archie cannot hear himself.
        try { recognition.stop(); } catch { /* ignore */ }
        recognitionRef.current = null;
        setIsListening(false);
        setInput(heard);

        const lower = heard.toLowerCase().replace(/[.!?]/g, '').trim();
        if (['stop', 'stop listening', 'stop talking', 'goodbye archie'].includes(lower)) {
          stopConversation();
          return;
        }
        sendMessage(heard, true);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('ARCHIE_RECOGNITION_ERROR', event.error);
      recognitionRef.current = null;
      setIsListening(false);

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError("Microphone permission was denied. Please allow microphone access in your phone settings.");
        setConversationEnabled(false);
      } else if (event.error === 'no-speech' || event.error === 'aborted') {
        // Silence/normal abort is not a failure in continuous conversation mode.
        if (conversationModeRef.current) scheduleListeningRestart(350);
      } else if (event.error === 'network') {
        setError("Voice recognition had a network problem. I'll keep trying while conversation mode is on.");
        if (conversationModeRef.current) scheduleListeningRestart(1200);
      } else {
        setError(`Voice recognition paused (${event.error}). Tap Archie again if it does not restart.`);
        if (conversationModeRef.current) scheduleListeningRestart(900);
      }
    };

    recognition.onend = () => {
      if (recognitionRef.current === recognition) recognitionRef.current = null;
      setIsListening(false);
      if (conversationModeRef.current && !submitted && !processingRef.current && !speakingRef.current) {
        scheduleListeningRestart(400);
      }
    };

    try {
      recognition.start();
    } catch (err) {
      recognitionRef.current = null;
      console.warn('ARCHIE_RECOGNITION_ERROR start', err);
      if (conversationModeRef.current) scheduleListeningRestart(700);
    }
  }

  async function recordAndTranscribeForFire() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('This browser cannot record speech. You can still type to Archie.');
      setConversationEnabled(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      recorderStreamRef.current = stream;
      const preferred = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'];
      const mimeType = preferred.find(type => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;
      const chunks: Blob[] = [];
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      recorder.onstart = () => {
        setIsListening(true);
        setError('Listening on your Fire tablet… speak now.');
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        recorderStreamRef.current = null;
        recorderRef.current = null;
        setIsListening(false);
        try {
          const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
          const audio = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
          });
          const response = await fetch(`${API_PREFIX}/ai/transcribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audio }),
          });
          const result = await response.json() as { text?: string; error?: string };
          if (!response.ok || !result.text) throw new Error(result.error || 'I could not hear that.');
          setInput(result.text);
          setError(null);
          sendMessage(result.text, true);
        } catch (problem) {
          setError(problem instanceof Error ? problem.message : 'I could not hear that. Please try again.');
          setConversationEnabled(false);
        }
      };
      recorder.start();
      window.setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, 6500);
    } catch (problem) {
      setIsListening(false);
      setConversationEnabled(false);
      setError(problem instanceof DOMException && problem.name === 'NotAllowedError'
        ? 'Microphone permission was denied. Allow microphone access in Silk settings, then try again.'
        : 'The microphone could not start. You can still type to Archie.');
    }
  }

  function handleReset() {
    stopConversation();
    setMessages([]);
    setError(null);
    setActiveSubject(null);
    try { localStorage.removeItem(HISTORY_KEY); } catch { /* ignore */ }
    inputRef.current?.focus();
  }

  const lastMessage = messages[messages.length - 1];
  const showTypingIndicator =
    isLoading && lastMessage?.role === 'assistant' && lastMessage.content === '';
  const showSuggestions = messages.length === 0;

  const activeSubjectData = SUBJECT_PROMPTS.find(s => s.label === activeSubject);

  return (
    <>
      <Helmet>
        <title>{archie_chat.seo.title}</title>
        <meta name="description" content={archie_chat.seo.description} />
        <link rel="canonical" href="https://sodafom.uk/ask-archie" />
        <meta property="og:title" content={archie_chat.seo.title} />
        <meta property="og:description" content={archie_chat.seo.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sodafom.uk/ask-archie" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={archie_chat.seo.title} />
        <meta name="twitter:description" content={archie_chat.seo.description} />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>

      <main className="relative min-h-screen overflow-hidden bg-sky-800 flex flex-col">
        <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/assets/cartoon/home-landscape-v2.png')" }} aria-hidden="true" />
        <div className="fixed inset-0 bg-gradient-to-b from-blue-500/65 via-indigo-800/80 to-blue-950/95" aria-hidden="true" />
        {/* Header */}
        <div className="relative z-10 m-3 rounded-[1.75rem] border-4 border-white/80 bg-gradient-to-r from-sky-500 via-blue-600 to-purple-700 text-white shadow-2xl sm:m-4">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => { stopConversation(); navigate('/'); }}
                aria-label="Back to Sodafom home"
                className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white text-sky-900 shadow-md active:scale-95"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              {/* Archie avatar */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-100 to-sky-100 flex items-center justify-center shadow-md border-2 border-yellow-300 overflow-hidden">
                  <ArchieCharacter size={48} speaking={false} />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div>
                <h1 className="font-extrabold text-white text-lg leading-tight">
                  {archie_chat.hero.title}
                </h1>
                <p className="text-xs text-yellow-200 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{archie_chat.hero.tagline}</span>
                </p>
              </div>
            </div>
            {messages.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHistory(h => !h)}
                  className="flex items-center gap-1.5 text-xs text-white/85 transition-colors px-3 py-1.5 rounded-full hover:bg-white/20"
                  aria-label="View chat history"
                >
                  <History className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">History</span>
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-xs text-white/85 transition-colors px-3 py-1.5 rounded-full hover:bg-white/20"
                  aria-label="Start a new chat"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{archie_chat.hero.newChatLabel}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="relative z-10 flex-1 max-w-2xl w-full mx-auto px-4 py-4 flex flex-col">
          {/* Welcome state */}
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col items-center justify-center rounded-[2rem] border-4 border-white/80 bg-white/95 px-4 py-8 text-center shadow-2xl backdrop-blur-sm"
            >
              <div
                className="mb-4 animate-bounce cursor-pointer"
                onClick={toggleListening}
              >
                <ArchieCharacter size={96} speaking={isListening} />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-800 mb-2">
                {archie_chat.hero.subtitle}
              </h2>
              <p className="text-gray-500 mb-6 max-w-sm text-sm leading-relaxed">
                {archie_chat.hero.description}
              </p>

              {/* Subject tabs */}
              <div className="w-full max-w-md mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Pick a subject or just ask anything!
                </p>
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {SUBJECT_PROMPTS.map(s => (
                    <button
                      key={s.label}
                      onClick={() => setActiveSubject(activeSubject === s.label ? null : s.label)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${s.color} ${activeSubject === s.label ? 'ring-2 ring-offset-1 ring-current' : ''}`}
                    >
                      {s.icon} {s.label}
                    </button>
                  ))}
                </div>

                {/* Prompts for active subject or default suggestions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(activeSubjectData?.prompts ?? archie_chat.suggestions.map(s => s.text)).map((text, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(text)}
                      className="text-left px-4 py-3 rounded-2xl bg-white border-2 border-yellow-200 hover:border-yellow-400 hover:bg-yellow-50 text-sm text-gray-700 font-medium transition-all shadow-sm hover:shadow-md"
                    >
                      {text}
                    </button>
                  ))}
                </div>

                {/* Quick-play game buttons */}
                <div className="mt-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    Or jump straight into a game!
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Play Maths', emoji: '🔢', slug: SUBJECT_GAME_SLUGS['Maths'],   grad: 'from-amber-400 to-amber-600'  },
                      { label: 'Play Spelling', emoji: '🐝', slug: SUBJECT_GAME_SLUGS['Spelling'], grad: 'from-red-400 to-red-600'      },
                      { label: 'Play Reading', emoji: '📖', slug: SUBJECT_GAME_SLUGS['Reading'],  grad: 'from-green-500 to-green-700'  },
                      { label: 'Play Science', emoji: '🔬', slug: SUBJECT_GAME_SLUGS['Science'],  grad: 'from-blue-500 to-blue-700'    },
                    ].map(g => (
                      <motion.button
                        key={g.slug}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => navigate(`/games/${g.slug}`)}
                        className={`flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r ${g.grad} text-white font-black text-sm shadow-md hover:shadow-lg transition-shadow`}
                      >
                        <Play size={13} className="fill-white" />
                        <span>{g.emoji} {g.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div className="flex-1 overflow-y-auto pb-4">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {showTypingIndicator && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-end gap-2 mb-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-100 to-green-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <ArchieCharacter size={32} speaking={true} />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1 items-center h-4">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input bar — sticky at bottom */}
        <div className="sticky bottom-0 z-20 border-t-4 border-white/70 bg-white/95 shadow-2xl backdrop-blur-md">
          {/* Subject quick-prompts (shown when chatting) */}
          {messages.length > 0 && (
            <div className="max-w-2xl mx-auto px-4 pt-2 pb-0">
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {SUBJECT_PROMPTS.map(s => (
                  <button
                    key={s.label}
                    onClick={() => setActiveSubject(activeSubject === s.label ? null : s.label)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap transition-all shrink-0 ${s.color} ${activeSubject === s.label ? 'ring-2 ring-offset-1 ring-current' : ''}`}
                  >
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
              <AnimatePresence>
                {activeSubjectData && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
                      {activeSubjectData.prompts.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => { sendMessage(p); setActiveSubject(null); }}
                          className="text-left px-3 py-2 rounded-xl bg-white border border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 text-xs text-gray-700 font-medium transition-all shadow-sm whitespace-nowrap shrink-0 max-w-[200px] truncate"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="max-w-2xl mx-auto px-4 py-3">
            {isSpeaking && (
              <div className="flex justify-center mb-3">
                <button
                  onClick={stopArchieSpeakingAndResume}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-600 border border-red-200 text-xs font-bold hover:bg-red-200 transition-all shadow-sm"
                >
                  <Square size={12} fill="currentColor" />
                  <span>Stop Archie speaking</span>
                </button>
              </div>
            )}
            {error && (
              <p className="text-xs text-red-500 text-center mb-2">
                {error.includes('HTTP') || error.includes('failed')
                  ? `Oops! ${error} 😊`
                  : "Oops! Something went wrong. Try again! 😊"}
              </p>
            )}
            {conversationMode && (
              <div className="text-center text-xs font-bold text-green-700 mb-2" aria-live="polite">
                {isSpeaking ? 'Archie is speaking…' : isLoading ? 'Archie is thinking…' : isListening ? 'Listening…' : 'Conversation mode on…'}
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`w-12 h-12 rounded-2xl transition-all flex items-center justify-center shadow-md hover:shadow-lg active:scale-95 flex-shrink-0 ${
                  conversationMode ? 'bg-red-500' : 'bg-green-500 hover:bg-green-600'
                } ${isListening ? 'animate-pulse' : ''}`}
                aria-label={conversationMode ? "Stop Archie conversation" : "Talk to Archie"}
                title={conversationMode ? "Stop Archie conversation" : "Talk to Archie"}
              >
                <Mic className="w-5 h-5 text-white" strokeWidth={2.5} />
              </button>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                type="text"
                placeholder={archie_chat.hero.inputPlaceholder}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-yellow-400 focus:outline-none text-sm bg-gray-50 focus:bg-white transition-all disabled:opacity-60 font-medium"
                autoComplete="off"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-12 h-12 rounded-2xl bg-yellow-400 hover:bg-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-md hover:shadow-lg active:scale-95 flex-shrink-0"
                aria-label="Send message"
              >
                <Send className="w-5 h-5 text-white" strokeWidth={2.5} />
              </button>
            </form>
            <p className="text-center text-xs text-gray-400 mt-2">
              {archie_chat.hero.disclaimer}
            </p>
          </div>
        </div>

        {/* History panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <History size={16} className="text-gray-500" />
                  <span className="font-bold text-gray-800 text-sm">Chat history</span>
                </div>
                <button onClick={() => setShowHistory(false)} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">No messages yet</p>
                ) : (
                  [...messages].reverse().map(m => (
                    <div key={m.id} className={`rounded-xl px-3 py-2 text-xs ${m.role === 'user' ? 'bg-yellow-50 border border-yellow-200 text-gray-700' : 'bg-gray-50 border border-gray-200 text-gray-600'}`}>
                      <span className="font-bold text-xs text-gray-400 block mb-0.5">{m.role === 'user' ? 'You' : 'Archie'}</span>
                      <p className="line-clamp-3">{m.content}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={() => { handleReset(); setShowHistory(false); }}
                  className="w-full py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm font-bold hover:bg-red-100 transition-colors"
                >
                  Clear history
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const navigate = useNavigate();
  const isUser = message.role === 'user';
  if (!message.content) return null;

  const { text, buttons } = isUser
    ? { text: message.content, buttons: [] }
    : parseArchieMessage(message.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2 mb-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-100 to-green-100 flex items-center justify-center flex-shrink-0 mb-0.5 overflow-hidden">
          <ArchieCharacter size={32} speaking={false} />
        </div>
      )}

      <div className={`max-w-[78%] flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
        {!isUser && message.source && (
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${message.source === 'local' ? 'bg-green-100 text-green-700 border border-green-200' : message.source === 'limit' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
            {message.source === 'local' ? 'LOCAL / FREE' : message.source === 'limit' ? 'AI LIMIT REACHED' : 'OPENAI'}
          </span>
        )}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-sm font-medium'
              : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
          }`}
        >
          {text}
        </div>

        {/* Play Now buttons — rendered below Archie's bubble */}
        {buttons.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {buttons.map((btn, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/games/${btn.slug}`)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-black text-sm shadow-md hover:shadow-lg transition-shadow border-2 border-yellow-300"
              >
                <Play size={13} className="fill-white" />
                {btn.label}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

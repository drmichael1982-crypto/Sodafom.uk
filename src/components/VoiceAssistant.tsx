/**
 * Voice Assistant — floating mic button.
 * Listens to a question about Sodafom, then reads the answer aloud
 * using the Web Speech API (SpeechRecognition + SpeechSynthesis).
 * Falls back gracefully when the browser doesn't support it.
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2, X, Loader2 } from 'lucide-react';
import { ttsSpeak } from '@/lib/voice-context';

// ── Knowledge base ────────────────────────────────────────────────────────────
const FAQ: Array<{ keywords: string[]; answer: string }> = [
  {
    keywords: ['hello', 'hi', 'hey', 'hiya'],
    answer: "Hello! I'm Soda, your Sodafom helper! Ask me anything about the app.",
  },
  {
    keywords: ['what is sodafom', 'what does sodafom do', 'about sodafom', 'tell me about'],
    answer:
      'Sodafom is a fun learning platform for children aged 5 to 13. It has games for maths, spelling, reading, and stories — all designed to make learning feel like play!',
  },
  {
    keywords: ['how much', 'cost', 'price', 'subscription', 'pay', 'free'],
    answer:
      'Sodafom costs just £2.99 a month, or £19.99 for a whole year. There is also a school plan for just £1 per pupil per year. You can try it free for 7 days!',
  },
  {
    keywords: ['promo', 'code', 'discount', 'voucher'],
    answer:
      'You can enter a promo code on the pricing page. A valid code gives you free access to all games! You can also earn a free month by collecting 1,000 stars in the Star Bank!',
  },
  {
    keywords: ['star', 'stars', 'bank', 'reward', 'rewards'],
    answer:
      'Every time a child plays a game and scores well, they earn stars. Collect 1,000 stars and a free month access code is automatically generated in the Rewards page!',
  },
  {
    keywords: ['game', 'games', 'play', 'activities'],
    answer:
      'Sodafom has over 15 games including Number Pop, Spelling Bee, Word Search, Alphabet Explorer, Times Table Race, Phonics Parrot, and many more!',
  },
  {
    keywords: ['age', 'ages', 'old', 'year', 'years', 'suitable'],
    answer:
      'Sodafom is designed for children aged 5 to 13. Games are grouped by age — from 4 to 6 for the youngest learners, all the way up to 11 to 13 for older children.',
  },
  {
    keywords: ['maths', 'math', 'numbers', 'times table', 'multiplication'],
    answer:
      'For maths, try Number Pop, Times Table Race, Fraction Pizza, Shape Sorter, or Number Sudoku. They cover counting, times tables, fractions, shapes, and logic!',
  },
  {
    keywords: ['spelling', 'spell', 'words', 'letters'],
    answer:
      'For spelling, try Word Wizard, Spelling Bee, Tricky Word Hunt, Word Search, Crossword, or Alphabet Explorer. They cover phonics, vocabulary, and letter patterns!',
  },
  {
    keywords: ['reading', 'read', 'phonics', 'story', 'stories'],
    answer:
      'For reading, try Phonics Parrot, Reading Quest, or Story Builder. They cover phonics, comprehension, and creative storytelling!',
  },
  {
    keywords: ['school', 'teacher', 'class', 'classroom', 'pupils'],
    answer:
      'The School Plan costs £100 a year and covers up to 30 devices. It is perfect for classrooms and includes unique device codes for each pupil.',
  },
  {
    keywords: ['sign up', 'register', 'account', 'join', 'create'],
    answer:
      'You can sign up on the subscribe page. Choose a plan, create your account, and add your children\'s profiles. You get a 7-day free trial to start!',
  },
  {
    keywords: ['contact', 'help', 'support', 'problem', 'issue'],
    answer:
      'You can reach us through the Contact page. We are always happy to help with any questions or problems!',
  },
  {
    keywords: ['dyslexia', 'accessibility', 'contrast', 'font', 'large text'],
    answer:
      'Sodafom has an accessibility toolbar — look for the wheelchair icon at the bottom right of the screen. You can turn on a dyslexia-friendly font, high contrast mode, and larger text!',
  },
];

function getAnswer(question: string): string {
  const q = question.toLowerCase();
  for (const entry of FAQ) {
    if (entry.keywords.some((kw) => q.includes(kw))) {
      return entry.answer;
    }
  }
  return "I'm not sure about that one! Try asking about games, prices, stars, or how to sign up. I'm still learning!";
}

// ── Browser support check ─────────────────────────────────────────────────────
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: ((_e: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

const hasSpeechRecognition =
  typeof window !== 'undefined' &&
  ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

const hasSpeechSynthesis =
  typeof window !== 'undefined' && 'speechSynthesis' in window;

type State = 'idle' | 'listening' | 'thinking' | 'speaking';

export default function VoiceAssistant() {
  const [state, setState] = useState<State>('idle');
  const [open, setOpen] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      if (hasSpeechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (hasSpeechSynthesis) window.speechSynthesis.cancel();
    ttsSpeak(text, () => setState('idle'));
  }, []);

  const stopSpeaking = () => {
    if (hasSpeechSynthesis) window.speechSynthesis.cancel();
    setState('idle');
  };

  const startListening = useCallback(() => {
    if (!hasSpeechRecognition) {
      setError('Voice input is not available on this device.');
      return;
    }
    setError('');
    setTranscript('');
    setAnswer('');

    const SpeechRec = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRec) return;

    const rec = new SpeechRec();
    rec.lang = 'en-GB';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    recognitionRef.current = rec;

    rec.onstart = () => setState('listening');
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const heard = e.results[0][0].transcript;
      setTranscript(heard);
      setState('thinking');
      setTimeout(() => {
        const resp = getAnswer(heard);
        setAnswer(resp);
        speak(resp);
      }, 400);
    };
    rec.onerror = (e: { error: string }) => {
      if (e.error === 'no-speech') {
        setError('No speech detected — please try again.');
      } else if (e.error === 'not-allowed') {
        setError('Microphone access was denied. Please allow it in your settings.');
      } else {
        setError('Something went wrong. Please try again.');
      }
      setState('idle');
    };
    rec.onend = (_e: Event) => {
      if (state === 'listening') setState('idle');
    };

    rec.start();
  }, [speak, state]);

  const stopListening = () => {
    recognitionRef.current?.stop();
    setState('idle');
  };

  const stateConfig = {
    idle: { icon: <Mic size={20} />, label: 'Ask Soda a question', bg: 'bg-card border-2 border-border text-muted-foreground hover:text-primary hover:border-primary' },
    listening: { icon: <MicOff size={20} />, label: 'Listening… tap to stop', bg: 'bg-secondary text-secondary-foreground animate-pulse' },
    thinking: { icon: <Loader2 size={20} className="animate-spin" />, label: 'Thinking…', bg: 'bg-primary text-primary-foreground' },
    speaking: { icon: <Volume2 size={20} />, label: 'Speaking — tap to stop', bg: 'bg-primary text-primary-foreground' },
  };

  const cfg = stateConfig[state as keyof typeof stateConfig];

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            className="bg-card border-2 border-border rounded-2xl shadow-xl p-4 w-72"
            role="dialog"
            aria-label="Voice assistant"
            aria-live="polite"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎙️</span>
                <p className="font-black text-foreground text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                  Ask Soda
                </p>
              </div>
              <button
                onClick={() => { setOpen(false); stopSpeaking(); stopListening(); }}
                className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                aria-label="Close voice assistant"
              >
                <X size={14} />
              </button>
            </div>

            {/* Status */}
            <div className="min-h-[60px] mb-3">
              {state === 'idle' && !transcript && !error && (
                <p className="text-muted-foreground text-xs text-center py-3">
                  Tap the mic and ask me anything about Sodafom!
                </p>
              )}
              {error && (
                <p className="text-secondary text-xs font-bold bg-secondary/10 rounded-xl p-2">{error}</p>
              )}
              {transcript && (
                <div className="mb-2">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">You asked:</p>
                  <p className="text-xs font-bold text-foreground bg-muted rounded-xl px-3 py-2">"{transcript}"</p>
                </div>
              )}
              {answer && (
                <div>
                  <p className="text-xs text-muted-foreground font-semibold mb-1">Soda says:</p>
                  <p className="text-xs text-foreground leading-relaxed bg-primary/5 border border-primary/20 rounded-xl px-3 py-2">{answer}</p>
                </div>
              )}
              {state === 'listening' && (
                <div className="flex items-center justify-center gap-2 py-3">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 rounded-full bg-secondary"
                      animate={{ height: ['8px', '20px', '8px'] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-2">Listening…</span>
                </div>
              )}
            </div>

            {/* Mic button */}
            <motion.button
              onClick={() => {
                if (state === 'idle') startListening();
                else if (state === 'listening') stopListening();
                else if (state === 'speaking') stopSpeaking();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full py-2.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${cfg.bg}`}
              aria-label={cfg.label}
            >
              {cfg.icon}
              <span>{cfg.label}</span>
            </motion.button>

            {!hasSpeechRecognition && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Voice input is not available on this device.
              </p>
            )}

            <p className="text-xs text-muted-foreground mt-2 text-center">
              Ask about games, prices, stars, or how to sign up
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        onClick={() => {
          if (state === 'speaking') { stopSpeaking(); return; }
          setOpen((v) => !v);
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open voice assistant"
        aria-expanded={open}
        className={`w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center transition-colors ${cfg.bg}`}
      >
        {cfg.icon}
      </motion.button>
    </div>
  );
}

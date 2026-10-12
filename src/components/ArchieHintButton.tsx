/**
 * ArchieHintButton — floating help button that appears during games.
 * Calls the /api/chat endpoint with a curriculum-aligned hint prompt.
 * Renders as a small Archie avatar button; expands into a hint bubble.
 * Also reads the current question aloud via speechSynthesis when tapped.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, Volume2 } from 'lucide-react';
import { API_PREFIX } from '@/lib/config';
import { ttsSpeak } from '@/lib/voice-context';
import { ArchieCharacter } from './ArchieCharacter';

interface ArchieHintButtonProps {
  gameTitle: string;
  subject: string;
  currentQuestion?: string;
}

function speakText(text: string): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const go = () => {
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.95;
    utt.pitch = 1.6;
    utt.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const pick =
      voices.find(v => /boy|junior|child.*male|male.*child/i.test(v.name)) ??
      voices.find(v => v.name === 'Google UK English Male') ??
      voices.find(v => v.name === 'Daniel') ??
      voices.find(v => v.name === 'Arthur') ??
      voices.find(v => v.lang === 'en-GB') ??
      voices.find(v => v.lang.startsWith('en-')) ??
      null;
    if (pick) utt.voice = pick;
    window.speechSynthesis.speak(utt);
  };
  if (window.speechSynthesis.getVoices().length > 0) go();
  else { window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.onvoiceschanged = null; go(); }; }
}

export default function ArchieHintButton({ gameTitle, subject, currentQuestion }: ArchieHintButtonProps) {
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const prevQuestion = useRef('');

  // Reset cached hint when question changes
  useEffect(() => {
    if (currentQuestion && currentQuestion !== prevQuestion.current) {
      prevQuestion.current = currentQuestion;
      setHint('');
    }
  }, [currentQuestion]);

  // Stop speech on unmount
  useEffect(() => () => {
    abortRef.current?.abort();
    window.speechSynthesis?.cancel();
  }, []);

  const handleReadQuestion = useCallback(() => {
    if (!currentQuestion) return;
    setSpeaking(true);
    ttsSpeak(`Here is your question: ${currentQuestion}`, () => setSpeaking(false));
  }, [currentQuestion]);

  async function fetchHint() {
    if (hint) { setOpen(true); return; }
    setOpen(true);
    setLoading(true);
    setError('');
    abortRef.current = new AbortController();

    const prompt = currentQuestion
      ? `You are Archie, a friendly and encouraging learning assistant for children aged 5–13. The child is playing "${gameTitle}" (${subject}). The current question is: "${currentQuestion}". Give a short, friendly hint (2–3 sentences max) that helps them think through it without giving the answer away. Use simple language suitable for a child.`
      : `You are Archie, a friendly learning assistant for children aged 5–13. The child is playing "${gameTitle}" (${subject}). Give them a short, encouraging tip (2–3 sentences) about how to do well at this type of game. Use simple, fun language.`;

    try {
      const res = await fetch(`${API_PREFIX}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          stream: false,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error('Could not get hint');
      const data = await res.json() as { message?: string; content?: string; text?: string };
      const hintText = data.message ?? data.content ?? data.text ?? 'Keep trying — you can do it! 🌟';
      setHint(hintText);
      // Auto-read the hint aloud
      ttsSpeak(hintText);
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        setError('Archie is thinking… try again in a moment!');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOpen(false);
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  return (
    <div className="fixed bottom-24 left-4 z-40 flex flex-col items-start gap-2 print:hidden">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' as const }}
            className="w-72 bg-card border-2 border-primary/30 rounded-2xl shadow-xl p-4 origin-bottom-left"
          >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden border border-amber-400">
                      <ArchieCharacter size={32} />
                    </div>
                    <span className="font-black text-foreground text-sm">Archie's hint</span>
                  </div>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close hint"
              >
                <X size={16} />
              </button>
            </div>

            {/* Read question aloud button */}
            {currentQuestion && (
              <button
                onClick={handleReadQuestion}
                disabled={speaking}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold mb-3 transition-all border ${
                  speaking
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-muted border-border text-foreground hover:bg-primary/10 hover:border-primary/30'
                }`}
              >
                <Volume2 size={13} className={speaking ? 'animate-pulse text-primary' : ''} />
                {speaking ? 'Reading question…' : 'Read question aloud'}
              </button>
            )}

            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
                <Loader2 size={16} className="animate-spin" />
                Archie is thinking…
              </div>
            )}

            {error && !loading && (
              <p className="text-secondary text-sm">{error}</p>
            )}

            {hint && !loading && (
              <>
                <p className="text-foreground text-sm leading-relaxed">{hint}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => ttsSpeak(hint)}
                    className="flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
                  >
                    <Volume2 size={12} /> Read hint
                  </button>
                  <button
                    onClick={() => { setHint(''); fetchHint(); }}
                    className="text-xs text-muted-foreground font-bold hover:underline ml-auto"
                  >
                    Another hint
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Archie button */}
      <motion.button
        onClick={fetchHint}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-2xl border-4 border-amber-400 hover:bg-amber-50 transition-colors overflow-hidden"
        aria-label="Ask Archie for a hint"
        title="Ask Archie for a hint"
      >
        <ArchieCharacter size={56} />
      </motion.button>
    </div>
  );
}


/**
 * ArchieHintButton — floating help button that appears during games.
 * Creates local contextual guidance without sending a child question to chat.
 * Renders as a small Archie avatar button; expands into a hint bubble.
 * Also reads the current question aloud via speechSynthesis when tapped.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, Volume2 } from 'lucide-react';
import { askArchie, friendlyArchieError } from '@/lib/archie-routing';
import { ttsSpeak } from '@/lib/voice-context';
import { ArchieCharacter } from './ArchieCharacter';

interface ArchieHintButtonProps {
  gameTitle: string;
  subject: string;
  currentQuestion?: string;
}

export default function ArchieHintButton({ gameTitle, subject, currentQuestion }: ArchieHintButtonProps) {
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const requestInFlightRef = useRef(false);

  // Do not show or speak a stale hint after the question/context changes.
  useEffect(() => {
    abortRef.current?.abort();
    setHint('');
    setError('');
  }, [currentQuestion, gameTitle, subject]);

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

  async function fetchHint(force = false) {
    if (hint && !force) { setOpen(true); return; }
    if (requestInFlightRef.current) return;
    requestInFlightRef.current = true;
    setOpen(true);
    setLoading(true);
    setError('');
    const controller = new AbortController();
    abortRef.current = controller;
    const localHint = currentQuestion
      ? `Let's work it out together. Read this carefully: ${currentQuestion}. Look at each choice, rule out the ones that cannot be right, then choose your best answer.`
      : `You are playing ${gameTitle}. Read the instructions carefully, take your time, and try one step at a time. I'm right here if you need me.`;

    try {
      const reply = await askArchie({
        messages: [{ role: 'user', content: 'Can I have a hint?' }],
        localHint,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setHint(reply.text);
      ttsSpeak(reply.text);
    } catch (error) {
      if (!controller.signal.aborted) setError(friendlyArchieError(error));
    } finally {
      requestInFlightRef.current = false;
      if (abortRef.current === controller) abortRef.current = null;
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
                    onClick={() => { setHint(''); void fetchHint(true); }}
                    className="text-xs text-muted-foreground font-bold hover:underline ml-auto"
                  >
                    Show hint again
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Archie button */}
      <motion.button
        onClick={() => void fetchHint()}
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

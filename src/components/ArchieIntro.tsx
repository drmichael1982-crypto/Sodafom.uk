/**
 * ArchieIntro — first-visit animated pop-up where Archie waves and speaks a welcome.
 * Shown once per browser session (sessionStorage flag).
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Volume2 } from 'lucide-react';
import { ArchieCharacter } from './ArchieCharacter';

const INTRO_SPEECH =
  "Hi! I'm Archie, your learning buddy! Welcome to Sodafom — " +
  "the most fun way to learn maths, spelling, and reading! " +
  "Tap any game to get started, and earn stars as you play. Let's go!";

const INTRO_BUBBLE =
  "Hi! I'm Archie! 👋 Welcome to Sodafom — the most fun way to learn!";

function speakIntro(volume: number, onEnd: () => void) {
  if (!('speechSynthesis' in window)) { onEnd(); return; }
  window.speechSynthesis.cancel();
  const trySpeak = () => {
    const utt = new SpeechSynthesisUtterance(INTRO_SPEECH);
    utt.rate = 1.2;
    utt.pitch = 1.75;
    utt.volume = volume;
    utt.onend = onEnd;
    const voices = window.speechSynthesis.getVoices();
    const pick =
      voices.find(v => /boy|junior|child.*male|male.*child/i.test(v.name)) ??
      voices.find(v => v.name === 'Google UK English Male') ??
      voices.find(v => v.name === 'Daniel') ??
      voices.find(v => v.lang === 'en-GB') ??
      voices.find(v => v.lang.startsWith('en')) ?? null;
    if (pick) utt.voice = pick;
    window.speechSynthesis.speak(utt);
  };
  if (window.speechSynthesis.getVoices().length > 0) trySpeak();
  else { window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.onvoiceschanged = null; trySpeak(); }; }
}

export default function ArchieIntro() {
  const [visible, setVisible] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem('archie_intro_seen');
    if (!seen) {
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const handleSpeak = useCallback(() => {
    if (speaking) { window.speechSynthesis?.cancel(); setSpeaking(false); return; }
    setSpeaking(true);
    speakIntro(0.6, () => setSpeaking(false));
  }, [speaking]);

  const handleClose = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setVisible(false);
    sessionStorage.setItem('archie_intro_seen', '1');
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Pop-up card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 60 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[min(92vw,360px)]"
          >
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-accent/40 overflow-hidden">
              {/* Header bar */}
              <div className="bg-gradient-to-r from-primary to-primary/80 px-4 py-2 flex items-center justify-between">
                <span className="text-white font-black text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                  Meet Archie! 👋
                </span>
                <button
                  onClick={handleClose}
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 py-4 flex items-end gap-4">
                {/* Archie waving */}
                <motion.button
                  onClick={handleSpeak}
                  animate={speaking
                    ? { y: [0, -12, 0, -7, 0], rotate: [0, -5, 5, -3, 0] }
                    : { y: [0, -6, 0], rotate: [0, 3, -3, 0] }
                  }
                  transition={speaking
                    ? { duration: 0.4, repeat: 4, ease: 'easeInOut' as const }
                    : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' as const }
                  }
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  className="relative shrink-0 focus:outline-none"
                  aria-label="Tap Archie to hear a welcome"
                >
                  <ArchieCharacter size={100} speaking={speaking} className="drop-shadow-xl" />
                  {/* Gold glow */}
                  <div className="absolute -inset-3 rounded-full blur-xl opacity-30 bg-accent -z-10" />
                  {speaking && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute -top-1 -right-1 w-7 h-7 bg-accent rounded-full flex items-center justify-center shadow border-2 border-white"
                    >
                      <Volume2 size={13} className="text-accent-foreground" />
                    </motion.div>
                  )}
                </motion.button>

                {/* Speech bubble */}
                <div className="flex-1 min-w-0">
                  <div className="bg-primary/8 border border-primary/20 rounded-2xl rounded-bl-sm px-3 py-2.5 mb-3">
                    <p className="text-foreground font-bold text-sm leading-snug">
                      {speaking ? INTRO_SPEECH.slice(0, 60) + '…' : INTRO_BUBBLE}
                    </p>
                    <p className="text-primary/60 text-xs mt-1">
                      {speaking ? 'Tap me to stop 🔊' : 'Tap me to hear my welcome! 🔊'}
                    </p>
                  </div>

                  <button
                    onClick={handleClose}
                    className="w-full bg-accent text-accent-foreground font-black text-sm py-2.5 rounded-2xl hover:scale-105 active:scale-95 transition-transform shadow"
                  >
                    Let's Play! 🎮
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

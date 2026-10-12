/**
 * ArchieDailyTip — Archie shows a fun learning tip on the hub dashboard.
 * Tip rotates daily (based on day-of-year index).
 */
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Volume2, RefreshCw } from 'lucide-react';
import { ArchieCharacter } from './ArchieCharacter';

const TIPS = [
  { tip: "Did you know? Reading for just 10 minutes a day can boost your vocabulary by over 1,000 words a year! 📚", subject: "Reading" },
  { tip: "Maths tip: When adding big numbers, try rounding them first, then adjust. It's much faster! ➕", subject: "Maths" },
  { tip: "Spelling trick: Break long words into smaller chunks. 'Because' = Be + cause. Easy! ✏️", subject: "Spelling" },
  { tip: "Science fact: Bees can recognise human faces! They use the same technique humans do. 🐝", subject: "Science" },
  { tip: "Memory trick: To remember your times tables, try singing them to your favourite tune! 🎵", subject: "Maths" },
  { tip: "Reading tip: After reading a page, close the book and try to recall 3 things you just read. 🧠", subject: "Reading" },
  { tip: "Spelling tip: 'I before E except after C' — like 'believe' and 'receive'. 🔤", subject: "Spelling" },
  { tip: "Maths fact: Zero is the only number that can't be represented in Roman numerals! 🔢", subject: "Maths" },
  { tip: "Geography fact: The UK has over 6,000 islands! How many can you name? 🗺️", subject: "Geography" },
  { tip: "Reading tip: Try reading out loud — it helps your brain remember information better! 📖", subject: "Reading" },
  { tip: "Maths tip: Multiplying by 9? Use your fingers! Hold up 10 fingers, fold down the one for your number. 🖐️", subject: "Maths" },
  { tip: "Spelling tip: Tricky words like 'Wednesday' are easier if you say them how they're spelled: Wed-nes-day! 🗓️", subject: "Spelling" },
  { tip: "Science tip: Plants grow towards light — this is called phototropism. Try it with a plant near a window! 🌱", subject: "Science" },
  { tip: "Maths trick: To multiply by 11, add the two digits and put the sum in the middle! E.g. 11×23 = 253. ✨", subject: "Maths" },
  { tip: "Reading tip: Asking 'what happens next?' while reading keeps your brain active and improves comprehension! 🤔", subject: "Reading" },
];

function speakTip(text: string, onEnd: () => void) {
  if (!('speechSynthesis' in window)) { onEnd(); return; }
  window.speechSynthesis.cancel();
  const trySpeak = () => {
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 1.15;
    utt.pitch = 1.6;
    utt.volume = 0.7;
    utt.onend = onEnd;
    const voices = window.speechSynthesis.getVoices();
    const pick =
      voices.find(v => /boy|junior|child.*male/i.test(v.name)) ??
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

export default function ArchieDailyTip() {
  const dayIndex = Math.floor(Date.now() / 86400000) % TIPS.length;
  const [tipIndex, setTipIndex] = useState(dayIndex);
  const [speaking, setSpeaking] = useState(false);
  const current = TIPS[tipIndex];

  const handleSpeak = useCallback(() => {
    if (speaking) { window.speechSynthesis?.cancel(); setSpeaking(false); return; }
    setSpeaking(true);
    speakTip(`Archie's tip! ${current.tip}`, () => setSpeaking(false));
  }, [speaking, current.tip]);

  const handleNext = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setTipIndex(i => (i + 1) % TIPS.length);
  }, []);

  return (
    <div className="bg-gradient-to-br from-accent/10 to-primary/5 border-2 border-accent/30 rounded-3xl p-4 flex items-start gap-3">
      {/* Archie */}
      <motion.button
        onClick={handleSpeak}
        animate={speaking
          ? { y: [0, -8, 0, -5, 0] }
          : { y: [0, -4, 0] }
        }
        transition={speaking
          ? { duration: 0.4, repeat: 4, ease: 'easeInOut' as const }
          : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }
        }
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="relative shrink-0 focus:outline-none"
        aria-label="Tap Archie to hear the tip"
      >
        <ArchieCharacter size={64} speaking={speaking} className="drop-shadow-md" />
        {speaking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center shadow border border-white"
          >
            <Volume2 size={10} className="text-accent-foreground" />
          </motion.div>
        )}
      </motion.button>

      {/* Tip content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-black text-primary uppercase tracking-wide">Archie's Daily Tip</span>
          <span className="text-xs bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full font-bold">{current.subject}</span>
        </div>
        <p className="text-foreground text-sm font-semibold leading-snug">{current.tip}</p>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={handleSpeak}
            className="flex items-center gap-1 text-xs text-primary font-bold hover:text-primary/70 transition-colors"
          >
            <Volume2 size={12} />
            {speaking ? 'Stop' : 'Read aloud'}
          </button>
          <span className="text-muted-foreground/40">·</span>
          <button
            onClick={handleNext}
            className="flex items-center gap-1 text-xs text-muted-foreground font-bold hover:text-foreground transition-colors"
          >
            <RefreshCw size={11} />
            Next tip
          </button>
        </div>
      </div>
    </div>
  );
}

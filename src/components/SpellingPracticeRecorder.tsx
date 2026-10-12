/**
 * SpellingPracticeRecorder — lets a child record themselves spelling words aloud.
 * Shows a word, the child records their attempt, then plays it back.
 * Saves recordings to localStorage keyed by child ID + word.
 * Used in the Voice Studio page as a standalone spelling practice mode.
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Square, Play, RotateCcw, ChevronLeft, ChevronRight, CheckCircle2, Volume2 } from 'lucide-react';

// KS1 / KS2 word lists by age group
const WORD_LISTS: Record<string, { label: string; words: string[] }> = {
  '5-7': {
    label: 'Ages 5–7 (KS1)',
    words: ['cat', 'dog', 'run', 'jump', 'play', 'big', 'red', 'sun', 'hat', 'bed',
            'fish', 'ship', 'chip', 'thin', 'when', 'that', 'with', 'then', 'them', 'they'],
  },
  '8-10': {
    label: 'Ages 8–10 (KS2)',
    words: ['because', 'different', 'enough', 'friend', 'guard', 'heard', 'island',
            'knowledge', 'length', 'minute', 'natural', 'often', 'perhaps', 'popular',
            'position', 'possible', 'potatoes', 'pressure', 'probably', 'promise'],
  },
  '11-13': {
    label: 'Ages 11–13 (KS2+)',
    words: ['accommodate', 'aggressive', 'amateur', 'apparent', 'appreciate', 'attached',
            'available', 'average', 'awkward', 'bargain', 'bruise', 'category', 'cemetery',
            'committee', 'communicate', 'community', 'competition', 'conscience', 'conscious', 'controversy'],
  },
};

type RecordingState = 'idle' | 'recording' | 'recorded' | 'playing';

interface SpellingPracticeRecorderProps {
  childId?: number;
}

function storageKey(childId: number | undefined, word: string) {
  return `sodafom_spelling_${childId ?? 'guest'}_${word}`;
}

export default function SpellingPracticeRecorder({ childId }: SpellingPracticeRecorderProps) {
  const [ageGroup, setAgeGroup] = useState<keyof typeof WORD_LISTS>('5-7');
  const [wordIdx, setWordIdx] = useState(0);
  const [state, setState] = useState<RecordingState>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [completedWords, setCompletedWords] = useState<Set<string>>(new Set());
  const [showWord, setShowWord] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const list = WORD_LISTS[ageGroup];
  const word = list.words[wordIdx];

  // Load saved recording for this word
  useEffect(() => {
    const saved = localStorage.getItem(storageKey(childId, `${ageGroup}_${word}`));
    if (saved) {
      setAudioUrl(saved);
      setState('recorded');
    } else {
      setAudioUrl(null);
      setState('idle');
    }
  }, [word, ageGroup, childId]);

  // Load completed words
  useEffect(() => {
    const done = new Set<string>();
    list.words.forEach(w => {
      if (localStorage.getItem(storageKey(childId, `${ageGroup}_${w}`))) done.add(w);
    });
    setCompletedWords(done);
  }, [ageGroup, childId, list.words]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          localStorage.setItem(storageKey(childId, `${ageGroup}_${word}`), dataUrl);
          setAudioUrl(dataUrl);
          setState('recorded');
          setCompletedWords(prev => new Set([...prev, word]));
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      setState('recording');
    } catch {
      alert('Microphone access is needed to record. Please allow it in your settings.');
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
  }

  function playRecording() {
    if (!audioUrl) return;
    setState('playing');
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.onended = () => setState('recorded');
    audio.onerror = () => setState('recorded');
    void audio.play();
  }

  function deleteRecording() {
    localStorage.removeItem(storageKey(childId, `${ageGroup}_${word}`));
    setAudioUrl(null);
    setState('idle');
    setCompletedWords(prev => { const s = new Set(prev); s.delete(word); return s; });
  }

  function speakWord() {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.rate = 0.8;
    u.pitch = 1.0;
    window.speechSynthesis.speak(u);
  }

  const progress = Math.round((completedWords.size / list.words.length) * 100);

  return (
    <div className="space-y-6">
      {/* Age group selector */}
      <div>
        <p className="text-sm font-bold text-muted-foreground mb-2">Choose word list</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Age group">
          {Object.entries(WORD_LISTS).map(([key, val]) => (
            <button
              key={key}
              onClick={() => { setAgeGroup(key as keyof typeof WORD_LISTS); setWordIdx(0); }}
              className={`px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all ${
                ageGroup === key
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-foreground hover:border-primary/40'
              }`}
            >
              {val.label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-bold text-foreground">{completedWords.size} / {list.words.length} words recorded</span>
          <span className="text-sm font-black text-primary">{progress}%</span>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' as const }}
          />
        </div>
      </div>

      {/* Word card */}
      <div className="bg-card border-2 border-border rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden">
        {/* Word number */}
        <p className="text-xs font-bold text-muted-foreground mb-4">
          Word {wordIdx + 1} of {list.words.length}
        </p>

        {/* The word (can be hidden for extra challenge) */}
        <div className="mb-6">
          <AnimatePresence mode="wait">
            {showWord ? (
              <motion.div
                key="word"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className="text-5xl sm:text-6xl font-black text-foreground tracking-wide mb-2"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {word}
                </div>
                {completedWords.has(word) && (
                  <div className="flex items-center justify-center gap-1.5 text-primary text-sm font-bold">
                    <CheckCircle2 size={16} />
                    Recorded!
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-5xl sm:text-6xl font-black text-muted/30 tracking-widest"
              >
                {'_ '.repeat(word.length).trim()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-center gap-3 mb-4">
          {/* Hear the word */}
          <button
            onClick={speakWord}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground font-bold text-sm transition-colors"
            title="Hear the word"
          >
            <Volume2 size={16} /> Hear it
          </button>

          {/* Hide/show word */}
          <button
            onClick={() => setShowWord(s => !s)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground font-bold text-sm transition-colors"
          >
            {showWord ? '🙈 Hide word' : '👁️ Show word'}
          </button>
        </div>

        {/* Record / play controls */}
        <div className="flex items-center justify-center gap-3">
          {state === 'idle' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startRecording}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-secondary text-white font-black shadow-lg hover:opacity-90 transition-opacity"
            >
              <Mic size={18} /> Record spelling
            </motion.button>
          )}

          {state === 'recording' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopRecording}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-secondary text-white font-black shadow-lg"
            >
              <Square size={18} /> Stop recording
            </motion.button>
          )}

          {(state === 'recorded' || state === 'playing') && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={playRecording}
                disabled={state === 'playing'}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground font-black shadow-md disabled:opacity-60 transition-opacity"
              >
                <Play size={16} /> {state === 'playing' ? 'Playing…' : 'Play back'}
              </motion.button>
              <button
                onClick={deleteRecording}
                className="flex items-center gap-1.5 px-4 py-3 rounded-full border-2 border-border text-muted-foreground font-bold text-sm hover:border-destructive hover:text-destructive transition-colors"
                title="Re-record"
              >
                <RotateCcw size={15} /> Re-record
              </button>
            </>
          )}
        </div>
      </div>

      {/* Word navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWordIdx(i => Math.max(0, i - 1))}
          disabled={wordIdx === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-border font-bold text-sm disabled:opacity-40 hover:border-primary/40 transition-colors"
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {/* Word dots */}
        <div className="flex gap-1.5 flex-wrap justify-center max-w-xs">
          {list.words.map((w, i) => (
            <button
              key={w}
              onClick={() => setWordIdx(i)}
              title={w}
              className={`w-3 h-3 rounded-full transition-all ${
                i === wordIdx
                  ? 'bg-primary scale-125'
                  : completedWords.has(w)
                  ? 'bg-primary/40'
                  : 'bg-muted'
              }`}
              aria-label={`Word ${i + 1}: ${w}`}
            />
          ))}
        </div>

        <button
          onClick={() => setWordIdx(i => Math.min(list.words.length - 1, i + 1))}
          disabled={wordIdx === list.words.length - 1}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-border font-bold text-sm disabled:opacity-40 hover:border-primary/40 transition-colors"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>

      {/* Completion celebration */}
      {completedWords.size === list.words.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-6 rounded-2xl bg-primary/5 border-2 border-primary/30"
        >
          <div className="text-4xl mb-2">🎉</div>
          <p className="font-black text-foreground text-lg" style={{ fontFamily: 'var(--font-heading)' }}>
            All {list.words.length} words recorded!
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            Amazing work! Try the next age group or play a spelling game to test yourself.
          </p>
        </motion.div>
      )}
    </div>
  );
}

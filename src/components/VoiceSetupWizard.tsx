/**
 * VoiceSetupWizard — friendly step-by-step onboarding to record
 * the child's voice for all the key clips used across the app.
 *
 * Shown as a modal/sheet triggered from the hub or profile page.
 * Can be dismissed at any step — partial recordings are saved.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Sparkles, Mic } from 'lucide-react';
import VoiceRecorder from '@/components/VoiceRecorder';
import { useVoice } from '@/lib/voice-context';

// ── Clip definitions ─────────────────────────────────────────────────────────
export const VOICE_CLIPS = [
  {
    key: 'welcome',
    label: 'Welcome greeting',
    prompt: 'Welcome to Sodafom! Let\'s learn and play!',
    emoji: '👋',
    description: 'Played when you open the app',
  },
  {
    key: 'well-done',
    label: 'Well done!',
    prompt: 'Well done! That\'s amazing!',
    emoji: '🌟',
    description: 'Played after a correct answer',
  },
  {
    key: 'try-again',
    label: 'Try again',
    prompt: 'Good try! Let\'s try again!',
    emoji: '💪',
    description: 'Played after a wrong answer',
  },
  {
    key: 'game-intro',
    label: 'Game intro',
    prompt: 'Time to play! Let\'s go!',
    emoji: '🎮',
    description: 'Played when a game starts',
  },
  {
    key: 'instructions',
    label: 'Instructions',
    prompt: 'Listen carefully to the instructions!',
    emoji: '📖',
    description: 'Played before game instructions',
  },
  {
    key: 'finished',
    label: 'Game finished',
    prompt: 'You finished! Great job!',
    emoji: '🏆',
    description: 'Played when a game ends',
  },
];

interface Props {
  onClose: () => void;
  childName?: string;
}

export default function VoiceSetupWizard({ onClose, childName = 'you' }: Props) {
  const { clips } = useVoice();
  const [step, setStep] = useState(0); // 0 = intro, 1–N = clips, N+1 = done

  const totalSteps = VOICE_CLIPS.length;
  const isIntro = step === 0;
  const isDone = step > totalSteps;
  const clipIndex = step - 1;
  const currentClip = VOICE_CLIPS.at(clipIndex);
  const recordedCount = VOICE_CLIPS.filter((c) => Object.hasOwn(clips, c.key) && clips[c.key as keyof typeof clips]).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-card border-2 border-border rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎙️</span>
            <div>
              <p className="font-black text-foreground text-sm" style={{ fontFamily: 'var(--font-heading)' }}>
                Your Voice Studio
              </p>
              {!isIntro && !isDone && (
                <p className="text-muted-foreground text-xs">
                  Step {step} of {totalSteps}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground"
            aria-label="Close voice setup"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress bar */}
        {!isIntro && !isDone && (
          <div className="h-1.5 bg-muted">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* ── Intro ── */}
            {isIntro && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center space-y-4"
              >
                <div className="text-6xl">🎤</div>
                <h2 className="text-2xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                  Record your voice, {childName}!
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  You can record <strong className="text-foreground">your own voice</strong> to use in the app!
                  When games read things out, it'll be <em>you</em> doing the talking. 🎉
                </p>
                <div className="bg-muted rounded-2xl p-4 text-left space-y-2">
                  {VOICE_CLIPS.map((c) => (
                    <div key={c.key} className="flex items-center gap-2 text-sm">
                      <span>{c.emoji}</span>
                      <span className="text-foreground font-bold">{c.label}</span>
                      <span className="text-muted-foreground text-xs">— {c.description}</span>
                      {clips[c.key] && (
                        <span className="ml-auto text-xs text-primary font-bold">✓ Done</span>
                      )}
                    </div>
                  ))}
                </div>
                {recordedCount > 0 && (
                  <p className="text-primary text-xs font-bold">
                    ✨ You've already recorded {recordedCount} of {totalSteps} clips!
                  </p>
                )}
                <button
                  onClick={() => setStep(1)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-black text-base hover:opacity-90 transition-opacity"
                >
                  <Mic size={18} />
                  Let's record!
                </button>
                <button
                  onClick={onClose}
                  className="w-full text-muted-foreground text-sm hover:text-foreground transition-colors"
                >
                  Maybe later
                </button>
              </motion.div>
            )}

            {/* ── Recording step ── */}
            {!isIntro && !isDone && currentClip && (
              <motion.div
                key={`step-${step}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <div className="text-5xl mb-2">{currentClip.emoji}</div>
                  <p className="text-muted-foreground text-xs">{currentClip.description}</p>
                </div>

                <VoiceRecorder
                  clipKey={currentClip.key}
                  label={currentClip.label}
                  prompt={currentClip.prompt}
                />

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-border text-foreground font-bold text-sm hover:bg-muted transition-colors"
                  >
                    <ChevronLeft size={14} /> Back
                  </button>
                  <button
                    onClick={() => setStep((s) => s + 1)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity"
                  >
                    {step < totalSteps ? (
                      <>Next <ChevronRight size={14} /></>
                    ) : (
                      <>Finish <Sparkles size={14} /></>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Done ── */}
            {isDone && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
              >
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.6 }}
                  className="text-6xl"
                >
                  🎉
                </motion.div>
                <h2 className="text-2xl font-black text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                  Amazing, {childName}!
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Your voice is now saved! Every time the app reads something out,
                  it'll use <strong className="text-foreground">your voice</strong>. How cool is that? 🌟
                </p>
                <div className="flex gap-2 justify-center text-2xl">
                  {VOICE_CLIPS.map((c) => (
                    <span key={c.key} title={c.label}>{c.emoji}</span>
                  ))}
                </div>
                <button
                  onClick={onClose}
                  className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-black text-base hover:opacity-90 transition-opacity"
                >
                  Let's play! 🚀
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

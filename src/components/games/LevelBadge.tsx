/**
 * LevelBadge — shows the current adaptive difficulty level (1–5) inside a game.
 * Also shows a "Level up!" or "Level down" toast when the level changes after a round.
 */
import { motion, AnimatePresence } from 'motion/react';

const LEVEL_LABELS = ['', 'Starter', 'Easy', 'Medium', 'Hard', 'Expert'] as const;
const LEVEL_COLORS = [
  '',
  'bg-green-100 text-green-800 border-green-300',
  'bg-blue-100 text-blue-800 border-blue-300',
  'bg-yellow-100 text-yellow-800 border-yellow-300',
  'bg-orange-100 text-orange-800 border-orange-300',
  'bg-red-100 text-red-800 border-red-300',
] as const;

interface LevelBadgeProps {
  level: number;
  showToast?: 'up' | 'down' | null;
  onToastDone?: () => void;
}

export default function LevelBadge({ level, showToast, onToastDone }: LevelBadgeProps) {
  const safeLevel = Math.max(1, Math.min(5, level));
  return (
    <div className="relative inline-flex flex-col items-center">
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-black ${LEVEL_COLORS[safeLevel]}`}>
        {'★'.repeat(safeLevel)}{'☆'.repeat(5 - safeLevel)} Level {safeLevel} — {LEVEL_LABELS[safeLevel]}
      </span>

      <AnimatePresence onExitComplete={onToastDone}>
        {showToast && (
          <motion.div
            key={showToast}
            initial={{ opacity: 0, y: -8, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            onAnimationComplete={() => setTimeout(() => onToastDone?.(), 1800)}
            className={`absolute top-full mt-1 whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-black shadow-lg z-50 ${
              showToast === 'up'
                ? 'bg-green-500 text-white'
                : 'bg-orange-400 text-white'
            }`}
          >
            {showToast === 'up' ? '🚀 Level up! Keep going!' : '📉 Dropped a level — you can do it!'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { motion } from 'motion/react';
import { ArchieCharacter } from '../ArchieCharacter';
import { useVoice } from '@/lib/voice-context';

interface ArchieReadAloudButtonProps {
  question: string;
  options?: string[];
  className?: string;
}

/**
 * ArchieReadAloudButton
 * A reusable round Archie control for quiz/game questions.
 * Uses the existing local/browser text-to-speech system, so ordinary
 * read-aloud does not require a paid AI request.
 */
export default function ArchieReadAloudButton({
  question,
  options = [],
  className = '',
}: ArchieReadAloudButtonProps) {
  const { speak, playing } = useVoice();

  const handleSpeak = () => {
    const optionText = options.length
      ? ` Your answer choices are: ${options.map((option, i) => `${i + 1}, ${option}`).join('. ')}.`
      : '';
    const text = `${question}.${optionText}`;
    speak(`archie-question:${question}`, text);
  };

  return (
    <motion.button
      type="button"
      onClick={handleSpeak}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      aria-label="Ask Archie to read this question and the answer choices"
      title="Tap Archie to hear the question and answers"
      className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-amber-400 bg-white shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 ${playing ? 'animate-pulse' : ''} ${className}`}
    >
      <ArchieCharacter size={64} speaking={playing} className="pointer-events-none" />
      <span className="sr-only">Read with Archie</span>
    </motion.button>
  );
}

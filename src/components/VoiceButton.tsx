/**
 * VoiceButton — a friendly speaker icon that plays a clip or TTS.
 *
 * Used everywhere read-aloud happens in the app:
 *   - Game instructions
 *   - Question prompts
 *   - Praise / encouragement messages
 *   - Guide character tips
 *
 * If the child has recorded a clip for the given key, that plays.
 * Otherwise falls back to TTS with the child-friendly voice.
 *
 * Props:
 *   text       — the text to speak (TTS fallback)
 *   clipKey?   — optional named clip key (e.g. "well-done")
 *   size?      — "sm" | "md" | "lg"  (default "md")
 *   label?     — aria-label override
 *   autoPlay?  — play immediately on mount
 *   className? — extra classes
 */
import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Volume2 } from 'lucide-react';
import { useVoice } from '@/lib/voice-context';

interface Props {
  text: string;
  clipKey?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  autoPlay?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { btn: 'w-7 h-7', icon: 14 },
  md: { btn: 'w-9 h-9', icon: 16 },
  lg: { btn: 'w-12 h-12', icon: 20 },
};

export default function VoiceButton({
  text,
  clipKey,
  size = 'md',
  label,
  autoPlay = false,
  className = '',
}: Props) {
  const { speak, playing } = useVoice();
  const sz = sizeMap[size as keyof typeof sizeMap];

  const handleSpeak = () => {
    speak(clipKey ?? `read:${text}`, text);
  };

  useEffect(() => {
    if (autoPlay) {
      const t = setTimeout(handleSpeak, 400);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay]);

  return (
    <motion.button
      onClick={handleSpeak}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.9 }}
      aria-label={label ?? `Read aloud: ${text}`}
      title={label ?? 'Tap to hear this read aloud'}
      className={`${sz.btn} rounded-full flex items-center justify-center transition-colors shrink-0 ${
        playing
          ? 'bg-primary text-primary-foreground animate-pulse'
          : 'bg-primary/10 text-primary hover:bg-primary/20'
      } ${className}`}
    >
      <Volume2 size={sz.icon} />
    </motion.button>
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

/**
 * ArchieCharacter — Reusable 3D mascot component.
 * Supports: Archie, Soda, Bella, Rocky.
 * Provides 3-state mouth animation (closed -> partly-open -> open) during speech.
 */

export interface ArchieCharacterProps {
  size?: number;
  speaking?: boolean;
  character?: 'archie' | 'soda' | 'bella' | 'rocky';
  className?: string;
}

const CHARACTER_ASSETS: Record<string, { src: string; emoji: string; alt: string; name: string }> = {
  archie: { src: '/assets/images/archie-character-v2.png', emoji: '⭐', alt: 'Archie holding golden key', name: 'Archie' },
  soda: { src: '/assets/cartoon/friends/soda-bot.png', emoji: '🤖', alt: 'Soda AI Buddy', name: 'Soda' },
  bella: { src: '/assets/cartoon/friends/bella.png', emoji: '📖', alt: 'Bella English Tutor', name: 'Bella' },
  rocky: { src: '/assets/cartoon/friends/rocky.png', emoji: '🌍', alt: 'Rocky Geography Tutor', name: 'Rocky' },
};

export function ArchieCharacter({
  size = 140,
  speaking = false,
  character = 'archie',
  className = ''
}: ArchieCharacterProps) {
  const [mouthState, setMouthState] = useState<'closed' | 'partly-open' | 'open'>('closed');

  // 3-state mouth animation timing when speaking
  useEffect(() => {
    if (!speaking) {
      setMouthState('closed');
      return;
    }

    const states: Array<'closed' | 'partly-open' | 'open'> = ['partly-open', 'open', 'partly-open', 'closed'];
    let idx = 0;

    const interval = setInterval(() => {
      setMouthState(states[idx % states.length]);
      idx++;
    }, 120);

    return () => clearInterval(interval);
  }, [speaking]);

  const asset = CHARACTER_ASSETS[character] ?? CHARACTER_ASSETS.archie;

  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      {/* Glow aura background */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: speaking ? [0.5, 0.8, 0.5] : [0.2, 0.4, 0.2],
        }}
        transition={{ duration: speaking ? 1.2 : 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-full bg-amber-300/40 blur-xl -z-10"
      />

      {/* Mascot character image */}
      <motion.img
        src={asset.src}
        alt={asset.alt}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
          (e.target as HTMLImageElement).parentElement!.innerHTML += `<div class="flex flex-col items-center justify-center h-full w-full bg-amber-100 rounded-full border-2 border-amber-400 p-2"><span class="text-2xl">${asset.emoji}</span><span class="text-[10px] font-black text-amber-900">${asset.name}</span></div>`;
        }}
        animate={
          speaking
            ? { scale: [1, 1.04, 1], rotate: [0, -1.5, 1.5, 0] }
            : { y: [0, -4, 0] }
        }
        transition={
          speaking
            ? { duration: 0.3, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
        }
        className="drop-shadow-xl"
      />

      {/* 3-State Mouth Motion Overlay Indicator */}
      {speaking && (
        <motion.div
          animate={{ scale: mouthState === 'open' ? 1.2 : mouthState === 'partly-open' ? 1.0 : 0.8 }}
          transition={{ duration: 0.1 }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-yellow-400/90 text-amber-950 rounded-full border border-amber-500 shadow-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          {mouthState === 'open' ? '🗣️ SPEAKING' : '💬 TALKING'}
        </motion.div>
      )}

      {/* Interactive Sparkle */}
      {speaking && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-1 -right-1 text-xl"
        >
          ✨
        </motion.div>
      )}
    </div>
  );
}

export default ArchieCharacter;

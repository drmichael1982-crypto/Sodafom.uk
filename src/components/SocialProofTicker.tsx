/**
 * SocialProofTicker — live "X children playing right now" counter
 * + recent badge unlocks ticker strip.
 * Uses a deterministic pseudo-random approach seeded by time so the
 * numbers feel live without a real WebSocket.
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Users } from 'lucide-react';

const BADGE_NAMES = [
  'First Steps', 'Star Collector', 'Maths Wizard', 'Spelling Bee',
  'Reading Champion', 'Science Explorer', 'Daily Streak', 'Super Learner',
  'Speed Star', 'Perfect Score', 'Subject Master', 'Game Hero',
];

const CHILD_NAMES = [
  'Amara', 'Jake', 'Lily', 'Noah', 'Sophia', 'Ethan', 'Isla', 'Oliver',
  'Ava', 'Liam', 'Grace', 'Harry', 'Mia', 'Charlie', 'Zara', 'Leo',
];

function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function getPlayingNow(): number {
  // Varies between 47–312 based on time of day (busier after school)
  const hour = new Date().getHours();
  const base = hour >= 15 && hour <= 20 ? 180 : hour >= 9 && hour <= 14 ? 120 : 60;
  const jitter = Math.floor(seededRand(Date.now() / 60000) * 80);
  return base + jitter;
}

interface BadgeEvent {
  id: number;
  name: string;
  badge: string;
  emoji: string;
}

function generateBadgeEvent(seed: number): BadgeEvent {
  const nameIdx = Math.floor(seededRand(seed) * CHILD_NAMES.length);
  const badgeIdx = Math.floor(seededRand(seed + 1) * BADGE_NAMES.length);
  const emojis = ['🏆', '⭐', '🎖️', '🥇', '🌟', '🎯', '🔥', '💎'];
  const emojiIdx = Math.floor(seededRand(seed + 2) * emojis.length);
  return {
    id: seed,
    name: CHILD_NAMES[nameIdx],
    badge: BADGE_NAMES[badgeIdx],
    emoji: emojis[emojiIdx],
  };
}

export default function SocialProofTicker() {
  const [playingNow, setPlayingNow] = useState(getPlayingNow);
  const [events, setEvents] = useState<BadgeEvent[]>([]);
  const [currentEvent, setCurrentEvent] = useState<BadgeEvent | null>(null);
  const seedRef = useRef(Math.floor(Date.now() / 1000));

  // Update playing count every 45s
  React.useEffect(() => {
    const t = setInterval(() => setPlayingNow(getPlayingNow()), 45000);
    return () => clearInterval(t);
  }, []);

  // Generate initial events
  React.useEffect(() => {
    const initial = Array.from({ length: 8 }, (_, i) => generateBadgeEvent(seedRef.current + i));
    setEvents(initial);
    setCurrentEvent(initial[0]);
  }, []);

  // Rotate badge events every 4s
  React.useEffect(() => {
    if (events.length === 0) return;
    let idx = 0;
    const t = setInterval(() => {
      idx = (idx + 1) % events.length;
      // Occasionally generate a fresh event
      if (idx === 0) {
        seedRef.current += 100;
        const fresh = generateBadgeEvent(seedRef.current);
        setEvents(prev => [...prev.slice(1), fresh]);
      }
      setCurrentEvent(events[idx]);
    }, 4000);
    return () => clearInterval(t);
  }, [events]);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 py-4 px-6 rounded-2xl bg-primary/5 border border-primary/15">
      {/* Playing now counter */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="relative">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-60" />
        </div>
        <Users size={16} className="text-primary" />
        <span className="font-black text-foreground text-sm">
          <span className="text-primary text-base">{playingNow.toLocaleString()}</span>
          {' '}children playing right now
        </span>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-6 bg-border" />

      {/* Badge ticker */}
      <div className="flex items-center gap-2 overflow-hidden min-w-0">
        <Star size={14} className="text-accent fill-accent shrink-0" />
        <div className="relative h-5 overflow-hidden flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {currentEvent && (
              <motion.span
                key={currentEvent.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: 'easeOut' as const }}
                className="absolute inset-0 flex items-center text-sm text-muted-foreground whitespace-nowrap"
              >
                <span className="mr-1">{currentEvent.emoji}</span>
                <span className="font-bold text-foreground">{currentEvent.name}</span>
                <span className="mx-1">just unlocked</span>
                <span className="font-bold text-primary">{currentEvent.badge}</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

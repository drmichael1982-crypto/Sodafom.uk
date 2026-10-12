/**
 * Badge definitions — single source of truth for all achievement badges.
 * Each badge has an id, display info, and an `evaluate` function that
 * checks whether a child has earned it given their stats.
 */

export interface BadgeDef {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  category: 'milestone' | 'streak' | 'stars' | 'subject' | 'social';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  /** Returns true if the stats satisfy this badge */
  evaluate: (stats: BadgeStats) => boolean;
}

export interface BadgeStats {
  gamesPlayed: number;       // all-time total games played
  totalStars: number;        // all-time stars earned
  currentStreak: number;     // current daily streak
  maxStreak: number;         // best ever streak
  mathsGames: number;        // games played in Maths
  readingGames: number;      // games played in Reading
  spellingGames: number;     // games played in Spelling
  scienceGames: number;      // games played in Science
  perfectGames: number;      // games completed with 3 stars
  referrals: number;         // friends referred
}

export const BADGE_DEFS: BadgeDef[] = [
  // ── Milestone ──────────────────────────────────────────────────────────────
  {
    id: 'first_game',
    emoji: '🎮',
    name: 'First Steps',
    desc: 'Play your very first game on Sodafom.',
    category: 'milestone',
    rarity: 'common',
    evaluate: (s) => s.gamesPlayed >= 1,
  },
  {
    id: 'games_10',
    emoji: '🏅',
    name: 'Getting Started',
    desc: 'Play 10 games in total.',
    category: 'milestone',
    rarity: 'common',
    evaluate: (s) => s.gamesPlayed >= 10,
  },
  {
    id: 'games_50',
    emoji: '🥈',
    name: 'On a Roll',
    desc: 'Play 50 games in total.',
    category: 'milestone',
    rarity: 'rare',
    evaluate: (s) => s.gamesPlayed >= 50,
  },
  {
    id: 'games_100',
    emoji: '🥇',
    name: 'Century Club',
    desc: 'Play 100 games — a true Sodafom champion!',
    category: 'milestone',
    rarity: 'epic',
    evaluate: (s) => s.gamesPlayed >= 100,
  },
  {
    id: 'games_500',
    emoji: '🏆',
    name: 'Legend',
    desc: 'Play 500 games. Absolutely legendary.',
    category: 'milestone',
    rarity: 'legendary',
    evaluate: (s) => s.gamesPlayed >= 500,
  },
  // ── Stars ──────────────────────────────────────────────────────────────────
  {
    id: 'stars_10',
    emoji: '⭐',
    name: 'Star Collector',
    desc: 'Earn 10 stars across all games.',
    category: 'stars',
    rarity: 'common',
    evaluate: (s) => s.totalStars >= 10,
  },
  {
    id: 'stars_100',
    emoji: '🌟',
    name: 'Star Power',
    desc: 'Earn 100 stars — you\'re shining bright!',
    category: 'stars',
    rarity: 'rare',
    evaluate: (s) => s.totalStars >= 100,
  },
  {
    id: 'stars_500',
    emoji: '💫',
    name: 'Supernova',
    desc: 'Earn 500 stars. Out of this world!',
    category: 'stars',
    rarity: 'epic',
    evaluate: (s) => s.totalStars >= 500,
  },
  {
    id: 'stars_1000',
    emoji: '🌠',
    name: 'Galaxy Brain',
    desc: 'Earn 1,000 stars. You\'re a galaxy!',
    category: 'stars',
    rarity: 'legendary',
    evaluate: (s) => s.totalStars >= 1000,
  },
  {
    id: 'perfect_5',
    emoji: '💎',
    name: 'Perfectionist',
    desc: 'Get 3 stars on 5 different games.',
    category: 'stars',
    rarity: 'rare',
    evaluate: (s) => s.perfectGames >= 5,
  },
  {
    id: 'perfect_20',
    emoji: '👑',
    name: 'Crown Jewel',
    desc: 'Get 3 stars on 20 different games.',
    category: 'stars',
    rarity: 'epic',
    evaluate: (s) => s.perfectGames >= 20,
  },
  // ── Streak ─────────────────────────────────────────────────────────────────
  {
    id: 'streak_3',
    emoji: '🔥',
    name: 'On Fire',
    desc: 'Keep a 3-day learning streak.',
    category: 'streak',
    rarity: 'common',
    evaluate: (s) => s.maxStreak >= 3,
  },
  {
    id: 'streak_7',
    emoji: '🔥🔥',
    name: 'Week Warrior',
    desc: 'Keep a 7-day streak — a full week of learning!',
    category: 'streak',
    rarity: 'rare',
    evaluate: (s) => s.maxStreak >= 7,
  },
  {
    id: 'streak_30',
    emoji: '🌋',
    name: 'Unstoppable',
    desc: 'Keep a 30-day streak. Nothing can stop you!',
    category: 'streak',
    rarity: 'epic',
    evaluate: (s) => s.maxStreak >= 30,
  },
  {
    id: 'streak_100',
    emoji: '⚡',
    name: 'Lightning Rod',
    desc: 'Keep a 100-day streak. Absolutely electric!',
    category: 'streak',
    rarity: 'legendary',
    evaluate: (s) => s.maxStreak >= 100,
  },
  // ── Subject ────────────────────────────────────────────────────────────────
  {
    id: 'maths_10',
    emoji: '🔢',
    name: 'Number Cruncher',
    desc: 'Play 10 Maths games.',
    category: 'subject',
    rarity: 'common',
    evaluate: (s) => s.mathsGames >= 10,
  },
  {
    id: 'reading_10',
    emoji: '📚',
    name: 'Bookworm',
    desc: 'Play 10 Reading games.',
    category: 'subject',
    rarity: 'common',
    evaluate: (s) => s.readingGames >= 10,
  },
  {
    id: 'spelling_10',
    emoji: '🔤',
    name: 'Spelling Bee',
    desc: 'Play 10 Spelling games.',
    category: 'subject',
    rarity: 'common',
    evaluate: (s) => s.spellingGames >= 10,
  },
  {
    id: 'science_10',
    emoji: '🔬',
    name: 'Lab Rat',
    desc: 'Play 10 Science games.',
    category: 'subject',
    rarity: 'common',
    evaluate: (s) => s.scienceGames >= 10,
  },
  {
    id: 'all_subjects',
    emoji: '🌈',
    name: 'All-Rounder',
    desc: 'Play at least 5 games in every subject.',
    category: 'subject',
    rarity: 'epic',
    evaluate: (s) => s.mathsGames >= 5 && s.readingGames >= 5 && s.spellingGames >= 5 && s.scienceGames >= 5,
  },
  // ── Social ─────────────────────────────────────────────────────────────────
  {
    id: 'referral_1',
    emoji: '🤝',
    name: 'Friend Maker',
    desc: 'Refer 1 friend to Sodafom.',
    category: 'social',
    rarity: 'rare',
    evaluate: (s) => s.referrals >= 1,
  },
  {
    id: 'referral_5',
    emoji: '🎉',
    name: 'Community Builder',
    desc: 'Refer 5 friends to Sodafom.',
    category: 'social',
    rarity: 'epic',
    evaluate: (s) => s.referrals >= 5,
  },
];

export const RARITY_COLOURS: Record<BadgeDef['rarity'], { bg: string; border: string; text: string; label: string }> = {
  common:    { bg: 'bg-slate-100',   border: 'border-slate-300',  text: 'text-slate-600',   label: 'Common' },
  rare:      { bg: 'bg-blue-50',     border: 'border-blue-300',   text: 'text-blue-700',    label: 'Rare' },
  epic:      { bg: 'bg-purple-50',   border: 'border-purple-300', text: 'text-purple-700',  label: 'Epic' },
  legendary: { bg: 'bg-yellow-50',   border: 'border-yellow-400', text: 'text-yellow-700',  label: 'Legendary' },
};

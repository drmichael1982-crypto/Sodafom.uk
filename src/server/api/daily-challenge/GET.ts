/**
 * GET /api/daily-challenge
 * Returns today's featured game + whether the current child has already
 * claimed the bonus 5-star reward today.
 * Query: ?childId=X
 */
import type { Request, Response } from 'express';
import { db } from '@/server/db/client';
import { sql } from 'drizzle-orm';

// Curated list of games for daily challenges
const CHALLENGE_GAMES = [
  { slug: 'number-pop',        title: 'Number Pop',         subject: 'maths' },
  { slug: 'times-table-race',  title: 'Times Table Race',   subject: 'maths' },
  { slug: 'fraction-pizza',    title: 'Fraction Pizza',     subject: 'maths' },
  { slug: 'shape-sorter',      title: 'Shape Sorter',       subject: 'maths' },
  { slug: 'word-wizard',       title: 'Word Wizard',        subject: 'spelling' },
  { slug: 'spelling-bee',      title: 'Spelling Bee',       subject: 'spelling' },
  { slug: 'tricky-word-hunt',  title: 'Tricky Word Hunt',   subject: 'spelling' },
  { slug: 'phonics-parrot',    title: 'Phonics Parrot',     subject: 'spelling' },
  { slug: 'reading-quest',     title: 'Reading Quest',      subject: 'reading' },
  { slug: 'word-search',       title: 'Word Search',        subject: 'reading' },
  { slug: 'story-builder',     title: 'Story Builder',      subject: 'reading' },
  { slug: 'alphabet-explorer', title: 'Alphabet Explorer',  subject: 'reading' },
  { slug: 'number-puzzle',     title: 'Number Puzzle',      subject: 'maths' },
  { slug: 'crossword',         title: 'Crossword',          subject: 'spelling' },
];

function todaysSeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

export default async function handler(req: Request, res: Response) {
  try {
    const seed = todaysSeed();
    const idx = seed % CHALLENGE_GAMES.length;
    const game = CHALLENGE_GAMES[idx];

    const childId = parseInt(req.query.childId as string, 10);
    let claimed = false;

    if (childId) {
      // Ensure table exists
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS daily_challenge_claims (
          id INT AUTO_INCREMENT PRIMARY KEY,
          child_id INT NOT NULL,
          challenge_date DATE NOT NULL,
          claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY uq_child_date (child_id, challenge_date)
        )
      `).catch(() => {});

      const rows = await db.execute(sql`
        SELECT id FROM daily_challenge_claims
        WHERE child_id = ${childId} AND challenge_date = CURDATE()
        LIMIT 1
      `);
      claimed = ((rows[0] as unknown as unknown[]).length) > 0;
    }

    // Seconds until midnight UTC
    const now = new Date();
    const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    const secondsLeft = Math.floor((midnight.getTime() - now.getTime()) / 1000);

    res.json({ game, claimed, secondsLeft, date: new Date().toISOString().slice(0, 10) });
  } catch (err) {
    console.error('[daily-challenge GET]', err);
    res.status(500).json({ error: String(err) });
  }
}

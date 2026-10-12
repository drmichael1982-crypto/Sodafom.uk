/**
 * Migration: add active_character_id to children + seed 100-star interval characters.
 * All characters are 100% original, created for Sodafom — no third-party IP used.
 * Run once on startup via runCharacterMigration().
 */
import { db } from '@/server/db/client';
import { rewardCharacters } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

// 100% original Sodafom characters — no trademarked names, no copyrighted IP.
// Each costs 100 stars × its tier (100, 200, 300 … 1000).
export const SODAFOM_CHARACTERS = [
  // Tier 1 — 100 stars
  { slug: 'archie-star',    name: 'Archie the Star',      emoji: '⭐', description: 'Sodafom\'s friendly guide — always cheering you on!', starCost: 100,  category: 'hero',    sortOrder: 1 },
  // Tier 2 — 200 stars
  { slug: 'benny-bear',     name: 'Benny the Bear',       emoji: '🐻', description: 'A big, brave bear who loves maths puzzles.',           starCost: 200,  category: 'animal',  sortOrder: 2 },
  // Tier 3 — 300 stars
  { slug: 'luna-owl',       name: 'Luna the Owl',         emoji: '🦉', description: 'Wise Luna reads every book she can find.',             starCost: 300,  category: 'animal',  sortOrder: 3 },
  // Tier 4 — 400 stars
  { slug: 'rex-dino',       name: 'Rex the Dino',         emoji: '🦕', description: 'A gentle giant who loves science experiments.',        starCost: 400,  category: 'animal',  sortOrder: 4 },
  // Tier 5 — 500 stars
  { slug: 'zara-unicorn',   name: 'Zara the Unicorn',     emoji: '🦄', description: 'Magical Zara sprinkles spelling dust everywhere!',     starCost: 500,  category: 'fantasy', sortOrder: 5 },
  // Tier 6 — 600 stars
  { slug: 'finn-fox',       name: 'Finn the Fox',         emoji: '🦊', description: 'Quick-witted Finn can solve any word puzzle.',         starCost: 600,  category: 'animal',  sortOrder: 6 },
  // Tier 7 — 700 stars
  { slug: 'nova-robot',     name: 'Nova the Robot',       emoji: '🤖', description: 'Nova calculates answers at lightning speed!',          starCost: 700,  category: 'hero',    sortOrder: 7 },
  // Tier 8 — 800 stars
  { slug: 'coral-mermaid',  name: 'Coral the Mermaid',    emoji: '🧜', description: 'Coral explores the deep ocean of knowledge.',          starCost: 800,  category: 'fantasy', sortOrder: 8 },
  // Tier 9 — 900 stars
  { slug: 'blaze-dragon',   name: 'Blaze the Dragon',     emoji: '🐉', description: 'Blaze breathes fire — and aces every quiz!',           starCost: 900,  category: 'fantasy', sortOrder: 9 },
  // Tier 10 — 1000 stars
  { slug: 'champion-trophy',name: 'The Champion',         emoji: '🏆', description: 'Only the greatest learners unlock the Champion!',      starCost: 1000, category: 'hero',    sortOrder: 10 },
];

export async function runCharacterMigration() {
  try {
    // Add active_character_id column to children (safe — ignore if already exists)
    await db.execute(
      `ALTER TABLE children ADD COLUMN active_character_id INT NULL`
    ).catch(() => {});

    // Upsert each character so re-runs are safe
    for (const char of SODAFOM_CHARACTERS) {
      const existing = await db
        .select({ id: rewardCharacters.id })
        .from(rewardCharacters)
        .where(eq(rewardCharacters.slug, char.slug));

      if (existing.length === 0) {
        await db.insert(rewardCharacters).values({ ...char, active: true });
      }
    }

    console.log('[Migration] Characters seeded successfully.');
  } catch (err) {
    console.error('[Migration] Character migration error:', err);
  }
}

/**
 * Migration: create game_levels table for per-child per-game adaptive difficulty.
 * Run once on startup via runGameLevelsMigration().
 */
import { db } from '@/server/db/client';
import { runEducationCloudSeed } from './education-cloud-seed';

export async function runGameLevelsMigration() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS game_levels (
        id INT PRIMARY KEY AUTO_INCREMENT,
        child_id INT NOT NULL,
        game_slug VARCHAR(64) NOT NULL,
        level INT NOT NULL DEFAULT 1,
        best_stars INT NOT NULL DEFAULT 0,
        plays_at_level INT NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_child_game (child_id, game_slug),
        FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
      )
    `);
    console.log('[Migration] game_levels table ready.');
  } catch (err) {
    console.error('[Migration] game_levels migration error:', err);
  }

  // Seed/update shared curriculum content in Railway MySQL without touching user data.
  await runEducationCloudSeed();
}

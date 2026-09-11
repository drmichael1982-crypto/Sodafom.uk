/**
 * Migration: bootstrap the core Sodafom app tables, add active_character_id to
 * children, and seed 100-star interval characters.
 *
 * All CREATE TABLE statements are additive/idempotent: they never drop or
 * truncate existing tables or user data.
 */
import { db } from '@/server/db/client';
import { rewardCharacters } from '@/server/db/schema';
import { eq, sql } from 'drizzle-orm';

// 100% original Sodafom characters — no trademarked names, no copyrighted IP.
// Each costs 100 stars × its tier (100, 200, 300 … 1000).
export const SODAFOM_CHARACTERS = [
  { slug: 'archie-star',     name: 'Archie the Star', emoji: '⭐', description: "Sodafom's friendly guide — always cheering you on!", starCost: 100, category: 'hero', sortOrder: 1 },
  { slug: 'benny-bear',      name: 'Benny the Bear', emoji: '🐻', description: 'A big, brave bear who loves maths puzzles.', starCost: 200, category: 'animal', sortOrder: 2 },
  { slug: 'luna-owl',        name: 'Luna the Owl', emoji: '🦉', description: 'Wise Luna reads every book she can find.', starCost: 300, category: 'animal', sortOrder: 3 },
  { slug: 'rex-dino',        name: 'Rex the Dino', emoji: '🦕', description: 'A gentle giant who loves science experiments.', starCost: 400, category: 'animal', sortOrder: 4 },
  { slug: 'zara-unicorn',    name: 'Zara the Unicorn', emoji: '🦄', description: 'Magical Zara sprinkles spelling dust everywhere!', starCost: 500, category: 'fantasy', sortOrder: 5 },
  { slug: 'finn-fox',        name: 'Finn the Fox', emoji: '🦊', description: 'Quick-witted Finn can solve any word puzzle.', starCost: 600, category: 'animal', sortOrder: 6 },
  { slug: 'nova-robot',      name: 'Nova the Robot', emoji: '🤖', description: 'Nova calculates answers at lightning speed!', starCost: 700, category: 'hero', sortOrder: 7 },
  { slug: 'coral-mermaid',   name: 'Coral the Mermaid', emoji: '🧜', description: 'Coral explores the deep ocean of knowledge.', starCost: 800, category: 'fantasy', sortOrder: 8 },
  { slug: 'blaze-dragon',    name: 'Blaze the Dragon', emoji: '🐉', description: 'Blaze breathes fire — and aces every quiz!', starCost: 900, category: 'fantasy', sortOrder: 9 },
  { slug: 'champion-trophy', name: 'The Champion', emoji: '🏆', description: 'Only the greatest learners unlock the Champion!', starCost: 1000, category: 'hero', sortOrder: 10 },
];

async function ensureCoreAppTables() {
  // These are the tables needed immediately after authentication.  Railway can
  // start with a fresh MySQL volume, so create them before child/reward
  // migrations run.  IF NOT EXISTS preserves any existing records.
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS children (
      id INT PRIMARY KEY AUTO_INCREMENT,
      parent_id VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      age_group VARCHAR(16) NOT NULL,
      avatar_emoji VARCHAR(32) DEFAULT '⭐',
      total_stars INT NOT NULL DEFAULT 0,
      active_character_id INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_children_parent (parent_id)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS reward_characters (
      id INT PRIMARY KEY AUTO_INCREMENT,
      slug VARCHAR(64) NOT NULL UNIQUE,
      name VARCHAR(128) NOT NULL,
      emoji VARCHAR(32) NOT NULL,
      description VARCHAR(255) NULL,
      star_cost INT NOT NULL,
      category VARCHAR(32) NOT NULL DEFAULT 'animal',
      sort_order INT NOT NULL DEFAULT 0,
      active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  // Progress/reward tables existed in the Drizzle schema but several older
  // Railway databases were created before their SQL migrations were added.
  // These statements are additive only and preserve every existing record.
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS activity_sessions (
      id INT PRIMARY KEY AUTO_INCREMENT,
      child_id INT NOT NULL,
      subject VARCHAR(32) NOT NULL,
      activity_id VARCHAR(64) NOT NULL,
      activity_title VARCHAR(255) NOT NULL,
      score INT DEFAULT 0,
      max_score INT DEFAULT 100,
      duration_seconds INT DEFAULT 0,
      stars_earned INT NOT NULL DEFAULT 0,
      completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_activity_child (child_id),
      INDEX idx_activity_completed (completed_at)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS progress_summaries (
      id INT PRIMARY KEY AUTO_INCREMENT,
      child_id INT NOT NULL,
      subject VARCHAR(32) NOT NULL,
      week_start TIMESTAMP NOT NULL,
      total_sessions INT DEFAULT 0,
      avg_score DECIMAL(5,2) DEFAULT 0,
      total_minutes INT DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_progress_summary_child (child_id),
      INDEX idx_progress_summary_week (week_start)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS child_progress (
      id INT PRIMARY KEY AUTO_INCREMENT,
      child_id INT NOT NULL,
      game_title VARCHAR(255) NOT NULL,
      subject VARCHAR(32) NOT NULL,
      stars INT NOT NULL DEFAULT 0,
      score INT NOT NULL DEFAULT 0,
      completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_child_progress_child (child_id),
      INDEX idx_child_progress_completed (completed_at)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS streak_tracker (
      id INT PRIMARY KEY AUTO_INCREMENT,
      child_id INT NOT NULL UNIQUE,
      current_streak INT NOT NULL DEFAULT 0,
      max_streak INT NOT NULL DEFAULT 0,
      last_played_date DATE NULL,
      freeze_active TINYINT(1) NOT NULL DEFAULT 0,
      freeze_used_at TIMESTAMP NULL DEFAULT NULL
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS child_characters (
      id INT PRIMARY KEY AUTO_INCREMENT,
      child_id INT NOT NULL,
      character_id INT NOT NULL,
      unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_child_character (child_id, character_id),
      INDEX idx_child_characters_child (child_id)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS star_milestones (
      id INT PRIMARY KEY AUTO_INCREMENT,
      child_id INT NOT NULL,
      milestone INT NOT NULL,
      promo_code VARCHAR(32) NULL,
      claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_child_milestone (child_id, milestone)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS promo_codes (
      id INT PRIMARY KEY AUTO_INCREMENT,
      code VARCHAR(32) NOT NULL UNIQUE,
      description VARCHAR(255) NULL,
      access_type VARCHAR(32) NOT NULL DEFAULT 'free',
      access_duration_days INT NULL,
      max_uses INT NULL,
      used_count INT NOT NULL DEFAULT 0,
      expires_at TIMESTAMP NULL DEFAULT NULL,
      active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id VARCHAR(255) NOT NULL,
      stripe_session_id VARCHAR(255) NOT NULL UNIQUE,
      stripe_subscription_id VARCHAR(255) NULL,
      stripe_price_id VARCHAR(255) NOT NULL,
      plan VARCHAR(32) NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'active',
      activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NULL DEFAULT NULL,
      cancel_reason VARCHAR(500) NULL,
      cancelled_at TIMESTAMP NULL DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_subscriptions_user (user_id)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  // School and teacher tables are created additively in dependency order.
  // This repairs older Railway databases that had the Drizzle definitions but
  // never received the corresponding migration.
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS school_licences (
      id INT PRIMARY KEY AUTO_INCREMENT,
      subscription_id INT NOT NULL,
      user_id VARCHAR(255) NOT NULL,
      licence_key VARCHAR(64) NOT NULL UNIQUE,
      max_devices INT NOT NULL DEFAULT 30,
      expires_at TIMESTAMP NULL DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_school_licences_user (user_id)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS teacher_accounts (
      id INT PRIMARY KEY AUTO_INCREMENT,
      licence_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      class_name VARCHAR(128) DEFAULT 'My Class',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_teacher_licence (licence_id)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS students (
      id INT PRIMARY KEY AUTO_INCREMENT,
      teacher_id INT NOT NULL,
      student_code VARCHAR(20) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      age_group VARCHAR(16) NOT NULL DEFAULT '8-10',
      avatar_emoji VARCHAR(32) DEFAULT '⭐',
      total_stars INT NOT NULL DEFAULT 0,
      last_active_at TIMESTAMP NULL DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_students_teacher (teacher_id)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS student_notes (
      id INT PRIMARY KEY AUTO_INCREMENT,
      student_id INT NOT NULL,
      teacher_id INT NOT NULL,
      subject VARCHAR(32) DEFAULT 'general',
      note_text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_student_notes_student (student_id)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS student_activity (
      id INT PRIMARY KEY AUTO_INCREMENT,
      student_id INT NOT NULL,
      game_id VARCHAR(64) NOT NULL,
      game_title VARCHAR(255) NOT NULL,
      subject VARCHAR(32) NOT NULL,
      score INT DEFAULT 0,
      max_score INT DEFAULT 100,
      stars_earned INT DEFAULT 0,
      duration_seconds INT DEFAULT 0,
      played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_student_activity_student (student_id)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS teacher_sessions (
      id INT PRIMARY KEY AUTO_INCREMENT,
      teacher_id INT NOT NULL,
      token VARCHAR(128) NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_teacher_sessions_teacher (teacher_id),
      INDEX idx_teacher_sessions_expiry (expires_at)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS chores (
      id INT PRIMARY KEY AUTO_INCREMENT,
      parent_id VARCHAR(255) NOT NULL,
      child_id INT NOT NULL,
      title VARCHAR(120) NOT NULL,
      value_pence INT NOT NULL DEFAULT 0,
      active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_chores_parent_child (parent_id, child_id)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS chore_completions (
      id INT PRIMARY KEY AUTO_INCREMENT,
      chore_id INT NOT NULL,
      parent_id VARCHAR(255) NOT NULL,
      child_id INT NOT NULL,
      status VARCHAR(24) NOT NULL DEFAULT 'waiting_for_parent',
      completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      approved_at TIMESTAMP NULL DEFAULT NULL,
      INDEX idx_chore_completions_parent (parent_id),
      INDEX idx_chore_completions_child (child_id)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS founder_change_requests (
      id INT PRIMARY KEY AUTO_INCREMENT,
      instruction TEXT NOT NULL,
      category VARCHAR(48) NOT NULL,
      risk_level VARCHAR(16) NOT NULL,
      plan TEXT NOT NULL,
      test_summary TEXT NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'prepared',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      approved_at TIMESTAMP NULL DEFAULT NULL,
      INDEX idx_founder_change_status (status)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  console.log('[Migration] Core Sodafom app tables ready.');
}

export async function runCharacterMigration() {
  try {
    await ensureCoreAppTables();

    // Older databases may have children without this field. Safe re-run.
    await db.execute(sql`ALTER TABLE children ADD COLUMN active_character_id INT NULL`).catch(() => {});

    // Upsert each character so re-runs are safe.
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

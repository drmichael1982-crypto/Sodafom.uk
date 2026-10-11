import { sql } from 'drizzle-orm';
import { db } from '../db/client.js';

let initialization: Promise<void> | null = null;

function isDuplicateColumnError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const value = error as { code?: unknown; errno?: unknown };
  return value.code === 'ER_DUP_FIELDNAME' || value.errno === 1060;
}

async function initialize(): Promise<void> {
  try {
    await db.execute(sql`
      ALTER TABLE children ADD COLUMN reward_email VARCHAR(255) NULL
    `);
  } catch (error) {
    if (!isDuplicateColumnError(error)) throw error;
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS badge_awards (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      child_id    INT NOT NULL,
      badge_id    VARCHAR(100) NOT NULL,
      awarded_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      email_sent  TINYINT(1) DEFAULT 0,
      UNIQUE KEY uq_child_badge (child_id, badge_id)
    )
  `);
}

export function ensureRewardStorage(): Promise<void> {
  if (!initialization) {
    initialization = initialize().catch((error) => {
      initialization = null;
      throw error;
    });
  }
  return initialization;
}

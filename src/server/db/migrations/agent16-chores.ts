/** Explicit, additive migration. Never run during imports, startup, tests or deployment here. */
import { sql } from 'drizzle-orm';
import { db, testConnection } from '../client';

const additions = {
  chores: [
    ['reward_type', "VARCHAR(12) NOT NULL DEFAULT 'money'"],
    ['reward_points', 'INT NOT NULL DEFAULT 0'],
    ['recurrence', "VARCHAR(12) NOT NULL DEFAULT 'daily'"],
    ['starts_on', 'VARCHAR(10) NULL'],
  ],
  chore_completions: [
    ['occurrence_key', 'VARCHAR(32) NULL'], ['title_snapshot', 'VARCHAR(120) NULL'],
    ['reward_type_snapshot', 'VARCHAR(12) NULL'], ['value_pence_snapshot', 'INT NULL'],
    ['reward_points_snapshot', 'INT NULL'], ['parent_note', 'VARCHAR(240) NULL'],
    ['reviewed_at', 'TIMESTAMP NULL'],
  ],
} as const;

export async function migrateAgent16Chores() {
  if (!await testConnection()) throw new Error('A real database connection is required. Migration stopped.');
  // All identifiers and definitions below are fixed source constants, never user input.
  for (const [table, columns] of Object.entries(additions)) {
    const [existing] = await db.execute(sql.raw(`SHOW COLUMNS FROM \`${table}\``));
    if (!Array.isArray(existing) || existing.length === 0) throw new Error(`Existing ${table} table is required. Migration stopped.`);
    const names = new Set(existing.map((row: { Field: string }) => row.Field));
    for (const [column, definition] of columns) {
      if (!names.has(column)) await db.execute(sql.raw(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`));
    }
  }
  const [indexes] = await db.execute(sql.raw('SHOW INDEX FROM `chore_completions`'));
  const keys = new Set((indexes as Array<{ Key_name: string }>).map(row => row.Key_name));
  if (!keys.has('chore_occurrence_unique')) await db.execute(sql.raw('CREATE UNIQUE INDEX `chore_occurrence_unique` ON `chore_completions` (`chore_id`, `occurrence_key`)'));
  if (!keys.has('chore_family_history')) await db.execute(sql.raw('CREATE INDEX `chore_family_history` ON `chore_completions` (`parent_id`, `child_id`, `id`)'));
  await db.execute(sql.raw(`CREATE TABLE IF NOT EXISTS chore_parent_checks (
    parent_id VARCHAR(255) NOT NULL PRIMARY KEY,
    window_started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    failures INT NOT NULL DEFAULT 0,
    CONSTRAINT chore_check_parent_fk FOREIGN KEY (parent_id) REFERENCES user(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`));
  // Legacy rows intentionally retain NULL snapshots and occurrence keys. No invented backfill.
}

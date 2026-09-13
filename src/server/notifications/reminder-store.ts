import { sql } from 'drizzle-orm';
import { db } from '../db/client';
import {
  defaultReminderPreferences, emptyReminderLedger, parseReminderPreferences,
  parseReminderLedger, planReminder, type ReminderPreferences, type ReminderDelivery,
} from '../../lib/reminder-policy';

interface Executor { execute(query: ReturnType<typeof sql>): Promise<unknown> }
interface StoredRow { preferences_json: string | object; delivery_json: string | object }
const decode = (value: string | object): unknown => typeof value === 'string' ? JSON.parse(value) : value;
function rows<T>(result: unknown): T[] {
  if (!Array.isArray(result) || !Array.isArray(result[0])) throw new Error('Reminder database unavailable');
  return result[0] as T[];
}
function written(result: unknown): void {
  if (!Array.isArray(result) || !result[0] || typeof result[0].affectedRows !== 'number') {
    throw new Error('Reminder settings were not persisted');
  }
}
let schemaReady: Promise<void> | undefined;
async function ensureSchema(): Promise<void> {
  // The application's offline mock must not report a successful save or reset limits.
  if (typeof db.transaction !== 'function') throw new Error('Persistent reminder storage unavailable');
  if (!schemaReady) {
    schemaReady = (async () => {
      await db.execute(sql`CREATE TABLE IF NOT EXISTS notification_reminder_settings (
        user_id VARCHAR(191) NOT NULL PRIMARY KEY,
        preferences_json TEXT NOT NULL,
        delivery_json TEXT NOT NULL,
        password_window BIGINT NOT NULL DEFAULT 0,
        password_attempts INT NOT NULL DEFAULT 0,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB`);
    })().catch(error => { schemaReady = undefined; throw error; });
  }
  return schemaReady;
}
async function lockRow(tx: Executor, id: string): Promise<StoredRow | undefined> {
  return rows<StoredRow>(await tx.execute(sql`
    SELECT preferences_json, delivery_json FROM notification_reminder_settings
    WHERE user_id = ${id} FOR UPDATE
  `))[0];
}
export async function readReminderPreferences(id: string): Promise<ReminderPreferences> {
  await ensureSchema();
  const row = rows<StoredRow>(await db.execute(sql`
    SELECT preferences_json, delivery_json FROM notification_reminder_settings WHERE user_id = ${id} LIMIT 1
  `))[0];
  return row ? parseReminderPreferences(decode(row.preferences_json)) : defaultReminderPreferences();
}
export async function reserveReminderPasswordAttempt(id: string, now: number): Promise<boolean> {
  await ensureSchema();
  return db.transaction(async (tx: Executor) => {
    // Off by default even when an attempt creates the first row.
    written(await tx.execute(sql`
      INSERT INTO notification_reminder_settings (user_id, preferences_json, delivery_json)
      VALUES (${id}, ${JSON.stringify(defaultReminderPreferences())}, ${JSON.stringify(emptyReminderLedger())})
      ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)
    `));
    const row = rows<{ password_window: number | string; password_attempts: number }>(await tx.execute(sql`
      SELECT password_window, password_attempts FROM notification_reminder_settings WHERE user_id = ${id} FOR UPDATE
    `))[0];
    if (!row) throw new Error('No reminder account');
    const start = Number(row.password_window), count = Number(row.password_attempts);
    if (!Number.isFinite(start) || !Number.isInteger(count) || start > now) return false;
    const reset = now - start >= 600_000;
    if (!reset && count >= 5) return false;
    written(await tx.execute(sql`
      UPDATE notification_reminder_settings SET password_window = ${reset ? now : start},
      password_attempts = ${reset ? 1 : count + 1} WHERE user_id = ${id}
    `));
    return true;
  });
}
export async function saveReminderPreferences(id: string, settings: ReminderPreferences): Promise<void> {
  await ensureSchema();
  const preferences = parseReminderPreferences(settings);
  await db.transaction(async (tx: Executor) => {
    if (!await lockRow(tx, id)) throw new Error('Parent verification required');
    // Never clear the delivery ledger on a setting/time-zone/opt-in change.
    written(await tx.execute(sql`
      UPDATE notification_reminder_settings SET preferences_json = ${JSON.stringify(preferences)} WHERE user_id = ${id}
    `));
  });
}
async function newestAchievement(tx: Executor, id: string, now: Date): Promise<string | null> {
  const from = new Date(now.getTime() - 86_400_000).toISOString().slice(0, 19).replace('T', ' ');
  const to = now.toISOString().slice(0, 19).replace('T', ' ');
  // Read-only: never invent an award, and never change badge/game/lesson records.
  const result = await tx.execute(sql`
    SELECT b.child_id, b.badge_id, b.awarded_at FROM badge_awards b
    INNER JOIN children c ON c.id = b.child_id
    WHERE c.parent_id = ${id} AND b.awarded_at >= ${from} AND b.awarded_at <= ${to}
    ORDER BY b.awarded_at DESC, b.child_id DESC, b.badge_id DESC LIMIT 1
  `);
  const row = rows<{ child_id: number; badge_id: string; awarded_at: string | Date }>(result)[0];
  return row ? `${row.child_id}:${row.badge_id}:${new Date(row.awarded_at).toISOString()}` : null;
}
export async function claimReminder(id: string, now: Date): Promise<ReminderDelivery | null> {
  await ensureSchema();
  return db.transaction(async (tx: Executor) => {
    const row = await lockRow(tx, id);
    if (!row) return null;
    const preferences = parseReminderPreferences(decode(row.preferences_json));
    const ledger = parseReminderLedger(decode(row.delivery_json));
    let achievement: string | null = null;
    if (preferences.rules.achievements.enabled) {
      // An unavailable award source suppresses achievements, not other reminder types.
      achievement = await newestAchievement(tx, id, now).catch(() => null);
    }
    const plan = planReminder(preferences, ledger, now, achievement);
    if (!plan) return null;
    written(await tx.execute(sql`
      UPDATE notification_reminder_settings SET delivery_json = ${JSON.stringify(plan.nextLedger)} WHERE user_id = ${id}
    `));
    // Transaction commits before the response / push. Prefer a missed reminder to a duplicate.
    return plan.notification;
  });
}

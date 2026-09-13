/** Feature-owned mappings for the existing chores tables. Shared schema stays untouched. */
import { mysqlTable, int, varchar, boolean, timestamp, uniqueIndex, index } from 'drizzle-orm/mysql-core';
import { children, user } from '@/server/db/schema';
import type { Recurrence, RewardType, ReviewStatus } from '@/lib/chores';

export const chores = mysqlTable('chores', {
  id: int('id').primaryKey().autoincrement(),
  parentId: varchar('parent_id', { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  childId: int('child_id').notNull().references(() => children.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 120 }).notNull(),
  valuePence: int('value_pence').notNull().default(0),
  rewardType: varchar('reward_type', { length: 12 }).$type<RewardType>().notNull().default('money'),
  rewardPoints: int('reward_points').notNull().default(0),
  // Existing chores behaved as repeatable jobs; new jobs always specify their schedule.
  recurrence: varchar('recurrence', { length: 12 }).$type<Recurrence>().notNull().default('daily'),
  startsOn: varchar('starts_on', { length: 10 }),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});
export const choreCompletions = mysqlTable('chore_completions', {
  id: int('id').primaryKey().autoincrement(),
  choreId: int('chore_id').notNull().references(() => chores.id, { onDelete: 'cascade' }),
  parentId: varchar('parent_id', { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  childId: int('child_id').notNull().references(() => children.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 24 }).$type<ReviewStatus>().notNull().default('waiting_for_parent'),
  occurrenceKey: varchar('occurrence_key', { length: 32 }),
  titleSnapshot: varchar('title_snapshot', { length: 120 }),
  rewardTypeSnapshot: varchar('reward_type_snapshot', { length: 12 }).$type<RewardType>(),
  valuePenceSnapshot: int('value_pence_snapshot'),
  rewardPointsSnapshot: int('reward_points_snapshot'),
  parentNote: varchar('parent_note', { length: 240 }),
  completedAt: timestamp('completed_at').defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
  approvedAt: timestamp('approved_at'),
}, table => [
  uniqueIndex('chore_occurrence_unique').on(table.choreId, table.occurrenceKey),
  index('chore_family_history').on(table.parentId, table.childId, table.id),
]);
/** Only failed password checks; never a password, hash, PIN or unlock token. */
export const choreParentChecks = mysqlTable('chore_parent_checks', {
  parentId: varchar('parent_id', { length: 255 }).primaryKey().references(() => user.id, { onDelete: 'cascade' }),
  windowStartedAt: timestamp('window_started_at').notNull().defaultNow(),
  failures: int('failures').notNull().default(0),
});

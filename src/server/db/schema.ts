/**
 * Database schema for Sodafom.
 *
 * This file defines the MySQL table structures using Drizzle ORM.
 * It is divided into three main sections:
 * 1. BetterAuth tables: Standard tables for authentication and session management.
 * 2. Sodafom app tables: Core application data including children, progress, and subscriptions.
 * 3. Teacher Hub tables: Tables specifically for school/teacher features and analytics.
 */
import { mysqlTable, int, varchar, text, boolean, timestamp, decimal, mysqlEnum } from 'drizzle-orm/mysql-core';

// ── BetterAuth tables ────────────────────────────────────────────────────────

/**
 * Core user table for authentication and profile data.
 */
export const user = mysqlTable('user', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('email_verified').default(false),
  image: text('image'),
  isAdmin: boolean('is_admin').default(false),
  role: varchar('role', { length: 32 }).default('parent'), // 'parent' | 'teacher'
  phoneNumber: varchar('phone_number', { length: 32 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

/**
 * Active sessions for authenticated users.
 */
export const session = mysqlTable('session', {
  id: varchar('id', { length: 255 }).primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

/**
 * OAuth accounts and credentials linked to users.
 */
export const account = mysqlTable('account', {
  id: varchar('id', { length: 255 }).primaryKey(),
  accountId: varchar('account_id', { length: 255 }).notNull(),
  providerId: varchar('provider_id', { length: 255 }).notNull(),
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: varchar('password', { length: 255 }),
  issuer: varchar('issuer', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

/**
 * Verification tokens for email confirmation and other security flows.
 */
export const verification = mysqlTable('verification', {
  id: varchar('id', { length: 255 }).primaryKey(),
  identifier: varchar('identifier', { length: 255 }).notNull(),
  value: varchar('value', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ── Sodafom app tables ───────────────────────────────────────────────────────

/**
 * Children profiles linked to a parent or teacher account.
 * Tracks basic info and total star progression.
 */
export const children = mysqlTable('children', {
  id: int('id').primaryKey().autoincrement(),
  parentId: varchar('parent_id', { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  ageGroup: varchar('age_group', { length: 16 }).notNull(), // '5-7' | '8-10' | '11-13'
  avatarEmoji: varchar('avatar_emoji', { length: 8 }).default('⭐'),
  totalStars: int('total_stars').default(0).notNull(),
  activeCharacterId: int('active_character_id'), // FK set after rewardCharacters is defined
  createdAt: timestamp('created_at').defaultNow(),
});

/**
 * Logs for individual activity sessions played by a child.
 * Records scores, duration, and stars earned.
 */
export const activitySessions = mysqlTable('activity_sessions', {
  id: int('id').primaryKey().autoincrement(),
  childId: int('child_id').notNull().references(() => children.id, { onDelete: 'cascade' }),
  subject: varchar('subject', { length: 32 }).notNull(),   // 'maths' | 'spelling' | 'reading'
  activityId: varchar('activity_id', { length: 64 }).notNull(),
  activityTitle: varchar('activity_title', { length: 255 }).notNull(),
  score: int('score').default(0),
  maxScore: int('max_score').default(100),
  durationSeconds: int('duration_seconds').default(0),
  starsEarned: int('stars_earned').default(0).notNull(), // 0–3 stars based on score %
  completedAt: timestamp('completed_at').defaultNow(),
});

/**
 * Weekly aggregated progress data for children per subject.
 * Used for reporting and dashboard visualizations.
 */
export const progressSummaries = mysqlTable('progress_summaries', {
  id: int('id').primaryKey().autoincrement(),
  childId: int('child_id').notNull().references(() => children.id, { onDelete: 'cascade' }),
  subject: varchar('subject', { length: 32 }).notNull(),
  weekStart: timestamp('week_start').notNull(),
  totalSessions: int('total_sessions').default(0),
  avgScore: decimal('avg_score', { precision: 5, scale: 2 }).default('0'),
  totalMinutes: int('total_minutes').default(0),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

/**
 * Subscription data for paid access (Stripe integration).
 * Tracks plans, statuses, and expiry dates.
 */
export const subscriptions = mysqlTable('subscriptions', {
  id: int('id').primaryKey().autoincrement(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  stripeSessionId: varchar('stripe_session_id', { length: 255 }).notNull().unique(),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  stripePriceId: varchar('stripe_price_id', { length: 255 }).notNull(),
  plan: varchar('plan', { length: 32 }).notNull(), // 'monthly' | 'annual' | 'promo' | 'school'
  status: varchar('status', { length: 32 }).notNull().default('active'), // 'active' | 'cancelled' | 'expired'
  activatedAt: timestamp('activated_at').defaultNow(),
  expiresAt: timestamp('expires_at'), // null = no expiry (promo/monthly), set for annual
  cancelReason: varchar('cancel_reason', { length: 500 }),
  cancelledAt: timestamp('cancelled_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

/**
 * Licences for schools, allowing multiple device activations.
 */
export const schoolLicences = mysqlTable('school_licences', {
  id: int('id').primaryKey().autoincrement(),
  subscriptionId: int('subscription_id').notNull().references(() => subscriptions.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  licenceKey: varchar('licence_key', { length: 64 }).notNull().unique(),
  maxDevices: int('max_devices').notNull().default(30),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

/**
 * Definitions for promotional codes and the access they grant.
 */
export const promoCodes = mysqlTable('promo_codes', {
  id: int('id').primaryKey().autoincrement(),
  code: varchar('code', { length: 32 }).notNull().unique(),          // e.g. '1182'
  description: varchar('description', { length: 255 }),              // internal label
  accessType: varchar('access_type', { length: 32 }).notNull().default('free'), // 'free' | 'trial'
  accessDurationDays: int('access_duration_days'),                    // null = permanent, or 7, 30, 90 etc.
  maxUses: int('max_uses'),                                           // null = unlimited
  usedCount: int('used_count').notNull().default(0),
  expiresAt: timestamp('expires_at'),                                 // null = never expires
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

/**
 * User-submitted reviews for the Sodafom site.
 */
export const siteReviews = mysqlTable('site_reviews', {
  id: int('id').primaryKey().autoincrement(),
  authorName: varchar('author_name', { length: 128 }).notNull(),
  authorRole: varchar('author_role', { length: 64 }).default('Parent'),
  stars: int('stars').notNull().default(5),
  body: text('body').notNull(),
  approved: boolean('approved').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

/**
 * Records of when users redeem specific promo codes.
 */
export const promoActivations = mysqlTable('promo_activations', {
  id: int('id').primaryKey().autoincrement(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  promoCodeId: int('promo_code_id').notNull().references(() => promoCodes.id),
  code: varchar('code', { length: 32 }).notNull(),                   // denormalised for easy lookup
  redeemedAt: timestamp('redeemed_at').defaultNow(),
});

/**
 * Catalogue of reward characters that can be unlocked using stars.
 */
export const rewardCharacters = mysqlTable('reward_characters', {
  id: int('id').primaryKey().autoincrement(),
  slug: varchar('slug', { length: 64 }).notNull().unique(),       // e.g. 'sunny-lion'
  name: varchar('name', { length: 128 }).notNull(),               // e.g. 'Sunny the Lion'
  emoji: varchar('emoji', { length: 8 }).notNull(),               // display emoji
  description: varchar('description', { length: 255 }),
  starCost: int('star_cost').notNull(),                           // stars needed to unlock
  category: varchar('category', { length: 32 }).notNull().default('animal'), // 'animal'|'fantasy'|'hero'
  sortOrder: int('sort_order').notNull().default(0),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

/**
 * Junction table tracking which reward characters a child has unlocked.
 */
export const childCharacters = mysqlTable('child_characters', {
  id: int('id').primaryKey().autoincrement(),
  childId: int('child_id').notNull().references(() => children.id, { onDelete: 'cascade' }),
  characterId: int('character_id').notNull().references(() => rewardCharacters.id),
  unlockedAt: timestamp('unlocked_at').defaultNow(),
});

/**
 * Records of star-based milestones reached and claimed by children.
 */
export const starMilestones = mysqlTable('star_milestones', {
  id: int('id').primaryKey().autoincrement(),
  childId: int('child_id').notNull().references(() => children.id, { onDelete: 'cascade' }),
  milestone: int('milestone').notNull(),                          // e.g. 1000, 2000
  promoCode: varchar('promo_code', { length: 32 }),               // generated code
  claimedAt: timestamp('claimed_at').defaultNow(),
});

/**
 * Individual activation codes for devices under a school licence.
 */
export const deviceCodes = mysqlTable('device_codes', {
  id: int('id').primaryKey().autoincrement(),
  licenceId: int('licence_id').notNull().references(() => schoolLicences.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 20 }).notNull().unique(), // e.g. SODA-ABCD-1234
  status: mysqlEnum('status', ['unused', 'active', 'revoked']).notNull().default('unused'),
  activatedAt: timestamp('activated_at'),
  deviceLabel: varchar('device_label', { length: 128 }), // optional label set by school admin
  createdAt: timestamp('created_at').defaultNow(),
});

/**
 * Tracks adaptive difficulty levels for games on a per-child basis.
 */
export const gameLevels = mysqlTable('game_levels', {
  id: int('id').primaryKey().autoincrement(),
  childId: int('child_id').notNull().references(() => children.id, { onDelete: 'cascade' }),
  gameSlug: varchar('game_slug', { length: 64 }).notNull(),   // e.g. 'times-table-race'
  level: int('level').notNull().default(1),                   // 1 (easiest) → 5 (hardest)
  bestStars: int('best_stars').notNull().default(0),          // highest stars ever earned
  playsAtLevel: int('plays_at_level').notNull().default(0),   // plays at current level
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ── Teacher Hub tables ────────────────────────────────────────────────────────

/**
 * Teacher accounts managed within the school licence system.
 */
export const teacherAccounts = mysqlTable('teacher_accounts', {
  id: int('id').primaryKey().autoincrement(),
  licenceId: int('licence_id').notNull().references(() => schoolLicences.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  className: varchar('class_name', { length: 128 }).default('My Class'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

/**
 * Student profiles managed by teachers.
 * Students use unique codes for login.
 */
export const students = mysqlTable('students', {
  id: int('id').primaryKey().autoincrement(),
  teacherId: int('teacher_id').notNull().references(() => teacherAccounts.id, { onDelete: 'cascade' }),
  studentCode: varchar('student_code', { length: 20 }).notNull().unique(), // e.g. SODA-STUD-A3F7
  name: varchar('name', { length: 255 }).notNull(),
  ageGroup: varchar('age_group', { length: 16 }).notNull().default('8-10'), // '5-7'|'8-10'|'11-13'
  avatarEmoji: varchar('avatar_emoji', { length: 8 }).default('⭐'),
  totalStars: int('total_stars').default(0).notNull(),
  lastActiveAt: timestamp('last_active_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

/**
 * Qualitative notes written by teachers about students.
 */
export const studentNotes = mysqlTable('student_notes', {
  id: int('id').primaryKey().autoincrement(),
  studentId: int('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  teacherId: int('teacher_id').notNull().references(() => teacherAccounts.id, { onDelete: 'cascade' }),
  subject: varchar('subject', { length: 32 }).default('general'), // 'maths'|'reading'|'spelling'|'general'
  noteText: text('note_text').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

/**
 * Logs of student gaming activity for teacher oversight.
 */
export const studentActivity = mysqlTable('student_activity', {
  id: int('id').primaryKey().autoincrement(),
  studentId: int('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  gameId: varchar('game_id', { length: 64 }).notNull(),
  gameTitle: varchar('game_title', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 32 }).notNull(),
  score: int('score').default(0),
  maxScore: int('max_score').default(100),
  starsEarned: int('stars_earned').default(0),
  durationSeconds: int('duration_seconds').default(0),
  playedAt: timestamp('played_at').defaultNow(),
});

/**
 * Analytics for tracking page views across the site.
 */
export const pageViews = mysqlTable('page_views', {
  id: int('id').primaryKey().autoincrement(),
  path: varchar('path', { length: 255 }).notNull(),
  viewDate: varchar('view_date', { length: 10 }).notNull(), // YYYY-MM-DD
  hits: int('hits').notNull().default(1),
  uniqueHits: int('unique_hits').notNull().default(1),
});

/**
 * Authentication sessions for the Teacher Hub.
 */
export const teacherSessions = mysqlTable('teacher_sessions', {
  id: int('id').primaryKey().autoincrement(),
  teacherId: int('teacher_id').notNull().references(() => teacherAccounts.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 128 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

/**
 * Emails captured for the marketing newsletter.
 */
export const newsletterSubscribers = mysqlTable('newsletter_subscribers', {
  id: int('id').primaryKey().autoincrement(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  subscribedAt: timestamp('subscribed_at').defaultNow(),
});

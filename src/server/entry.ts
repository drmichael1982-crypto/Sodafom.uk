import express, { type Express, type NextFunction, type Request, type Response } from "express";
import { fileURLToPath } from "node:url";
import { dirname, extname, join } from "node:path";
import { readFileSync } from "node:fs";

// <api-imports>
import admin_code_get_0 from "./api/admin/code/GET";
import admin_list_users_get_1 from "./api/admin/list-users/GET";
import admin_reset_user_post_2 from "./api/admin/reset-user/POST";
import admin_stats_get_3 from "./api/admin/stats/GET";
import admin_promo_get from "./api/admin/promo/GET";
import admin_promo_post from "./api/admin/promo/POST";
import admin_promo_toggle_post from "./api/admin/promo/toggle/POST";
import admin_verify_post_extra from "./api/admin/verify/POST";
import auth_change_password_post_4 from "./api/auth/change-password/POST";
import auth_forgot_password_post_5 from "./api/auth/forgot-password/POST";
import auth_update_profile_post_6 from "./api/auth/update-profile/POST";
import auth_action_get_7 from "./api/auth/[action]/GET";
import auth_action_post_8 from "./api/auth/[action]/POST";
import auth_action_detail_get_9 from "./api/auth/[action]/[detail]/GET";
import auth_action_detail_post_10 from "./api/auth/[action]/[detail]/POST";
import badges_get_11 from "./api/badges/GET";
import battle_create_post_12 from "./api/battle/create/POST";
import battle_id_get_13 from "./api/battle/[id]/GET";
import battle_id_submit_post_14 from "./api/battle/[id]/submit/POST";
import chat_post_15 from "./api/chat/POST";
import children_get_16 from "./api/children/GET";
import children_post_17 from "./api/children/POST";
import children_childId_delete_18 from "./api/children/[childId]/DELETE";
import children_childId_patch_19 from "./api/children/[childId]/PATCH";
import children_childId_game_level_gameSlug_get_20 from "./api/children/[childId]/game-level/[gameSlug]/GET";
import children_childId_game_level_gameSlug_post_21 from "./api/children/[childId]/game-level/[gameSlug]/POST";
import ai_teacher_read_page_post from "./api/ai-teacher/read-page/POST";
import children_childId_progress_get_22 from "./api/children/[childId]/progress/GET";
import children_childId_progress_post_23 from "./api/children/[childId]/progress/POST";
import children_childId_reward_email_get_24 from "./api/children/[childId]/reward-email/GET";
import contact_formName_post_25 from "./api/contact/[formName]/POST";
import daily_challenge_get_26 from "./api/daily-challenge/GET";
import daily_challenge_claim_post_27 from "./api/daily-challenge/claim/POST";
import daily_challenge_history_get_28 from "./api/daily-challenge/history/GET";
import health_get_29 from "./api/health/GET";
import leaderboard_get_30 from "./api/leaderboard/GET";
import leaderboard_opt_in_post_31 from "./api/leaderboard/opt-in/POST";
import newsletter_migrate_post_32 from "./api/newsletter/migrate/POST";
import newsletter_subscribe_post_33 from "./api/newsletter/subscribe/POST";
import notifications_get_34 from "./api/notifications/GET";
import notifications_read_post_35 from "./api/notifications/read/POST";
import notify_email_post_36 from "./api/notify/email/POST";
import parent_dashboard_get_37 from "./api/parent/dashboard/GET";
import promo_redeem_post_38 from "./api/promo/redeem/POST";
import push_send_post_39 from "./api/push/send/POST";
import push_subscribe_post_40 from "./api/push/subscribe/POST";
import push_unsubscribe_post_41 from "./api/push/unsubscribe/POST";
import push_vapid_public_key_get_42 from "./api/push/vapid-public-key/GET";
import referral_get_43 from "./api/referral/GET";
import referral_convert_post_44 from "./api/referral/convert/POST";
import referral_track_post_45 from "./api/referral/track/POST";
import reports_weekly_email_post_46 from "./api/reports/weekly-email/POST";
import reviews_get_47 from "./api/reviews/GET";
import reviews_post_48 from "./api/reviews/POST";
import rewards_characters_get_49 from "./api/rewards/characters/GET";
import rewards_check_badges_post_50 from "./api/rewards/check-badges/POST";
import rewards_milestones_get_51 from "./api/rewards/milestones/GET";
import rewards_reward_email_post_52 from "./api/rewards/reward-email/POST";
import rewards_set_character_post_53 from "./api/rewards/set-character/POST";
import rewards_unlock_post_54 from "./api/rewards/unlock/POST";
import streak_get_55 from "./api/streak/GET";
import streak_freeze_post_56 from "./api/streak/freeze/POST";
import stripe_create_checkout_session_post_57 from "./api/stripe/create-checkout-session/POST";
import stripe_session_sessionId_get_58 from "./api/stripe/session/[sessionId]/GET";
import subscription_get_59 from "./api/subscription/GET";
import subscription_activate_post_60 from "./api/subscription/activate/POST";
import subscription_activate_school_post_61 from "./api/subscription/activate-school/POST";
import subscription_cancel_post_62 from "./api/subscription/cancel/POST";
import subscription_create_trial_post_63 from "./api/subscription/create-trial/POST";
import subscription_trial_status_get_64 from "./api/subscription/trial-status/GET";
import teacher_login_post_65 from "./api/teacher/login/POST";
import teacher_me_get_66 from "./api/teacher/me/GET";
import teacher_register_post_67 from "./api/teacher/register/POST";
import teacher_student_lookup_get_68 from "./api/teacher/student-lookup/GET";
import teacher_students_get_69 from "./api/teacher/students/GET";
import teacher_students_post_70 from "./api/teacher/students/POST";
import teacher_students_studentId_get_71 from "./api/teacher/students/[studentId]/GET";
import teacher_students_studentId_activity_post_72 from "./api/teacher/students/[studentId]/activity/POST";
import teacher_students_studentId_notes_post_73 from "./api/teacher/students/[studentId]/notes/POST";
import track_pageview_post_74 from "./api/track/pageview/POST";
import webhook_stripe_post_75 from "./api/webhook/stripe/POST";
// </api-imports>
import { db } from "./db/client";
import { promoCodes } from "./db/schema";
import { sql } from "drizzle-orm";
import { runCharacterMigration } from "./db/migrations/add-characters-100-stars";
import { runGameLevelsMigration } from "./db/migrations/add-game-levels";
import { seoRoutes } from "../lib/seo-routes";
import {
	loadAdSenseRuntimeConfig,
	resolveAdSenseTextFile,
	type AdSenseRuntimeConfig,
} from "./adsense-manifest";
import { loadIndexNowKey } from "./indexnow-key";
import { isSystemHost } from "./seo-host";
import { llmsTxtHandler } from "./llms-txt";
import { existsSync, readFileSync as fsReadFileSync } from "node:fs";
import { resolve as pathResolve } from "node:path";

export function reloadProjectEnv() {
  const cwd = process.cwd();
  const envPaths = [
    pathResolve(cwd, ".env"),
    pathResolve(cwd, "../.env"),
    pathResolve(cwd, "../../.env")
  ];
  for (const envPath of envPaths) {
    if (existsSync(envPath)) {
      try {
        const content = fsReadFileSync(envPath, "utf-8");
        const lines = content.split(/\r?\n/);
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || trimmedLine.startsWith("#")) continue;
          const eqIdx = trimmedLine.indexOf("=");
          if (eqIdx === -1) continue;
          const key = trimmedLine.slice(0, eqIdx).trim();
          let val = trimmedLine.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          val = val.trim();
          if (key) {
            process.env[key] = val;
            if (key === 'OPENAI_API_KE') {
              process.env['OPENAI_API_KEY'] = val;
            }
          }
        }
      } catch (err) {
        console.warn("[server] Failed to load .env from:", envPath, err);
      }
    }
  }
}

reloadProjectEnv();


export interface SsrRenderResult {
	html: string;
	head: string;
	status: number;
	redirect?: string;
}

export function registerAdSenseTextRoutes(app: Express, config: AdSenseRuntimeConfig): void {
	app.get("/ads.txt", (_req, res) => {
		const content = resolveAdSenseTextFile(config, "adsTxt");
		if (content === null) {
			res
				.status(404)
				.type("text/plain")
				.set("Cache-Control", "no-cache")
				.send("Not found\n");
			return;
		}
		res.type("text/plain").set("Cache-Control", "no-cache").send(content);
	});

	app.get("/app-ads.txt", (_req, res) => {
		const content = resolveAdSenseTextFile(config, "appAdsTxt");
		if (content === null) {
			res
				.status(404)
				.type("text/plain")
				.set("Cache-Control", "no-cache")
				.send("Not found\n");
			return;
		}
		res.type("text/plain").set("Cache-Control", "no-cache").send(content);
	});
}

export function renderSsrDocument(
	template: string,
	result: Pick<SsrRenderResult, "head" | "html">,
	adSenseConfig: Pick<AdSenseRuntimeConfig, "scriptHtml">,
): string {
	const head = [result.head, adSenseConfig.scriptHtml].filter(Boolean).join("\n");
	return template
		.replace("<!--app-head-->", () => head)
		.replace("<!--app-html-->", () => result.html);
}

function normalizeCommerceApiBaseUrlEnv() {
	if (process.env.GODADDY_API_BASE_URL) return;
	const hostOnly = process.env.VITE_GODADDY_API_HOST;
	if (!hostOnly) return;
	const normalizedHost = hostOnly.replace(/^https?:\/\//, "").trim();
	if (!normalizedHost) return;
	process.env.GODADDY_API_BASE_URL = `https://${normalizedHost}`;
}

normalizeCommerceApiBaseUrlEnv();

const app = express();

// DEBUG LOGGING MIDDLEWARE
app.use((req, res, next) => {
  console.log(`[server] ${req.method} ${req.url} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

// --- Extremely Robust CORS Middleware for Capacitor & Web ---
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost',
    'https://localhost',
    'capacitor://localhost',
    'https://app.sodafom.uk',
    'https://sodafom.uk'
  ];

  if (origin) {
    if (allowedOrigins.includes(origin) || origin.endsWith('.sodafom.uk')) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      // Fallback: reflect origin to ensure connectivity during transition
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, Accept, Origin, Range, Cache-Control, Pragma, X-Capacitor-Http, Accept-Encoding, X-Accel-Buffering, User-Agent');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, X-Accel-Buffering, Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Honour x-forwarded-* from the load balancer so req.protocol/req.hostname
// reflect the public-facing values. Express-maintained parsing respects the
// existing trust-proxy config; direct header reads would let a client spoof
// the sitemap origin in robots.txt.
app.set("trust proxy", true);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// <api-registrations>
app.get("/api/admin/code", admin_code_get_0);
app.get("/api/admin/list-users", admin_list_users_get_1);
app.post("/api/admin/reset-user", admin_reset_user_post_2);
app.get("/api/admin/stats", admin_stats_get_3);
app.get("/api/admin/promo", admin_promo_get);
app.post("/api/admin/promo", admin_promo_post);
app.post("/api/admin/promo/toggle", admin_promo_toggle_post);
app.post("/api/admin/verify", admin_verify_post_extra);
app.post("/api/auth/change-password", auth_change_password_post_4);
app.post("/api/auth/forgot-password", auth_forgot_password_post_5);
app.post("/api/auth/update-profile", auth_update_profile_post_6);
app.get("/api/auth/:action", auth_action_get_7);
app.post("/api/auth/:action", auth_action_post_8);
app.get("/api/auth/:action/:detail", auth_action_detail_get_9);
app.post("/api/auth/:action/:detail", auth_action_detail_post_10);
app.get("/api/badges", badges_get_11);
app.post("/api/battle/create", battle_create_post_12);
app.get("/api/battle/:id", battle_id_get_13);
app.post("/api/battle/:id/submit", battle_id_submit_post_14);
app.post("/api/chat", chat_post_15);
app.get("/api/chat-ping", (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.status(200).send(process.env.OPENAI_API_KEY?.trim()
    ? "Archie API is alive and OpenAI is configured."
    : "Archie API is alive, but OPENAI_API_KEY is missing on the server.");
});
app.get("/api/children", children_get_16);
app.post("/api/children", children_post_17);
app.delete("/api/children/:childId", children_childId_delete_18);
app.patch("/api/children/:childId", children_childId_patch_19);
app.get("/api/children/:childId/game-level/:gameSlug", children_childId_game_level_gameSlug_get_20);
app.post("/api/children/:childId/game-level/:gameSlug", children_childId_game_level_gameSlug_post_21);
app.post("/api/ai-teacher/read-page", ai_teacher_read_page_post);
app.get("/api/children/:childId/progress", children_childId_progress_get_22);
app.post("/api/children/:childId/progress", children_childId_progress_post_23);
app.get("/api/children/:childId/reward-email", children_childId_reward_email_get_24);
app.post("/api/contact/:formName", contact_formName_post_25);
app.get("/api/daily-challenge", daily_challenge_get_26);
app.post("/api/daily-challenge/claim", daily_challenge_claim_post_27);
app.get("/api/daily-challenge/history", daily_challenge_history_get_28);
app.get("/api/health", health_get_29);
app.get("/api/leaderboard", leaderboard_get_30);
app.post("/api/leaderboard/opt-in", leaderboard_opt_in_post_31);
app.post("/api/newsletter/migrate", newsletter_migrate_post_32);
app.post("/api/newsletter/subscribe", newsletter_subscribe_post_33);
app.get("/api/notifications", notifications_get_34);
app.post("/api/notifications/read", notifications_read_post_35);
app.post("/api/notify/email", notify_email_post_36);
app.get("/api/parent/dashboard", parent_dashboard_get_37);
app.post("/api/promo/redeem", promo_redeem_post_38);
app.post("/api/push/send", push_send_post_39);
app.post("/api/push/subscribe", push_subscribe_post_40);
app.post("/api/push/unsubscribe", push_unsubscribe_post_41);
app.get("/api/push/vapid-public-key", push_vapid_public_key_get_42);
app.get("/api/referral", referral_get_43);
app.post("/api/referral/convert", referral_convert_post_44);
app.post("/api/referral/track", referral_track_post_45);
app.post("/api/reports/weekly-email", reports_weekly_email_post_46);
app.get("/api/reviews", reviews_get_47);
app.post("/api/reviews", reviews_post_48);
app.get("/api/rewards/characters", rewards_characters_get_49);
app.post("/api/rewards/check-badges", rewards_check_badges_post_50);
app.get("/api/rewards/milestones", rewards_milestones_get_51);
app.post("/api/rewards/reward-email", rewards_reward_email_post_52);
app.post("/api/rewards/set-character", rewards_set_character_post_53);
app.post("/api/rewards/unlock", rewards_unlock_post_54);
app.get("/api/streak", streak_get_55);
app.post("/api/streak/freeze", streak_freeze_post_56);
app.post("/api/stripe/create-checkout-session", stripe_create_checkout_session_post_57);
app.get("/api/stripe/session/:sessionId", stripe_session_sessionId_get_58);
app.get("/api/subscription", subscription_get_59);
app.post("/api/subscription/activate", subscription_activate_post_60);
app.post("/api/subscription/activate-school", subscription_activate_school_post_61);
app.post("/api/subscription/cancel", subscription_cancel_post_62);
app.post("/api/subscription/create-trial", subscription_create_trial_post_63);
app.get("/api/subscription/trial-status", subscription_trial_status_get_64);
app.post("/api/teacher/login", teacher_login_post_65);
app.get("/api/teacher/me", teacher_me_get_66);
app.post("/api/teacher/register", teacher_register_post_67);
app.get("/api/teacher/student-lookup", teacher_student_lookup_get_68);
app.get("/api/teacher/students", teacher_students_get_69);
app.post("/api/teacher/students", teacher_students_post_70);
app.get("/api/teacher/students/:studentId", teacher_students_studentId_get_71);
app.post("/api/teacher/students/:studentId/activity", teacher_students_studentId_activity_post_72);
app.post("/api/teacher/students/:studentId/notes", teacher_students_studentId_notes_post_73);
app.post("/api/track/pageview", track_pageview_post_74);
app.post("/api/webhook/stripe", webhook_stripe_post_75);
// </api-registrations>

let isInitialized = false;
const initializeProject = async () => {
  if (isInitialized) return;
  isInitialized = true;

  // Local phone testing can run Archie AI without a MySQL server.
  // Only attempt database bootstrap when database credentials were explicitly supplied.
  const hasDatabaseConfig = Boolean(
    process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || process.env.DATABASE_URL || process.env.NOMAD_TASK_DIR
  );

  if (!hasDatabaseConfig) {
    console.log('[init] Database credentials not supplied; skipping database bootstrap for local AI testing.');
    return;
  }

  // Initialize BetterAuth tables if missing
  const initAuthTables = async () => {
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS user (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255),
          email VARCHAR(255) NOT NULL UNIQUE,
          email_verified TINYINT(1) DEFAULT 0,
          image TEXT,
          is_admin TINYINT(1) DEFAULT 0,
          role VARCHAR(32) DEFAULT 'parent',
          phone_number VARCHAR(32) DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS session (
          id VARCHAR(255) PRIMARY KEY,
          expires_at TIMESTAMP NOT NULL,
          token VARCHAR(255) NOT NULL UNIQUE,
          ip_address VARCHAR(45),
          user_agent TEXT,
          user_id VARCHAR(255) NOT NULL REFERENCES user(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS account (
          id VARCHAR(255) PRIMARY KEY,
          account_id VARCHAR(255) NOT NULL,
          provider_id VARCHAR(255) NOT NULL,
          user_id VARCHAR(255) NOT NULL REFERENCES user(id) ON DELETE CASCADE,
          access_token TEXT,
          refresh_token TEXT,
          id_token TEXT,
          access_token_expires_at TIMESTAMP NULL,
          refresh_token_expires_at TIMESTAMP NULL,
          scope TEXT,
          password VARCHAR(255),
          issuer VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS verification (
          id VARCHAR(255) PRIMARY KEY,
          identifier VARCHAR(255) NOT NULL,
          value VARCHAR(255) NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Core auth tables initialized');
    } catch (err: any) {
      console.warn('⚠️  Auth table initialization warning:', err instanceof Error ? err.message : String(err));
    }
  };

  await initAuthTables();

  // Add phone_number and role columns to user table (in case table already existed without them)
  db.execute(sql`ALTER TABLE user ADD COLUMN role VARCHAR(32) DEFAULT 'parent'`).catch(() => {});
  db.execute(sql`ALTER TABLE user ADD COLUMN is_admin TINYINT(1) DEFAULT 0`).catch(() => {});
  db.execute(sql`ALTER TABLE user ADD COLUMN phone_number VARCHAR(32) DEFAULT NULL`).catch(() => {});

  // Seed permanent promo codes — runs on every server start (upsert, safe to repeat)
  for (const [code, description] of [
    ['1182', 'Permanent founder access code'],
    ['4718', 'Permanent owner access code'],
    ['040718', 'Permanent unlimited access code'],
  ] as const) {
    db.insert(promoCodes).values({
      code,
      description,
      accessType: 'free',
      maxUses: null,
      active: true,
      expiresAt: null,
    }).onDuplicateKeyUpdate({ set: { active: true, maxUses: null, expiresAt: null } })
      .then(() => console.log(`✅ Promo code ${code} active (permanent, unlimited)`))
      .catch((err: unknown) => console.warn(`⚠️  Promo seed ${code} skipped:`, (err as Error).message));
  }

  // Create newsletter_subscribers table if it doesn't exist
  db.execute(sql`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `).then(() => console.log('✅ newsletter_subscribers table ready'))
    .catch((err: unknown) => console.warn('⚠️  newsletter_subscribers migration skipped:', (err as Error).message));

  // Create referrals table if it doesn't exist
  db.execute(sql`
    CREATE TABLE IF NOT EXISTS referrals (
      id INT AUTO_INCREMENT PRIMARY KEY,
      referrer_user_id VARCHAR(255) NOT NULL,
      referral_code VARCHAR(32) NOT NULL,
      referred_user_id VARCHAR(255) DEFAULT NULL,
      converted TINYINT(1) DEFAULT 0,
      reward_granted TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      converted_at TIMESTAMP NULL DEFAULT NULL,
      INDEX idx_referrer (referrer_user_id),
      INDEX idx_code (referral_code)
    )
  `).then(() => console.log('✅ referrals table ready'))
    .catch((err: unknown) => console.warn('⚠️  referrals migration skipped:', (err as Error).message));

  // Add cancel columns to subscriptions table (safe ALTER — ignored if already exists)
  db.execute(sql`ALTER TABLE subscriptions ADD COLUMN cancel_reason VARCHAR(255) DEFAULT NULL`)
    .catch(() => {});
  db.execute(sql`ALTER TABLE subscriptions ADD COLUMN cancelled_at TIMESTAMP NULL DEFAULT NULL`)
    .catch(() => {});
  // Add stripe_subscription_id column so cancel can find the Stripe sub directly
  db.execute(sql`ALTER TABLE subscriptions ADD COLUMN stripe_subscription_id VARCHAR(255) DEFAULT NULL`)
    .then(() => console.log('✅ subscriptions.stripe_subscription_id column ready'))
    .catch(() => console.log('ℹ️  subscriptions.stripe_subscription_id already exists — skipping'));

  // Add freeze columns to streak_tracker table
  db.execute(sql`ALTER TABLE streak_tracker ADD COLUMN freeze_active TINYINT(1) DEFAULT 0`)
    .catch(() => {});
  db.execute(sql`ALTER TABLE streak_tracker ADD COLUMN freeze_used_at TIMESTAMP NULL DEFAULT NULL`)
    .catch(() => {});

  // Battles table
  db.execute(sql`
    CREATE TABLE IF NOT EXISTS battles (
      id VARCHAR(12) PRIMARY KEY,
      game_slug VARCHAR(100) NOT NULL,
      game_title VARCHAR(255) NOT NULL,
      game_emoji VARCHAR(10) DEFAULT '🎮',
      subject VARCHAR(50) DEFAULT 'maths',
      creator_user_id VARCHAR(255) NOT NULL,
      creator_name VARCHAR(255) DEFAULT 'Player 1',
      creator_score INT DEFAULT NULL,
      creator_stars INT DEFAULT NULL,
      challenger_user_id VARCHAR(255) DEFAULT NULL,
      challenger_name VARCHAR(255) DEFAULT NULL,
      challenger_score INT DEFAULT NULL,
      challenger_stars INT DEFAULT NULL,
      status VARCHAR(20) DEFAULT 'waiting',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `).then(() => console.log('✅ battles table ready'))
    .catch((err: unknown) => console.warn('⚠️ battles migration skipped:', (err as Error).message));
  db.execute(sql`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(255) DEFAULT NULL,
      endpoint TEXT NOT NULL,
      p256dh VARCHAR(512) NOT NULL,
      auth_key VARCHAR(255) NOT NULL,
      device_label VARCHAR(255) DEFAULT 'browser',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_endpoint (endpoint(512))
    )
  `).then(() => console.log('✅ push_subscriptions table ready'))
    .catch((err: unknown) => console.warn('⚠️  push_subscriptions migration skipped:', (err as Error).message));

  // Seed reward characters — 100-star intervals, all original Sodafom characters
  // runCharacterMigration also adds active_character_id column to children (safe re-run)
  await runCharacterMigration();
  await runGameLevelsMigration();
};

// Non-blocking initialization
initializeProject()
  .then(() => console.log('[init] Project initialization completed'))
  .catch(err => console.error('[init] Project initialization failed:', err));





// Error middleware must be registered AFTER the routes it protects
app.use("/api", (err: unknown, req: Request, res: Response, _next: NextFunction) => {
	console.error("ssr.api.error", {
		url: req.url,
		error: err instanceof Error ? err.stack : String(err),
	});
	res.status(500).json({
    error: "Internal server error",
    message: err instanceof Error ? err.message : String(err)
  });
});

function baseUrl(req: Request): string {
	return `${req.protocol}://${req.hostname}`;
}

function escapeXml(s: string): string {
	const xmlEntities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
	// eslint-disable-next-line security/detect-object-injection
	return s.replace(/[&<>"']/g, (c) => xmlEntities[c] ?? c);
}

// Serve og-image.svg as og-image.png so social crawlers accept it
app.get("/og-image.png", (req, res) => {
	const svgPath = join(dirname(new URL(import.meta.url).pathname), "client", "og-image.svg");
	try {
		// eslint-disable-next-line security/detect-non-literal-fs-filename
		const svg = readFileSync(svgPath);
		res.set("Content-Type", "image/svg+xml");
		res.set("Cache-Control", "public, max-age=86400");
		res.send(svg);
	} catch {
		res.status(404).send("Not found");
	}
});

app.get("/robots.txt", (req, res) => {
	if (isSystemHost(req)) {
		res
			.type("text/plain")
			.set("Cache-Control", "public, max-age=60, must-revalidate").set("Vary", "Host")
			.send("User-agent: *\nDisallow: /\n");
		return;
	}
	const base = baseUrl(req);
	const body = [
		"User-agent: *",
		"Allow: /",
		"",
		`Sitemap: ${base}/sitemap.xml`,
		"",
	].join("\n");
	res.type("text/plain").set("Cache-Control", "public, max-age=60, must-revalidate").set("Vary", "Host").send(body);
});

app.get("/sitemap.xml", (req, res) => {
	if (isSystemHost(req)) {
		const empty = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>\n`;
		res.type("application/xml").set("Cache-Control", "public, max-age=60, must-revalidate").set("Vary", "Host").send(empty);
		return;
	}
	const base = baseUrl(req);
	const urls = seoRoutes
		.filter((r) => typeof r.path === "string" && r.path.startsWith("/"))
		.map((r) => {
			const loc = `${base}${r.path}`;
			const parts = [`    <loc>${escapeXml(loc)}</loc>`];
			if (r.lastmod) parts.push(`    <lastmod>${escapeXml(r.lastmod)}</lastmod>`);
			if (r.changefreq) parts.push(`    <changefreq>${r.changefreq}</changefreq>`);
			if (r.priority !== undefined)
				parts.push(`    <priority>${r.priority.toFixed(1)}</priority>`);
			return `  <url>\n${parts.join("\n")}\n  </url>`;
		})
		.join("\n");
	const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
	res.type("application/xml").set("Cache-Control", "public, max-age=60, must-revalidate").set("Vary", "Host").send(body);
});

app.get("/llms.txt", llmsTxtHandler);

if (import.meta.env.PROD) {
	const __dirname = dirname(fileURLToPath(import.meta.url));
	const clientDir = join(__dirname, "client");
	const adSenseRuntimeConfig = loadAdSenseRuntimeConfig(__dirname);
	const indexNowKey = loadIndexNowKey(__dirname);

	registerAdSenseTextRoutes(app, adSenseRuntimeConfig);

	if (indexNowKey !== null) {
		app.get(`/${indexNowKey}.txt`, (_req, res) => {
			res.type("text/plain").set("Cache-Control", "public, max-age=86400").send(indexNowKey);
		});
	}

	app.use(
		express.static(clientDir, {
			index: false,
			setHeaders(res, filePath) {
				res.set(
					"Cache-Control",
					filePath.includes("/assets/")
						? "public, max-age=31536000, immutable"
						: "no-cache",
				);
			},
		}),
	);

	app.use((_req, res, next) => {
		res.set("Cache-Control", "no-cache");
		next();
	});

	let template: string;
	try {
		template = readFileSync(join(clientDir, "index.html"), "utf-8");
	} catch (err) {
		console.error("ssr.template.load-failed", {
			path: join(clientDir, "index.html"),
			error: err instanceof Error ? err.message : String(err),
		});
		process.exit(1);
	}
	if (!template.includes("<!--app-head-->") || !template.includes("<!--app-html-->")) {
		// Fail fast at boot, same as a template load failure above: without
		// markers, every .replace() call on the render path is a no-op and we
		// would serve a shell with no <head> content and no rendered body on
		// every request. Preferring process.exit over a degraded mode ensures
		// an operator notices and fixes the build rather than serving broken
		// SEO-invisible pages indefinitely.
		console.error("ssr.template.markers-missing", {
			hasHead: template.includes("<!--app-head-->"),
			hasHtml: template.includes("<!--app-html-->"),
		});
		process.exit(1);
	}
	const fallbackShell = template
		.replace("<!--app-head-->", "")
		.replace("<!--app-html-->", "");

	// Resolve the SSR module once into a stable render function. A failed
	// load is unrecoverable at runtime - exiting lets the container
	// scheduler restart with a clean slate rather than leaving the server
	// to serve silent 503s indefinitely against a single startup log.
	let renderFn: ((url: string) => Promise<SsrRenderResult>) | null = null;
	const SSR_MODULE_LOAD_TIMEOUT_MS = 30_000;
	const loadTimeout = setTimeout(() => {
		if (renderFn !== null) return;
		console.error("ssr.module.load-timeout", {
			timeoutMs: SSR_MODULE_LOAD_TIMEOUT_MS,
		});
		process.exit(1);
	}, SSR_MODULE_LOAD_TIMEOUT_MS);
	loadTimeout.unref();
	import("../entry-server").then(
		(mod) => {
			clearTimeout(loadTimeout);
			renderFn = mod.render;
		},
		(err) => {
			clearTimeout(loadTimeout);
			console.error("ssr.module.load-failed", {
				error: err instanceof Error ? err.stack : String(err),
			});
			process.exit(1);
		},
	);

	app.get(/.*/, async (req, res, next) => {
		if (req.method !== "GET") return next();
		if (req.path.startsWith("/api")) return next();
		if (extname(req.path)) return next();
		const sendFallback = () =>
			res
				.status(503)
				.set("Content-Type", "text/html; charset=utf-8")
				.set("Cache-Control", "no-store")
				.send(fallbackShell);
		if (renderFn === null) {
			// Module not yet resolved; fall back without logging to avoid startup
			// noise before the first render is even possible. A terminal load
			// failure (import reject or 30s timeout) process.exit(1)s from the
			// loader above, so this branch is only the brief warmup window.
			return sendFallback();
		}
		try {
			const result = await renderFn(req.url);
			if (result.redirect) {
				// Redirect thrown from a loader/action surfaces as a Response.
				// Forward it so the browser actually navigates to the new URL
				// instead of seeing an empty shell with a stale status.
				res.redirect(result.status, result.redirect);
				return;
			}
			if (!result.html) {
				// A non-redirect Response was thrown from a loader (e.g.
				// `throw new Response(null, { status: 404 })`). renderToString
				// produced no markup, so we have a real status but no body.
				// Log so the case is observable in ops dashboards, and mark
				// no-store so CDNs don't cache an empty page as a valid hit.
				// User-visible 404 / error pages should come from a route
				// errorElement, not from this fallback path.
				console.error("ssr.render.error-response", {
					url: req.url,
					status: result.status,
				});
				res
					.status(result.status)
					.set("Content-Type", "text/html; charset=utf-8")
					.set("Cache-Control", "no-store")
					.send(fallbackShell);
				return;
			}
			// Per-host SEO injection. System URLs get a noindex meta so
			// crawlers drop them from the index over time; customer-attached
			// hosts get a self-canonical link so search engines treat them
			// as authoritative for the rendered content.
			const seoHead = isSystemHost(req)
				? `<meta name="robots" content="noindex,nofollow">`
				: `<link rel="canonical" href="${escapeXml(`${req.protocol}://${req.hostname}${req.path}`)}">`;
			// Function replacements disable String.replace's $-special sequences
			// ($&, $', $`, $$) so user-authored titles / JSON-LD like
			// "Save $& today" insert literally instead of being interpolated.
			const out = renderSsrDocument(
				template,
				{ ...result, head: seoHead + result.head },
				adSenseRuntimeConfig,
			);
			res
				.status(result.status)
				.set("Content-Type", "text/html; charset=utf-8")
				.set("Cache-Control", "no-cache")
				.send(out);
		} catch (err) {
			// 503 surfaces the failure in CDN/monitoring without caching a broken
			// page as success. console.error (not warn) puts it at the right log
			// level for the observability pipeline to alert on.
			console.error("ssr.render.failed", {
				url: req.url,
				// Log the full stack — React's renderToString annotates it with
				// the failing component's call tree, which the message alone
				// discards.
				error: err instanceof Error ? err.stack : String(err),
			});
			sendFallback();
		}
	});

	const shutdown = async (signal: string) => {
		console.log(`Got ${signal}, shutting down gracefully...`);
		// Scope the ERR_MODULE_NOT_FOUND suppression to the import() only.
		// A closeConnection() failure that happens to carry the same code
		// (unlikely but possible for wrapped errors) must not be silently
		// swallowed - it indicates a real db-close failure worth logging.
		let mod: { closeConnection?: () => Promise<void> | void } | null = null;
		try {
			const dbClient = "./db/client" + ".js";
			// Source-literal optional module path; no request, environment, or user input reaches import().
			// eslint-disable-next-line no-unsanitized/method
			mod = await import(/* @vite-ignore */ dbClient);
		} catch (error: unknown) {
			const code = (error as { code?: string } | null)?.code;
			if (code !== "ERR_MODULE_NOT_FOUND") {
				console.error("ssr.shutdown.db-import-failed", {
					error: error instanceof Error ? error.message : String(error),
				});
			}
		}
		if (mod && typeof mod.closeConnection === "function") {
			try {
				await mod.closeConnection();
				console.log("Database connections closed");
			} catch (error: unknown) {
				console.error("ssr.shutdown.db-close-failed", {
					error: error instanceof Error ? error.message : String(error),
				});
			}
		}
		process.exit(0);
	};

	(["SIGTERM", "SIGINT"] as const).forEach((signal) => {
		process.once(signal, () => {
			void shutdown(signal);
		});
	});

	const rawPort = process.env.PORT || "3000";
	const port = parseInt(rawPort, 10);
	if (!Number.isInteger(port) || port <= 0 || port > 65535) {
		// parseInt("abc") returns NaN; passing that to app.listen throws
		// synchronously before the server.on("error") handler below can catch
		// it. Fail fast with an actionable log rather than a cryptic crash.
		console.error("ssr.server.invalid-port", { rawPort });
		process.exit(1);
	}
	const host = process.env.HOST || "0.0.0.0";
	const server = app.listen(port, host, () => {
		console.log(`Server listening on http://${host}:${port}`);
	});
	server.on("error", (err: NodeJS.ErrnoException) => {
		console.error("ssr.server.listen-failed", {
			port,
			host,
			code: err.code,
			error: err.message,
		});
		process.exit(1);
	});
}

export default app;

/**
 * BetterAuth Server Configuration
 *
 * Supports both Email/Password and OAuth authentication.
 * Enable/disable methods by uncommenting the relevant sections.
 *
 * Secrets (via getSecret from #airo/secrets):
 * - BETTER_AUTH_SECRET: Session encryption key (auto-generated during install)
 * - OAuth credentials (GOOGLE_CLIENT_ID, etc.) for social login
 *
 * CORS/Trusted Origins:
 * - Only trusts origins matching the server's hostname
 */

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { existsSync, readFileSync } from 'node:fs';

import { db } from '@/server/db/client';
import { user, session, account, verification } from '@/server/db/schema';
import { getSecret } from '#airo/secrets';
import { sendEmail } from '@/server/email';

const OWNER_EMAIL = 'sodafom.uk@gmail.com';

async function notifyOwnerOfSignup(newUser: { name?: string | null; email: string; phoneNumber?: string | null }) {
  // Skip email notification in local development to avoid hangs/timeouts
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[auth] skipping signup notification for ${newUser.email} (local dev)`);
    return;
  }
  try {
    const date = new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' });
    await sendEmail({
      fromName: 'Sodafom Signups',
      to: OWNER_EMAIL,
      subject: `🎉 New Sodafom signup — ${newUser.name || newUser.email}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 12px;">
          <div style="background: #2D6A4F; padding: 20px 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: #FFD700; margin: 0; font-size: 22px;">🎉 New Signup — Sodafom</h1>
          </div>
          <div style="background: #ffffff; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555; width: 140px;">Name:</td><td style="padding: 8px 0; color: #222;">${newUser.name || 'Not provided'}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${newUser.email}" style="color: #2D6A4F;">${newUser.email}</a></td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Phone:</td><td style="padding: 8px 0; color: #222;">${newUser.phoneNumber || 'Not provided'}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Date:</td><td style="padding: 8px 0; color: #222;">${date}</td></tr>
            </table>
            <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
            <p style="color: #2D6A4F; font-weight: bold; margin: 0;">A new parent has created an account on Sodafom!</p>
          </div>
        </div>
      `,
      text: `New Sodafom Signup\n\nName: ${newUser.name || 'N/A'}\nEmail: ${newUser.email}\nPhone: ${newUser.phoneNumber || 'N/A'}\nDate: ${date}`,
    });
    console.log(`[auth] signup notification sent for ${newUser.email}`);
  } catch (err) {
    // Non-fatal — don't block signup if email fails
    console.error('[auth] failed to send signup notification:', err);
  }
}

// Lazy singleton — betterAuth() must NOT run at module init time.
//
// The BETTER_AUTH_SECRET is loaded from the alloc config at runtime, so the
// auth instance must be constructed after the secrets are available (i.e. on
// the first HTTP request, not at import time).
//
// Pattern mirrors how db/client.ts defers the actual MySQL connection — the
// pool object is safe to create at init, but anything that reads schema state
// or secrets must be deferred to request time.
let _auth: ReturnType<typeof betterAuth> | null = null;

export function getAuth() {
  if (_auth) return _auth;

  let authSecret = getSecret('BETTER_AUTH_SECRET');

  // Fallback for local development
  if (!authSecret && process.env.NODE_ENV !== 'production' && existsSync('.env')) {
    try {
      const envContent = readFileSync('.env', 'utf-8');
      const match = envContent.match(/BETTER_AUTH_SECRET=([^\s]+)/);
      if (match) {
        authSecret = match[1].replace(/^["']|["']$/g, "");
        process.env.BETTER_AUTH_SECRET = authSecret as string;
      }
    } catch (err) {
      console.warn('[auth] Failed to read secret from .env fallback:', err);
    }
  }

  if (!authSecret || typeof authSecret !== 'string') {
    throw new Error('BETTER_AUTH_SECRET is not set or invalid — run requestSecrets() first or ensure .env is present');
  }


  if (!db) {
    throw new Error('Database not configured. Install the database skill first, then configure auth.');
  }

  const auth = betterAuth({
    // Schema passed explicitly — avoids BetterAuth's runtime schema inference.
    database: drizzleAdapter(db, {
      provider: 'mysql',
      schema: { user, session, account, verification },
    }),

    secret: authSecret,

    // Set baseURL so BetterAuth can construct absolute callback/redirect URLs.
    // In local development or preview, we let BetterAuth derive the base URL
    // from the incoming request headers (x-forwarded-host, etc.)
    baseURL: (process.env.AIRO_PREVIEW === 'true' || process.env.NODE_ENV === 'development')
      ? undefined
      : 'https://sodafom.uk',

    // Protect admin status field from user input
    user: {
      additionalFields: {
        isAdmin: {
          type: 'boolean',
          defaultValue: false,
          input: false,  // Prevent clients from writing this field
          returned: true,
        },
        role: {
          type: 'string',
          defaultValue: 'parent',
          input: false,
          returned: true,
        },
        phoneNumber: {
          type: 'string',
          required: false,
          input: true,
          returned: true,
        },
      },
    },

    // CORS: Trusts .airoapp.ai subdomains, sodafom.uk, and localhost.
    trustedOrigins: (request?: Request) => {
      // Always trust these fixed origins
      const ALWAYS_TRUSTED = [
        'https://sodafom.uk',
        'https://www.sodafom.uk',
      ];

      if (!request) return ALWAYS_TRUSTED;

      const origin = request.headers.get('origin');
      if (!origin) return ALWAYS_TRUSTED;

      try {
        const originUrl = new URL(origin);
        const hostname = originUrl.hostname;

        // Trust all airoapp.ai subdomains (preview/builder)
        if (hostname.endsWith('.airoapp.ai') || hostname.endsWith('.test-airoapp.ai')) {
          return [...ALWAYS_TRUSTED, origin];
        }

        // Trust localhost for development
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          return [...ALWAYS_TRUSTED, origin];
        }

        // Trust sodafom.uk and subdomains
        if (hostname === 'sodafom.uk' || hostname.endsWith('.sodafom.uk')) {
          return [...ALWAYS_TRUSTED, origin];
        }

        return ALWAYS_TRUSTED;
      } catch {
        return ALWAYS_TRUSTED;
      }
    },

    advanced: {
      // Disable CSRF origin check — the preview runs in an iframe on a different
      // origin and the browser strips the Origin header for same-origin requests,
      // causing BetterAuth to reject valid sign-in/sign-up calls with 403.
      // Cookie security is still enforced by SameSite + Secure attributes below.
      disableCSRFCheck: true,

      // In preview mode the site runs in an iframe embedded by the builder on a
      // different origin, so cookies need SameSite=None + Secure + Partitioned
      // (CHIPS) for cross-site access. In publish mode use the safer SameSite=Lax.
      ...(process.env.AIRO_PREVIEW === 'true' && {
        defaultCookieAttributes: {
          sameSite: 'none' as const,
          secure: true,
          partitioned: true,
        },
      }),
    },

    emailAndPassword: {
      enabled: true,
      sendResetPassword: async ({ user: resetUser, url }) => {
        await sendEmail({
          fromName: 'Sodafom',
          to: resetUser.email,
          subject: 'Reset your Sodafom password',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 12px;">
              <div style="background: #2D6A4F; padding: 20px 24px; border-radius: 8px 8px 0 0; text-align: center;">
                <h1 style="color: #FFD700; margin: 0; font-size: 24px;">🔑 Reset your password</h1>
              </div>
              <div style="background: #ffffff; padding: 28px 24px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
                <p style="color: #333; font-size: 16px; margin: 0 0 16px;">Hi ${resetUser.name ?? 'there'},</p>
                <p style="color: #555; font-size: 15px; margin: 0 0 24px;">
                  We received a request to reset your Sodafom password. Click the button below to choose a new one.
                  This link expires in <strong>1 hour</strong>.
                </p>
                <div style="text-align: center; margin: 28px 0;">
                  <a href="${url}"
                     style="display: inline-block; background: #2D6A4F; color: #FFD700; font-weight: bold; font-size: 16px;
                            padding: 14px 32px; border-radius: 8px; text-decoration: none;">
                    Reset my password
                  </a>
                </div>
                <p style="color: #888; font-size: 13px; margin: 24px 0 0;">
                  If you didn't request this, you can safely ignore this email — your password won't change.
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="color: #aaa; font-size: 12px; margin: 0; text-align: center;">
                  Sodafom · Fun learning for kids aged 5–13 · <a href="https://sodafom.uk" style="color: #2D6A4F;">sodafom.uk</a>
                </p>
              </div>
            </div>
          `,
          text: `Hi ${resetUser.name ?? 'there'},\n\nReset your Sodafom password by visiting this link (expires in 1 hour):\n\n${url}\n\nIf you didn't request this, ignore this email.\n\n— Sodafom`,
          sameDomainFallback: true,
        });
      },
    },

    databaseHooks: {
      user: {
        create: {
          after: async (newUser) => {
            await notifyOwnerOfSignup({
              name: newUser.name,
              email: newUser.email,
              // @ts-ignore - custom field in database
              phoneNumber: newUser.phoneNumber,
            });
          },
        },
      },
    },

    // socialProviders: {
    //   google: {
    //     clientId: getSecret('GOOGLE_CLIENT_ID') as string,
    //     clientSecret: getSecret('GOOGLE_CLIENT_SECRET') as string,
    //   },
    //   github: {
    //     clientId: getSecret('GITHUB_CLIENT_ID') as string,
    //     clientSecret: getSecret('GITHUB_CLIENT_SECRET') as string,
    //   },
    // },
  });

  _auth = auth as unknown as ReturnType<typeof betterAuth>;
  return auth as unknown as ReturnType<typeof betterAuth>;
}

export type Session = ReturnType<typeof getAuth>['$Infer']['Session'];
export type User = ReturnType<typeof getAuth>['$Infer']['Session']['user'];

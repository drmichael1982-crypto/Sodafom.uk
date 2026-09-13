# Agent Root — Authentication Review Report

- **Agent number:** Root (primary coordinating agent)
- **Original task:** Explain this repository's authentication using code and docs: components, request flow, and how credentials and tokens are handled.
- **Repository:** `drmichael1982-crypto/Sodafom.uk`
- **Branch:** `agent-root-auth-review-20260913`
- **Base branch / revision:** `main` at `305401dd15acfaa60d8bd12f32a1aafd5f351f34`
- **Latest commit ID:** This report is itself the branch-head commit; its exact SHA is supplied in the final GitHub handoff because a Git commit cannot contain its own hash.
- **Pushed:** Yes — this report was created directly on the GitHub branch.

## Completed

Completed a source-and-documentation review of the two live authentication paths:

1. Parent/owner accounts use Better Auth, Drizzle/MySQL and HttpOnly cookie sessions.
2. Teacher Hub uses its own custom random bearer token stored in browser localStorage.

The written review covers client components, Express routing, session lookup, database tables, reset flow, logout/recovery behaviour, secret configuration, and the separate teacher flow.

## Tests performed

- Read and cross-checked the auth client, Better Auth configuration, Express adapter/middleware, dynamic API routes, session-recovery code, database schema, parent/teacher pages, teacher API endpoints, admin endpoints and deployment notes.
- Confirmed the parent flow preserves request cookies through the Express-to-Web adapter and preserves separate `Set-Cookie` response headers.
- Confirmed that the report file exists on this branch after the GitHub commit.
- No application source was changed, so no functional application test run was required for this handoff.
- Repository review found no dedicated parent-auth/session test files; the only matching test found was `src/lib/__tests__/teacher-mode.test.ts`.

## Passed

- Better Auth is configured with a database adapter and a server-side `BETTER_AUTH_SECRET`.
- Parent identity is generally derived server-side with `auth.api.getSession({ headers })`.
- Parent/child endpoints commonly check `parentId` ownership.
- Password-reset responses avoid email enumeration.
- The session-recovery mechanism clears stale HttpOnly Better Auth cookies server-side and is guarded against reload loops.
- Teacher tokens are cryptographically random, expiry-checked server-side, and parsed as Bearer tokens.

## Failed / needs work before production

- A client-side `sodafom_free_access` localStorage bypass fabricates an authenticated admin user.
- Admin access has hard-coded/default fallback codes and several endpoints accept a code instead of requiring a real administrator session. Some use `BETTER_AUTH_SECRET` itself as an admin key.
- The Express CORS middleware reflects arbitrary request origins while allowing credentials; Better Auth also disables CSRF checking globally.
- Teacher passwords use one fast SHA-256 hash with a source-visible static salt, rather than a password KDF such as Argon2id/bcrypt/scrypt.
- Teacher bearer tokens are stored in localStorage, returned in JSON, stored raw in the database, and are not server-revoked on logout.
- There are legacy endpoints that expect `req.session` or `req.user`, but the Express entry file has no middleware attaching either. These flows will not reliably authenticate.
- Some teacher/student-code endpoints are deliberately unauthenticated and treat a student code as a credential; rate limiting and scoped access need review.
- `.env` is present in the public repository tree even though the deployment notes say it must not be shared. Its contents were not read or recorded; validate it immediately, remove it from Git history if it ever contained a real secret, and rotate exposed credentials.
- OAuth provider configuration is commented out, so the generic OAuth UI is not a live configured login path.

## Shared files / merge conflicts

- Added only `agent-reports/AGENT-ROOT-REPORT.md`.
- No application files changed; merge conflict risk is limited to other work that creates or edits the same agent-report file.
- The task was review-only. Authentication fixes should be implemented in a dedicated security branch after prioritisation.

## Deployment and branch confirmation

- No merge into `main` or `master` was performed.
- No Railway deployment was performed.
- This branch is the official handoff branch for this review.

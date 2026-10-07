# Parent accounts in the standalone preview

The learning library continues to work with accounts disconnected. This backend
uses the installed Better Auth library and existing MySQL auth-table definitions.
It does not create a database, run migrations, send email, create a paid service,
or activate payments. No live login or database connectivity is claimed by this
document. Mocked unit checks do not establish a real deployment is ready.

The legacy auth profile is deliberately not mounted: it disables CSRF checking,
trusts broad dynamic origins, and can notify the owner of signups. The legacy DB
proxy can fall back to a mock and disables remote certificate verification. The
preview's isolated profile uses neither fallback nor notification hooks.

## Explicit server setup

An owner must supply these server environment values through their existing
secret manager or local process environment. Never use `VITE_` variables for them,
commit a real environment file, paste credentials into lesson content, or share
the values in screenshots/logs. Restart the server after configuration changes.

- `ARCHIE_PARENT_ACCOUNTS_ENABLED=true` explicitly enables account infrastructure.
- `BETTER_AUTH_SECRET`: a freshly generated, unpredictable server secret of at
  least 32 characters. The preview rejects trivial/repeated/placeholder strings.
- `BETTER_AUTH_URL`: the exact app origin, including the correct local port.
  HTTPS is required except loopback HTTP for non-production development. Paths,
  fragments, credentials and arbitrary dynamic origins are rejected.
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`; optional `DB_PORT` (default 3306).
  Equivalent `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`,
  `MYSQL_PORT` are accepted. No implicit passwordless root database is used.
- `ARCHIE_PARENT_DB_TLS=true` is mandatory for a non-loopback database. Certificates
  must validate against the server's trusted roots; invalid TLS fails closed.

Use an existing persistent database with a least-privilege account and backups.
Do not point development at a production family database. The required existing
tables are `user`, `session`, `account`, `verification`, with the columns declared
in `src/server/db/schema.ts`, including protected `is_admin`/`role` user fields.
Better Auth stores password hashes and opaque session credentials in the DB;
the application does not implement its own password hashing or browser storage.

The installed Better Auth 1.7.1 account model requires an `issuer` column and a
unique identity constraint on `(issuer, account_id)`. An older database needs a
reviewed migration and correct issuer backfill for existing credential/OAuth
records; do not guess issuer values or merge distinct identities. The app's
read-only readiness probe includes `issuer`, but does not certify backfill,
constraints or write permissions. Inspect the installed version's generated
schema against actual tables and existing records before enabling signup.
Drizzle transactions are explicitly enabled for account creation; the database
tables must use a transaction-capable engine so failed writes can roll back
instead of leaving an orphan user or partial account.

An owner-reviewed migration must also create the preview's persistent rate-limit
table. The server performs read-only schema probes; it never creates this table:

```sql
CREATE TABLE archie_parent_rate_limit (
  id VARCHAR(255) NOT NULL PRIMARY KEY,
  `key` VARCHAR(255) NOT NULL UNIQUE,
  count INT NOT NULL,
  last_request BIGINT NOT NULL
);
```

Do not run the SQL blindly: inspect the actual database, schema compatibility,
collation/index limits and backup/restore plan first. If the installed Better Auth
version is changed, review its generated Drizzle schema and migration requirements.
The app exposes a safe unavailable state when tables or permissions are missing.

## HTTP contract

- `GET /api/parents/account-status`: HTTP 200 with `state` (`disconnected`, `ready`,
  `unavailable`), `configured`, `ready`, `message`, and non-secret setup labels in
  `missing`. Readiness requires successful real DB/table probes. It does not imply
  email verification, cloud progress or payments: all three capability flags are
  currently false. Status responses never reveal DB hosts, passwords or secrets.
- `POST /api/auth/sign-up/email`: JSON `{name,email,password}`. Name identifies the
  grown-up, maximum 100 characters. No child/private family information is needed.
- `POST /api/auth/sign-in/email`: JSON `{email,password}`, optional `rememberMe`.
- `POST /api/auth/sign-out`: JSON `{}`; send existing session cookies.
- `GET /api/auth/get-session`: real current-session lookup; HTTP 200 `null` when
  accounts are disconnected so the app's normal session hook can settle.

Use same-origin requests with JSON and `credentials: 'include'`. Browsers supply
the Origin header; the server requires its exact configured value on every
account POST and rejects cross-site fetch metadata. Better Auth's own CSRF/origin
checks remain enabled. Unknown fields, including `role`, `isAdmin`, child records
or provider keys, are rejected. Unavailable account writes return 503; other
operations return 404. Normal authentication validation returns 4xx; rate limits
return 429 with retry headers. A signup is successful only after a genuine 2xx
response. Never retain or log the password after submitting it.

Cookies use a separate `sodafom-parent` namespace, HttpOnly and SameSite=Lax;
HTTPS uses Secure cookies. Cross-site iframe login is intentionally unsupported.
Session cookie caching is disabled so server-only account-key routing checks the
persistent session. A client-supplied account ID is never used as identity.
Default signup role is parent and protected admin fields cannot be supplied.
The local `1182` preview gate has no server login or admin authority, and the
preview client ignores the legacy `sodafom_free_access` fake-admin session.

Rate limits are explicitly enabled in development and production and persisted
in the database: five sign-in attempts / minute, three signups / minute, ten
sign-outs / minute, with a general 60 requests / minute limit. The server uses the
direct socket IP and overwrites spoofable forwarded identity headers. If deployed
behind a reverse proxy, its address may become the shared rate-limit identity;
review a restricted, trusted proxy configuration before public rollout rather
than accepting arbitrary forwarded IP headers.

## Checks still required before public parent accounts

Verify two synthetic parents can sign up/login/logout; each session and each
server-side key belongs only to its actual account. Check password hash storage,
cookie attributes, cross-origin rejection, rate limiting across server restarts,
schema/write permissions and failure states with the deployed database. Check
HTTPS/proxy/device cookies on the real deployment. This work has not provisioned
infrastructure or executed those live checks.

Email verification and password-reset delivery are not connected. Signup does
not establish ownership of an email address; recovery is unavailable. Connect
and test an owner-approved email provider and verified-account policy before a
public launch. Never imply verified parent identity, consent or child age from
account signup alone. Local learning history remains device data; accounts do
not automatically move, associate, upload or partition existing local profiles.

Provider-key and pricing/payment settings are separate server-owned integrations.
Do not treat account setup or the local gate as consent to paid requests, Stripe
activation, live charges, subscription entitlement or an online admin session.

## Primary implementation references

- [Better Auth Express integration](https://better-auth.com/docs/integrations/express)
- [Better Auth security](https://better-auth.com/docs/reference/security)
- [Better Auth rate limits and DB schema](https://better-auth.com/docs/concepts/rate-limit)
- [Better Auth email/password](https://better-auth.com/docs/authentication/email-password)
- [Better Auth Drizzle adapter](https://better-auth.com/docs/adapters/drizzle)

The preview reconstructs a Web Request from JSON parsed only on its isolated
account routes, then calls Better Auth's handler; it does not pass an already
consumed body stream to `toNodeHandler`. Auth routes precede the shared JSON/chat
middleware. Provider routes receive only the cookie-backed server session helper.
The inspected package lock and installed Better Auth version are 1.7.1; the
declared package range starts at 1.6.15. Preserve and review the lockfile, and
recheck schema and security options if upgrading.

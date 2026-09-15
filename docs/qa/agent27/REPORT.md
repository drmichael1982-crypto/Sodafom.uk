# Agent27 — Full-app QA and safe fixes

Date: 13 September 2026  
Repository: `drmichael1982-crypto/Sodafom.uk`  
Branch: `agent27/full-app-qa-safe-fixes-20260913`  
Starting `master`: `058097f78077015980460c0b359903fda5aa83a6`  
Final application-code commit: `0f237cb890c90f2983be6e38fddb3f747b34974d`

## Status

Safe fixes are committed to the Agent27 branch. No master/main write, merge, pull request, Railway change, or deployment was performed. Other agents' branches were inspected only, not imported or changed. The final documentation commit contains this report and standalone QA tools; application code is identical to the application-code commit above.

**Automated QA passed. Full app end-to-end sign-off is BLOCKED, not passed.** This is a test of the master-derived branch, not the combined result of other agents' unmerged feature branches.

## Safe fixes

### 1. Error-screen markup and repeated overlays

The old `src/main.tsx` interpolated an error message, URL and stack directly into `innerHTML` and added another full-screen overlay for every error. HTML-looking error text could become markup, and repeated errors could stack screens.

The handler now calls `src/lib/critical-error-display.ts`. It uses DOM `textContent`, reuses one recovery panel, preserves the existing wording and styling, and keeps the reload control functional. Missing document bodies, inaccessible error stacks and failing string conversions are handled without another reporting exception. No feature or artwork redesign was made.

Evidence: 12 dependency-free regression tests; six assertions at each of two Chromium viewport sizes. The browser checks use the real helper in an in-memory document, not the full application.

### 2. Startup failure when storage is denied or full

The diagnostic flag in `src/lib/config.ts` accessed `localStorage` during module startup without error handling. A denied storage getter, blocked `getItem`, or quota failure in `setItem` could abort startup before the app rendered.

A narrow try/catch now makes only this optional diagnostic flag best-effort. Platform detection, API addresses, AI routing, authentication and payment configuration are unchanged. This is not a claim that every storage access across the app is now hardened.

Evidence: the same 12 tests produce **9 passed / 3 failed** against the original detector and **12 passed / 0 failed** against the fixed detector.

### 3. Admin-auth regression test setup

The original Vitest cookie test supplied a signing secret but not the configured admin-code version required by the existing secure implementation. It failed without developer environment variables.

`src/server/__tests__/admin-auth.test.ts` now isolates its environment, supplies explicit test-only settings for the success case, and adds checks that missing configuration is rejected and code rotation invalidates a previous cookie. **Production admin authentication was not weakened or modified.**

## Executed checks

Final isolated workflow: `34733269702`, job `103659913885`, testing application-code commit `0f237cb890c90f2983be6e38fddb3f747b34974d`.

| Check | Result |
| --- | --- |
| Frozen pnpm 11.23.0 dependency install | PASS; lifecycle scripts disabled |
| Existing Vitest suite, including repaired fixture and two added cases | 227 passed in 32 files |
| Existing island-adventure regressions | 28 passed |
| Existing admin / paid-AI spending-guard regressions | 24 passed |
| Agent27 error-display regressions | 12 passed |
| Agent27 startup-storage regressions | 12 passed |
| Total automated test cases above | 303 passed; zero failed |
| Project TypeScript check | PASS |
| Client and server production build | PASS; build only, not deployment |
| Project ESLint | PASS exit status; 0 errors, 88 warnings retained |
| Static source parse | 523 TypeScript/TSX files; no syntax errors |
| Static route inventory | 233 routes; no duplicate route paths |
| Route imports | 202 checked; none unresolved |
| Selected home/hub/reading/island literal menu destinations | 79 checked; all have registered routes |

Runtime environment: CI Node 22.23.2, TypeScript 5.9.3, pnpm 11.23.0. Local dependency-light checks also ran on Node 22.16.0 with TypeScript 5.8.3. Browser component checks used Chromium 144.0.7559.96 at 1366×900 and 390×844. The latter is a viewport emulation, not an Android or iPhone device test.

The static checks establish source/route consistency only. They do not prove a route renders, that every button works, or that the corresponding feature works end to end.

## Coverage of the requested areas

| Area | Evidence obtained | Still required |
| --- | --- | --- |
| Sign-up / sign-in | Source review; auth/admin/teacher-password tests | Browser form submission, cookie persistence, password recovery and real test-account journey |
| Home / profiles / navigation | Route/import/menu audit; existing home, feature-hub and server-render tests | Full click-through, back/next controls and authenticated profile persistence |
| Ask Archie | Existing local-AI and spending-guard tests | Conversational UI, local-first integration, paid fallback with verified vouchers |
| Lessons | Existing tutor, teacher-mode and curriculum tests | Complete timed lessons, interruptions, marking and saved progress |
| Games | Existing game component/data tests; 28 island tests; 140 individual game routes inventoried | Every game level, next button, score persistence, certificate and sharing flow |
| Reading / homework | Routes and scanner-related source reviewed; paid-provider guard tested | Real camera/upload, page reading, highlighting, explanation and image permissions |
| Voice / microphone | Mocked speech recognition permission, timeout, unsupported-browser and cleanup cases in island suite | Real device permissions, accents/noise, recording, voices and audio mixing |
| Parent / teacher areas | Source/route review and relevant authentication unit coverage | Authorised and unauthorised cross-account access; class/report data end to end |
| Rewards / stickers | Routes/source reviewed; progression tests | Drag/drop sticker saving, unlocking and real reward persistence |
| Notifications | Routes/source reviewed | Parent preferences, delivery times, push permissions, opt-out and no-spam behaviour |

No real account was created, no real child data was accessed, no email or notification was sent, no paid AI was called, and no payment was started during these tests. Backend-related regression suites use fixtures/mocks. Tests/builds run in containers with networking disabled after dependency installation.

## Remaining failures, blockers and warnings

**Browser environment blocker.** Full-page Chromium navigation returned `net::ERR_BLOCKED_BY_ADMINISTRATOR`, including for an isolated local build with every request intercepted. The initial 12-route pilot at two viewport sizes was blocked before app code ran. A smaller alternate-host probe was also blocked. These are environment-blocked checks, not application test passes or confirmed page failures. No attempt was made to change managed browser policy. The in-memory recovery-component checks do run successfully.

**No full live-service or real-device test.** Accounts, database-backed progress, camera, physical microphone, notification delivery and payment/voucher integration remain unverified. No final combined-agent build exists in this branch because merging was prohibited.

**Paid AI remains deliberately paused in this baseline.** `src/server/paid-ai-guard.ts` returns `PAID_AI_BILLING_PENDING` / HTTP 503 for paid chat, photo reading and transcription routes until verified voucher billing is connected. The 24 guard tests confirm that forged client credits cannot bypass it. This spending safeguard was preserved. It must not be reported as working paid-AI functionality.

**Old price definitions remain.** `src/pages/hub/signup.tsx` and `src/pages/subscribe.tsx` still contain £2.99/month and £19.99/year definitions; signup also defines £1/pupil/year. These conflict with the current requested parent pricing/free-school model. They were not changed because payments/sign-up are owned by other agents. Open testing mode currently hides or bypasses some plan prompts; source presence does not prove what a live subscriber sees.

**Sticker entry needs integrated-feature QA.** In this master-derived source, the Home hotspot labelled “Open Archie's Sticker Book” points to `/rewards`. Agent20 has separate sticker-book work. Do not certify drag/drop sticker pages based on the current hotspot or route existence.

**Warnings remain.** ESLint reports 88 warnings. The build warns about a roughly 3.08 MB minified main JavaScript chunk before gzip. Agent24's performance changes were not merged into this branch. No broad warning cleanup or performance redesign was attempted.

**Alternative npm lockfile is out of sync.** Initial workflow `34732634503` failed at `npm ci` due to mismatched js-yaml, qs and side-channel resolutions. The project's documented Docker packaging uses pnpm 11.23.0: that frozen install succeeds. No package versions, overrides or lockfiles were changed just to make the alternative npm install pass.

## Agent overlaps — notes only

- Agent25 also changes `src/main.tsx` to add device-compatibility styling. Agent27 changes its error handler. This is a shared-file integration warning, not a tested merge conflict. A later approved integration must preserve both changes; Agent25's branch was not modified.
- Agent17 and Agent18 both change `src/components/VoiceRecorder.tsx`. That overlap was observed in their change lists and left untouched.
- Agent24 changes `src/App.tsx` and `src/routes.tsx`; its route-loading changes are not part of these results.
- Agent6 and Agent25 both touch `src/layouts/RootLayout.tsx`; neither branch was merged here.
- Agent26's navigation-recovery changes were inspected but not copied or overwritten.

## Reproduction

Run the existing branch-only GitHub workflow by pushing code changes to this Agent27 branch. It does not trigger on master/main and contains no deployment step. Individual checks from a correctly provisioned, isolated checkout are:

```sh
node --experimental-strip-types --test scripts/qa/agent27/critical-error-display.node.mjs
node --test scripts/qa/agent27/startup-config.node.mjs
node --test scripts/test-island-adventures.cjs
node --test scripts/test-admin-paid-ai-guard.mjs
npm test -- --run
npm run type-check
npm run build
npm run lint
node tests/qa/agent27/source-audit.cjs
python tests/qa/agent27/recovery_browser.py
```

Install the project's declared pnpm version and frozen lockfile first. Python browser tools additionally require Playwright and Chromium. Full-page offline smoke checks are supplied in `tests/qa/agent27/browser_smoke.py`; they exit non-zero on failed or blocked checks and do not pass requests through to live services. They remain unexecuted successfully in this managed browser environment.

CI logs are retained by GitHub Actions. Source/build/log artifacts uploaded by this workflow expire after one day. No credentials are included in the added QA files.

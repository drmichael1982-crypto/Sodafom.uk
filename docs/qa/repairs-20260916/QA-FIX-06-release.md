# QA-FIX-06 — public domain and release repair plan

Date: 16 September 2026. Owner: QA-FIX-06, reporting to Coordinator Codex.

Status: **AMBER — release mapping investigated; public routing cause not yet proven.**

This worker made read-only Railway/GitHub checks and source inspections. This document is the only file owned by this worker. No code, DNS, domain attachment, environment variable, Railway configuration, authentication setting, deployment or Git ref was changed. The town prototype and Sodafoam Systems 797 were not inspected or changed.

## Finding and immediate decision

The earlier interactive audit observed different applications at `https://sodafom.uk/` and `https://sodafomuk-production-3f3a.up.railway.app/`: the public domain showed the older catalogue and broken `undefined` game links; the Railway address showed the family home and 135-game catalogue. These are **inherited browser findings**, not a new browser test by this worker.

Fresh Railway metadata confirms that **both hostnames are already attached to the same children’s service, environment and port**. The service still runs the 12 September deployment. The 15 September stable checkpoint remains an unmerged draft PR. Therefore:

1. Do not add a second custom domain, delete the existing attachment, change the target port, or deploy an agent branch as an assumed fix.
2. Keep the current children’s service as the proposed destination. Inspect the existing custom-domain verification/DNS values and the public DNS/CDN routing before preparing a concrete production change.
3. Treat aligning the public address and releasing repaired application code as two separately evidenced changes. A deployment does not establish that public DNS is correct.

## Verified current mapping

The following values came from Railway `get_service_config`, `list_domains` and `list_deployments`, with the explicit project/service/environment IDs shown below. Variable values were not requested or inspected.

| Item | Verified value |
| --- | --- |
| Children’s project | `ff66d3b4-d86e-4e13-9290-e7234a1244ef` |
| Children’s service | `Sodafom.uk` — `af2db3eb-e8ab-47e8-bf96-0041484382bd` |
| Environment | `production` — `f89fbda1-a273-4520-b858-3214ab1982cf` |
| Railway hostname | `sodafomuk-production-3f3a.up.railway.app` |
| Railway domain ID / port | `36ebd173-a0c1-4f51-b107-20120252cbac` / `8080` |
| Public hostname | `sodafom.uk` |
| Custom-domain ID / port | `ab1ece11-379b-4a88-9a49-933d36695c4e` / `8080` |
| Source repository / branch | `drmichael1982-crypto/Sodafom.uk` / `master` |
| Latest successful deployment | `7dd2cc1b-ba98-4c9c-b15a-ff21edbe5240` |
| Deployment creation time | `2026-09-12T22:03:46.737Z` |
| Deployed commit | `058097f78077015980460c0b359903fda5aa83a6` |
| Deployed commit description | Lock production Admin access and block unmetered paid AI; align voucher authorization with founder sessions |
| Start command | `node dist/server.bundle.mjs` |
| Pending staged changes returned | `null` |

The service configuration response reports `build.builder: RAILPACK`; the committed `railway.json` requests `DOCKERFILE`. This is a configuration-precedence question to confirm from the next approved build’s resolved configuration/logs, not evidence that either domain is connected to the wrong port. No build setting was changed.

## Review build is separate from deployed build

[PR #25](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/25) is still open, draft and unmerged. Its head is `codex/stable-app-build-20260915` at `442656b4e2ec76167b4d0b5fb7b804cf742904a5`; its base is `integration/sodafom-big-jobs-20260915` at `3caea47a4f0cde7b76c0fb309e20ec017671c04a`.

Its description reports a successful stable-build QA run covering installation, account checks, MySQL integration, scanner/books tests, type checking, Vitest and production build. This worker verified the PR metadata, **not those CI results independently**. The description explicitly says that it is a review checkpoint and gives no merge/deploy permission.

[PR #33](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/33) remains a separate draft artwork handoff at `cbe4a727b2edd561fcc29d024844ca920904e1dc`. It changes one Markdown file, not the deployed pictures or the app build. It is not evidence that character corrections have shipped.

The coordinator’s repair checkout was on `codex/audit-repairs-20260916`, based on `442656b4e2ec76167b4d0b5fb7b804cf742904a5`, when inspected. No worker-specific Git branch or commit was created by QA-FIX-06.

## What source inspection does and does not explain

- At the deployed commit, [src/App.tsx](https://github.com/drmichael1982-crypto/Sodafom.uk/blob/058097f78077015980460c0b359903fda5aa83a6/src/App.tsx) selects hash routing only when the Capacitor bridge exists; ordinary web rendering selects browser routing. The audit recorded hash URLs at the Railway address. That discrepancy merits checking the delivered client asset identity and whether the session was a packaged/native context. It does not establish the cause on its own.
- At the deployed commit, [src/server/entry.ts](https://github.com/drmichael1982-crypto/Sodafom.uk/blob/058097f78077015980460c0b359903fda5aa83a6/src/server/entry.ts) serves one client directory and gives application HTML `Cache-Control: no-cache`; hashed assets receive long immutable caching. The inspected host-dependent code controls SEO metadata, not selection of a different family-home application.
- At the review commit, [src/lib/config.ts](https://github.com/drmichael1982-crypto/Sodafom.uk/blob/442656b4e2ec76167b4d0b5fb7b804cf742904a5/src/lib/config.ts) uses relative `/api` URLs for normal web hosts. Pointing only a backend setting at Railway would not replace an old public frontend.
- At the review commit, [public/sw.js](https://github.com/drmichael1982-crypto/Sodafom.uk/blob/442656b4e2ec76167b4d0b5fb7b804cf742904a5/public/sw.js) handles push and notification clicks and contains no fetch-cache handler. This does not rule out an older worker, another CDN or a different public build. Do not diagnose a service-worker cache bug from the filename or `CACHE_NAME` constant alone.

The available read-only domain response does not include authoritative DNS answers, the existing domain’s required CNAME/TXT values, verification status, CDN origin, redirect configuration or an asset fingerprint. It cannot prove that public traffic reaches this Railway service.

## Concrete repair procedure for the release owner

These are proposed steps, not changes performed in this task. The user’s no-merge/no-deploy instruction remains in force.

1. **Capture the current routing state.** Read the existing custom-domain entry identified above and record its displayed DNS target, verification record/status and port. Read the authoritative DNS provider’s current root-domain records, any `www` forwarding and any proxy/CDN origin rule. Preserve exact prior record values, TTLs, proxy status and forwarding settings for rollback. Do not reveal credentials or copy unrelated mail/security records into a public report.
2. **Compare the two delivered applications in fresh web sessions.** Record final URL/redirect chain, visible home design, game count, client asset URLs/build identity and safe response cache/server headers for both origins. Test root entry and a real game link obtained from each catalogue. Also compare the failing existing session. Keep account/cookie data separate between origins; do not erase users’ stored learning progress as a diagnostic shortcut.
3. **Choose only the change supported by that evidence.** If authoritative DNS/CDN points at another application, replace only the incorrect Sodafom website record/origin with the exact target shown for the existing Railway custom-domain entry. Do not guess that the generated service hostname is the required custom-domain DNS target. If origin routing is correct but only a cache is stale, repair the identified cache/HTML rule and invalidate only the affected application shell. If both origins deliver identical assets but render differently, hand the reproducible host/native-context difference to the app owner before editing DNS.
4. **Prepare one reviewed release candidate.** Coordinator Codex integrates the repair workers into a single exact commit, preserves the existing section work and records tests against that commit. Use a review/preview environment first; the production service still follows `master`. Do not change production’s tracked branch to an unreviewed worker branch. Confirm effective Dockerfile/build settings and the expected client/server entry points in that candidate’s build logs.
5. **Obtain the final release decision against concrete values.** Present the exact candidate commit, target service/environment, any specific DNS/CDN record change with old/new values, acceptance evidence and rollback choice. Deploy, merge or alter public routing only after the applicable release authorization. This worker has not requested or carried out such an action.
6. **Verify public parity and then retire the warning.** Repeat the checks below on both origins after any authorized change. Keep the audit warning until the evidence shows that the public address consistently opens the intended app.

Railway’s [custom-domain documentation](https://docs.railway.com/networking/domains/working-with-domains#custom-domains) says to use the exact routing and verification records supplied for the domain. For a root domain, the DNS provider must support the corresponding apex/flattened-alias setup. The provider and exact record values for this domain were not available in the metadata response, so no ready-to-run DNS mutation is justified yet.

## Acceptance checks

| Check | Pass condition | Status for this worker |
| --- | --- | --- |
| Railway target | Both existing domain IDs still map to this children’s service/environment and port 8080 | PASS — metadata only |
| Release identity | Recorded deployment commit equals the reviewed candidate; delivered asset/build evidence agrees on both origins | NOT TESTED |
| Public root entry | Fresh `https://sodafom.uk/` and Railway sessions show the same intended family app | NOT TESTED — prior audit found mismatch |
| Navigation | Catalogue links are defined; direct game entry, refresh, back and home work on both origins | NOT TESTED |
| Corrected game result | 9/10 is displayed accurately and does not claim every answer was correct | Owned by gameplay repair worker; rerun after release |
| Helper and lesson repairs | Typed Homework Helper returns an answer or a useful recoverable error; lesson text fits the chosen age | Owned by helper/lesson workers; rerun after release |
| Mobile entry | Honor/Android browser opens the same intended build; no stale shell or horizontal clipping | NOT TESTED on physical device |
| Account boundary | Sign-in/session refresh works at the final canonical origin without weakening protected routes | NOT TESTED; use an approved test account |
| Current safety controls | Protected Admin and paid-AI allowance controls remain in place | No production changes made; release regression still required |

No new overall percentage is assigned: this is an infrastructure diagnosis and release plan, not evidence that the app audit failures have been fixed on the public website.

## Rollback

- Preserve the current successful children’s deployment `7dd2cc1b-ba98-4c9c-b15a-ff21edbe5240` / commit `058097f78077015980460c0b359903fda5aa83a6` as the baseline. If a later authorized code release fails, the release owner should restore that exact known deployment through the approved rollback path and repeat health/navigation checks. Do not select earlier September deployments casually: the current commit explicitly added Admin/paid-AI protections.
- If a later authorized DNS/CDN change fails, restore only the exact website record/origin/forwarding values captured immediately before that change. Preserve unrelated verification, email, DNSSEC and other project records. Retest after the actual TTL/propagation behavior; a saved screenshot of the Railway service alone is not a DNS backup.
- A deployment rollback does not reverse a DNS/CDN edit, and a DNS rollback does not restore the previous code. Track the two changes independently.

## Verification performed

- Read-only Railway service configuration, both domain mappings and four most recent deployment records.
- Read-only GitHub metadata for PR #25 and PR #33.
- Read-only inspection of deployed commit `058097f...` and review commit `442656b4...` source/configuration.
- Railway’s current domain documentation read through its documentation connector.
- Documentation diff/whitespace check only. No application runtime, CI suite, DNS lookup, browser parity test or production mutation was performed by QA-FIX-06.

**Coordinator handoff:** public-domain mismatch remains a release blocker. The exact children’s destination is verified; the missing evidence is public DNS/CDN/asset identity. This document is ready to attach to the repair PR without claiming the live routing is repaired.

## Coordinator browser follow-up

After this worker finished, Coordinator Codex opened both root URLs in separate browser tabs on 16 September 2026. This repeats the mismatch and establishes that the browser receives different client bundle references. These were new tab navigations in the existing browser profile, not cleared-cache or isolated-cookie sessions.

| Browser DOM evidence | `https://sodafom.uk/` | `https://sodafomuk-production-3f3a.up.railway.app/` |
| --- | --- | --- |
| Visible root | Older Games & Activities catalogue with 127-game labels | Family home with 17 learning/navigation buttons |
| Main script reference | `/assets/index-DRkW87NR.js` | `/assets/index-CRZvd_GX.js` |
| Main stylesheet reference | `/assets/index-Ce-TDN2F.css` | `/assets/index-CM6tliXU.css` |
| Root DOM links to `/games/undefined` | 107 | 0 (home screen, not a catalogue parity test) |

Script and stylesheet paths came from the loaded document's `src`/`href` attributes; no response bodies, private account information or browser storage were inspected. Different bundle references rule out a purely visual difference in an otherwise identical document in these two visits. They do not identify whether origin routing, a CDN or an existing cache supplied the older public document. Exact DNS/CDN evidence and a clean-session comparison remain required before choosing a routing change. No DNS, cache or deployment action was taken.

# Sodafom frontend repair handoff

For Michael and Coordinator Codex. 14 September 2026.

This review pass repairs frontend behaviour and connects working world prototypes. It is not ready for release: six backend authorization probes still fail, and browser/device acceptance is outstanding.

Base: `codex/children-foundation-first-pass` at `81a78e12c5fd35cef4de24180047480364d0358b`.
Separate review branch: `codex/sod-software-repairs-20260914`.

Michael subsequently authorized repairs and parallel visual work after the initial read-only SOD-05 review. His later instruction to leave the backend alone governed this repair pass. Production backend, authentication server configuration, hosting configuration, approved image assets, master/main and the coordinator's original branch are unchanged. The only changed file under `src/server/` is an isolated test fixture. No merge or deployment is part of this handoff.

## What works in this review build

| Area | Changed behaviour |
| --- | --- |
| Frontend authentication | Blocked storage no longer prevents parent login; returned logout errors remain visible and retryable. Transient session errors no longer trigger automatic cookie deletion. Reset screens inspect HTTP failures. |
| Badges | Invalid stored child data, failed HTTP responses and malformed payloads produce recoverable messages instead of render crashes. Requests cancel on unmount. |
| Homework photos | JPEG/PNG/WebP files are validated and redrawn, removing original metadata. Encoded images are capped at 85,000 characters to fit the existing JSON limit. Errors, empty responses, paused service and oversized requests are reported honestly; old replies cannot replace a newer photo. |
| Local Archie | Bounded arithmetic, spoken numbers, fractions, percentages, spelling and curated knowledge. Corrected numeric lesson routing and exact answer grading. Unvalidated shared model-answer caching is disabled and purged. This is deterministic teaching logic, not a trained general reasoning model. |
| AI Teacher | Local answers use the selected age. Missing online answers and unreadable photos are reported truthfully. Duplicate requests are blocked; navigation cancels requests/timers and suppresses late speech. Guest age changes never fabricate a database child identity. |
| Eight mapped maths games | Ten-question rounds, no repeats within a round, corrected answer positioning/scoring, suitable finite banks, duplicate-tap protection and cleanup. Oldest age group reaches tier three. |
| Game navigation | Exact allowlisted world/shop return destinations; hostile or unknown targets fall back to games. Next-game links preserve the validated return destination. |
| Victorian world | Actual Three.js street and five enterable procedural interiors, including the double-fronted sweet shop and jar display. Working doors, camera controls, activity links, gentle surprises and ordinary button alternatives. |
| Floating room | Planet, colouring-book and geography-aircraft skins with separate active hotspots. Earth rotates independently about a fixed tilted axis; the Sun lights the room. A clearer animated planet diagram is also available. |
| Cinema and books | Four illustrated 1:20 shorts and ten complete ten-page stories using existing text/art. Play/pause, page navigation, endings, progress, optional speech/fullscreen, quiet start, reduced motion and harmless shuffled jokes. |

## Where to open the new features

Archie's Menu at `/archie-menu` links to these pages:

| Page | Route |
| --- | --- |
| Victorian street | `/world/victorian` |
| Sweet shop interior | `/world/victorian?shop=sweet-shop` |
| Floating learning room | `/world/floating` |
| Animated north-view planet diagram | `/world/planets` |
| Picture cinema | `/cinema` |
| Animated books | `/books/animated` |

The new routes load their scene/player code lazily. Activity buttons remain available if WebGL fails. Native keyboard controls and reduced-motion behaviour have automated coverage; that is not physical-device acceptance.

## Verification on the final source snapshot

Node 24.19.0, pinned pnpm 11.23.0, Vitest 4.1.11. Installed dependencies came from the available cache. No live database, real child account, paid model, email or payment was used.

| Check | Result | Practical limit |
| --- | --- | --- |
| `corepack pnpm run build` | Passed: client and SSR/server bundles | Compilation only; built server was not started against a database. Existing large-bundle warning remains. |
| `corepack pnpm run type-check` | Passed | Static type checking. |
| `corepack pnpm test --run` | **446 passed, 6 failed; 452 total, 49 files; exit 1** | All six failures are the intentionally retained authorization expectations described below. The suite is not green. |
| `node --experimental-vm-modules --test scripts/test-*.cjs scripts/test-*.mjs` | **114 passed, 0 failed** | Isolated helpers/handlers and source probes; includes existing foundation scripts and new parent-auth checks. |
| `corepack pnpm run lint` | Passed with **0 errors, 83 warnings** | Warnings remain across the existing app. |
| `git diff --check` | Passed | Whitespace check only. |
| Browser interaction/visual review | Blocked | Advertised browser runtime could not allocate a session: all 20 sessions were occupied. No screenshots or browser passes are claimed. |
| Real MySQL, server startup, Android/iPhone | Not run | Still required before release. |

The final source was frozen after the AI Teacher cancellation/identity repair. Documentation was written afterwards. Test commands ran with inherited service credentials removed. Do not blindly run a production server or migrations to reproduce these checks.

The founder-cookie test now provides its own dummy configuration; production founder-auth code is unchanged. Coverage tooling is installed and its isolated three-test smoke run passed. No whole-app coverage percentage was measured.

The first Node run omitted `--experimental-vm-modules`, which is required by the existing badges harness. Its 11 harness launch errors disappeared with the documented flag; the result above is the correct final run.

## Six confirmed failures retained for backend review

`src/__tests__/sod12-public-route-authorization.test.ts` exercises real handlers with synthetic request/database fixtures. Every test requires authorization before reading or mutating data. The tests deliberately remain failing rather than accepting the existing permissive behaviour.

| Handler family | Anonymous fixture result | Required result |
| --- | ---: | --- |
| Public review creation | 201 | 401 or 403 before write |
| Newsletter migration | 200 | 401 or 403 before write |
| Referral conversion | 200 | 401 or 403 before write |
| Push unsubscribe | 200 | 401 or 403 before write |
| Student lookup | 200 | 401 or 403 before read |
| Student activity | 200 | 401 or 403 before write |

These are local reproductions, not calls against production. SOD-03 also reported broader child game/progress ownership faults, weak student codes, permissive credentialed CORS/disabled CSRF, and school-activation/payment validation faults. Those findings remain open under the backend freeze. The existing paid-AI 503 guard remains enabled; online OCR, paid models and voucher activation are not made operational by this pass. Existing affiliate and checkout pages are not covered by the new practice-only shop restrictions.

## Percentage scorecard — estimates only

These are conservative planning estimates against SOD-05's five named milestones per area. They are not whole-app completion, code coverage, a safety probability or time remaining. A known failing milestone earns zero; source-only or partial work earns ten; the specified narrow verified milestone earns twenty.

| Area | Current estimate | Five milestone points | Remaining evidence |
| --- | ---: | --- | --- |
| Authentication | 50% | Endpoint 20; storage/logout 20; sign-up/sign-in integration 10; complete reset 0; device sessions 0 | Real accounts, email/reset/session revocation and device cookies. |
| Badges | 80% | Inputs 20; ownership 20; calculations 20; resilient screen 20; real database flow 0 | Real progress/database and complete account flow. |
| Shop/world foundation | 50% | Registry 20; age links 10; approved matching art 0; scenes 10; interactions/device acceptance 10 | Final matching art and actual rendering/device review. Shop age selection filters suggestions; game difficulty still uses its existing child/level controls. |
| Child safety | 20% | Wider account isolation 0; spending block 20; CORS/CSRF 0; full scanner/adult-shopping boundaries 0; full child acceptance 0 | Backend blockers and full privacy/content/adult authorization review. |
| Build readiness | 70% | Toolchain declaration 10; cached frozen install 20; production bundles 20; type check 20; server startup 0 | Cold install, consistent npm/pnpm hosting instructions, built-server and native builds. |
| Testing programme | 20% | Focused checks 20; entirely passing regression suite 0; service integration 0; browser flows 0; physical-device/accessibility acceptance 0 | Six failures and four missing programme gates. Many passing checks do not substitute for those gates. |
| Overall release confidence | 40% | Two of five release-evidence gates met | Identified tested source and build/type evidence are met; core real-service flows, resolved safety boundaries, and agreed visual/game/device acceptance are not. |

The original SOD-05 build estimate was based on an archive without dependencies. SOD-01 subsequently demonstrated a cached frozen install, client/SSR build and type check on the original `81a78e1` branch; its normal Vitest result was 224/225, with the founder fixture failure. Those results supersede the earlier missing-tool assessment. They do not establish that repairs in this branch are on the coordinator's original branch or in production.

## Remaining visual and gameplay scope

The five interiors and floating objects are procedural starter models, not final approved character models. The picture cinema moves existing illustrations; it is not newly produced cartoon footage or unique art for every scene. Planet sizes, distances, speeds and circular orbits are teaching simplifications; geography flight is imaginary. The existing approved characters and image files remain unchanged.

Only the eight mapped shop games were standardized to ten questions. Seven unrelated Learning Arena games retain their existing eight-question rounds. Finite content banks eventually recycle; Fraction Easy has exactly ten representations. The shop lessons still use existing game themes, including pizza fractions in the cake shop.

Coordinator Codex should review this branch, resolve the backend scope decision with Michael, and then arrange browser/device, real account/database and artwork acceptance. No merge or deployment is authorized by this document.

## Team

Six helpers were coordinated alongside the primary agent for the final work: SOD-06 integration/review, SOD-07 frontend auth/Local Archie, SOD-09 maths, SOD-10 floating rooms/planets, SOD-13 Victorian world, and SOD-14 cinema/books. Earlier SOD-11 build tooling and SOD-12 independent probes supplied evidence and tests. Helpers worked within assigned files; the coordinator connected routes and ran the final integrated gate.

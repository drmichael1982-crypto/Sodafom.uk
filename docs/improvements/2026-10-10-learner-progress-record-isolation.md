# Learner-scoped progress records — 10 October 2026

## Fresh state and ownership

- Repository: `drmichael1982-crypto/Sodafom.uk`.
- The evidence-resolved children’s target remains `test/archie-2026-10-02` at `286817348b5bf82954b7e67cab01fdd99c4187f8`, newer than the reference `be917c8e6cdb99156a63b38f8d12792babeb31c4`.
- Dedicated candidate branch: `improve/archie-learning-20261007`; draft PR [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81) remains open, draft and unmerged.
- Published implementation commit: `4e8d233b0c7e38abac3f2dab1996a7b9317afb76`.
- Before editing, the target branch, candidate head, open PRs, current CI and latest Railway deployment were rechecked. This run did not merge, deploy, change credentials or payments, touch 3D work, or modify the separate `sodafom797` service. Leonard’s external queue is not visible in this runtime, so no claim of active-worker coordination is made.

## Reproduced behavior and bounded repair

The live parent progress page explicitly warned that locally stored activity could mix multiple learners on a shared device. Game stars used one global key, and lesson/book activity was not attributed to a profile. Switching the active child could therefore show another learner’s recent games, personal best, activity history or report totals.

The candidate now:

- gives each active child a stable `child:<id>` progress scope and assigns a persistent anonymous `local:<uuid>` scope when no child profile is active;
- stores game stars under a profile-specific key and updates game selection, badges and the learning hub when the active child changes;
- writes lesson and book activity with the current profile ID and deduplicates within that profile only;
- limits learner, parent and teacher summaries to the current profile;
- uses the active child’s name ahead of the old globally remembered nickname;
- preserves old unscoped entries without silently assigning them to a child, displaying them only in a separate `Older shared device history` section in adult views; and
- keeps old global game stars read-only as legacy history rather than copying or deleting them.

The repair is deliberately non-destructive. It improves local attribution from this version forward; it does not claim that historical shared records can be reliably attributed, that all settings/stickers are profile-scoped, or that progress is cloud-synchronised.

## Verification

| Check | Result |
| --- | --- |
| TypeScript `--noEmit` | PASS |
| Focused progress tests | PASS — 3 files / 22 tests |
| Full Vitest suite | PASS — 137 files / 1,044 tests |
| Archie production build | PASS — existing mixed-import and large-chunk warnings remain |
| Browser script syntax | PASS — `node --check scripts/test-shared-device-progress.cjs` |
| Patch whitespace | PASS — `git diff --check` |
| Exact implementation interest-theme workflow | PASS — [run #60](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38075098106) |
| Exact implementation full workflow | In progress when this note was written — [run #415](https://github.com/drmichael1982-crypto/Sodafom.uk/actions/runs/38075098034) |

The regression suite uses synthetic Mia and Leo profiles. It proves that each learner receives separate activities and stars, that switching to a learner with no records shows an empty state, and that valid and malformed legacy records remain preserved. This is simulated shared-device behavior, not real-child testing.

The new deterministic browser journey also seeds scoped and legacy records, checks the phone/tablet parent report and switches to the empty synthetic learner. It could not be executed locally because this runner has no Playwright Chromium binary. A bounded `playwright install chromium` attempt failed repeatedly with a truncated zero-byte CDN download. That is a runner/tooling blocker, not evidence of an application failure; the exact hosted workflow is the authoritative browser check once complete.

## Separate live rendered walkthrough

The known Railway deployment was opened read-only. This visual review covers the deployed target, not the unpublished candidate.

- **Home:** retained the blue/gold branding, pale illustrated background, puzzle-playground scene and established blond, emerald-eyed Archie. Controls and cartoon art were coherent at the available cloud-browser width.
- **Game selection:** Year 3 displayed 109 games with clear search, year and subject controls, large cards and pagination.
- **Complete game:** Number Pop was played through its initial instruction, hint, intentional wrong answer, supportive retry, pause control, corrected answer and all ten questions. The completion result showed 90%, 9/10 and three stars after one deliberate retry. This confirms the interaction flow only, not learning or enjoyment.
- **Lessons:** the Year 3 lesson catalogue showed a clear next-adventure card, 36 weeks, 180 lessons, progress context and paging controls.
- **Parent:** the grown-up gate opened and the deployed page still displayed the shared-device warning reproduced above. That establishes the live before-state; the candidate fix is not deployed.
- **Teacher:** the grown-up gate opened to year/subject controls and the Year 3 Maths plan (180 lessons across 36 units), with explicit preview/no-live-pupil-data boundaries.

The cloud browser did not expose viewport resizing, and the local browser binary was unavailable. Therefore no after-change rendered claim is made for 390 × 844 or 820 × 1180 in this run. The existing blue/gold visuals and Archie character were not changed by the implementation.

## Railway deployment evidence

- Project: `noble-emotion` (`2f75a12f-11b5-45da-a1dd-97fd99e77ec3`).
- Service: `archie-learning-test` (`efa8d843-4d25-4622-ba35-a185678a2621`).
- Environment: `production` (`6e9b98eb-2972-4b28-8489-f77f8facc5ee`).
- Current deployment: `f0320c4c-8306-41da-b432-543ccbed6b96`, `SUCCESS`, created 10 October 2026 at 13:52 UTC from branch `test/archie-2026-10-02`, commit `286817348b5bf82954b7e67cab01fdd99c4187f8`.
- No staged/applying work was present. No deployment or infrastructure mutation was performed.

## Curriculum, feedback and product benchmark

Current official sources were checked after the required Stripe Directory workflow. The Stripe CLI was unavailable, and no provider was selected, contacted, provisioned or paid.

- The [England mathematics programme of study](https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study) supplies statutory year-by-year attainment content; its non-statutory examples remain distinct from requirements. This storage repair changes no curriculum objective or question content.
- The [EEF feedback guidance](https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/feedback) supports timely, specific feedback and opportunities to act. Number Pop’s calm wrong-answer hint and corrected retry were assessed against that interaction principle, without claiming improved outcomes.
- [Sumdog’s official product description](https://www.sumdog.com/en-gb/about/) describes personalised practice, rewards and parent/teacher reporting. Its useful benchmark here is unambiguous learner attribution in reports and actionable next-step context; no proprietary lesson, wording, character, art or report layout was copied.

## Unverified boundaries and next priority

Physical phones/tablets, real audible speech, microphone capture, hardware screen readers, live parent/teacher accounts, live email, payments and real-child learning or enjoyment remain unverified.

Next: once Chromium is available, execute the new shared-device journey at 390 × 844 and 820 × 1180 and inspect its captures. Then audit the remaining settings and sticker state so each is either learner-scoped or clearly labelled as device-wide, while continuing the synthetic age/year walkthrough matrix and preserving the separate deployment and `sodafom797` boundaries.

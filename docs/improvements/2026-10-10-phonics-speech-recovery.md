# Phonics Parrot speech recovery — 10 October 2026

## Repository and deployment evidence

- Repository: `drmichael1982-crypto/Sodafom.uk`.
- The children’s test branch was rechecked from both GitHub and Railway rather than inferred: `test/archie-2026-10-02` at `1bd5690800fc8e24cccbe3b017e148466dffa945` (`Repair tutor grading and parent progress`). This is newer than reference `be917c8e6cdb99156a63b38f8d12792babeb31c4`.
- Dedicated candidate branch: `improve/archie-learning-20261007`. Product commit: `e9022f1` (`Give Phonics Parrot accessible speech recovery`). Reconciliation merge: `6917e1d3bac15c742462ec291143abae86cbd79e`.
- Draft PR: [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81), open, draft and unmerged when this note was written.
- Railway deployment `cd0307ae-36a4-4099-9847-bb2c27efa224` was rechecked read-only and remains `SUCCESS` on target commit `1bd5690…`. This candidate was not deployed. The separate `sodafom797` service was not changed.

## Bounded improvement

Phonics Parrot's core **Hear the sound** action previously called `window.speechSynthesis` directly. On devices without usable browser speech it could fail silently, despite the app already having a shared accessible voice-recovery path.

The game now:

- uses the shared `VoiceProvider` for playback, stop state and the existing calm recovery notice;
- keeps the printed letter and example visible when speech is unavailable;
- associates the control with that printed card through `aria-controls`;
- exposes an explicit `Hear the sound` / `Stop the sound` accessible name and pressed state;
- preserves focus on the action after failure, and stops speech when the game unmounts.

Unit coverage simulates missing speech APIs and verifies the printed fallback, recovery notice, focus retention and dismissal. The hosted browser journey enters the game through the Year 1 game selection, disables `SpeechSynthesisUtterance`, checks the same recovery at 390 × 844 and 820 × 1180, asserts zero horizontal overflow and records both screenshots.

## Checks and visual boundary

Checks on the reconciled tree:

- TypeScript: PASS.
- Full Vitest: PASS — 120 files / 981 tests.
- Archie production build: PASS; the existing mixed-import and large-chunk warnings remain.
- Browser-script syntax and `git diff --check`: PASS.

The current deployed home and games pages were inspected directly. They retain the blue/gold header, pale yellow-to-blue illustrated puzzle background, large controls and blond, green-eyed Archie. The direct Phonics Parrot route correctly showed the age guard for the saved Year 4 profile. This was a live-target review, not candidate proof.

Local Playwright could not be installed because the browser archive download was truncated repeatedly. Therefore the candidate's phone/tablet visual result is not claimed until GitHub's hosted browser workflow completes and both new screenshots are inspected. Simulated play is not child testing and demonstrates neither enjoyment nor learning outcomes.

## Curriculum and product comparison

- England's [English national curriculum](https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study/national-curriculum-in-england-english-programmes-of-study) is the statutory source for relating letters and sounds and correct pronunciation.
- The Department for Education's [phonics programme guidance](https://www.gov.uk/government/publications/choosing-a-phonics-teaching-programme/list-of-phonics-teaching-programmes) requires a rigorous systematic approach with resources matched to grapheme–phoneme progression. This accessibility repair does not turn Phonics Parrot into a validated systematic synthetic phonics programme.
- Teach Your Monster's official [phonics minigame](https://www.teachyourmonster.org/mini-games/phonics) and [Practice Mode](https://www.teachyourmonster.org/updates/practice-mode) descriptions were used only as benchmarks for progressive sound practice and a visible replay control.
- Khan Academy Kids' official [ELA description](https://www.khanacademy.org/kids/ela) was used only as a benchmark for pairing step-by-step phonics with visible learning material. No characters, lesson text, art or proprietary sequence was copied.
- Stripe Directory was attempted before product/provider lookup; no provider was selected, purchased or provisioned.

Real-device touch, browser voice playback, microphone capture, screen-reader hardware, live accounts/payments and real-child testing remain unverified. No 3D, deployment, credential or real-child data work occurred.

## Next priority

1. Require the final hosted branch workflow to pass and inspect `phonics-speech-fallback-390.png` and `phonics-speech-fallback-820.png` before closing this item.
2. Then migrate the next high-value direct speech caller, `reading-quest.tsx`, to the shared recovery pattern without changing the now-green pager.

# Reading Quest speech recovery — 10 October 2026

## Verified starting state

- Repository: `drmichael1982-crypto/Sodafom.uk`.
- The children’s test branch was rechecked from the open PR and Railway: `test/archie-2026-10-02` at `1bd5690800fc8e24cccbe3b017e148466dffa945`, newer than reference `be917c8e6cdb99156a63b38f8d12792babeb31c4`.
- Dedicated candidate branch: `improve/archie-learning-20261007`; starting head `23a86470f262d6d31b8d08dce5643089275b1599`; Reading Quest implementation commit `f7438294989139db3ba1f9a0f2b2d2ac089c9eaf`.
- Draft PR [#81](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/81) remains open, draft and unmerged. GitHub's connector currently reports `mergeable: false`, although compare evidence says the branch is 116 commits ahead, zero behind, and has the exact target as its merge base. Recheck this indicator before review.
- Railway deployment `cd0307ae-36a4-4099-9847-bb2c27efa224` remains `SUCCESS` on the target branch/commit. This candidate was not deployed; the separate `sodafom797` service and deferred 3D work were not changed.

## Reproduced failure and bounded repair

`reading-quest.tsx` called `window.speechSynthesis` directly and returned silently when browser speech was unavailable. The printed passage stayed visible, but the child received no explanation or retry guidance.

Reading Quest now:

- uses the existing shared `VoiceProvider` recovery path;
- keeps the printed passage visible and associates the read-aloud control with it through `aria-controls`;
- exposes explicit `Read passage aloud` / `Stop reading aloud` accessible names and pressed state;
- retains focus on the read-aloud control after unavailable speech;
- stops narration before the quiz and when the game unmounts;
- tests the unavailable-speech path in a focused component test and in the hosted phone/tablet browser journey.

No story, question, grading, age policy, art, CSS, payment or account behavior changed.

## Checks and visual boundary

- Browser-script syntax: PASS.
- Focused Reading Quest and Phonics recovery tests: PASS — 2 tests.
- TypeScript: PASS.
- Full Vitest: PASS — 121 files / 982 tests.
- Archie production build: PASS; the existing mixed-import and large-chunk warnings remain.
- Focused ESLint and `git diff --check`: PASS.

The local runtime has no Playwright Chromium executable, so the browser suite could not start locally. GitHub had not scheduled a workflow or status for `f743829…` when this note was written. Therefore the new 390×844 and 820×1180 Reading Quest captures are pending and are not claimed as visually verified. The immediately preceding artifact on code commit `92e86eb…` was directly inspected across home, games, completed Maths Bingo, lessons, parents, teachers and the settled Phonics fallback at both widths; branding and layouts were coherent, but those images do not prove this new candidate.

## Curriculum and original comparison

- England's [English national curriculum](https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study/national-curriculum-in-england-english-programmes-of-study) remains the statutory source for reading fluency, comprehension and spoken-language objectives. This recovery control is an accessibility/product design choice, not a statutory objective.
- Khan Academy Kids' official [ELA description](https://www.khanacademy.org/kids/ela) was used only as an interaction benchmark for keeping print visible alongside read-aloud support. No characters, stories, questions, artwork or proprietary lesson sequence were copied.
- The DfE [reading framework](https://www.gov.uk/government/publications/the-reading-framework-teaching-the-foundations-of-literacy) informs the distinction between supported reading access and a complete systematic teaching programme. Archie is not claimed to be a validated phonics programme or to demonstrate learning outcomes.
- Stripe Directory was attempted before provider/product lookup in this session; no provider was selected, purchased or provisioned.

These are simulated software checks, not child testing. Real-device speech playback, microphone capture, touch, screen-reader hardware, live accounts/payments and real-child outcomes remain unverified.

## Next priority

Obtain the hosted Chromium run for `f743829…`, require the Reading Quest unavailable-speech journey to pass at 390×844 and 820×1180, and directly inspect both captures for passage readability, clear recovery guidance, focus visibility, large controls and clipping. Do not widen the change or claim completion until that evidence exists.

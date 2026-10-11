# Spelling practice instructions — 8 October 2026

## Repository and deployment state checked first

- Continued `improve/archie-learning-20261007` and draft PR #81, targeting `test/archie-2026-10-02`; the remote head before this change was `9cfacad2831df2ee0d1ed7570a139707f8daeb20` and GitHub run #172 was successful.
- Rechecked PR #81, its latest successful CI artifact, saved run notes and the live Railway test service before editing. Leonard/sodafom797 remains separate.
- Directly reopened `https://archie-learning-test-production.up.railway.app/`. The rendered home still shows the established dark-blue space jigsaw, gold controls, orbit artwork and blond Archie. Railway reports the live test service healthy on `test/archie-2026-10-02` commit `f254a44aa06bf0d8e4035059290e0a538393f886`, deployed 7 October 2026 at 22:33:37 UTC, with no staged or applying work.
- The candidate branch was not deployed or merged.

## Reproduced issue and bounded change

1. Direct review of run #172's compact spelling screenshots found an instruction mismatch: the target word was visibly available to study, but the screen said only `Hear the word, then try spelling it.` It did not explain that selecting `Try spelling` would hide the word or what to do after it disappeared.
2. Before practice, the compact whiteboard now says: `Look at the word. Tap Hear the word, then Try spelling. The word will hide.`
3. After `Try spelling` hides the word, the whiteboard now says: `Type the word you heard, then press Check.`
4. Existing word lists, audio controls, supportive retry, pause/resume, seven-word progression, scoring, rewards and saved completion behavior are unchanged.
5. The simulated browser journey now requires both instruction states during every spelling walkthrough at 390 px and 820 px. These are automated learner scenarios, not real-child testing.

## Curriculum and accessibility basis

- England's statutory English programmes include year-by-year spelling requirements and attainment targets; this change does not alter those words or claim a new statutory teaching method: <https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study>.
- W3C's Labels or Instructions guidance says users need enough cues to understand what input is expected without unnecessary clutter: <https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html>.
- The two short state-specific prompts are an original usability/accessibility design improvement, not a claim of improved educational outcomes.

## Verification and rendered review

- `npm run type-check`: PASS.
- `npm test -- --run`: PASS, 84 files / 833 tests.
- `npm run build:archie`: PASS with the existing bundle-size and mixed dynamic/static import warnings.
- Local Chromium was unavailable, so the repository CI provided the authoritative browser execution.
- GitHub run #174 for code head `d814fdff74ee655a4a8593ec7021ff089caf58ed`: PASS. TypeScript, 833 tests, production build, all 130 linked game routes, 12 core browser journeys, all 68 simulated search/game/lesson journeys and artifact upload passed.
- Direct artifact review at 390 × 844 and 820 × 1180 confirms the new study instruction wraps inside the whiteboard, all six controls remain visible, blond/emerald-eyed Archie and the established blue/gold styling are preserved, and there is no horizontal clipping.
- The hidden-word state is behaviorally verified by browser assertions; the retained overview screenshots show the pre-practice study state.

## Boundaries and next priority

No merge/deployment, paid service, credential change, real child data, 3D work or Leonard edit occurred. Physical phone/tablet, microphone/audio, device keyboard/screen reader, live accounts/payments and real-child testing remain unverified.

Next bounded priority: reconcile the public learner year choices with the agreed ages 5–12 scope before changing or hiding any existing Year 8–9 content; then fix only a confirmed scope mismatch.

# Sodafom children’s app — island repair, 12 September 2026

## Scope and source

Children’s education app only: `drmichael1982-crypto/Sodafom.uk`, Railway service `Sodafom.uk`, project `affectionate-essence`, production branch `master`.

Repair branch: `fix/kids-island-navigation-20260912`.
Pre-change source commit: `6697c16925cf63a952a3e807f981e8db2ff852d5`.
Pre-change successful Railway deployment: `99611b4a-5046-4651-9684-9eff1a24b5d5`.
No changes to 797, database records, credentials, payment configuration, authentication or existing game files.

## Changes

- All ten map islands now open their matching subject adventure. Previously History, Geography and Technology opened Science, and French, German and PE opened the generic game list.
- Ten subject-specific starter challenges, each with ten questions and three shuffled answer options: Maths, English, Science, History, Geography, PE, Technology, French, German and Spelling.
- Dedicated island screens include accessible answer buttons, question progress, correct/incorrect feedback, results, replay, back navigation and 17 links to relevant existing games.
- Each challenge contains a finite practice bank. Replaying reshuffles the same bank; this is not a year-long curriculum or an adaptive difficulty engine. Practice results are session-only and are explicitly not added to school reports.
- Optional read-aloud and browser speech input. The microphone starts only on a user click, has a stop control, times out, handles permission/missing-device/network errors, and is cancelled on leaving. Tap answers remain available. The game does not save recordings or call OpenAI; browser speech recognition itself may use a provider’s online service, disclosed in the interface.
- Existing approved artwork, other menu destinations and the current PaywallGate behavior are retained. Wrong island navigation is replaced; unrelated old pages are not deleted.
- Navigation feedback tolerates blocked storage, unavailable speech and vibration failures. If an approved image fails to load, a visible alternative button menu remains available. Delayed lesson navigation is cleaned up on leaving.

## Tests actually executed before deployment

### Targeted Node regression tests: 28 passed, 0 failed

Run after installing the repository dependencies:

```sh
node --test scripts/test-island-adventures.cjs
```

Tests cover TypeScript/TSX syntax transpilation for the four feature modules, all ten banks, ten-question progression, answer validation, duplicate-tap protection, scoring, replay reset, shuffling, every island map destination, invalid query values, retained menu counts, feedback failures, transcript matching, unsupported speech, microphone permission/audio/network errors, stale callbacks, start exceptions and timeouts.

Syntax transpilation is not a full semantic TypeScript check or whole-project build.

### Isolated Chromium component tests: 15 passed, no page errors observed

The new IslandAdventure component was mounted in a local compatibility harness using React 16.0, with a fragment shim. The router callbacks, Archie mascot and speech APIs were test doubles. This was NOT the complete production React 19 app.

Executed all 100 answer clicks across the ten challenges, result/replay/back controls, 17 existing-game navigation callbacks, read-aloud invocation, a simulated recognised answer, microphone denial, unsupported speech and cleanup on unmount. Both mobile-sized and desktop-sized viewports were used. Destination game pages and physical audio were not exercised by these callback tests.

## Remaining checks — not certified by this repair

- Full production dependency install, semantic type-check, existing test suite and browser end-to-end regression.
- Railway build/deploy status for the final new commit must be checked separately; the pre-change SUCCESS status does not prove this patch deployed.
- Live production navigation with actual React 19, existing context providers, authentication/subscription states and asset requests.
- Physical Android/iPhone/desktop microphone capture, accents, real speech-recognition quality, audible voice quality and native Android bridge behavior.
- Camera/homework scanning, every existing game, certificates/sharing, sign-up/sign-in/password recovery, parent/teacher reports, subscriptions/cancellation and paid AI routing.
- Remaining old-page cleanup needs route-by-route replacement verification before deletion; this change intentionally does not delete unrelated functioning pages.
- Large question libraries, increasing difficulty, persistent reporting for these new challenges and curriculum review remain further work.

## Deployment and recovery

Merge by a non-forced fast-forward from the reviewed repair branch to `master`, then verify Railway’s new deployment refers to that exact commit. Do not change `main` or a 797 service.

If the new release fails, use Railway’s previous successful deployment as a recovery reference or prepare a Git revert of this repair. Do not force-reset the production branch or discard another contributor’s commits. No database migration is part of this repair.

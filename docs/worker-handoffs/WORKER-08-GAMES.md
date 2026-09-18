# Worker 08 — Educational games handoff

## Scope and safety constraints

- Worked only in `drmichael1982-crypto/Sodafom.uk` from `codex/children-foundation-first-pass`.
- Branch: `worker08/educational-games-foundation`.
- Did not edit either Sodafoam 797 repository.
- No deployment, main-branch merge, secret access, database mutation, or irreversible operation.
- Legacy games were treated as reference only; no legacy page was modified.

## Delivered

1. `src/features/learning-games/types.ts`
   - Typed game catalogue, question, answer, session, result, and action contracts.
2. `src/features/learning-games/engine.ts`
   - Pure, deterministic state reducer with duplicate-answer protection, pause/resume, restart, and safe score calculation.
3. `src/features/learning-games/progress.ts`
   - Versioned game completion event and reward request ports.
   - Stable per-attempt idempotency keys.
   - No child name, email, free text, or other direct personal data.
4. `src/features/learning-games/components/`
   - Filterable game launcher.
   - Reusable multiple-choice game shell.
   - End-to-end launcher-to-game experience component.
5. `src/features/learning-games/catalog.ts`
   - Two low-risk, untimed starter games for ages 5–8:
     - Number Bonds to 10.
     - Word Family Match.
6. Accessibility support
   - Semantic headings, lists, fieldsets, answer groups, progressbar, and live feedback.
   - Keyboard-operable and touch-friendly controls.
   - Text equivalents for essential information.
   - Optional host read-aloud callback; no automatic microphone or audio permission.
   - No time pressure, public leaderboard, chat, adverts, purchases, or user-generated content.

## Shared progress boundary

Worker 08 deliberately did not use or extend the legacy `ProgressionContext`, because it writes a separate local-storage total and would compete with lesson and reading progress.

The coordinating progress worker should own one durable service with these responsibilities:

- Accept activity-completed events from games, lessons, and reading.
- Deduplicate by `eventId`.
- Attach the authenticated child identifier server-side or in the trusted host layer.
- Queue offline events and retry failed syncs.
- Calculate stars, badges, streaks, levels, and parent/teacher rollups centrally.
- Return reward decisions; child-facing features must never mint rewards themselves.

The game contract currently uses `activityType: 'game'`. Lessons and reading should use the same envelope shape with their own activity types once Worker 01 or the progress owner publishes the canonical shared contract.

## Acceptance checks completed

- 4 test files passed.
- 9 focused tests passed.
- TypeScript project check passed with no errors.
- Completion is emitted once per play attempt.
- Duplicate answer actions cannot inflate a score.
- Wrong answers receive neutral, supportive feedback.
- Pause/resume retains the current question.
- Age and subject filters work.

## Integration intentionally blocked

No route was changed because Worker 01 architecture notes and a canonical shared progress service were not available. Wiring now would risk replacing the wrong legacy route or creating duplicate navigation/progress state.

Coordinator decisions needed:

1. Confirm the canonical route/3D-world entry point for the new launcher.
2. Name the owner and location of the shared learning-progress service.
3. Confirm whether read-aloud is browser speech, native Capacitor speech, or a cloud voice service.
4. Confirm the approved age-band taxonomy before expanding the catalogue.

## Safe next tickets

- GAMES-08-01: Adapt `LearningActivityCompletedEventV1` to the coordinator's canonical progress envelope.
- GAMES-08-02: Wire `LearningGamesExperience` into the approved new-app route.
- GAMES-08-03: Add host-managed offline queue and visible adult diagnostics for failed progress sync.
- GAMES-08-04: Add a curriculum/content review gate before any new question bank is enabled.
- GAMES-08-05: Add automated accessibility scanning in CI when the project chooses an accessibility test library.

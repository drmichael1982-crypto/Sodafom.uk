# Learning games foundation

This folder is the isolated Worker 08 foundation for the new children's app. It does not replace or alter the older game pages yet.

## What is included

- A versioned, data-driven launcher with subject and age-band filtering.
- A pure reducer for ready, playing, feedback, paused, and completed states.
- An accessible multiple-choice shell with large touch targets, keyboard controls, text feedback, pause/resume, and no timer.
- Two small starter games: Number Bonds to 10 and Word Family Match.
- Server-issued attempt receipts, versioned completion commands, and reward requests.
- Focused unit and interaction tests.

## Progress ownership

Games do not persist progress and do not award stars, badges, or levels. Durable progress requires a short-lived `GameAttemptReceipt` issued by the trusted game-attempt service. Without one, the same UI works in honest practice mode and emits no progress or reward request.

The game sends only the canonical Worker 14 progress fields that the child client can safely claim: activity kind/ID/version, completion type, score percentage, skill codes, source, attempt ID, and idempotency key. The server attaches authoritative tenant, child, event ID, and occurrence time. Raw answers are not included in durable progress commands.

## Integration example

```tsx
<LearningGamesExperience
  learnerAgeBand="5-7"
  attemptsByGameId={issuedAttempts}
  onProgress={progressService.recordCompletion}
  onReward={rewardService.requestReward}
  onReadAloud={speechService.speak}
/>
```

The host services own durable queuing, retry, error reporting, offline sync, server-side score validation, and reward calculation. The client never mints stars or trusts itself as the final progress authority.

## 797 and Archie isolation

The learning-games package is a pure child-learning feature. It has no direct network client and must not import Archie, 797, admin, business, diagnostic, codebase, payment, secret, database, or server modules. Boundary tests fail if one of those dependencies or a direct network call is added. Integration happens only through the narrow progress, reward, and read-aloud ports supplied by the trusted host app.

## Route status

No production route is wired in this branch. Worker 01 requires a canonical game-attempt API, a shared progress service, full checks, and peer review before dev-branch integration. The coordinator should then choose whether this experience replaces the legacy `/games` page or launches from a new 3D/world route.

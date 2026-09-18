# Learning games foundation

This folder is the isolated Worker 08 foundation for the new children's app. It does not replace or alter the older game pages yet.

## What is included

- A data-driven launcher with subject and age filtering.
- A pure reducer for ready, playing, feedback, paused, and completed states.
- An accessible multiple-choice shell with large touch targets, keyboard controls, text feedback, pause/resume, and no timer.
- Two small starter games: Number Bonds to 10 and Word Family Match.
- Versioned completion events and reward requests.
- Focused unit and interaction tests.

## Progress ownership

Games do not persist progress and do not award stars, badges, or levels. A host app injects `onProgress` and `onReward` into `LearningGamesExperience`. This keeps storage, retries, parent/teacher reporting, and reward policy in one app-wide service shared with lessons and reading.

Completion event IDs are stable within one play attempt. The app-wide progress service must treat `eventId` as an idempotency key. A replay creates a new session attempt and therefore a new event ID.

## Integration example

```tsx
<LearningGamesExperience
  learnerAge={7}
  onProgress={progressService.recordCompletion}
  onReward={rewardService.requestReward}
  onReadAloud={speechService.speak}
/>
```

The progress and reward callbacks are intentionally fire-and-forget from the child-facing screen. The host services own durable queuing, retry, error reporting, and offline sync.

## Route status

No production route is wired in this branch. Worker 01 architecture notes were not available when this pass was completed. The coordinator should choose whether this experience replaces the legacy `/games` page or launches from a new 3D/world route.

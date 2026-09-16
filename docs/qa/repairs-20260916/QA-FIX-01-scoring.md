# QA-FIX-01 — Honest game scores and celebrations

Coordinator: Coordinator Codex. Worker: QA-FIX-01.

Branch: `codex/qa-fix-01-scoring-20260916`

Base commit: `442656b4e2ec76167b4d0b5fb7b804cf742904a5`

## Problems reproduced

1. Shared `GameShell` called every three-star result a perfect score. Its three-star threshold is 90%, so Number Pop's 9/10 result said both 90% and “You got every question right”.
2. `LevelledQuizEngine` threw away the real correct count and percentage. It reconstructed invented results from stars: zero stars became 20% / 2 out of 10, and three stars became 95% / 10 out of 10. Short question banks were also reported as ten questions.
3. An empty `QuizEngine` question bank dereferenced a missing question and crashed.

## Changes

- Perfect-score text in the result headline, celebration banner and earned-star badge now requires a nonempty round, every question correct, and 100%. A 90% three-star result remains encouraging: “Amazing! Three stars!”
- `QuizEngine` keeps stars as the first completion callback argument and supplies the actual `GameResult` as the second. Existing consumers that only read the first argument remain compatible.
- `LevelledQuizEngine` forwards those exact results instead of reconstructing scores. Percentages are rounded from the actual correct count and selected question count.
- Empty banks show a child-readable message and do not award game completion or level progress.
- Existing star thresholds, certificate eligibility, saved best stars, replay timing and next-game destinations remain unchanged.

## Files

- `src/components/games/GameShell.tsx`
- `src/components/games/QuizEngine.tsx`
- `src/components/games/LevelledQuizEngine.tsx`
- `src/components/games/__tests__/GameShellResults.test.tsx`
- `src/components/games/__tests__/LevelledQuizResults.test.tsx`
- This report.

## Verification

| Check | Outcome |
| --- | --- |
| New GameShell regression tests before production edits | Reproduced: 4 failed, 7 passed. The failures were false perfection claims. |
| New levelled-quiz regression tests before production edits | Reproduced: 16 failed, 1 passed. Failures covered invented scores, wrong totals, empty-bank crash and missing actual-result callback. |
| Final targeted UI/regression run | PASS: 4 files, 33 tests. |
| TypeScript check | PASS: no diagnostics. |
| `git diff --check` | PASS. |

Commands from this worktree:

```sh
node node_modules/vitest/vitest.mjs run src/components/games/__tests__/GameShellResults.test.tsx src/components/games/__tests__/LevelledQuizResults.test.tsx src/contexts/ProgressionContext.test.ts src/pages/games/crossword.test.ts
node node_modules/typescript/bin/tsc --noEmit
git diff --check
```

The 28 new tests cover:

- Actual Number Pop rounds at 0/10, 1/10, 8/10, 9/10 and 10/10, including correct percentages, feedback and certificate availability.
- Certificate preview star counts, no false perfect wording, pausing automatic replay while the certificate is open, and resuming afterward.
- Manual replay after a perfect round, resetting the current score while retaining the child's best saved stars; next-game routing.
- Contradictory 100% / 9-of-10 input, 95% / 10-of-10 input and empty 0-of-0 input never receiving perfect wording.
- Exact levelled-quiz results across ten-question rounds and one-/three-question banks, unchanged 90/60/30 quiz-star boundaries, duplicate questions, the ten-question cap, empty banks and leaving a partly played round.
- Compatibility of the original stars callback argument.

Tests use React Testing Library and fake timers. Auth, network calls, adaptation persistence, voice, animation, confetti and count-up animation are mocked; question selection, answering, scoring, result UI, certificate preview and replay state are exercised. Network progress writes, payment gates, audible speech, visual animation quality, certificate printing/download/sharing and physical phone operation were not retested here.

## Remaining limits

- The quiz adaptation thresholds (90/60/30) and shared result-star thresholds (90/75/50) already differ. This patch preserves both policies as instructed. Correcting invented percentages means the shared shell now awards its stars from the real score.
- Existing historical saved scores are not rewritten.
- The eight-second automatic next-round timer is unchanged. Opening a certificate still pauses it.
- This branch has no live deployment. Coordinator review and preview/browser testing remain necessary before release.

No main/master edits, merge, deployment, production settings, external messages or Systems 797 changes were made. Other workers' files were not edited. Dependency manifests and lockfiles are unchanged.

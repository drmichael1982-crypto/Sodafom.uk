# Agent 40 — Official Handoff Report

## Agent number
40

## Original task
Build a child-friendly virtual claw machine inside the existing Rewards area. Children earn turns through genuine learning progress, use the claw to grab a guaranteed digital prize, watch it drop/open, and have the prize saved into the existing rewards/collection system. Reuse existing reward/character systems where possible. Do not add real-money turns, paid loot boxes, cash-value rewards, gambling language, pressure loops, duplicate currencies, or unrelated feature changes. Protect turn use against reconnects and duplicate submissions. Respect reduced-motion/sensory needs and keep the feature responsive on mobile, tablet, and desktop.

## Exact branch name
`agent-40-virtual-claw-machine`

## Latest completed-work commit before this report
`6094c96b822ae61f24ae217ec699a4e0ddf24ce3`

> Git technical note: a report file cannot contain the SHA of the commit that contains that exact report, because the commit SHA is calculated from the final committed contents. The official final handoff commit is therefore the branch head after this report is committed and is reported in the final chat handoff.

## Pushed
Yes. The branch exists on GitHub and all Agent 40 work is being committed only to this branch.

## What was completed
- Added a virtual claw machine to the existing `/rewards` area only.
- Added large child-friendly left/right/grab controls.
- Added grab, carry, drop, prize-opening, and celebration states.
- Added a Prize Collection Book showing claw-machine prizes won by the selected child.
- Reused the existing reward-character collection rather than introducing a separate collectible/currency system.
- Added learning-earned turns: 1 claw turn for every 3 successful saved learning sessions.
- Added server-side accounting so used turns are derived from a persistent claw-play ledger.
- Added per-play idempotency tokens so reconnect/retry requests can return the same result instead of spending another turn.
- Added per-child serialized transaction handling to protect against double taps/concurrent turn spending.
- Guaranteed an unowned available reward character for every valid usable turn; no deliberately empty grabs.
- Preserved unused turns if the available reward-character collection is complete.
- Added ownership checks so a signed-in user can only operate the claw machine for a child linked to that account.
- Kept existing star-based character unlocking unchanged.
- Added reduced-motion handling for animations.
- Added responsive layouts/touch targets for mobile, tablet, and desktop breakpoints.
- Added child-friendly offline/reconnect messaging.
- Added no-money/no-cash-value wording and no paid-turn mechanic.

## Files changed or added
- `src/components/rewards/ClawMachineRewards.tsx` — new claw-machine UI and collection book.
- `src/lib/claw-machine.ts` — turn calculation, token validation, stable prize selection, claw movement helpers.
- `src/lib/claw-machine.test.ts` — targeted reward-rule tests.
- `src/server/rewards/claw-machine.ts` — persistent play ledger, state calculation, transactional protected play handling.
- `src/server/api/rewards/characters/GET.ts` — exposes claw-machine state alongside existing reward characters.
- `src/server/api/rewards/unlock/POST.ts` — adds a scoped `source: "claw"` claim path while preserving normal star unlocks.
- `src/layouts/RootLayout.tsx` — mounts the claw-machine component only on `/rewards`.

## Tests performed
- Targeted reward-rule tests for turn earning and balance calculations.
- Tested 0, 2, 3, and 7 successful-session cases.
- Tested used-turn accounting and non-negative available-turn protection.
- Tested progress calculation toward the next earned turn.
- Tested deterministic retry prize selection for the same play token.
- Tested valid/invalid play-token handling.
- Tested claw movement bounds.
- Static review of client request/retry flow.
- Static review of server authentication and child ownership checks.
- Static review of transaction/idempotency handling.
- Static review of collection-complete handling and unused-turn preservation.
- Compared branch against `master` to confirm Agent 40 changes stayed in the Rewards/supporting integration scope.

## What passed
- 12/12 targeted reward-rule checks passed.
- Learning-turn calculations passed.
- Non-negative turn-balance handling passed.
- Deterministic protected retry logic passed at helper-test level.
- Token validation passed.
- Claw movement bounds passed.
- Branch comparison showed only Agent 40 Rewards/supporting integration files changed.
- Existing star-based unlock logic remains present and separate from claw-machine claims.
- Reduced-motion path is implemented.
- No real-money claw turns, cash-value prizes, paid loot boxes, or gambling language were added.

## What failed
No known targeted rule-test failures were found.

Full project CI/browser/database execution was not available in this agent environment because the repository has no configured GitHub Actions workflow for this branch and this execution environment did not provide the project runtime dependencies plus a test MySQL instance. I therefore did not claim an unrun end-to-end browser/database test as passed.

## Still needing work before production
- Run the repository's normal install/build/type-check/test commands in a full project checkout with dependencies installed.
- Exercise one test child end-to-end against a non-production MySQL database: earn a turn, use it, refresh/relogin, verify prize persistence, retry an interrupted request, and confirm a duplicate request does not consume a second turn.
- Perform final visual QA on representative phone, tablet, and desktop viewport sizes.
- Confirm the database account used in the eventual target environment has permission to create the `claw_machine_plays` table on first use.

## Shared files / possible merge conflicts
The most likely merge-conflict files are:
- `src/layouts/RootLayout.tsx`
- `src/server/api/rewards/characters/GET.ts`
- `src/server/api/rewards/unlock/POST.ts`

These are existing shared files and another agent may also have touched them. Merge carefully and preserve both agents' intended changes. The new Agent 40 files under `src/components/rewards/`, `src/lib/claw-machine*`, and `src/server/rewards/claw-machine.ts` should normally merge cleanly unless another agent independently created the same paths.

## Master / deployment confirmation
- `master` was **not merged** into by Agent 40.
- Agent 40 did **not deploy** to Railway.
- Agent 40 did **not deploy** anywhere else.
- Work remains isolated on `agent-40-virtual-claw-machine` for final review/merge by the coordinating agent.

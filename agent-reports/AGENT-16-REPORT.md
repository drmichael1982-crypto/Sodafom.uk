# Agent 16 Recovery — Chores and Pocket-Money Notes

## Scope and recovery decision

- Recovery branch: `recovery/agent16-chores-pocket-money-20260913`
- Base: current `main` at `305401dd15acfaa60d8bd12f32a1aafd5f351f34`
- Status: verified; the scoped source and tests have been uploaded to this recovery branch through the authorised GitHub connector.
- No merge, pull request, Railway action, deployment, default-branch change, or 797 work has been made.

The historical `agent-16-chores-pocket-money-20260913` branch was inspected. It was based on the older production `master` line and included a very large set of unrelated application, database, deployment, payment and admin changes. None of those changes were copied. This recovery ports only a small, self-contained chores feature onto the current `main` base.

## Delivered

- Child view: `/chores` (also available at `/pocket-money`) lets a child mark a chore ready for review.
- Grown-up controls: `/parent-dashboard/chores` uses the existing signed-in route guard to create, approve, return, and archive chores.
- The feature offers age-neutral, child-safe task ideas and blocks obvious risky wording such as heat, blades, chemicals, roads, heavy lifting, electrical items, and medicine.
- A grown-up must tick a safety-and-suitability confirmation before a new chore can be created.
- Rewards are either separate **chore points** or a **pocket-money note**. Chore points never affect game stars; a pocket-money note is not a payment, wallet, transfer, or balance.
- A child submission earns nothing. Only one grown-up approval transitions a pending chore to approved; returning it records no reward and allows a retry.
- Pending review requests cannot be archived silently.
- The tracker is intentionally device-local (`localStorage`) and stores no child name, account identifier, payment detail, or network data.

## Safety and privacy boundary

The parent-controls route uses the app’s existing authenticated route guard, but this recovery deliberately adds no server or database role system. It is therefore a small family reminder tracker on one browser, not a financial record or a new security boundary. Normal use keeps child actions limited to submitting work, while normal grown-up controls perform creation/review/archive actions.

No Stripe/payment, AI, admin, seasonal-cover, deployment, database, migration, or external API code is imported or changed.

## Verification

| Check | Result |
| --- | --- |
| Focused chores model tests | 7 passed |
| Full Vitest suite | 19 files, 159 tests passed |
| TypeScript (`tsc --noEmit`) | passed |
| Production client + SSR build | passed |
| Focused ESLint | no errors; three pre-existing `routes.tsx` warnings remain |

## Remaining product decisions before a durable family feature

1. Whether chores should be server-backed and scoped to a real parent/child relationship rather than one browser.
2. Whether recurring schedules and multi-device synchronisation are wanted; neither is added here because they need data and access-control design.
3. Whether a separate parent credential/role is required beyond the project’s existing signed-in route guard.

This report is the final recovery-branch status update after the verified source upload. The branch is ready for review and later integration only. It has not been merged or deployed.

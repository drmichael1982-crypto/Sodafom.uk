# Seasonal Covers Recovery Report

## Scope

- Recovery branch: `recovery/seasonal-cover-switcher-20260913`
- Base: current `main` at `305401dd15acfaa60d8bd12f32a1aafd5f351f34`
- Status: verified and uploaded to this recovery branch through the authorised GitHub connector.
- No merge, pull request, Railway action, deployment, or 797 change has been made.

## Delivered

- Added the `/seasonal-themes` cover picker with large responsive cards and native button keyboard support.
- Preserved the original **Everyday Rainbow**, **Christmas**, and **Easter** choices.
- Added **Bedtime Stars**, **Birthday Celebration**, **Mother’s Day**, **Father’s Day**, **Grandparents’ Day** (inclusive of Nan, Nanny, and Grandad), and **Teacher Thank-you**.
- Added an obvious **Everyday / remove cover** action. It removes the saved setting and restores the normal Sodafom background.
- Stores the selected cover only in this browser's `localStorage`; no child data or external image assets are used.
- Applied the selected CSS/emoji cover to both homes:
  - Archie’s Adventure home (`/`)
  - Sodafom Home (`/classic-home`)
- Added visible **Covers** links from both home screens and a plain-language status announcement for assistive technology.

## Verification

| Check | Result |
| --- | --- |
| Focused seasonal-cover tests | 6 passed |
| Full Vitest suite | 19 files, 158 tests passed |
| TypeScript (`tsc --noEmit`) | passed |
| Production client + SSR build | passed |
| Focused ESLint | no errors; existing unrelated warnings remain in older home/routes files |

## Follow-up boundary

This is a self-contained recovery branch. Its source and tests were uploaded in seven sequential GitHub connector commits after verification; this report is the final branch report upload. It is ready for review and branch-level integration later, but it has not been merged into `main` or `master` and has not been deployed.

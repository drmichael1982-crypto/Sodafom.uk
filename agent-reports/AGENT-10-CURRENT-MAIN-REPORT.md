# Agent 10 Recovery — current-main Classroom Lessons

**Status:** authorised GitHub recovery-branch upload complete and content verification passed.

## Recovery basis

- Recovery branch: `recovery/agent10-current-main-classroom-lessons-20260913`
- Current-main base: `305401dd15acfaa60d8bd12f32a1aafd5f351f34`
- Legacy reference reviewed: `agent10/classroom-lessons-20260913` at
  `6bbae3eff477706d444a84163c80a337c1f48858`
- Teacher architecture reference reviewed only:
  `recovery/agent14-schools-teachers-20260913` at
  `dda8eabf0138cf2ae608b71aee5effc4ccf2d8c9`

The legacy Agent 10 branch is a divergent old-master branch (99 commits ahead
and 23 behind current `main`), so none of its history was cherry-picked or
merged. Agent 14 was not merged either.

## Delivered

- Rebuilt `/tutor` and `/teacher-mode` as a current-main classroom lesson
  experience while keeping both existing routes unchanged.
- Added local lesson selection by subject, learner age group, rotation number,
  and 15/20/30/60-minute duration. Every planned minute is allocated over eight
  clear learning stages.
- Reused the existing local curriculum and existing on-device tutor memory;
  this recovery adds no cloud lesson loader, API call, database read/write, or
  new child-data store.
- Added a child-safe PE rotation for football control, athletics pacing,
  basketball passing, floor balance, coordination, and throwing/catching. PE
  gives practical safety guidance, never requires equipment, and never claims
  that Sodafom observed or scored physical performance.
- Added classroom and PE scene cues with CSS/emoji and existing character
  components only; no new external or unapproved visual assets were used.
- Added pause, help, read-aloud, typed/tapped answers, optional in-tab activity
  responses, feedback, and a visible timer/stage plan. Help pauses the timer.
- Voice answers are strictly opt-in by button press. The UI handles unavailable
  or denied browser speech recognition gracefully and states that Sodafom does
  not save raw audio; touch and typing remain complete alternatives.
- Teacher integration uses only the existing public `getTeacherProfile()`
  helper. When an existing teacher session is present, the page provides a
  Teacher Hub link and explicitly states that it does not send answers,
  recordings, or marks. This remains compatible with Agent 14's equivalent
  helper boundary without copying its authentication, API, or school-data work.

## Deliberate exclusions

- No AI routing, payments, admin, scanner, school API/auth change, database
  schema/seed, default branch, Railway, deployment, PR, merge, or `797` work.
- No microphone auto-start, raw-audio storage, direct teacher API request,
  teacher-data write, activity upload, or cloud lesson request.
- No dependency manifest or lockfile change.

## Files

- `src/lib/tutor/classroom-lesson.ts`
- `src/lib/tutor/classroom-lesson.test.ts`
- `src/pages/tutor/ClassroomLessonPage.tsx`
- `src/pages/tutor/ClassroomLessonPage.test.tsx`
- `src/pages/tutor/TeacherModePage.tsx`

## Local verification

| Check | Result |
| --- | --- |
| Focused lesson and classroom UI tests | 10 passed |
| Tracked/staged Vitest suite | 20 files / 162 passed |
| TypeScript | `tsc --noEmit` passed |
| Targeted lint | passed with no errors or warnings |
| Production client build | passed (existing large-chunk advisory only) |
| Production SSR build | passed |
| `git diff --check` | passed |

The installed local toolchain was used for validation. Current `main` has a
pre-existing package-manifest/lockfile inconsistency that causes package-manager
commands to propose unrelated lockfile rewrites; this recovery intentionally
leaves dependency files unchanged.

## Outstanding acceptance checks

- Test optional browser speech recognition and permission-denial wording on
  real Chrome/Android/iOS-supported environments; no physical microphone or
  device test was run here.
- Visually review keyboard, screen-reader, phone, tablet, and desktop layouts,
  plus timer/pause and reduced-motion behaviour in real browsers.
- Test an actual authenticated teacher session against the current Teacher Hub,
  then repeat once the separately-reviewed Agent 14 architecture is integrated.
  This recovery deliberately does not call those services.
- No live database, class roster, education-cloud lesson table, or production
  data was contacted. If a future product decision needs teacher-visible lesson
  records, design and review that privacy contract separately.

## Upload record

- The five source and test files above were uploaded only to
  `recovery/agent10-current-main-classroom-lessons-20260913` and read back
  byte-for-byte against the tested local commit.
- This report is included in the final branch-content verification. No PR,
  merge, deployment, Railway action, or default-branch write was performed.

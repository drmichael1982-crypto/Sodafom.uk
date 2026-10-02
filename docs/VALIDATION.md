# Validation recorded on 2 October 2026

- TypeScript: passed.
- Production test build: passed.
- Focused unit/regression suite: 19 tests passed across 5 files.
- Browser checks: 10 journeys passed.
- All 127 catalog game destinations opened without a crash or redirect to home.
- Main screens checked at 360, 390 and 1280 pixels with no horizontal overflow.
- Browser exceptions during those checks: 0.
- Requests to the original production API during those checks: 0.

## Browser journeys

1. Approved home: every navigation button opens its destination
2. One shared Ask Archie: local maths, close, context and navigation
3. Spelling whiteboard: wrong answer, seven correct answers, pause and saved reward
4. Books: reader pagination, read aloud and completion saved once
5. Homework: upload/remove and the typed question reaches shared Archie
6. Parents: saved year group, large text, setup status and progress
7. Cartoons: selection, play/pause, next, restart and return
8. Games menu: filter, search and existing game launches
9. All 127 linked game routes render without a crash or home redirect
10. Phone and desktop layouts: no horizontal overflow

## Remaining hosted/device checks

GitHub push and deployment have not happened yet because repository creation is waiting for secure browser sign-in. AI provider configuration/reuse and a live answer remain to be verified on the new hosted service. Speech output, microphone permission and camera behaviour need a real phone check. Existing game routes were opened, not all played to completion.

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

## Hosted release

- Pushed to `test/archie-2026-10-02` in `drmichael1982-crypto/Sodafom.uk`.
- Separate service: `https://archie-learning-test-production.up.railway.app`.
- Health endpoint returned HTTP 200 with `ok: true`.
- Hosted AI returned a correct, child-friendly rainbow explanation, HTTP 200, in 3.54 seconds on 2 October 2026.
- The new service references the existing 797 provider key and economy model securely in Railway; it does not use the private 797 control API.
- A 390px browser check passed home navigation, rubber clearing a typed spelling, correct spelling, next word and the shared assistant.
- Original main remains `5b9641d1090abe762a1f23ac6cb0cda0590e57ce`.

## Remaining work

The user prioritised a quick release of static 3D-looking artwork and working buttons. Accounts, cross-device syncing and photo OCR are not enabled in this first test release. Their follow-up implementation is checkpointed separately on local branch `wip/archie-accounts-photo` and is not release-verified. A permanent storage volume is required before accounts can be enabled.

The completely separate private GitHub repository still needs browser sign-in. Speech output, microphone permission and camera behaviour need a real phone check. Existing game routes were opened, not all played to completion.

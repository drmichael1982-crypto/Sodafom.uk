# Phone layout and button check - 2 October 2026

## Changes

- Fit the complete approved home and lesson artwork within the small visible viewport, including safe-area insets.
- Add readable home and lesson controls for short landscape screens.
- Keep spelling inputs at 16px to avoid automatic focus zoom on iPhone.
- Fit word-search grids at 320px and wrap the analogue/digital clock pair.
- Switch the legacy teacher header to its compact menu below 1024px.
- Remove sideways question-panel entrance movement that temporarily overflowed in WebKit.
- Preserve the newer colourful menu, game-card and library artwork from remote commit cedbade60852def08acbcda3e65e5fa367f12ca3.

## Evidence

- 541 layout cases each in Chromium and WebKit: 1,082 total, no horizontal overflow, off-screen home/lesson artwork controls or browser exceptions.
- Core routes at 320x568, 360x640, 375x667, 390x664, 393x852, 412x915, 430x932, 540x720, 768x1024 and 844x390.
- All 127 game destinations at 320px, 390px and 430px in both engines.
- Ten existing button journeys pass in both engines: home navigation, shared helper, seven-word spelling completion, reward/sticker persistence, book pagination/completion, homework photo/remove/question handoff, saved parent settings, picture-story playback, filtering/search and game launch.
- Direct-tap checks at five phone/landscape sizes in both engines: all nine home destinations, local assistant answer, spelling input, rubber, correct answer, next word and pause/resume.
- Number Pop completed with ten correct answers, followed by result and certificate open/close, in both engines.
- Production build, TypeScript check and git whitespace check pass.

## Scope

These are automated browser and viewport simulations, not certification on every physical phone. Real-device microphone permission, spoken output, soft keyboard and browser chrome still need hands-on checks. All game routes were opened; this is not a full playthrough of all 127 games. Long catalogues and reading pages scroll vertically so controls and text remain readable. Accounts, payments, cross-device sync and photo OCR remain outside this test release.

## Reproduce

Run `npm run build`, `npm start`, then `node scripts/check-phone-layouts.cjs` and `node scripts/test-phone-actions.cjs`.
Set `ARCHIE_BROWSER=webkit` for the WebKit run; install the matching Playwright browser and dependencies first.
Set `ARCHIE_TEST_URL` to test the hosted copy. The Chromium executable can be set with `ARCHIE_CHROMIUM_PATH` for the layout script.

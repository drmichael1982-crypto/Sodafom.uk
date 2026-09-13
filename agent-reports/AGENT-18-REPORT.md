# Agent 18 Recovery Report

- **Agent number:** 18
- **Original task:** Voice and audio — child-safe read-aloud, accessibility controls, microphone/recording lifecycle, captions and safe fallbacks.
- **Recovery branch:** `recovery/agent18-voice-audio-20260913`
- **Base:** remote `main` at `305401dd15acfaa60d8bd12f32a1aafd5f351f34`
- **Recovered source reviewed:** `agent18/master-voice-audio-20260913` at `14986eddf34d6f084808bc1f1fd94468f04035bf`
- **Latest implementation commit:** `cbeb2951097179b1fd26b4f2685c6cb0cdc09308`
- **Pushed:** Yes — verified on this recovery branch through the authorised GitHub connector. No PR, merge or deployment was created.

## Completed

- Rebuilt the compatible, safe portion of the divergent Agent 18 work on current `main`, rather than cherry-picking its old history.
- Added one local audio policy: persisted settings contain only the family’s voice enabled/quiet/volume choices, while foreground reading and microphone sessions cancel one another cleanly.
- Replaced unsafe read-aloud lifecycle handling with a single cancellable service. It cleans display formatting before speech, has a bounded watchdog, stops on page hide, avoids raw-text console logging, and uses the existing optional Android bridge with a browser speech fallback. It does not call paid AI or a speech provider.
- Added temporary managed read-aloud captions, a Clear caption control, managed mute/volume/quiet choices, and a Stop reading and microphone control in the existing accessibility panel.
- Added an explicit microphone test only. It never starts by itself, has a short timeout and Stop button, does not display, retain, route, or save recognised words, and gives a typed-control fallback for unsupported, denied, unavailable, or noisy input.
- Reworked personal voice recording so it starts only after a deliberate button/countdown, uses video-disabled, single-channel constraints, stops late permission streams after cancellation, stops on page exit, and is bounded to eight seconds / 1.4 MB before base64 conversion.
- Keeps a new recording in memory for preview only. It reaches existing device-local clip storage only after the separate **Save recording** action; unsaved replacements can be discarded without overwriting the earlier saved clip. Saved clips are type/size validated before loading, and Delete removes the local clip.

## Privacy and safety confirmation

- No raw reading text, microphone transcript, or recording is sent to a network endpoint, analytics service, AI provider, or console by this recovery work.
- Captions are memory-only and are cleared on completion, Stop, page hide, and accessibility-panel close.
- The only recording persistence retained is the existing explicit device-local personal-clip design. Its stored data URL is constrained and validated; this branch does not add cloud sync, automatic recording, or paid AI.
- Browser speech recognition can use the browser’s configured speech service; the UI says so before the optional test. The application itself neither retains nor transmits the words.

## Tests performed

| Command | Result |
| --- | --- |
| `node --test tests/agent18/voice-audio.test.cjs` | Passed: 8/8 focused checks (settings/focus, text cleanup/chunks, explicit recognition, denied fallback, late stream cancellation, bounded recording, static privacy controls, TypeScript parsing) |
| Targeted ESLint on all changed Agent 18 source/test files | Passed: 0 errors, 0 warnings |
| `pnpm type-check` | Passed |
| `pnpm build` | Passed (existing large client-chunk advisory; dependency comments were stripped by Rollup) |
| `git diff --check` | Passed |

`pnpm install --frozen-lockfile --offline` was blocked before testing because current `main` already has manifest/lockfile specifier drift. An offline `pnpm install --no-lockfile --ignore-scripts` supplied the local test layout without changing tracked manifest or lock files.

## Deliberately omitted stale or out-of-scope integrations

- The old branch’s `app/src/main/java/uk/sodafom/app/ArchieSpeechPlugin.java`, `src/lib/island-speech.ts`, and `src/pages/ArchieFriendsPage.tsx` were not brought over: all three paths are absent on current `main`, and restoring them would revive an obsolete native/UI integration rather than preserve the current design.
- Its old browser-script/docs files were replaced by this scoped Node test and official recovery report; no stale test harness or legacy documentation was copied unchanged.
- No broad migration of every existing game, scanner, AI-teacher, or character microphone/read-aloud call site was made. The shared safe read-aloud wrapper remains API-compatible, but per-feature redesign would cross Agent 12 scanner, AI routing, games, and other recovery scopes.
- No scanner, AI routing, payment, admin, default-branch, Railway/deployment, or `797` files were changed.

## Device checks still required before release

- On Android/iOS hardware: grant, deny, revoke, and cancel microphone permission while the browser/native prompt is open; confirm late streams stop and no clip is saved without Save recording.
- On Android Capacitor: test the existing native Archie speech bridge’s speak/stop/cancel behavior, then its browser fallback. The native bridge source was intentionally not recreated because it is absent from current `main`.
- On supported HTTPS browsers: verify browser recognition permission/error messages, background/page-hide cancellation, headset/Bluetooth switching, and browser-specific speech-service disclosure.
- With keyboard and screen reader: verify focus order, temporary captions/clear action, stop/mute controls, large text, and high-contrast panel scrolling.
- On a real child/parent device: verify local-storage quota/private-mode handling, explicit save/delete behavior, and family consent wording with the final privacy review.

## Shared files / merge conflicts to watch

- Shared recovery surfaces: `src/lib/voice-context.tsx`, `src/components/VoiceRecorder.tsx`, and `src/components/AccessibilityBar.tsx`.
- Agent 12 also safely changes `src/lib/voice-context.tsx`; reconcile the two implementations deliberately rather than blindly combining them.

## Safety confirmation

`main`/`master` was not merged or changed. No PR, Railway action, deployment, payment action, or production configuration change was made.

# Agent 18 — voice and audio branch report

Date: 13 September 2026

Repository: `drmichael1982-crypto/Sodafom.uk`

Branch: `agent18/master-voice-audio-20260913`

Base: `master` at `058097f78077015980460c0b359903fda5aa83a6`

Status: **Partial implementation for review. Not a full feature completion or production-ready sign-off.** The final commit identifier is supplied in the GitHub commit and handover message, rather than embedded into its own contents.

## Changes implemented

- A shared foreground-audio owner prevents the migrated microphone and voice services from talking over one another. Optional effects and registered music/audio elements are silenced during shared speech or listening. Quiet mode leaves teaching voices available while suppressing optional music/effects; voices also have an independent switch and volume control.
- Shared speech sessions cancel voice-loading listeners, timers and old callbacks. Native failures arriving after Stop cannot resurrect speech. Long text is chunked, completion is bounded, page exit cancels playback, and spoken-text diagnostics no longer log children's text in the modified services.
- Character voices are pinned by identity rather than array position. An unavailable pinned browser voice is reported instead of silently replaced. Explicit reviewed role/voice configuration is supported. Regex word boundaries prevent `female` matching `male`. Only local synthesis voices are selected; no paid AI/TTS call was added.
- Archie has the requested child-boy profile. Existing family dogs Jessica, Sally and Daisy are blocked from human synthesis. Optional, short procedural dog reactions have different pitches. These are synthetic sound-effect previews, NOT approved recordings of real barks.
- An explicit shared microphone controller exposes requesting/listening/off/error states, bounded listening, permission-denial messages, no automatic retry, one final result, and cancellation on page exit. The existing island answer listener delegates to this controller without changing answer selection rules.
- The voice recorder requests permission from a deliberate action, supports cancelling a pending request, stops late-arriving streams, closes tracks on failure/unmount/profile change, negotiates the actual recording format and limits clips to eight seconds. Existing explicit Save/Delete controls and device-local clip storage remain. Ideal echo cancellation/noise suppression/automatic gain constraints apply to recordings, not necessarily browser speech recognition.
- Inline voice/music/effects controls and a microphone test were added inside the existing accessibility panel. No additional floating icon was introduced. The Friends page retains its images, roster, text and navigation, replacing random voice cycling with the shared service and adding playback cleanup/status feedback.
- The root Android `app/.../ArchieSpeechPlugin.java` no longer raises system volume or logs spoken text. Per-utterance volume respects the user's hardware level; unique utterance IDs guard callbacks from older calls; stop/replacement clears pending text; local voice selection is deterministic. This source change is NOT an Android build pass.

## Actual validation

| Check | Result | What it does and does not prove |
| --- | --- | --- |
| `node scripts/test-agent18-audio.mjs` | **46/46 passed** | Strict isolated TypeScript compilation of four audio modules, deterministic mocked speech/recording lifecycle tests, policy/voice/choice tests, and Android source assertions. No physical microphone or provider calls. |
| `python scripts/test-agent18-browser.py` | **26/26 passed** | Offline Chromium 144.0.7559.96, desktop 1440×900 and touch/mobile-sized 390×844. Real Web Audio and MediaRecorder with an internally generated audio stream. Speech recognition, synthesis and permission events are mocked. This is a service harness, NOT the React app or a physical mobile browser. |
| Five modified TSX files parsed/transpiled using TypeScript | **5 passed, 0 syntax diagnostics** | Syntax/transpilation only; no full React dependency/type/build validation. |
| Accessibility source preservation | **Passed** | Removing the audio import, inline control and panel scrolling addition reproduces upstream blob `9f7b56a0be1c47cc3574fa143fb02265b1c4a117`. Existing display options were preserved. |
| Repository checkout/full app tests | **Blocked/not run** | Git clone failed because `github.com` did not resolve in the execution container. An isolated workspace was reconstructed from pinned GitHub connector reads. React/Vitest/project dependencies were not installed. Local Node 22.16.0 is also below this project's declared Node >=22.22.0 requirement. |
| Normal local app browsing | **Blocked** | Chromium navigation to the temporary localhost server returned `ERR_BLOCKED_BY_ADMINISTRATOR`. No browser policy was changed. The successful offline harness uses `set_content` and executes only supplied local test code, with no network navigation. |
| Android compile/install and physical device checks | **Not run** | No Android SDK/Gradle build or physical iPhone, Android phone, tablet or desktop microphone/speaker verification. |

An additional unused-import check found one unused audio import, which was removed before committing; the isolated suites now compile with unused-local and unused-parameter checks enabled. The first syntax-check attempt used an incorrect TypeScript module location; it was corrected to the installed global package and all five syntax checks then passed. No remaining failure was observed in the two successfully executed isolated suites. Blocked and unrun checks are not counted as passes.

## Remaining work — do not mark the whole brief complete

1. Supply and review the complete approved cast metadata and licensed voice assets/provider identities. The legacy Friends roster does not establish reliable ages, genders or species for every character. Those characters remain unassigned device fallbacks rather than invented roles. Browser pitch alone is NOT a verified eight-year-old boy's voice. Distinct final voices and identical acoustic voices across iOS, Android and desktop have NOT been delivered.
2. Migrate remaining direct browser speech/recognition and audio call sites with their owning agents. This branch deliberately does not rewrite the chatbot, tutor, games, scanner, books, cinema, birthday room, admin or payments feature files. The legacy `VoiceAssistant` and `ApprovedArtworkPage.playButtonFeedback` still bypass the shared owner. Existing music/video players require `registerAudioElement` or equivalent explicit integration. Therefore the new controls do NOT yet govern every sound across the app.
3. Integrate `speakCharacterDialogue` into approved scene playback and review natural turn-taking/animation synchronization. The shared sequence API is present; the app's scenes were not rebuilt. Add reviewed action-to-effect hooks and perceptually approve or replace the synthetic dog reactions. No human dog speech should be introduced.
4. Run the actual project install/build/type-check/Vitest suite using its supported Node and dependency versions. Reconcile root `app` source with the repository's separate Android submodule before packaging; only the root speech plugin source was modified here. Check native plugin compilation, device engine voice availability, missing voice behavior, permissions and lifecycle.
5. Test real iPhone/iPad Safari, Android Chrome/WebView/native app and Windows/macOS browsers. Include allow/deny/revoke, absent mic, double taps, Bluetooth/headphones, calls/backgrounding, app navigation, long reading, slow voice loading, no connection, accents, realistic background noise, music ducking, quiet mode and actual character/dog listening checks. Unsupported recognition must retain typing/tap controls. Browser recognition may use the browser vendor's online service; no local-only transcription claim is made.

## Integration API

- `ttsSpeak(text, onEnd?, character?)` retains the legacy entry point; cancellation does not run a stale completion callback that might reopen the microphone.
- `speakCharacter(character, text)` returns `{ finished, stop }`; callers should stop owned playback when they unmount or replace a scene.
- `speakCharacterDialogue(lines)` plays ordered `{ character, text }` turns with an owned cancel handle.
- `configureCharacterVoice(profile)` is for reviewed cast data. Voice selection results distinguish configured voices from device fallbacks; no AI-inferred casting.
- `startSpeechInput(options, host?)` is explicit single-shot listening. Existing continuous conversation features still require coordinated adoption; this branch does not silently enable always-listening.
- `startVoiceRecording(options, host?)` returns `{ stop, cancel }`; only explicit application Save persists a resulting clip.
- `registerAudioElement(element, channel)` returns a cleanup function. Call it for controlled audio only; it does not hijack arbitrary media elements.
- `playActionSound(action, reaction?)` is optional and bounded; no delayed effect is queued behind a teaching session.

## Scope and repository safety

Only audio service code, the audio recorder/control integrations, the Friends voice integration, the Android speech plugin, these tests and this report are included. No lesson content, game mechanics, artwork assets, AI routing, accounts, payments, deployment files or other branches were changed. No PR, merge or deployment was initiated. No API key, real recording or child's transcript is included in test artifacts.

## References checked

- MDN: SpeechSynthesisVoice/localService — https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService
- MDN: SpeechRecognition — https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
- MDN: MediaTrackConstraints/noiseSuppression — https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/noiseSuppression
- Android: TextToSpeech — https://developer.android.com/reference/android/speech/tts/TextToSpeech
- Capacitor: PluginCall typed values — https://github.com/ionic-team/capacitor/blob/main/android/capacitor/src/main/java/com/getcapacitor/PluginCall.java

## Original Agent 18 brief

Create a new branch from master. Don't deploy. Work only on voice, microphone, character voices, and sound effects. Make mic and voice input reliable across the app. Check permissions, speech recognition, background noise, and clear mic on-off states. Give each approved character a fixed consistent voice. Archie is a friendly 8-year-old boy. Other child characters have distinct age-appropriate voices. Adult women teachers have distinct adult women's voices, and adult men have distinct men's voices. Keep voices consistent across all areas. Characters talk naturally to each other without changing voices. Give the dogs their own friendly barks and reactions. Don't make them speak as humans. Add optional sensory sound effects and playful noises tied to on-screen actions, but never drown out teaching or reading. No silly floating icons. Add controls for voices, music, and sound effects, plus a quiet or reduced sensory mode. Test on mobile and desktop. Don't touch other agents' features. Commit only to your branch. Report exact branch name and latest commit ID, what passed, what failed, what needs work. Don't merge.

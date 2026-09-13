# Agent32 — Child privacy, safety and permissions

Date: 13 September 2026
Repository: `drmichael1982-crypto/Sodafom.uk`
Branch: `agent32/child-privacy-safety-permissions-20260913`
Base: `master` at `058097f78077015980460c0b359903fda5aa83a6`

## Result and scope

Five production files received privacy-only changes. The isolated regression suite passes **69/69 tests**, with zero failures, skips or cancellations. Running the same suite against the exact original source gives **36 passes and 33 failures**. These are test-case results, not 33 separate vulnerabilities.

This is not whole-application privacy certification. No merge, deployment, production-data access, paid AI request or live-account creation was performed. No artwork, lesson content, pricing, AI routing, database schema, platform configuration or other agent branch was changed.

## Privacy fixes

1. `src/components/VoiceRecorder.tsx`: stop and discard capture on screen exit, child/clip changes, hidden page and pagehide. Cancel countdowns, abort pending preview reads, ignore late permission callbacks and release a late-granted stream immediately. Release the microphone on recorder construction/start failures and on Stop without waiting for the queued stop event. Prevent repeated taps from opening parallel captures. Request audio only after Record; do not request video. Retain the existing eight-second limit and explicit Save/Delete actions. No new recording store was introduced.
2. `src/lib/voice-context.tsx`: remove spoken text, native response bodies and raw speech error payloads from logs. Keep metadata-only engine events. Voice selection, speech content and fallback behaviour are unchanged.
3. `src/server/auth-middleware.ts`: stop cloning/reading/logging failed authentication response bodies and raw request paths. Remove raw exception messages from logs and replace configuration/database failure details with a generic sign-in message. Preserve the authentication response forwarding and stale-session recovery flow.
4. `src/server/api/children/[childId]/progress/GET.ts`: replace raw exception responses with a generic progress-unavailable message. Preserve the existing ownership predicates and data queries.
5. `src/server/api/ai-teacher/read-page/POST.ts`: explicitly set `store: false` for homework/reading image Responses requests. Model, billing guard, inputs, prompts and limits are unchanged. This disables retrievable response-state storage; it does NOT establish zero provider retention or override separate abuse-monitoring/image safety policies.

## Executed tests

| Area | Cases | Result |
| --- | ---: | --- |
| Authentication response/log privacy and preserved forwarding/recovery | 8 | Pass |
| Progress authentication, identifier validation, ownership and private errors | 10 | Pass |
| Teacher profile credential expiry, own-profile fields and private errors | 6 | Pass |
| Admin ordinary-role rejection, fail-closed checks and signed founder cookie | 10 | Pass |
| Recorder permission timing, cleanup, cancellation, profile changes and explicit saving | 24 | Pass |
| Scan storage flag, invalid input, preserved guard and private provider errors | 6 | Pass |
| Native/browser read-aloud success, fallback and error-log privacy | 5 | Pass |
| **Total** | **69** | **Pass** |

The teacher profile route and admin helper were tested but not changed. The progress tests use two synthetic families and evaluate the actual route predicates: a distinct child, teacher or other parent identity cannot read the selected parent's child. This does not prove that a child holding an already-authenticated parent's browser session is separated from that parent.

### Reproduce

With the project's development dependencies installed:

```sh
node --test scripts/agent32-privacy.test.cjs
```

The suite loads and transpiles the actual source files. It uses explicit synthetic authentication, database, media and hook-lifecycle adapters, not a React renderer or physical browser. No network or real personal data is used. `AGENT32_SOURCE_ROOT` can select another checkout for a baseline comparison.

Execution environment: Linux, Node 22.16.0, TypeScript 5.8.3. Because dependency installation and direct Git cloning were unavailable, selected source files were read through the GitHub connector and their original Git blob hashes verified. Execution used the available global TypeScript with `NODE_PATH=$(npm root -g)`. The repository declares Node >=22.22.0; a supported-runtime full build, project Vitest suite, semantic type-check and browser/device integration tests were NOT run. The new CJS test script passed `node --check`; transpilation reported no syntax errors for loaded source.

## Additional source review — not device-tested

`src/pages/HomeworkHelperPage.tsx` opens its camera/file picker after Scan is pressed and transmits an image in a POST body only after Explain is pressed. It holds the selected image in component state. This is not proof about OS camera storage, image metadata, proxy logging or provider retention.

`app/src/main/AndroidManifest.xml` declares microphone access but no camera permission in that inspected manifest. It enables backup and cleartext traffic. `MainActivity.java` registers the speech plugin and does not itself request startup permissions. Native plugin internals, the separate Android gitlink and effective merged manifests were not fully audited or built.

`src/lib/teacher-auth.ts` uses an Authorization header rather than a URL for the teacher token. It stores teacher tokens and profile details in localStorage. The inspected voice context also retains explicitly saved clips in localStorage by child ID.

## Still needing work before privacy sign-off

- **High priority: shared-device role separation.** Verify child mode, direct parent/teacher/admin URLs, reauthentication, logout and profile switching in the complete app. An authenticated parent cookie must not silently grant a child adult access. The isolated identity tests cannot certify these UI/session boundaries or all API endpoints.
- **High priority: retention and account separation.** Review existing saved voice clips, teacher tokens/profile storage, account-switch clearing, logout behaviour and Android backup scope. No retention/account-storage system was redesigned in this branch.
- **Scanner lifecycle and error UI.** The reviewed homework page does not abort its pending file read/request when the picture is removed or the screen closes, and displays raw failed-response text. Coordinate targeted fixes with the scanner owner. Review EXIF/private image metadata and the parent-facing processing explanation.
- **Real permissions.** Test grant, deny, dismiss, revoke, background, navigation and late permission grants on Android, iPhone/iPad and desktop browsers, including the native speech path. Camera permission/picker behaviour was source-reviewed, not exercised on a device.
- **Remaining data paths.** Audit other endpoints, framework responses, reverse-proxy/hosting logs and third-party settings. This branch removes the identified logging/error leaks in the five scoped files, not every possible application data exposure.

Potential integration overlap: Agent18 voice files, Agent29 authentication middleware, Agent28 progress route and Agent12 image route. Review these small privacy hunks alongside those agents' branches; do not overwrite their feature changes or merge automatically.

## Technical references consulted

- MDN: MediaDevices.getUserMedia() — permission requests can remain pending; delayed results need lifecycle handling.
  https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
- OWASP Logging Cheat Sheet — exclude sensitive personal data, access/session tokens and raw secrets from logs.
  https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
- OpenAI data controls — Responses storage and abuse-monitoring retention are separate controls.
  https://platform.openai.com/docs/guides/your-data

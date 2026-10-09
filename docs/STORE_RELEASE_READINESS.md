# Store release readiness — 9 October 2026

This is a repository audit and release plan. No native binary was signed, uploaded or approved. Store approval and a release date cannot be inferred from a passing web build.

## Submission blockers found

| Area | Repository evidence | Required completion |
| --- | --- | --- |
| Native projects | `android/` is empty; `ios/` is absent; `@capacitor/ios` is not installed | Generate and maintain real native projects; build, sign and test them with the developer's store accounts. |
| Privacy policy | `ArchiePrivacy.tsx` describes a school preview and explicitly leaves controller/contact, hosting/AI providers and retention unsettled | Publish a final policy at an actual HTTPS URL and link it in app and listing. Complete accurate App Privacy and Play Data safety answers after validating every shipped SDK and backend. |
| Account deletion | `archie-parent-auth.ts` allows signup, signin, signout and get-session only; `ParentAccountPanel.tsx` has no delete-account path | If accounts ship, implement authenticated deletion of account and associated data, an in-app entry and a working web request path. Signout, API-key disconnect and local progress clearing do not delete an account. |
| Children and AI | School-year selection and grown-up gates are device preferences; the privacy page says the gate is not proof of parental consent | Decide actual intended audiences, launch regions and consent process. Identify actual speech/AI processors and retention terms before enabling personal-data transfer. Verify external links and purchasing areas against the chosen children's category rules. |
| Microphone | `ArchieHelper.tsx` uses browser `SpeechRecognition` with typed fallback; native permission files and native speech integration are absent | Validate support on each native WebView. Request access only on deliberate use, provide accurate purpose text and check permission denied/revoked, cancellation, backgrounding and typing. Never claim support on every phone from a mocked speech test. |
| Shipping quality | Current product and documents describe a preview; no device release evidence recorded for this checkout | Remove incomplete production journeys, prepare real screenshots and review notes, supply review access for account features, and perform TestFlight/Play testing plus physical-device checks. |

The preview pricing and payments remain off. If paid digital features are enabled, separately choose and implement the applicable store billing approach before submission.

## Current official requirements to verify again on submission day

- Apple requires functional submissions, accessible privacy policies, age-appropriate Kids Category behavior and gated outward links/purchases. A gate does not establish legal parental consent. Personal-data sharing with third-party AI requires clear disclosure and explicit permission. [App Review Guidelines, 1.3, 2.1, 2.2, 5.1](https://developer.apple.com/app-store/review/guidelines/)
- Apple account creation requires account deletion in the app. Non-regulated apps should not force an email or support conversation to delete. [Apple account deletion guidance](https://developer.apple.com/help/app-review/guideline-reference/5-1-1-account-deletion)
- Google requires an in-app deletion route and a functional web resource for apps in its account-deletion scope. [Google account deletion guidance](https://support.google.com/googleplay/android-developer/answer/13327111)
- Google Families policies apply when children are in the intended audience, including SDK suitability and microphone-data disclosures. Store target-audience and content-rating answers must reflect actual design. [Google Families policies](https://support.google.com/googleplay/android-developer/answer/9893335)
- Google Data safety covers app-controlled WebViews and SDK collection. A privacy policy is still required when no data is collected. [Google Data safety](https://support.google.com/googleplay/android-developer/answer/10787469)
- As checked today, Apple uploads require Xcode 26+ and the iOS/iPadOS 26 SDK; the deployment target must be iOS 13+. [Apple requirements](https://developer.apple.com/news/upcoming-requirements/)
- As checked today, new ordinary mobile Google Play apps and updates require Android 16 / target API 36. Extensions, if actually granted, have separate conditions; do not assume one. [Google target API requirements](https://support.google.com/googleplay/android-developer/answer/11926878)

## Native configuration completed and still needed

`capacitor.config.ts` now uses the display name **Sodafom**, existing identifier `uk.sodafom.app`, packaged `dist/client`, Android's HTTPS local origin and no remote live-reload `server.url`. Keep the identifier consistent with store records; ownership/registration was not verified. [Capacitor configuration](https://capacitorjs.com/docs/config)

Build the web assets before syncing them into generated native projects. On a prepared workstation, generate Android with the installed Capacitor Android package and generate iOS after adding a matching `@capacitor/ios` dependency. iOS compilation needs macOS/Xcode. Android compilation needs its supported JDK/Android SDK. Signing keys, certificates, store membership, listings and version/build numbers must come from the owner; none were created here.

After projects exist, add only permissions used by the shipped functionality. For microphone access, review an iOS `NSMicrophoneUsageDescription` such as “Use the microphone when you choose voice input to turn your spoken learning question into text. You can type instead.” This is candidate copy, not installed metadata. If implementing native Apple speech recognition, review the corresponding speech-recognition description and authorization as well. Android requires appropriate manifest/runtime audio permissions and WebView permission handling for the actual implementation. Do not add camera, location, advertising ID or broad photo access merely for a file picker. [Apple microphone purpose key](https://developer.apple.com/documentation/bundleresources/information-property-list/nsmicrophoneusagedescription)

Review the final binary's Apple privacy manifest and required-reason APIs for the app and all native SDKs. Do not create a blanket “no data collected” manifest while accounts, speech or online AI are unresolved. [Apple privacy manifests](https://developer.apple.com/documentation/bundleresources/privacy-manifest-files)

## History on phones and offline limits

The source bank includes 324 lessons: 36 for each of Years 1–9, across 54 authored topics. `ArchieCourses` and the shared lesson inventory import this bank directly. Content is compiled into the web assets copied by Capacitor, rather than retrieved from a remote history API. Local lesson coaching uses supplied lesson text and hints.

`public/sw.js` handles push and notification clicks; it has no fetch/cache implementation. Therefore this audit establishes packaged-content availability and already-loaded in-app behavior, not offline cold launch of the website. A native bundled app can load its local assets without a website connection after native packaging is completed. Browser speech recognition, AI calls, external source links and account services can still need connectivity.

Reproduce the static bundle and bounded local CPU check after a fresh build:

```bash
npm run build:archie
node --import tsx scripts/check-mobile-history.ts
```

The script checks all bundled topic names, per-year counts, unique lesson IDs and 3,000 lesson lookup/local hint operations while rejecting fetch. It prints measured p50/p95/max runtime; these are Node CPU timings and exclude download, first parse, rendering, microphones, transcription, speech playback and network. They cannot support a universal 0.1-second device guarantee.

With Playwright browsers installed on a prepared test machine, run 36 cases per engine (four phone/tablet viewports × nine school years):

```bash
node scripts/test-mobile-history.cjs
ARCHIE_BROWSER=webkit node scripts/test-mobile-history.cjs
```

Start the app separately; `ARCHIE_TEST_URL` can select a deployed/test URL. `ARCHIE_CHROMIUM_PATH` can select an existing Chromium executable. The runner starts history from the course list after disconnecting the browser, checks phase interaction and horizontal overflow, and records observed DOM response time plus advertised speech support in `test-results/`. It does not request a real microphone or install an emulator onto a phone. Android emulators/iOS simulators run on development computers; physical phone and tablet testing remains necessary.

For real-device testing, record model/OS/browser or native version, first load versus warm use, offline status, microphone allow/deny/revoke, read-aloud start/stop, interruption/background behavior, soft keyboard, portrait/landscape and measured input-to-visible-response separately from input-to-spoken-response.

## Evidence from this audit

The static packaged-history check passed against the available web build: 324 unique lessons, 54 bundled topics, nine year allocations and zero fetch calls during 3,000 lookup/clue operations. This machine observed p95 approximately 0.009 ms and maximum approximately 2.703 ms for that local CPU work. Recheck after the final build; these are not phone response-time measurements.

The history course, lesson inventory, lesson coach, Archie privacy, Archie voice and analytics consent suites passed: six files, 83 tests. New audit scripts and Capacitor config passed scoped lint; the browser runner passed syntax checking. Executing the browser runner was blocked before any case ran because this environment has no matching Playwright Chromium executable. No physical-device, native microphone, store-signing or store-review result is claimed.

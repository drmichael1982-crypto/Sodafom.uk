# Sodafom school-ready and app-store audit

Date: 3 October 2026
Working branch: `codex/school-ready-2d-curriculum-2026-10`
Scope: 2D child app, school readiness, lesson quality, one-to-one tutoring, reading and homework scanning, parent model choices.

## Existing software found

- `src/pages/AITeacherPage.tsx`: age selection for ages 5–13, year-stage topic guidance, two-way text prompt to `/chat`, speech output, and reading-page image upload to `/ai-teacher/read-page`.
- `src/server/api/ai-teacher/read-page/POST.ts`: age-banded book-page reading endpoint; sends images to configured OpenAI model `gpt-4o-mini`. It currently requires the server API key and has no local OCR fallback.
- `src/pages/tutor/TeacherModePage.tsx` plus `src/lib/tutor/{curriculum,engine,memory,voice-commands}.ts`: child profile, local tutor lessons, question feedback, hints/simpler explanations, progress memory, microphone and spoken output.
- `src/server/api/homework-scan/{POST,GET,DELETE}.ts`: authenticated saved-homework image storage. This is storage, not proof of a working homework OCR/marking journey.
- `src/server/db/migrations/education-cloud-seed.ts`: generates 90 Maths, 90 English and 30 Ancient Egypt lessons across age bands 5–7, 8–10 and 11–13. Most are topic templates with repeated variants, not a complete differentiated school-year sequence.
- `sodafom-177-child-tutor/`: separate 177 child tutor prototype with age/subject/lesson controls, voice, and local 797 endpoint configuration. Keep private 797 administration hidden from children and do not make 797 a launch dependency.

## What a real full-year curriculum needs

A full year requires a planned sequence mapped to England's National Curriculum by year group (Year 1 through Year 9), subject, term, unit, learning objective, prerequisite, lesson, retrieval practice, assessment and extension/support. The three broad age bands are useful for an initial profile but are too wide for school-level progression on their own. Existing topics and games can be reused as resources within that progression.

## Parent AI model choice

Parent-only settings should explain, in plain language, each model that is actually configured: local/offline tutor, any parent-supplied key provider, and any server-hosted cloud provider. For each, show what it is good at, whether it needs internet, who pays, what data is sent, and controls. Default child use to local-first and age-appropriate mode; require an adult gate before provider changes or adding API keys. Never display a provider as available until a real adapter, credential path, error handling and privacy disclosure exist. The current book scanner specifically uses server-configured OpenAI; that is not the same as a selectable multi-model router.

## Launch blockers to verify before submission

- Test signup/sign-in, parent gate, deletion/export, consent and data retention with real supported accounts and privacy disclosures.
- Test camera permission, image limits, upload, page recognition, read-along, offline/error states and homework save/reopen on representative iOS and Android devices.
- Test voice round trips, interruption, microphone denial/retry, speech echo, child age handling and local/cloud fallback.
- Replace repeated lesson templates with an expert-reviewed year/term sequence and independently verify every answer key.
- Audit child privacy, school data processing, safeguarding, accessibility, payments, subscriptions, store screenshots/descriptions, support contact and age ratings.
- Build and sign Android and iOS release packages, run device QA, and submit through the owner's Google Play and Apple developer accounts. A code change alone cannot publish the app.

No camera-device QA, store submission, or claim of 100% operation is made by this audit.

## Cross-project reuse check

Checked the GitHub repositories available to the connected account: `Sodafom.uk`, `sodafom-v1`, `sodafom797`, and `797sodafom.`.

- `Sodafom.uk` is the active web app and already contains tutor, age-aware teacher page, AI book-page reading endpoint, homework image save/load/delete APIs, and teacher hub routes. The previously remembered branch name `sodafom-2d-first-release` was not present in the branch search for this repository; use the current main as inspected base unless the owner supplies another repo/branch.
- `sodafom-v1` contains reusable book assets and classroom/curriculum components, including recovered reading text and ten legacy story PDFs, many reference-book assets, `src/components/CurriculumView.tsx`, `src/lib/book-reading-text.ts`, book-page checking reports, and book-reader tests. These assets and code need a compatibility and licensing review before copying into the active app.
- `sodafom797` contains separate Kids Tutor Mode documentation, `tools/kids_tutor_mode.py`, curated curriculum code/tests, and a detailed Reading Helper design for camera scan, parent-confirmed OCR, word highlighting, phonics help and comprehension questions. The Reading Helper document explicitly describes several endpoints as “to add later”; this is design guidance, not an already working scanner. Keep System 797 private and separate; do not make it a production dependency for the children's app.
- `797sodafom.` returned an access error through the repository tree endpoint, so its contents could not be inspected in this pass.
- Library contains an older `Sodafom-Full-Current-Project.zip` integration audit. That audit found the uploaded Android ZIP had working-looking artwork and some screen scaffolding but several empty tap handlers and an empty reading microphone callback; it was not a fresh checkout and was not rebuilt. This is separate from the current React app and cannot establish current release readiness.

## Safe integration decision

Reuse the active React app's own tutor and scanner routes first. Bring in v1 reading text/assets and 797 lesson ideas only after path-by-path review, age mapping, answer validation, copyright checks and tests. Do not merge the whole 797 project or claim that a prototype/document makes a camera OCR pipeline production-ready.

## Model explainer requirement

Expose a parent-gated model comparison screen that lists only genuinely configured choices and explains capability, internet need, estimated cost/payer, data flow/retention, and fallback behavior in plain language. A local-first default should remain for children's sessions. The current code proves only a local rules-based tutor and one server-configured cloud provider for image reading; a menu of multiple models would be misleading until adapters and privacy handling exist.

## Library ZIP check

Library inventory confirms these available archives:

- `SODAFOM-test-archie-2026-10-02-source.zip` (40.8 MB; newest app source archive found in the first results page)
- `Sodafoam_177_Child_Tutor_SIP_60_Lessons.zip` (12.0 MB)
- `Sodafom_177_Child_Tutor_TOP_NOTCH.zip` (197 KB)

The ZIPs have no extracted text view. Two attempts to materialize the first and second archives failed with a Library transfer network error, so no ZIP contents were extracted or compared in this pass. GitHub source inspection is therefore not a substitute for those ZIP bytes; compare the October 2 source archive against the repo before choosing a final release base.

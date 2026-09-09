# Sodafom School Mode, Teacher Workload and SEN Support Specification

## 1. Free School Mode
- Schools can use Sodafom free of charge for approved classroom use.
- School Mode must never call paid OpenAI models.
- School Mode uses Sodafom local/self-hosted AI plus downloaded curriculum knowledge packs.
- If local AI cannot answer reliably, it must say it is unsure and offer teacher review rather than silently escalating to a paid model.
- School presence should be verified using approved school Wi-Fi/network plus optional geofence. Classroom-level detection should use teacher roster plus classroom Wi-Fi/Bluetooth beacon rather than GPS alone.
- No continuous child location history should be stored. Store only a short-lived verification result such as `verified_school_id` and optional `verified_classroom_id`.

## 2. Teacher accounts and classroom linking
- Teachers create a password-protected account and are linked to a school and classes.
- Pupils can be linked to a class once, then classroom access should work automatically where possible without requiring repeated school or teacher codes.
- The teacher dashboard shows connected pupils, class activity, submitted work, progress, reports and items needing review.

## 3. Teacher-taught Local AI
- When local AI does not know an educational answer, a verified teacher can use a `Teach Archie` action.
- Teacher provides answer, topic, subject, year/age band and optional source.
- Teacher submissions are not immediately trusted globally.
- New material enters a review/validation queue, then approved content is added to the shared Local AI knowledge base.
- Store the educational answer, not the child's personal conversation or location history.

## 4. Handwritten work capture and first-pass marking
- Pupils can photograph handwritten spelling, maths, English and other school work.
- The system extracts text/answers, compares with the task/mark scheme and produces first-pass marks and feedback.
- Low-confidence handwriting or ambiguous answers must be sent to `Needs teacher review`.
- Teachers can correct a mark and approve the final result.
- Corrections can be used to improve marking models and rules, subject to privacy controls.
- Do not claim that Sodafom removes all teacher marking; position it as reducing routine marking and handling first-pass marking.

## 5. Face-photo safeguard
- Before a pupil work image is stored, run an on-device or immediate pre-storage face check.
- If a face is detected, prefer rejecting the image and asking for a page-only retake. Auto-cropping/blurring may be offered only where reliable.
- A child's face must not be retained as part of the submitted school-work record.
- The app should clearly tell the pupil to photograph the page only.

## 6. Secure storage and school access
- The authoritative copy of children's work is stored securely in the school's cloud area, not only on a teacher's phone.
- The teacher phone/tablet is a secure viewer and uploader.
- School Admin accounts can view school-wide work, reports and exports according to permissions.
- Email should be used for notifications/secure links, not bulk attachment delivery of children's work by default.
- School Admin can export approved portfolios/reports as PDF/CSV/ZIP for school records.
- Include configurable retention and deletion policies.

## 7. Automated teacher reports
- Build draft reports from school activity, homework, games, reading, spelling, maths, photographed work and progress over time.
- Show school activity and home activity separately, plus an optional combined progress view.
- Reports can include subject scores, strengths, areas for support, progress since last period and a suggested comment.
- Teachers must be able to edit every generated comment and add their own teacher comment.
- Nothing is sent to a parent or treated as a final school report until teacher approval.
- For SEN pupils, emphasise individual progress rather than class ranking.

## 8. Local AI curriculum knowledge packs
- Build downloadable, versioned curriculum packs for Maths, English, Spelling, Reading, Science, Geography, History, Technology, PE, French and German.
- Expand packs with definitions, worked examples, misconceptions, age-banded explanations, question banks and marking rubrics.
- Track `local_ai_answer_rate`, `teacher_taught_answers`, `needs_review_count` and curriculum coverage by subject/year.
- Goal: maximise local coverage. Do not promise 100% accuracy; if confidence is low, defer to teacher review.

## 9. Football educational games
Add football-themed learning games that still have a clear curriculum objective, for example:
- Football Maths Manager: arithmetic, percentages, averages, money and statistics.
- Penalty Shootout Times Tables: multiplication/division fluency.
- Matchday Fractions: fractions, ratios and score-line reasoning.
- Football Geography Cup: countries, flags, capitals and continents.
- Football Spelling League: spelling and vocabulary challenges.
- Football Data Analyst: tables, charts, averages and probability.
- Stadium Design Challenge: perimeter, area, scale and geometry.
- Commentary Builder: English sentence construction, punctuation and descriptive writing.

## 10. SEN and learning-support screening safeguards
Sodafom may support screening and learning-support flags, but must not diagnose dyslexia, autism or any other condition.

### Dyslexia-related support
- Track persistent literacy patterns only where appropriate and transparent.
- Use validated, age-appropriate literacy screening tasks where available and permitted.
- Output should be `possible literacy difficulty / consider further assessment`, never a diagnosis.
- Provide adaptive support regardless of diagnosis: read-aloud, speech-to-text, extra time, reduced visual clutter and structured phonics practice.

### Autism-related support
- Do not infer autism automatically from camera, voice, eye contact, facial expression or general app behaviour.
- Do not run covert background autism detection.
- Any formal screening pathway must use an appropriate structured tool, consent and professional/human oversight.
- Sodafom may surface learning-preference observations without labelling them as autism.

### General safeguards
- Screening must be opt-in, transparent and separate from normal gameplay.
- Parents/schools control who can see screening results.
- Do not rank children by disability likelihood.
- Do not use screening results for disciplinary, admissions or exclusion decisions.
- Store minimum necessary data with deletion/retention controls.

## 11. Teacher and SENCO workflow
- Dashboard tabs: `Class`, `Work`, `Needs review`, `Progress`, `Reports`, `Learning support`.
- Learning-support area shows observed learning patterns and recommended classroom adjustments, not diagnoses.
- Teacher/SENCO can add notes, mark concerns as reviewed and record support strategies.

## 12. Ofsted Readiness and School Improvement
- Add a School Admin dashboard area called `Ofsted Readiness & School Improvement`.
- Keep the framework versioned. The September 2026 state-funded schools toolkit is the current baseline for this specification; the system must be capable of replacing/updating the framework when official Ofsted material changes.
- Local AI may summarise and map school evidence against the official framework, but must not claim to predict or guarantee an Ofsted grade.
- Present evidence strength and gaps, e.g. `strong evidence`, `evidence available`, `needs attention`, `missing/needs review`.
- Map evidence to relevant current evaluation areas, including safeguarding, inclusion, curriculum and teaching, achievement, attendance and behaviour, personal development and wellbeing, and leadership and governance, plus phase-specific areas where applicable.
- Every AI-generated readiness finding must link back to the underlying school evidence so leaders can inspect it.
- School leaders can add comments, override an AI interpretation and mark improvement actions complete.
- Generate an `Ofsted Evidence Pack` index, but do not manufacture documents specifically for inspection or encourage unnecessary workload.
- Provide a framework update service that checks official Ofsted/GOV.UK sources, stages changes for admin review, versions the criteria, and records which framework version was used for each readiness report.

## 13. School Audit & Evidence Vault
- Add a secure `Audit & Evidence Vault` to the School Admin area.
- Schools can scan/photograph paper records or upload PDF, DOCX, XLSX, CSV and image files from the school computer.
- Use document extraction/OCR only as needed to classify and index records; always preserve the original uploaded document as the authoritative evidence.
- Suggested folders/categories: governance, school improvement, safeguarding, attendance, behaviour, SEND/inclusion, curriculum, assessment/achievement, staff training, policies, external evaluations, finance/audit references and other school-defined categories.
- AI can suggest a document type, date, owner, review/expiry date and relevant Ofsted evidence area. A school administrator confirms or corrects the classification.
- Provide full-text search, filters, version history, document owner, upload date, review date and evidence tags.
- Provide an audit trail for uploads, edits, approvals, exports and deletions.
- Add reminders for documents/policies approaching their school-defined review dates.
- Allow leaders to attach a document to an improvement action or Ofsted-readiness evidence item without duplicating the file.
- Export a secure evidence index and selected approved documents when the school chooses.
- Do not automatically email bulk pupil or safeguarding records. Use authenticated access and secure exports.
- Apply role-based permissions so teachers, SENCOs, safeguarding staff, governors and school admins only see records appropriate to their role.
- Sensitive safeguarding/SEND/pupil records require stricter access controls and must not be used to train the general Local AI knowledge base.
- Support school-defined retention/deletion rules and legal/privacy review before production deployment.

### Ofsted design principle
Current Ofsted guidance says inspectors should normally use documents the school already maintains for statutory requirements or normal business, and should not require leaders to create special inspection paperwork. Sodafom should therefore organise existing evidence rather than create unnecessary bureaucracy.

## 14. Product positioning
Recommended school message:
> Free classroom learning with local AI, first-pass marking, progress tracking, teacher-ready reports and an organised school evidence vault — designed to reduce routine workload while keeping teachers and leaders in control.

Avoid claims such as:
- `Predicts your Ofsted grade`
- `Guarantees an Ofsted result`
- `Diagnoses dyslexia/autism automatically`
- `Replaces teacher marking completely`
- `100% accurate AI`

Use claims such as:
- `Helps organise evidence against the current Ofsted framework`
- `Highlights areas where leaders may want to review evidence or improvement actions`
- `Helps spot learning patterns that may need further assessment`
- `Reduces routine marking with teacher review for uncertain work`
- `Keeps paid AI disabled in School Mode`

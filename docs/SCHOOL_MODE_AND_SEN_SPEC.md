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
Sodafom may support **screening and learning-support flags**, but must not diagnose dyslexia, autism or any other condition.

### Dyslexia-related support
- The app may track patterns such as persistent phonological errors, decoding difficulty, spelling patterns, reading fluency, letter/word confusion and unusually slow reading/writing relative to the child's own history.
- Use validated, age-appropriate literacy screening tasks where available and permitted.
- Output should be phrased as `possible literacy difficulty / consider further assessment`, never `this child has dyslexia`.
- Provide adaptive support immediately regardless of diagnosis: read-aloud, speech-to-text, extra time, reduced visual clutter, dyslexia-friendly text options and structured phonics practice.

### Autism-related support
- Do not infer autism automatically from camera, voice, eye contact, facial expression or general app behaviour.
- Do not run covert background autism detection.
- If a school wants an autism screening pathway, it should use an approved questionnaire or structured screening tool with appropriate school/parent consent and professional oversight.
- Sodafom may surface learning-preference observations (for example sensitivity to change, preference for predictable routines, repeated need for visual instructions) without labelling them as autism.
- Any concern should be routed to the teacher/SENCO/parent for human review and, where appropriate, professional assessment.

### General safeguards
- Screening must be opt-in, transparent and separate from normal gameplay.
- Parents/schools should control who can see screening results.
- Do not rank children by disability likelihood.
- Do not use screening results for disciplinary, admissions or exclusion decisions.
- Store the minimum necessary data and provide deletion/retention controls.

## 11. Teacher and SENCO workflow
- Dashboard tabs: `Class`, `Work`, `Needs review`, `Progress`, `Reports`, `Learning support`.
- Learning-support area shows observed learning patterns and recommended classroom adjustments, not diagnoses.
- Teacher/SENCO can add notes, mark concerns as reviewed, and record recommended support strategies.

## 12. Product positioning
Recommended school message:
> Free classroom learning with local AI, first-pass marking, progress tracking and teacher-ready reports — designed to reduce routine workload while keeping teachers in control.

Avoid claims such as:
- `Diagnoses dyslexia/autism automatically`
- `Replaces teacher marking completely`
- `100% accurate AI`

Use claims such as:
- `Helps spot learning patterns that may need further assessment`
- `Reduces routine marking with teacher review for uncertain work`
- `Keeps paid AI disabled in School Mode`

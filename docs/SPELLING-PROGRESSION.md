# Spelling Bee progression (sets of ten)

Code: `src/lib/spelling/word-bank.ts` (word bank), `src/lib/spelling/progression.ts` (rules, pure functions),
`src/pages/games/spelling-bee.tsx` (UI). Tests: `src/lib/spelling/progression.test.ts`, `src/pages/games/spelling-bee.test.tsx`.

## Year bands
The band always follows the learner's year in Archie settings (`useArchieData().settings.year`, default Year 4).
The game never moves a child to an older or younger band by itself. Each band keeps its own saved progress,
so changing the year starts (or continues) that band's state; the other band's progress is kept.

| Band | Years | Words | Stages | Source |
|------|-------|-------|--------|--------|
| `y1` | 1 | 72 | 6 | Y1 phonics examples + common exception words (not "a"/"I"), days of the week, original CVC pool |
| `y2` | 2 | 62 | 5 | Y2 common exception words (not "Mr"/"Mrs") |
| `y3-4` | 3–4 | 108 | 9 | Full statutory Years 3–4 list with listed variants |
| `y5-6` | 5–6 | 100 | 10 | Full statutory Years 5–6 list |
| `y7-9` | 7–9 | 70 | 7 | Curated KS3 literacy terms and commonly misspelt words (no statutory list exists) |

British spellings throughout. Homophones carry a sentence (shown with the word blanked and read aloud).

## A set
- Exactly 10 typed words; the screen shows **Set N** and **Question n of 10**.
- A first wrong attempt gets a friendly message, a hint (first letter, length, tip) and one retry.
  A second wrong attempt shows the spelling, letter by letter, with a tip. Only first-try answers score.
- The child presses **Next word** between questions. After the 10th answer the results screen appears
  (score, stars, mastery message, words to review with correct spelling and tip, break reminder) with
  **Continue to next 10**, **Stop for now** and **Home**. Nothing auto-advances.
- After 3 sets in one visit the break reminder asks for a proper break. A Pause button is always available.

## Mastery thresholds (first-try correct out of 10)
| Score | After a learning set | After a practice/review set |
|-------|---------------------|-----------------------------|
| 8–10 | Next stage in the same band | Back to normal learning (same stage) |
| 5–7 | Same stage; next set mixes in up to 5 missed words | Same |
| 0–4 | Targeted practice: up to 6 missed words + easier words (earlier stages or words already spelt correctly) in the same band; never harder | Same |

Normal learning sets also bring back up to 2 review words. A review word leaves the review list when it is
spelt correctly first time.

## Word choice
Unseen words first (current stage, then leftover earlier-stage words, then later stages of the same band).
Correctly spelt words are not repeated while unseen words remain in the band.

## End of a band
When every word in the band has been seen, the results screen says so and offers an explicit **review set**
(missed words first, then older words) or stopping; grown-ups can change the year in settings. No new
questions are invented and play is never forced.

## Saving
`localStorage["sodafom_spelling_progress_v1"]` (`version: 1`) stores, per band: stage, set number, seen word
ids, review words with miss counts, the current set (word ids, position, attempts, answers) and the last
result. Reloading resumes on the same question (or the unacknowledged results screen). Invalid, unknown or
other-version data is ignored safely.

The old adaptive level (`sodafom_level_spelling-bee` / server game-level) is still updated after each set,
but no longer chooses words. It is used once, gently, to pick a starting stage for the first band created
(levels 1–3 → stage 1, 4–6 → stage 2, 7–9 → stage 3, 10 → stage 4).

Completion is still reported to GameShell after every set (stars, progress, badges) via the optional
`controls.recordCompletion` render argument, so GameShell's own result screen does not replace the spelling
results screen.

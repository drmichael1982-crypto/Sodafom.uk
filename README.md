<div align="center">

<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

  <h1>Built with AI Studio</h2>

  <p>The fastest path from prompt to production with Gemini.</p>

  <a href="https://aistudio.google.com/apps">Start building</a>

</div>


### Archie test parent accounts

The test service supports a dedicated SQLite account database on a persistent volume. Set `ARCHIE_PARENT_ACCOUNTS_ENABLED=true`, a strong random `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` to the exact HTTPS app origin, and `ARCHIE_PARENT_SQLITE_PATH=/data/parents.sqlite`. Production requires `RAILWAY_VOLUME_MOUNT_PATH=/data` supplied by the attached volume; it will refuse ephemeral account storage. The first start initializes only this new dedicated database. Existing account schemas are never migrated automatically. Keep volume backups. Existing MySQL configuration remains supported.

Run `node scripts/test-archie-parent-storage.cjs` to verify registration, sessions, persistence after a server restart, rejection of cross-origin writes, and temporary API key isolation. The test uses an isolated temporary local database and synthetic credentials; it makes no AI provider call. The key form supports a parent's own OpenAI API key; adding it does not prove funding, and paid API use is separate from free built-in learning help. Email verification, password recovery and cloud progress are not enabled in this test version.


### Whole-page picture playground

The home screen has six fitted icon buttons and an interactive jigsaw around them. Other tester pages provide a Picture puzzle control; the current activity stays mounted while its picture is built. The My lesson / My game icon returns to it. Spelling and course lessons pause for a puzzle break; timed game countdowns pause through `PicturePauseContext`. Touch users select a loose piece, then tap its space; desktop users can also drag. The board changes its piece count to keep fixed controls usable on short and landscape screens. Progress is saved per route and grid size on this device, independently of lesson scores. All 26 destinations remain available through All activities.

Run `node scripts/test-page-picture-jigsaw.cjs` against a running tester to verify matching and wrong placements, persistence, full completion, fixed icons, six screen sizes, activity retention and the timed game pause. Set `ARCHIE_TEST_URL` for a different local base. Existing `test:archie:ui` continues to cover learning journeys and all 130 game routes.

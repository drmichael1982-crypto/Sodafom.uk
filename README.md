<div align="center">

<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

  <h1>Built with AI Studio</h2>

  <p>The fastest path from prompt to production with Gemini.</p>

  <a href="https://aistudio.google.com/apps">Start building</a>

</div>


### Archie test parent accounts

The test service supports a dedicated SQLite account database on a persistent volume. Set `ARCHIE_PARENT_ACCOUNTS_ENABLED=true`, a strong random `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` to the exact HTTPS app origin, and `ARCHIE_PARENT_SQLITE_PATH=/data/parents.sqlite`. Production requires `RAILWAY_VOLUME_MOUNT_PATH=/data` supplied by the attached volume; it will refuse ephemeral account storage. The first start initializes only this new dedicated database. Existing account schemas are never migrated automatically. Keep volume backups. Existing MySQL configuration remains supported.

Run `node scripts/test-archie-parent-storage.cjs` to verify registration, sessions, persistence after a server restart, rejection of cross-origin writes, and temporary API key isolation. The test uses an isolated temporary local database and synthetic credentials; it makes no AI provider call. The key form supports a parent's own OpenAI API key; adding it does not prove funding, and paid API use is separate from free built-in learning help. Email verification, password recovery and cloud progress are not enabled in this test version.

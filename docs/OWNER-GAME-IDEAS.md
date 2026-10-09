# Owner game idea drafts

The owner dashboard supports `GET` and `PUT /api/admin/game-ideas`. These routes require a real signed-in account whose server-verified ID matches `ARCHIE_OWNER_USER_ID`. Browser preferences and admin flags cannot grant ownership. Saves also require the configured `BETTER_AUTH_URL` Origin and JSON content.

Sign in through the parent hub on your phone. Expand **Account setup ID** and copy its read-only ID for trusted server configuration. This is an account identifier, not a password. Set `ARCHIE_OWNER_USER_ID` to that verified intended owner's ID and restart the server. Never select an owner by email address or by whichever account happens to appear first in the database.

Each save adds a draft with a title (1–80 characters), a subject (`maths`, `spelling`, `reading`, `science`, or `art`), and a description (1–1500 characters). The server assigns the ID and creation time. Up to 100 drafts are retained, newest first. Saving does not create, modify or publish gameplay, execute code, or alter existing games.

Set `ARCHIE_ADMIN_GAME_IDEAS_PATH` to an absolute persistent file path. If omitted, the path defaults to `game-ideas.json` beside `ARCHIE_PARENT_SQLITE_PATH`. Production paths must lie under `RAILWAY_VOLUME_MOUNT_PATH`. Files are written atomically with private permissions; malformed storage produces an error rather than silently replacing existing drafts. With no persistent path, viewing returns `editable: false` and saving is unavailable.

Run `npx vitest run src/server/lib/archie-admin-game-ideas.test.ts src/components/ParentAccountPanel.test.tsx` to verify authorization, Origin checks, field and size bounds, persistence, concurrent additions and the server-confirmed account setup ID.

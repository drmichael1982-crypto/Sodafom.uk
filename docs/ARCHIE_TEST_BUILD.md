# Sodafom Archie test build

This is a separate test copy of `drmichael1982-crypto/Sodafom.uk`, based on commit `5b9641d1090abe762a1f23ac6cb0cda0590e57ce`. It keeps the existing 127 game routes. The new home and spelling lesson use the two pictures approved on 2 October 2026, with accessible HTML controls and live lesson content over the artwork. Archie is static, blond, green-eyed and wears blue and gold.

## Run it

Use Node 24, then:

```sh
npm ci --include=dev --ignore-scripts --no-audit --no-fund
npm run build
npm start
```

Open `http://localhost:4173`. `PORT` can select a different port. Refresh and direct page links are supported.

The default build/start commands run the isolated test server. They do not start the original database, migrations or payment services. The old commands remain under `build:legacy`, `start:legacy` and `seed:legacy` for a later integration review.

## Connected pages and controls

| Screen | Route | Working actions |
| --- | --- | --- |
| Approved home | `/` | Settings, sound, world, games, lesson, one Ask Archie, parents, rewards, stickers, cartoons, progress |
| My world | `/world` | Subject games, lesson, library, homework, cartoons, rewards and parents |
| Choose a game | `/games` | Subject filters, search, all 127 existing game destinations |
| Play a game | `/games/:slug` | Existing gameplay; one shared Ask Archie; the game passes its current question when available |
| Approved whiteboard lesson | `/lesson` | Hear, practise, check spelling, helpful feedback, seven words, pause/resume, 30-minute timer, next/finish, stars |
| Library | `/library` | Four complete original starter stories |
| Reader | `/reader/:bookId` | Previous/next pages, read aloud/stop, completion star saved once per book |
| Homework | `/homework` | Local image reference, remove photo, type question, open that question in the shared assistant |
| Cartoon theatre | `/cartoons` | Six existing picture stories, play/pause, next scene, restart and read scene; artwork stays static |
| Sticker book | `/stickers` | Unlock and collect stickers using earned stars |
| Rewards and progress | `/rewards`, `/progress` | Real local totals and saved book/lesson history; no example rewards presented as earned |
| Parents / settings | `/parents`, `/settings` | School year, sound, large text, saved preferences, AI setup status and progress |

The existing `/tutor`, `/teacher-mode` and `/ai-teacher` screens also supply learning context to the same assistant. Legacy `/ask-archie` and `/chat` open the shared panel.

## AI connection

The browser first uses the existing on-device learning rules. Wider questions go to this app's `/api/chat`. The server tries configured Ollama first, then the configured OpenAI or Gemini provider. The child interface has no API-key field and cannot access private 797 tools.

Use `.env.archie.example` as a list of server variable names. A hosted service needs its secret variables configured in hosting. This app does not load a parent's `.env` directory or copy secrets into frontend assets. The setup check distinguishes configuration from a successful live answer.

The connected Railway account has an existing `sodafom797` service with `OPENAI_API_KEY`, `OPENAI_MODEL` and `OPENAI_ECONOMY_MODEL`. The connector reveals names only. Once the separate GitHub repository exists, a new independent app service in that Railway project can use Railway service-variable references for the approved provider key and economy model without reading or putting the key into code. Do not point the children's app at the private 797 control API.

Live provider reuse has not been deployed or verified yet.

## Test scope and limits

Run `npm run type-check`, `npm run test:archie`, `npm run build` and, with Chromium installed by `npx playwright install chromium`, `npm run test:archie:ui` while the server is running. GitHub Actions repeats these checks and saves screenshots.

The browser checks cover the main button journeys, opening every game destination, and overflow at 360, 390 and 1280 pixels. Opening each game is not a complete playthrough of every inherited game. Microphone permission, actual speech output on a phone, and live cloud AI need a device/hosted check.

This test version keeps learning progress in this browser. Accounts, payments, cross-device syncing and photo OCR are not connected. The homework page explains that the uploaded image is a local reference and asks for the question as text. Existing game sign-in prompts are hidden in the test build. Online AI shows an honest fallback when no server provider is configured.

The two approved screens are implemented. The other generated pictures in the 12-page design book remain design references; their live pages use working controls and existing game artwork.

## Repository / deployment status

Prepared on local branch `feat/archie-design-test`. The original repository's push URL is disabled locally to prevent an accidental production push. The requested separate private repository is `drmichael1982-crypto/sodafom-archie-2d`; creation requires GitHub browser sign-in. An isolated test branch in the source repository is being used for an interim, separate hosted test app. The original main branch and production service are unchanged. Creation of the completely separate repository remains pending sign-in.

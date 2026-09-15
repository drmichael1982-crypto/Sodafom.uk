# SOD-04 branch inventory

For Michael and Coordinator Codex. Inspected 15 September 2026 through GitHub.
Comparison target: stable app `442656b4e2ec76167b4d0b5fb7b804cf742904a5`, draft PR #25.
These are source observations, not runtime acceptance or permission to integrate.
Ahead/behind counts describe ancestry, not feature completeness.

| Branch | Observed tip | Compared with stable |
| --- | --- | --- |
| `S-O-D-cartoon-English-31` | `3ab8011c6bfa43660a4d8e9e09771cd4bfc68bdf` | diverged; 2 ahead / 57 behind |
| `S-O-D-cartoon-dinosaurs-26` | `9df7debf7c3a07c27a84f2d0c7c20183ee5d15e4` | diverged; 26 ahead / 143 behind |
| `S-O-D-cartoon-health-32` | `3bba110fbeea7dd255153f962564a2d136790224` | diverged; 28 ahead / 143 behind |
| `S-O-D-cartoon-science-29` | `5bba542eaf80ba1257f6300b1835deb03e5754d4` | diverged; 25 ahead / 143 behind |
| `S-O-D-cartoon-space-25` | `7981561018b731906b593cb172f687b94eeaccd5` | diverged; 32 ahead / 143 behind |
| `S-O-D-cartoon-sweetshop-23` | `058097f78077015980460c0b359903fda5aa83a6` | behind; 0 ahead / 57 behind |
| `S-O-D-mischief-characters-33` | `d1b32fcd3ef3d79b290bf8617549af678c0fd0a2` | diverged; 27 ahead / 143 behind |
| `agent5-characters-outfits` | `272abe423ee68becf6230656a869b73f7d6fc967` | diverged; 3 ahead / 57 behind |
| `recovery/agent5-current-main-outfits-20260913` | `24a9ffe068aa0b4d7144805753feb6cd3f54af49` | diverged; 30 ahead / 143 behind |
| `recovery/agent5-handoff-20260913` | `19ad358faa17015ee193c9967af304e8db4a6485` | diverged; 6 ahead / 57 behind |
| `codex/sod-software-repairs-20260914` | `c8470de5a93c2c9a3838b0bb3603cef07da5cc19` | diverged; 2 ahead / 57 behind |
| `codex/sod-06-phone-look-360` | `398a51445c2bb242b6e532e16c7b0fca24c31d41` | diverged; 2 ahead / 57 behind |
| `codex/children-foundation-first-pass` | `81a78e12c5fd35cef4de24180047480364d0358b` | diverged; 1 ahead / 57 behind |

## Ownership and integration boundaries

- English 31: `src/lib/cartoons/word-adventure.ts`, `src/components/cartoons/WordAdventurePlayer.tsx`; owner report describes 42 scenes / 336 seconds.
- Dinosaurs 26: `src/lib/cartoons/dinosaur-adventure.ts`, `episode-contract.ts`, `src/components/cartoons/CartoonEpisodePlayer.tsx`; 18 scenes / 360 seconds.
- Science 29: `src/lib/cartoons/archies-amazing-science-adventure.ts`, `src/components/cartoon/CartoonEpisodePlayer.tsx` (singular cartoon directory); 12 scenes / 375 seconds.
- Space 25: `src/lib/cartoons/archies-space-adventure.ts`, `src/components/cartoons/SpaceAdventurePlayer.tsx`; 22 scenes, estimated 419 seconds. Owner explicitly says the final remote tip was not rerun locally.
- Health 32: `src/features/cartoons/healthBodyEpisode.ts`, `src/pages/cartoons/HealthyBodyAdventurePage.tsx`; 28 scenes / 372 seconds, temporary computer-voice founder cameo.
- Sweetshop 23: branch tip is the old master baseline, with zero unique commits versus stable. No delivered episode can be inferred from its name.
- Mischief 33: `src/components/ChildPageMischief.tsx`; shared `RootLayout.tsx` mount. Existing owner reports four decorative gags, excluded adult routes and reduced motion.
- Agent 5 original/handoff/current-main recovery: `ArchieOutfitPage.tsx`, `character-outfits.ts` and related tests. Preserve original saved-outfit migration and birthday gating. Original and current-main versions diverge; do not combine automatically.
- SOD-10 floating room, SOD-13 procedural Victorian world and SOD-14 cinema/books are attributed by `docs/qa/coordinator-repair-handoff-2026-09-14.md` on repair tip c8470de. The report describes actual procedural Three.js models plus separate picture players; final art/device acceptance is outstanding. None is treated as already in stable #25.
- SOD-06 phone look provides `public/prototypes/phone-look/controls.mjs` and a standalone demo. Its owner reports 10 synthetic controller tests passed, browser executable missing, physical sensors untested. Keep the manual fallback and explicit permission path.

English, dinosaur, science and space branches overlap `src/pages/CartoonTheatrePage.tsx`; several also alter `src/routes.tsx`. Mischief touches `src/layouts/RootLayout.tsx`. Player implementations differ. Episode reports refer to a then-missing Agent 22 engine. The complete branch listing inspected contains no S-O-D-cartoon-engine-22 branch. This does not establish the state of unpushed work in other chats.

Read all listed owner reports before recording this inventory. Their earlier test claims remain attributed claims, not SOD-04 reruns. Source durations are not audible full-playback evidence.

## Decision for Coordinator Codex

Issue #21 comment 5684400686 acknowledges an existing Coordinator Codex animation/theatre worker, with numeric identity/engine branch unresolved. Nominate that already acknowledging worker for the ONE shared engine owner, pending coordinator confirmation; SOD-04 does not claim those files. Keep episode authors on their own manifests. Agree the engine contract and smallest route/theatre changes before any integration. My own scope is the prior Victorian audit and standalone family-preview handoff.

No original branches, main/master, production settings or 797 files changed. No merge or deployment.


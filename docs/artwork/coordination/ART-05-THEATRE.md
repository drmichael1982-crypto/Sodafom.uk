# ART-05 — Theatre verification and Agent 7 work order

For Michael Davis and Coordinator Codex. Reviewed 16 September 2026. **AMBER: shared player work exists; finished film and device acceptance remain incomplete.**

## Ownership and exact source

- ART-05 is the coordinator's verification lane. This lane owns only this document; it does not create a competing player or animation engine.
- **Legacy Agent 7 is the confirmed scoped owner** of shared cinema/theatre playback, presentation, theatre movement and narration/speaking integration. Evidence: the acknowledgement in [PR #28](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/28), its [push confirmation](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/28#issuecomment-5684569752), and the [cinema handoff](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/28#issuecomment-5697599834). Historical acknowledgement establishes ownership; it does not prove that another chat is currently running or has accepted this new work order.
- Branch: `codex/agent7-sod-fin-04-cinema-animation-theatre-20260915`.
- PR/report head: `1815d442e68abda6a20ee74c1337ac9a1cf76cbb`.
- **Source and committed tests reviewed:** `c217ba3a05667ebfb55679003b8bdc68aea7d7f6`. The head adds only `agent-reports/AGENT-7-REPORT.md` after that code commit.
- Base: `442656b4e2ec76167b4d0b5fb7b804cf742904a5`. GitHub comparison confirms five commits ahead, zero behind and three changed files: the report, `src/pages/CartoonTheatrePage.tsx` and `src/pages/CartoonTheatrePage.test.tsx`.
- Reference rules: [handoff PR #33](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/33), plus the supplied private pack's README, Michael master, world work order, rocket draft and scene-status manifest. This report contains no private image/video upload.

## Tests and observed gaps

The tests ran in an independent stable-source snapshot with the two theatre files fetched from the exact PR head. Both Git blob hashes matched GitHub: page `77ab948b0a4644ad49b109abb189ef2e31bd56b4`; test `b9f5ee712864e6811a652260c33a7001d8bdb491`. Dependencies were reused from an existing installation whose `package.json` and `pnpm-lock.yaml` matched the target byte for byte. No installation or other workspace edits occurred. Runtime: Node 24.19.0, Vitest 4.1.11, Vite 6.4.3, React 19.2.8, Motion 12.43.0 and jsdom 29.1.1; these package versions match the lockfile.

| Check on source `c217ba3a05667ebfb55679003b8bdc68aea7d7f6` | Result | Evidence and limit |
| --- | --- | --- |
| Existing committed theatre regressions | **PASS — 5/5** | Episode start/resume issues one narration, Next avoids duplicate narration, Read disables autoplay, mute/unmute, subtitles toggle. Voice and Archie are mocked; this does not establish audible or visual quality. |
| Restart while first scene is already playing | **FAIL — reproduced** | Start Number Island, then immediately press Restart. Speech is stopped, but the narration-call count stays at one instead of two. Setting the already-current scene `0` and `playing=true` does not rerun the playback effect. |
| Speaking state during manual Read | **FAIL — reproduced** | Start Number Island, press Read. A second speech request is issued while Archie receives `speaking=false`. A disposable acceptance probe expected an active speaking state and failed. |
| Pause stops the whole scene | **FAIL — source inspection** | Background movement, sparkles and Archie path loops are independent of `playing`; Soda keeps its position/rotation loop. No browser motion test was run. |
| Speaking follows actual speech completion/error/cancellation | **FAIL — source inspection** | The page uses `speaking={playing && !muted}`, without a speech completion callback. It can keep speaking after an utterance finishes or fails; the closing line runs after `playing` becomes false. |
| Reduced motion reaches all nested character animation | **FAIL — source inspection** | Page-level camera, sparkle and actor motion are disabled, but unchanged `ArchieCharacter.tsx` retains repeating glow/bob animation and a speaking indicator. The page does not pass a reduced-motion contract to it. Coordinate with its existing owner before editing that shared component. |
| Replaceable finished-video catalogue | **FAIL — source inspection** | Six entries each contain three image/TTS scenes at 6,500 ms: nominal **19.5 seconds per entry, 117 seconds total**, excluding user interactions and the closing utterance. There is no MP4/video source or timed-caption media contract in this page. These are short illustrated prototypes. |
| Type-check, full build, lint and full application suite | **NOT TESTED by ART-05** | The targeted theatre run does not replace these gates. |
| Browser phone/tablet layout, real speech, Michael voice, full films/joins and physical phone | **NOT TESTED** | No audio or physical-device acceptance is inferred from mocks or source. |

Reproduce the committed result with `node node_modules/vitest/vitest.mjs run src/pages/CartoonTheatrePage.test.tsx --reporter=verbose`. Two additional disposable probes, outside the shared repository, produced **2 FAIL / 0 PASS** for Restart on scene 0 and speaking during Read. They are distinct from the five passing committed tests; application code was unchanged.

Additional clock issue for Agent 7: mute/unmute is an effect dependency and recreates the 6,500 ms scene timeout; toggling sound resets the remaining scene time. Pause/resume also restarts the scene narration/time rather than retaining elapsed playback. Define and test consistent resume behaviour when adding actual media.

## Separate episode owners and overlaps

The following exact tips were compared with stable. Content remains with its existing episode owner. Agent 7 and Coordinator Codex should select a common player contract and reconcile only the smallest necessary presentation changes; do not import old branches wholesale. Several branches carry unrelated old package, server, scanner and adventure-page changes.

| Existing lane / exact tip | Keep with that owner | Integration conflict |
| --- | --- | --- |
| English 31 — `3ab8011c6bfa43660a4d8e9e09771cd4bfc68bdf` | `src/lib/cartoons/word-adventure.ts` and episode-specific content | `WordAdventurePlayer.tsx`, shared theatre and routes. |
| Dinosaurs 26 — `9df7debf7c3a07c27a84f2d0c7c20183ee5d15e4` | `src/lib/cartoons/dinosaur-adventure.ts` | `episode-contract.ts`, `src/components/cartoons/CartoonEpisodePlayer.tsx`, shared theatre and routes. |
| Science 29 — `5bba542eaf80ba1257f6300b1835deb03e5754d4` | `src/lib/cartoons/archies-amazing-science-adventure.ts` | `src/components/cartoon/CartoonEpisodePlayer.tsx` uses a different, singular directory; also alters shared theatre. |
| Space 25 — `7981561018b731906b593cb172f687b94eeaccd5` | `src/lib/cartoons/archies-space-adventure.ts` | `SpaceAdventurePlayer.tsx` and shared theatre. |
| Health 32 — `3bba110fbeea7dd255153f962564a2d136790224` | `src/features/cartoons/healthBodyEpisode.ts` | Own page/player and routes; earlier owner report identifies a temporary computer-voice founder cameo, requiring established-Michael-voice review. |
| Sweetshop 23 — `058097f78077015980460c0b359903fda5aa83a6` | Preserve branch; owner must supply the missing episode | Zero unique commits against stable; the branch name does not establish delivered film content. |
| Mischief 33 — `d1b32fcd3ef3d79b290bf8617549af678c0fd0a2` | `src/components/ChildPageMischief.tsx` | Shared `RootLayout.tsx` mount remains separate from theatre ownership. |

Episode durations/scene counts in the [existing SOD-04 inventory](https://github.com/drmichael1982-crypto/Sodafom.uk/blob/a81cd506f3e4d615e1e814c0060da31fc31f6852/docs/prototypes/sod-04-family-square/BRANCH-INVENTORY.md) are attributed source/report estimates, not ART-05 full-playback results. Preserve Agent 5's character/outfit files and Books/scanner ownership as well.

## Next work order — Agent 7

1. Acknowledge ART-05 in #21/#28 with the current branch, exact commit, owned files and next action. Continue the established shared player; other episode authors retain their content files.
2. Repair Restart on an already-playing first scene and separate narration activity from autoplay. Add narrow regressions for repeated Restart on scene 0, Read while playing/paused/muted, speech finish/error/cancel, Next during speech and page exit. Require one live narration session and no stale callback restarting playback.
3. Use a consistent playback clock for pause/resume, mute and scene transitions. Test pause halfway through a scene, repeated pause/resume, mute/unmute without resetting progress, and end/restart behaviour. Freeze camera, actors and decoration on pause. Carry reduced motion through nested characters via the shared component owner.
4. Prepare a replaceable finished-clip catalogue and player contract for video source, poster, actual duration, captions, approval status and loading/error behaviour. Keep reference stills and concept scenes identified separately. Exercise it with suitable non-private test media before importing approved final clips. Do not copy a second episode player's engine over shared controls.
5. Coordinate finished audio with the clip/episode owners. Preserve Michael's established voice in every section, including space and Health. Current default `ttsSpeak` narration uses Archie; a device fallback or temporary founder voice is not evidence of Michael continuity. Do not invent a replacement voice where approved audio is missing.
6. Re-run the repaired targeted tests and exact-commit type-check/build, then record browser and device acceptance separately. Return branch/commit, paths, PASS/FAIL/NOT TESTED results, preview/evidence and blockers to Coordinator Codex. No merge or deployment.

## Exact acceptance before this section is green

- [ ] One shared player supports Play, Pause, Resume, Restart, Next, Mute/Sound and captions; state and elapsed time remain consistent through repeated controls and error/exit paths.
- [ ] Audible playback drives the correct speaking character; no simultaneous narration, stale speech, silent mouth movement or fixed-duration mouth claims. Michael's established voice is checked in full playback.
- [ ] Pause freezes stage/camera/decorative motion; reduced motion suppresses nonessential motion throughout nested characters and controls. Touch and keyboard controls remain usable.
- [ ] Approved finished MP4s replace demonstrations through the agreed catalogue. Actual duration, loading, retry/error handling, subtitles and sound controls are tested. A corrected still or source filename never counts as a repaired moving film.
- [ ] Full clips are inspected at opening, middle, close-up, transition and final frames, then played end to end. Michael matches the approved portrait; Archie, Rob and Soda match the group reference. Exactly three dogs: Jessica jet-black with tiny white chin only, Sally entirely jet-black, Daisy brown/white. No duplication, vanishing limbs, sliding feet or changing identities.
- [ ] Joins preserve character order/scale, camera direction/height, grounded walking, lighting and the sound bed. Fairground-to-rocket boarding, launch and space transitions have actual connecting shots; daytime-to-night needs an intentional transition. Preserve SODAFOM lettering and correct educational captions.
- [ ] 4K masters, where supplied, are distinguished from existing lower-resolution references and phone delivery assets. Phone/tablet layout and real-device playback are recorded with the exact source/media version; untested devices remain NOT TESTED.

The private pack explicitly records **no corrected full moving section or joined export signed off**. The rocket sequence is a draft. Completed still corrections, accepted full motion, integrated playback and physical-phone checks are separate gates.

ART-05 changed only this report in the coordinator repository. No app source edit, generated art, private-media publication, commit, push, merge, deployment, production-setting change or Systems 797 work was performed.

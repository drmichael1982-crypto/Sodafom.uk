# Agent SOD-04 — SOD-FIN-04 report

For Michael and **Coordinator Codex**. Updated 15 September 2026.

## Status and exact scope

**AMBER — audit and preview handoff complete; section acceptance blocked. Not launch ready.**

- Existing agent: **SOD-04**, distinct from Agent 4 Admin.
- Original task: read-only comparison of the children’s app with the Victorian shop-world plan.
- Original review branch: `codex/children-foundation-first-pass` at `81a78e12c5fd35cef4de24180047480364d0358b`.
- Section: [SOD-FIN-04 / issue #21](https://github.com/drmichael1982-crypto/Sodafom.uk/issues/21).
- Own handoff branch: `codex/sod-04-fin-04-handoff-20260915`.
- PR review base: `integration/sodafom-big-jobs-20260915` at `3caea47a4f0cde7b76c0fb309e20ec017671c04a`, documented in the coordinator integration report and PR #25.
- Current stable source inspected separately: `442656b4e2ec76167b4d0b5fb7b804cf742904a5`, [draft PR #25](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/25).
- **Exact preview/code commit checked: `86f5ff5c9492f1e6aa09ef695d0021d76b1cf032`.**
- Pushed code: yes, via the connected GitHub account. Command-line push failed for missing credentials; it changed no remote branch. Remote code was fetched back and checked. Its full tree `97999dcf6de42750f6335632d6a6d5f02b90e4c8` exactly matches the original local tested tree.
- Final report commit and verified remote push are recorded in this handoff's PR description, avoiding a self-referential hash.
- Exact owned files: this report and the six files under `docs/prototypes/sod-04-family-square/`. No production source, routes, layouts, dependency files, approved artwork or shared engine edits.
- Unfinished work preserved: the previously delivered moving HTML was recovered unchanged and committed. The family PDF remains separately delivered to Michael. Nothing from another agent was overwritten.

The initial read-only assignment was followed by Michael's requests for standalone animated family concepts and his current authorization to commit/push a report. Those previews were not previously committed to the app.

## Completed and what exists

[Full branch inventory](../docs/prototypes/sod-04-family-square/BRANCH-INVENTORY.md) includes exact tips, ancestry comparisons and ownership. Read #21 and its comments before acknowledgement; own acknowledgement is [comment 5684424277](https://github.com/drmichael1982-crypto/Sodafom.uk/issues/21#issuecomment-5684424277). Also read the six cartoon/mischief owner reports, both Agent 5 recovery reports, SOD-06 phone-look report, foundation design report and c8470de repair handoff. No AGENTS.md was present in the inspected source tree/local checkout.

| Planned feature | What exists in inspected code or preserved work | Still needed |
| --- | --- | --- |
| Sweet shop | Foundation registry specifies double frontage, glass jars and central display; c8470de repair branch has a procedural Three.js interior/street. Sweetshop cartoon branch has no unique commits against stable. | Approved matching art/models; integrate through agreed owner; test door, jar, activity and return journeys; actual sweetshop episode. |
| School supplies | Registry plus procedural book/stationery fixtures on repair branch; existing back-to-school affiliate page in stable. | Finish the child learning interior and activities; affiliate shopping is a separate existing page, not proof of the world. |
| Uniform and shoes | Registry/procedural shop on repair branch; stable has a uniform affiliate category. Agent 5 has distinct character/outfit branches. | Approved shop displays and interactions; preserve Agent 5 outfit/save behavior during owner-led integration. |
| Cake and pie | Registry/procedural cakes on repair branch; links to Fraction Pizza and Ratio Recipe. | Cake/pie-specific lesson presentation, age suitability, full answers/scoring/return checks. A pizza game is not a finished cake lesson. |
| Celebration shop | Registry/procedural fixtures on repair branch; existing birthday page is a separate feature. | Matching interior/exterior, safe learning interactions and shop journey. |
| Archie | Stable `ArchieCharacter.tsx` draws artwork with motion and a 120 ms mouth-state loop. Existing teaching/voice work has other owners. | Actual walking rig and speech-timed mouth behavior in the agreed engine; verify pause and voice lifecycle. |
| Founder, family, dogs | Existing approved artwork is preserved. Our standalone preview has nine illustrated family/robot/dog sprites. Health episode report describes an explicitly temporary computer-voice founder cameo. | Confirm approved character identity/assets for integration; founder voice/likeness acceptance; connected movement and dialogue. The preview is not an approved 3D cast. |
| Maths games | Eight practice destinations are in the foundation registry; repair branch reports standardized rounds. Stable has existing games. | Full age-appropriate shop → game → score → return journeys, under agreed world/game ownership. Existing game links alone do not complete a shop. |
| Floating planets | Repair handoff attributes floating rooms to SOD-10; actual Three.js procedural source is on c8470de. Our Canvas preview also has independent orbit/axial spin and a Moon. | Select/reconcile approved implementation and art, mobile performance and actual device validation. |
| Theatre/cartoons | Stable theatre has six short three-scene illustrated stories, each advanced by a 6.5-second timer. Five longer episode branches have different players/manifests and prior owner test reports. Repair branch has separate picture cinema/books work. | One agreed engine, preserve each episode, reconcile shared theatre/routes, full audible playback/content/duration, controls and device checks. |

The foundation branch only defines the shop registry and game destinations; it does not render a world. The repair branch goes further with actual procedural geometry. The current stable tree does not include those `src/components/world/` implementations. Source existence on a separate branch is not integration or deployment evidence.

## Family preview and picture book

Preserved file: [Sodafom-Moving-Family-Square.html](../docs/prototypes/sod-04-family-square/Sodafom-Moving-Family-Square.html), 860,124 bytes.

- Three displays: planets, gold carousel and eight equally spaced upright balloons.
- Canvas 2D sprite walking, body/leg motion, dialogue bubbles and optional native browser speech.
- Round floating display/pause/speed/walking/talk controls; planet selection or lights control.
- Subtle candlelight overlays, individual lamp/shop clicks and master light toggle.
- Responsive portrait/landscape layout; reduced-motion and hidden-page lifecycle code.
- No app navigation, saved child progress, real AI teaching, full 3D skeletal animation or lip-sync integration.
- Six embedded WebP assets. The original export references three optional unpkg helper/icon scripts; this is recorded rather than silently changing the preserved file.

The separate **Sodafom-Family-Picture-Book.pdf** has 227 pages with 205 earlier distinct project pictures, new concepts and preview screenshots. It is a static family presentation. The 80 MB PDF was already delivered and is not duplicated in Git.

## Tests actually run

All current checks below refer to **`86f5ff5c9492f1e6aa09ef695d0021d76b1cf032`**.

| Check / command | Result | Meaning |
| --- | --- | --- |
| `node docs/prototypes/sod-04-family-square/verify-preview.cjs` | **PASS** | Six inline scripts compile; all six embedded WebP containers have valid complete RIFF lengths. No rendering/audio claim. |
| `node --check docs/prototypes/sod-04-family-square/browser-check.cjs` | **PASS** | Browser harness syntax only. |
| `cmp ../recovered/Sodafom-Moving-Family-Square.html docs/prototypes/sod-04-family-square/Sodafom-Moving-Family-Square.html` | **PASS** | Exact previously delivered file preserved. |
| `git diff --check` | **PASS** | Whitespace check. |
| `node docs/prototypes/sod-04-family-square/browser-check.cjs` | **FAIL — environment blocked** | Chromium executable missing; zero browser assertions ran. Installer download timed out twice; stopped retrying. |
| Current app menu → world → shop → game → return journey | **NOT TESTED** | Shared source integration not owned/confirmed; preview is not the app. |
| Current full episode audible playback, character mouth timing | **NOT TESTED** | No working browser/audio device in this run. |
| Physical iPhone/Android/foldable/tablet/native wrapper | **NOT TESTED** | No physical device used. |
| Full app type-check/build/test rerun | **NOT TESTED by SOD-04** | Only docs/prototype handoff changed. Coordinator #25's earlier CI pass is separately attributed and is not section acceptance. |

Preview SHA-256: `3271ac8d1950988b97b6d4e239a7b59329acd73dda40d3d46b5e7d0345f507fc`.

Earlier in this thread, the **uncommitted standalone preview**, not any app commit, passed headless Chromium checks at widths 320, 360, 375, 390, 412, 430, 600, 601, 768, 820, 1024 and 1280. Checks covered animation/pause, upright balloon spacing, light toggles, dialogue and round controls; the exported file also had phone/tablet/landscape fit checks. Those old scratch logs/browser executable are unavailable now, so they are historical results and are **not relabelled as a rerun of this commit**. Audible speech and physical phones were never verified.

## Known source-level failures and conflicts

At stable commit 442656b, `CartoonTheatrePage.tsx` uses repeating motion animations independently of `playing`. Its Pause button stops narration and scene progression but does not freeze the background/character/star motion. The page has Read, Pause, Next and Restart, without a dedicated mute control; captions are always visible. `ArchieCharacter.tsx` advances mouth shapes every 120 ms based on a boolean rather than speech boundaries. These are source-level findings, not a browser reproduction. They belong to the already acknowledging animation/theatre worker; no duplicate fixes made.

English/dinosaurs/science/space players overlap `CartoonTheatrePage.tsx`; routes and RootLayout are shared. Agent 5 owns outfit files. The repair branch includes unrelated backend test failures in its dated report; do not blindly transplant its whole branch or interpret its older backend findings as fresh stable-build results.

Issue #21 comment 5684400686 is from an existing Coordinator Codex animation/theatre worker. **Nomination:** that worker should be the ONE shared animation-engine owner, subject to coordinator identity/branch confirmation. SOD-04 claims only the audit/preview paths above; episode authors keep their own manifests. This is a concrete ownership blocker, not a request to reassign other agents silently.

## Section acceptance checklist

**2/10 gates evidenced (20%) for this explicit section checklist; not a whole-app completion estimate.**

| Gate | Status |
| --- | --- |
| 1. Inventory all cartoon/mischief branches and Agent 5 original/recovery variants before edits | **PASS** — exact tips and file boundaries recorded |
| 2. Preserve existing work/episode ownership and hand off SOD-04 preview without shared-file changes | **PASS** — unchanged HTML and scoped commits |
| 3. One confirmed shared engine owner and route/theatre writer | **NOT TESTED / BLOCKED** — coordinator confirmation needed |
| 4. Five integrated Victorian shop/room journeys with accepted art | **FAIL as stable-source acceptance** — implementations remain on separate repair branch |
| 5. Integrated character movement and speech-timed mouths | **FAIL as source acceptance** — timed image effects do not establish this behavior |
| 6. Complete episode playback, narration duration and educational content review on combined source | **NOT TESTED** |
| 7. Pause freezes all motion/audio; mute and subtitles work through navigation | **FAIL as source acceptance** — theatre movement remains independent of pause |
| 8. Reduced motion and gentle lighting across all approved scenes | **NOT TESTED** on current combined app |
| 9. Phone/tablet portrait/landscape controls and screen fit, including physical devices | **NOT TESTED** on current combined app |
| 10. Optional phone look with consent/denial/manual fallback and device lifecycle | **NOT TESTED** on current combined app |

Next unfinished item in this section: Coordinator Codex confirms the existing animation worker's identity/branch and shared-engine contract, then assigns the narrow integration of the preserved preview/reference work. Until that conflict is resolved, SOD-04 has completed the non-conflicting audit/preservation handoff and will not edit the shared engine, theatre, routes or Agent 5 files.

No merge, deployment, Railway action, main/master update, production settings change or Sodafoam Systems 797 work. At handoff, no further files are being edited.

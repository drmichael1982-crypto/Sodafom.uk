# Artwork reference review — 16 September 2026

For **Michael Davis and Coordinator Codex**. Overall artwork acceptance: **AMBER / incomplete**.

The private artwork pack has been read and its actual images inspected. All nine images match their recorded hashes, sizes and dimensions. The six scene stills retain three dogs, but Michael's latest portrait has not yet been applied faithfully throughout. The checked app source also contains older Archie, Soda and Daisy artwork. No picture, animation or app replacement is claimed by this review.

## Identity and scope

| Item | Exact value |
| --- | --- |
| Repository | `drmichael1982-crypto/Sodafom.uk` |
| This branch | `codex/artwork-reference-review-20260916` |
| Source inspected / branch base | `442656b4e2ec76167b4d0b5fb7b804cf742904a5` |
| Handoff read | [PR #33](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/33), `cbe4a727b2edd561fcc29d024844ca920904e1dc` |
| Pack | `Sodafom-Agent-Artwork-Handoff.zip` |
| Archive SHA-256 | `d2ecb9ae26dc2a3559c9a91bae06fa500c846f32f8f466ac8c27e7f85a32e109` |
| Role | Narrow character-reference review; no existing numeric agent identity claimed |
| Implementation assignment | Not established for this chat by the handoff; existing scene owners retained |
| Tested checker / final commit | Recorded in this branch's draft PR description after commit |

New files owned by this continuation:

- `agent-reports/ARTWORK-REFERENCE-REVIEW-20260916.md`
- `docs/artwork/reference-pack-checks-20260916.json`
- `scripts/qa/check-artwork-reference-pack.py`

No application, route, player, episode, image, voice, dependency, workflow or deployment files were changed. The original pack is preserved outside the repository. Public publication of its portrait/image bytes is not part of this change. The prior handoff's publication restriction remains in place.

## References actually inspected

Read all four Markdown documents and `scene-status.json` in the pack. Visually inspected the original Michael portrait, rocket group, six-scene overview and each of the six scene PNGs individually at original resolution. The findings below are manual visual observations, not a facial-similarity score or Michael's approval.

| Character | Reference priority and retained design |
| --- | --- |
| Michael | `images/master/michael-davis-approved.jpg`, SHA-256 `74e4bc78fddea3ca40bc8bbb383a8b6c8a344178e27d9a2591d88e810dedefa2`. Use this specific face, beard, brown eyes and adult build; navy three-piece suit, open white shirt, white pocket square, gold outline heart pin. Dad and sole Founder & Creator. Preserve established voice. |
| Archie | Rocket group: curly blond hair, emerald-green eyes, blue/gold A hoodie, jeans and matching trainers. |
| Rob | Rocket group: older guide, brown wide-brim hat, glasses, grey moustache, cream shirt, brown waistcoat and trousers. |
| Soda | Rocket group: separate round white/blue head and torso, cyan ring eyes, short articulated limbs and round blue SODAFOM badge. |
| Jessica | Jet-black Cockapoo, tiny white chin only, blue collar. |
| Sally | Entirely jet-black Cockapoo, blue collar. |
| Daisy | Brown/white Cockapoo, white muzzle/chest/belly, blue collar. |

Group reference SHA-256: `aaef7bb409f6a35a40029bdb518a92f511511f5908c84ce00ac07f0f54dc6099`. Michael in that group is superseded by his portrait. The portrait is 685 × 1536 including black screenshot margins; it does not establish feet/shoes. The scene masters supplied are 1672 × 941 or 1920 × 1080, not 4K or rigged 3D models.

## Scene-specific correction list

Common finding: the stills preserve Michael's bald head, dark beard and suit attributes, but use a more exaggerated earlier face, eye treatment and beard silhouette than the approved portrait. Matching clothing is insufficient. Rework Michael from the portrait while retaining each pose, setting and other approved cast. None of the six is marked portrait-matched or motion-approved in the supplied manifest; this review does not change those flags.

Each filename below is relative to `images/scenes/` in the private pack. Only one still per source clip was reviewed; anchor times are copied from the manifest and were not independently checked in video.

| Still / source anchor | Direct observation | Required follow-up |
| --- | --- | --- |
| `Sodafom-Shop-Walk-Character-Correction.png` / 6 s | Michael retains the earlier face. Three dogs are visible; two have visibly black coats. Soda's lower body is cropped by the frame. | Correct Michael only; preserve shopfront, jars, cast and path. Check Soda's complete body and dog markings in the actual moving shot. |
| `Sodafom-Funfair-Character-Correction.png` / 3 s | Michael retains the earlier face. All three dogs and the core cast are visible, with the black dogs still black under warm lights. | Compare Michael at the closest frame as well as this wide view. Preserve the approved entrance and prize stall. |
| `Sodafom-Funfair-Continuation-Character-Correction.png` / 1.5 s | Earlier Michael face; three dogs are visible but lower bodies are cropped. Night lighting differs from the daylight coaster still. | Correct Michael; review uncropped motion and an intentional lighting/time transition if these clips are joined in that order. |
| `Sodafom-Coaster-Character-Correction.png` / 2.05 s | Earlier Michael face; three dogs visible. Additional blonde adult is present; this pack does not establish her identity. MATHS sign is readable. | Correct Michael; retain the extra cast member and use her established reference. Do not invent an identity from this pack. Check actual educational prompts in video. |
| `Sodafom-Waltzers-Character-Correction.png` / 12 s | Michael is closer and the exaggerated eyes/face are especially apparent. Three dogs sit beside the car. Archie/Soda appear airborne and Rob is stepping over the car edge. | Correct Michael. The still cannot establish whether the ride is stopped or the exit coherent; review the full action before accepting playback. |
| `Sodafom-Twister-Character-Correction.png` / 12 s | Earlier Michael face; core cast and three dogs visible at the steps. Dog tags are bone-shaped here, versus round tags in the shop and heart-shaped tags in the Waltzers still. | Correct Michael; make accessory continuity deliberate using established dog references. Check each character's exit and foot contact in motion. |

The rocket still also needs the Michael override. Keep the rocket, ramp and group design. The pack has a rocket script, not a rendered boarding/launch sequence.

Visible still-only dog count: **6/6 PASS**. This does not prove persistent dog identity, tiny chin markings, complete coats in cropped areas, gait or count through moving clips. No broad white chest bib is clearly visible on the black dogs in these stills, but the known Jessica defect in prior moving footage has not been retested here.

## Concrete app-source inconsistencies

These findings apply to source commit `442656b4e2ec76167b4d0b5fb7b804cf742904a5`, not the deployed app or unmerged owner branches. Each of the following actual PNGs was opened and visually inspected.

| Existing asset | Observed difference from the latest reference | Verified consumers |
| --- | --- | --- |
| `public/assets/images/archie-character-v2.png` | Swept/spiky blond hair, superhero suit/cape, heart emblem and key instead of curly hair and the A hoodie. Green eyes alone do not establish continuity. | `src/components/ArchieCharacter.tsx`; `src/components/scanners/ScannerWorkspace.tsx` |
| `public/assets/cartoon/friends/soda-bot.png` | Sticker-style robot with crescent eyes and large GREAT CHOICE text; different presentation from the round cyan-ring-eye character with visible SODAFOM badge. | `src/components/CartoonRobot.tsx`; `src/components/ArchieCharacter.tsx`; `src/pages/CartoonTheatrePage.tsx`; `src/pages/SodafomAdventurePage.tsx` |
| `public/assets/cartoon/friends/daisy.png` | Black dog, pink bow, red collar and WOOF/WELL DONE text. Current Daisy reference is brown/white with a blue collar. | Friends entry named Daisy in `src/pages/SodafomAdventurePage.tsx` |

These are a correction queue for the current owners. No shared asset was silently replaced. A global replacement needs a properly reviewed character asset, checks for every consuming layout and coordination with the character, scanner, theatre and town owners.

## Verification actually performed

| Check | Result / limit |
| --- | --- |
| Archive CRC (`zipfile.ZipFile.testzip`) | PASS; 14 archive entries readable. |
| Nine assets: SHA-256, byte size, dimensions and image decoding | PASS, 9/9; exact recorded output in `docs/artwork/reference-pack-checks-20260916.json`. |
| Approved portrait and rocket hashes anchored in checker | PASS; checker also pins the original scene manifest. |
| Missing-pack negative check | PASS: checker returns FAIL and exit 1. |
| Altered-portrait negative check | PASS: appending bytes to a temporary copy rejects that portrait; eight untouched images still pass. Originals unchanged. |
| Manual still review | Completed for both masters and all six scenes; identity corrections remain. |
| Source/image inspection | Completed for the three legacy app assets and listed consumers. |
| Full video, narration, mouth timing, joins and safe ride exits | NOT TESTED; no MP4, MOV or WebM is included in this archive. |
| App build, unit suite, browser journeys and physical phone/tablet | NOT TESTED in this documentation/checker continuation. No runtime code changed. |
| New-file scope / whitespace | PASS at commit preparation; source/public trees unchanged from branch base. |

Reproduce the positive integrity check after extracting the supplied pack:

```sh
python3 scripts/qa/check-artwork-reference-pack.py /absolute/path/to/sodafom-artwork-master-20260916
```

Requires Python 3 and Pillow. The tool reads files and emits JSON. Exit 0 means reference integrity only; it is not a visual approval gate. This exact-pack checker intentionally rejects a modified manifest or master reference. Future approved packs need an explicit reviewed anchor update.

## Ownership preserved and remaining work

| Existing owner/thread | Snapshot inspected | Remaining dependency |
| --- | --- | --- |
| Town #29 / PR #30 | `72812932facc1baed2589a9769e1c8924df70005` | Apply reviewed cast within town-owned presentation and coordinate transitions. |
| Fairground/shop PR #31 | `9c8d1f7528394c97fe351d81ce38df6883108f57` | Correct the existing six scenes and rocket Michael; validate before/after footage. |
| Agent 7 / #21 / PR #28 | `1815d442e68abda6a20ee74c1337ac9a1cf76cbb` | Shared playback, movement, speaking state, captions, mute and reduced motion. |
| SOD-04 / PR #27 | `a81cd506f3e4d615e1e814c0060da31fc31f6852` | Existing family-preview/audit files retained. This review does not assume that agent's identity. |
| Books/scanners #20 | Ownership recorded in #33 | Preserve reader/scanner behaviour when character artwork is integrated. |

The sampled open PR metadata is a snapshot, not evidence that those agents are currently active. No new work orders or acknowledgement on another agent's behalf were sent.

Remaining: confirmed implementation scope for this chat; owner-produced Michael corrections and consistent accessories; approved app-ready Archie/Soda/Daisy assets; full moving clips and established voice sources; actual transitions, theatre integration and device acceptance. The prior 7 × 4 correction remains a video-content requirement from #33, not a newly retested result. No overall completion percentage is inferred from the nine passing integrity checks.

**No merge, deployment, main/master change, production-setting change or Sodafoam Systems 797 work.**

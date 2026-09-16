# QA-FIX-05 — character asset repair handoff

16 September 2026. For Michael Davis and Coordinator Codex.

## Result and scope

**Artwork remains RED pending accepted replacement assets.** This worker completed a source/asset triage, not an artwork regeneration or app rollout. No existing public asset was a safe, approved replacement for the audited home Michael, shared Soda or Daisy sprite. Changing an alt label would not repair the image, and replacing a flattened navigation scene with a portrait would destroy its layout.

- Branch: `codex/qa-fix-05-artwork-20260916`.
- Inspected application base: `442656b4e2ec76167b4d0b5fb7b804cf742904a5`.
- Owned deliverable: this text-only report, including the replacement manifest below.
- Runtime code, artwork bytes and private references: unchanged.
- No generation spend, publication of private images, merge, deployment, main/master change, or Systems 797 work.
- The final report commit is recorded by Coordinator Codex and in branch history; it cannot be embedded in its own contents.

This follows artwork handoff PR #33, the numbered art desk #34 and existing private reference review work. Agent 5 / ART-01 / reference #32 retain character ownership; ART-04 and the relevant scene owners retain the learning scenes; Agent 7 retains theatre work. This handoff does not imply those existing owners have accepted a new assignment.

## References actually inspected

Viewed the original files in the private `sodafom-artwork-master-20260916` pack, read its master-character/work-order documents, and read the public handoff and existing character/books review records through the cloned Git branches.

| Private reference | Actual dimensions | SHA-256 |
| --- | --- | --- |
| `images/master/michael-davis-approved.jpg` | 685 × 1536 | `74e4bc78fddea3ca40bc8bbb383a8b6c8a344178e27d9a2591d88e810dedefa2` |
| `images/master/approved-group-rocket.png` | 1672 × 941 | `aaef7bb409f6a35a40029bdb518a92f511511f5908c84ce00ac07f0f54dc6099` |

These are identifiers, not public image URLs. No portrait, group image, candidate still, private download URL or image data is included here.

Michael must match his latest portrait: bald head, brown eyes, shaped full beard, actual face proportions, navy three-piece suit, open white shirt, pocket square and gold outline heart pin. He is Archie's dad and sole Founder & Creator. Keep his established voice.

For the other characters, the original rocket group remains authoritative. Archie needs its actual face, blond hair, emerald-green eyes and blue/gold zip-front A jacket; shared blue/gold colours alone do not make the superhero sprite a match. Rob keeps his hat, glasses, grey moustache and cream/brown clothes. Soda needs its round head, cyan ring eyes, compact articulated white/blue body and circular blue SODAFOM badge. Jessica is jet-black with only a tiny white chin; Sally is entirely jet-black; Daisy is brown and white. Keep exactly three family dogs.

## Exact replacement manifest

Paths beginning `public/` below are already committed public app assets. They are the current assets to review or replace, not newly accepted artwork. Image corrections must preserve scene composition, visible navigation labels and existing hotspot geometry unless the owner separately updates and tests the layout.

| ID | Current public asset and consumers | Direct observation | Required owner deliverable / acceptance |
| --- | --- | --- | --- |
| ART-R01 | `public/assets/approved/home-fire-v3.jpg` (1086 × 1448); `src/pages/ApprovedArtworkPage.tsx`, home variant | Father has brown hair, blue eyes and a blue hoodie; this is not the supplied Michael portrait. The old robot has a different face and key badge. Jessica has a conspicuous white chest area. | ART-01 plus home/town owner: a corrected version of the same scene, including the small Parents' Evening portrait, matching Michael and the group. Preserve 17 real home targets and verify each target after integration. No accepted public replacement located. |
| ART-R02 | `public/assets/approved/lessons.png` (1536 × 1151); `src/pages/ApprovedArtworkPage.tsx`, lessons variant; `src/components/ClassroomScene.tsx` background | Brown-haired hoodie father, duplicate family/dog groups and additional puppies remain. Archie wears the older plain-blue outfit. | ART-04 / classroom owner with ART-01: correct the existing classroom family and dog presentation while retaining all ten subject doors, positions and readable text. No accepted public replacement located. |
| ART-R03 | `public/assets/approved/stories.png` (1536 × 1151); `src/pages/ApprovedArtworkPage.tsx`, stories variant; reader fallback in `src/pages/ArchieStoryCollectionPage.tsx` | Old hoodie father, large white patch on Jessica, a separate Daisy-and-puppies group and earlier Archie designs remain. | ART-04 / Books owner with ART-01: correct the existing library scene; keep shelves and book labels. Six books use this reader fallback, so review their 60 page states after a change. Do not overwrite QA-FIX-04 reader repairs. |
| ART-R04 | `public/assets/cartoon/friends/daisy.png` (320 × 320); `src/pages/ArchieFriendsPage.tsx`; `src/pages/SodafomAdventurePage.tsx` | The named Daisy image is a dark dog with a pink bow and a “WOOF! WELL DONE!” sticker. It is not the approved brown/white Daisy. | ART-01/shared-character owner: supply one accepted brown/white Daisy asset and integrate at both consumers. No correct standalone public Daisy asset located. Do not rename this dark dog Jessica or Sally to conceal the mismatch. |
| ART-R05 | `public/assets/cartoon/friends/soda-bot.png` (320 × 320); `src/components/ArchieCharacter.tsx`, `src/components/CartoonRobot.tsx`, `src/pages/ArchieFriendsPage.tsx`, `src/pages/SodafomAdventurePage.tsx`, `src/pages/AITeacherPage.tsx`, `src/pages/CartoonTheatrePage.tsx` | The sprite has curved smiling eyes and a large “GREAT CHOICE!” graphic. It is not the current round-ring-eye, SODAFOM-badge robot. | ART-01 supplies one accepted shared Soda asset; consumer owners test existing display sizes and speaking/idle states. Coordinate theatre integration with Agent 7. No accepted public replacement located. |
| ART-R06 | `public/assets/images/archie-character-v2.png` (1024 × 1536); `src/components/ArchieCharacter.tsx`, direct cover/reader uses in `src/pages/ArchieStoryCollectionPage.tsx`, `src/pages/AITeacherPage.tsx`, `src/components/scanners/ScannerWorkspace.tsx` | Spiky-haired superhero outfit with cape and heart emblem differs from the approved group jacket and proportions. | ART-01/shared-character owner supplies the accepted common Archie asset or model. Review the A badge, gold sleeves, hood, zip, pockets, cuffs and waistband against the actual group. Preserve reader/scanner behaviour and source ownership. |
| ART-R07 | `public/assets/approved/homework-helper.png` (1536 × 1405); `src/pages/ApprovedArtworkPage.tsx`, homework-helper variant | A brown dog on the bed is visibly labelled “Sally”; the bottom-right panel names Daisy. The main Archie wears the earlier plain-blue outfit. | ART-04/homework scene owner corrects the identity in the pixels against the group and preserves the real scanner entry controls. Do not change scanner logic or assume the brown dog is Sally. |
| ART-R08 | `public/assets/approved/archie-theatre.png` (1536 × 1024); `src/pages/ApprovedArtworkPage.tsx`, theatre variant | Baked heading reads “Archy Theatre”; the robot has a heart badge and older styling, and Archie wears the earlier outfit. | ART-05 / Agent 7 with ART-01: correct the existing entrance art and spelling while retaining the shared-player entry. This is distinct from the six playable cartoon controls. |
| ART-R09 | `public/assets/approved/settings.png` (1536 × 1061), `game-islands.png` (1536 × 1151), `shop.png` (1536 × 1024); their variants in `src/pages/ApprovedArtworkPage.tsx`; game-islands is also used in `src/components/IslandAdventure.tsx` | These still show the earlier plain-blue Archie outfit. Settings also gives Jessica a white chest bib. They do not provide a current approved replacement for the shared characters. | Their existing scene owners review the characters against ART-01, preserving the windmill, islands, shop environments and live hit targets. This report does not approve a wider redesign or any price changes. |

For ART-R03, the six fallback books are The Lost Puppy, A Visit to Orford Castle, Space Explorers, Animals Around the World, Healthy and Happy, and Caring for Our Planet. That inventory follows the actual `story.image` assignments; having an available fallback is not a passed character-consistency check.

The dedicated `public/assets/stories/archie-magic-key.jpg` shows the correct broad two-black/one-brown-white grouping, but Archie's outfit is still the earlier plain-blue hoodie. `public/assets/stories/archie-library-welcome.jpg` also has three dogs and a different small key emblem on Archie. Neither is a standalone replacement sprite. QA-FIX-04 owns the Magic Key text alignment against the current committed illustration; this worker has not changed it. The four dedicated story scenes remain subject to the existing Books artwork owner's finer continuity review.

## Daisy coordination and pre-existing fixes

QA-FIX-04 and this worker checked the same stable base. The reader no longer contains the decorative sprite falsely described as Daisy: that removal predates this repair batch. It must be preserved and must not be presented as a newly written fix. The two other Daisy mappings in ART-R04 still need accepted artwork.

The stable voice policy identifies Jessica, Sally and Daisy as dogs and prevents human speech for those profiles. That source path is retained. Audible dog sounds and physical-device playback were not retested by this lane.

QA-FIX-04 acknowledged it owns the reader and is independently addressing the Magic Key opening, shelf clipping and phone header wrapping. It is preserving the earlier labels and sprite removal. Shared character motion and the existing step-out overlap remain separate from this asset-mapping task.

## Public asset verification

- Enumerated all 38 PNG/JPEG files under `public/assets` and ran Pillow `Image.open(...).verify()` against each: **36 decoded successfully; 2 failed**.
- All eight currently mapped `ApprovedArtworkPage.tsx` variant images decoded successfully. The active home is `home-fire-v3.jpg`.
- `public/assets/approved/home.png` is not identifiable as an image; `public/assets/approved/home-fire-v2.png` fails its PNG IDAT checksum. Searches found no active `src` references to either old file. Do not switch the home back to these assets. They were left untouched; their failure is not evidence that the current v3 home fails to load.
- Visually inspected the two private masters and the specific public scenes/sprites described above. The older `complete-design-board.png` also uses earlier character designs; `home-landscape-v2.png` contains no family and cannot repair the family scene. No current-reference public replacement was found in the inspected stable asset set.
- Read the PR #33 handoff, `SOD-VIS-01-REFERENCE-REVIEW.md`, `ART-01-CHARACTERS.md`, and the existing `AGENT-SOD-BOOKS-QA-ARTWORK-20260916.md`. Those branches provide text/candidate-review handoffs, not accepted public asset replacements. Candidate imagery does not supersede the original masters.

Selected current public-file hashes make this before-state reproducible:

| Asset | SHA-256 |
| --- | --- |
| `public/assets/approved/home-fire-v3.jpg` | `c05a27873a8c48f51a5472b53df24f3550c2bbddac6bb393afe59d5d082e1e8f` |
| `public/assets/approved/lessons.png` | `cefb7e9d842da083ee137a49ec6ed120c5c6c5ea34170f7b4ffd6fc740f2ee1d` |
| `public/assets/approved/stories.png` | `35f3d75ef160fd9c32a9daacf860d78edb4a01b915acc85cc6630a2c673a4dad` |
| `public/assets/cartoon/friends/daisy.png` | `703661a12f27b56bb094de291cc1609af89dc23a11317c8e5ce3c5a437438bf8` |
| `public/assets/cartoon/friends/soda-bot.png` | `a622a540b2ec2b7c1b58ed12252172ed0734050beb2c2882fd7709850427a267` |
| `public/assets/images/archie-character-v2.png` | `d8cc304681fe5b78418ca95c45d6015478493bc7eaedc7b0475a87639040132a` |

## Acceptance and next integration step

1. Coordinator Codex routes ART-R01–R09 through the existing numbered artwork desk and owners; avoid parallel edits to the same source image.
2. Owners make localised character corrections using the private masters, preserve the existing scenes and provide actual before/after evidence. Keep private reference/candidate pixels out of the public repository under the current handoff restriction.
3. After an asset is accepted and authorised for app delivery, record its exact filename/hash, update only the relevant consumer mapping or scene file, and verify the retained hit targets, accessible controls and image fit.
4. Retest the exact integration commit in the browser and on Michael's phone, including shared sprites, reader transitions and reduced motion. Review real motion/voice separately; a corrected still does not prove lip movement, character walking or voice consistency.

**Not tested in this lane:** new runtime build, live-site changes, physical phones, microphone/audio, animation joins or after-fix visual acceptance. No implementation tests were rerun for this documentation-only commit. The verified outcome is an exact correction handoff; the images and the audit's artwork score have not yet improved.

# ART-01 — Character correction handoff

Date: 16 September 2026. Coordinator: Coordinator Codex.

ART-01 is a new numbered review lane; it does not rename or replace legacy Agent 5. Existing ownership stays with Agent 5 / reference issue #32 and the fairground owner of PR #31.

- Working branch: `codex/artwork-coordination-20260916`.
- Inspected base commit: `442656b4e2ec76167b4d0b5fb7b804cf742904a5`.
- Owned repository file: `docs/artwork/coordination/ART-01-CHARACTERS.md` only.
- This report was prepared without committing, pushing, commenting externally, merging, deploying, or changing application code. Systems 797 was not touched.
- Portrait, source stills and the generated candidate remain private. This text handoff contains no embedded image bytes, public asset URLs or application references to private files.

## Result

All six original stills were visually compared at their native resolution with the actual approved portrait and rocket group. Their Michael faces retain earlier stylisation and need refinement against the portrait. The navy suit and accessories are broadly consistent, but those alone do not establish a face match.

One private Shop Walk candidate was generated and inspected. Its Michael face is closer to the portrait, but his head turns toward the camera instead of retaining the original rightward gaze. Output resolution also changed. It is a review candidate, **not an approved replacement**. No other still or moving section was regenerated.

## Reference rules used

Read: `README.md`, `MICHAEL-DAVIS-MASTER.md`, `WORLD-ARTWORK-WORK-ORDER.md` and `scene-status.json` from the supplied `sodafom-artwork-master-20260916` pack.

1. Michael uses `images/master/michael-davis-approved.jpg`: specific face, brown eyes, thick dark eyebrows, full shaped dark beard, adult build, navy three-piece suit, open white shirt, white pocket square and small gold outline heart pin. Preserve each scene's pose and established footwear; the portrait does not show his feet. His established voice remains unchanged. He is Archie's dad and sole Founder & Creator.
2. Archie, Rob, Soda and the dogs use `images/master/approved-group-rocket.png`. Its earlier Michael does not override the portrait.
3. Keep the approved scene settings, cast, actions and composition. Do not invent designs for Beth, Kayla or Alfred from this pack.

Archie retains blond curls, emerald-green eyes, the blue/gold A hoodie, jeans and matching trainers. Rob retains his older face, brown wide-brim hat, thin gold glasses, grey moustache, natural chin, cream rolled-sleeve shirt and plain brown waistcoat/trousers. Soda retains a separate round head/torso, white/blue body, cyan ring eyes, short articulated limbs and blue belly badge spelling `SODAFOM`.

Exactly three family dogs: Jessica jet-black with a tiny white chin only; Sally entirely jet-black; Daisy caramel-brown with white muzzle/chest/belly. All wear blue collars. Light-coloured collar tags must not be mistaken for white fur.

## Per-scene correction instructions

The table concerns the original stills, not the source videos. Michael identity is marked FAIL where further correction is required, rather than treating a familiar costume as acceptance.

| Original scene | Michael check and exact correction | Preserve / additional check | Still result |
| --- | --- | --- | --- |
| Shop Walk | At centre-left between Rob and Archie, replace the earlier large round-eye/cheek and beard treatment with the portrait's eye, brow, nose, cheek/jaw and full beard proportions. Retain the original three-quarter rightward gaze, walking stride and relaxed hands. Review the private candidate below; its turned head still needs resolution. | Preserve striped awning, jars, red door, curb, warm light, existing character placement and foreground Soda crop. Jessica is left, Daisy centre-right, Sally right. | Michael FAIL; visible dog count/coats PASS. |
| Funfair entrance | Refine the central Michael's face against the portrait; retain his upright walk, upward-right attention and natural smile. Match the portrait's adult face proportions and beard contour without transferring the portrait's tilted pose. | Preserve prize stall, balloons, signs, background child, current cast order and sunset. Jessica left and Sally right remain black; Daisy stays between Michael and Archie. | Michael FAIL; visible dog count/coats PASS. |
| Funfair continuation | Refine Michael above/between Rob and Archie. Correct the earlier eye/cheek and long block-like lower beard shape using the portrait while retaining his upward look at the coaster. | Preserve night lighting, wooden coaster and visible riders. The lower frame crops parts of Soda and the dogs: do not invent hidden paws/body markings to claim a complete check. Keep three visible dog heads/bodies. | Michael FAIL; visible count/coat areas PASS; hidden body areas NOT TESTED. |
| Coaster | Refine Michael behind Daisy/Soda, keeping his facing-right walking pose and cheerful expression. Replace the earlier eye, cheek and compact chin/beard treatment with the portrait's face and beard proportions. | Preserve daylight, timber platform, queue and `MATHS` sign. Preserve the blonde adult in pink; this pack does not establish her character identity. Do not recolour the two black dogs. | Michael FAIL; visible dog count/coats PASS; additional adult identity NOT TESTED. |
| Waltzers | Refine the central seated Michael's oversized round-eye and simplified lower-face/beard treatment to the portrait's proportions. Preserve his excited expression, seated body, hands and existing suit. | Keep the polished car, sunset, Archie, Rob and airborne Soda pose in this still. Preserve the three seated dogs at lower left. The still does not prove safe/stopped boarding, a coherent exit or motion continuity. | Michael FAIL; visible dog count/coats PASS; ride motion NOT TESTED. |
| Twister | Refine Michael at left of Archie, keeping his rightward attention, walking step, hands and suit. Match the portrait's brow/eye spacing, nose, cheeks and shaped full beard instead of the earlier scene face. | Preserve ride, step, open gates, `READING` sign, pointing Archie and Rob/Soda positions. Jessica left, Daisy centre and Sally right remain unchanged. | Michael FAIL; visible dog count/coats PASS. |

Across all six, the visible main designs of Archie, Rob and Soda broadly follow the rocket reference; no replacement character design is needed. A remaining consistency detail is the dog tag silhouette: round blue tags in Shop Walk/entrance, heart-like tags in Waltzers and bone-like tags in Twister. Agent 5 should settle on the visible approved rocket collar/tag design before motion work. Preserve the actual fur markings while making any agreed accessory correction. Do not roll that separate change into a Michael-only edit.

The rocket group's Michael also needs a separate portrait comparison/correction under Agent 5 / #32. ART-01 did not edit that reference.

## Private Shop Walk candidate

- Built-in imagegen was used once, with the original Shop Walk as edit target and the approved Michael portrait as identity reference. The image was displayed privately in the working conversation; it was not added to GitHub or the app.
- Output identifier: `exec-6eb8838e-859b-414e-824e-405f8157bff7.png`.
- Actual size: **1672 × 941**, 2,270,842 bytes. This is smaller than the 1920 × 1080 source and is not a 4K master.
- SHA-256: `0f5c4264580d9a8250b59c790a4cf769ef37f12d2250d89b545d7885d02defdb`.
- Visual inspection: portrait resemblance improved; shop composition, other cast, three dogs and `SODAFOM` badge remained recognisable. Pixel-identical preservation is not claimed.
- **FAIL:** original Michael head direction was not fully preserved; his gaze/head now turns toward the camera. Exact source dimensions were not retained.
- **NOT TESTED:** user approval, exact pixel preservation outside Michael, full-resolution final delivery, app integration, animation and voice.

Prompt record: identity-preserve edit; change only Michael's head/face and minimal neck blend to the supplied portrait. Match brown eyes, dark brows, nose/cheek/jaw proportions and full dark beard. Retain his original facing-right walk, adult build, hands, suit, heart pin, pocket square and footwear. Lock the shop, lighting, camera, framing, Rob, Archie, Soda, all three dogs and their markings/positions. No extra cast, objects, text or crop changes. Request one landscape 1920 × 1080 candidate if supported. The inspection above records where the output did not satisfy that request.

## Source integrity and sizes

SHA-256 was recomputed from every supplied asset and matched `scene-status.json`: **9/9 PASS**. Actual dimensions read from the images also matched the manifest: **9/9 PASS**. The contact sheet's hash/dimensions were checked; scene judgments used the six individual originals.

Paths below are relative to the private reference pack, not downloadable repository assets.

| File | Actual pixels | SHA-256 |
| --- | --- | --- |
| `images/master/michael-davis-approved.jpg` | 685 × 1536 | `74e4bc78fddea3ca40bc8bbb383a8b6c8a344178e27d9a2591d88e810dedefa2` |
| `images/master/approved-group-rocket.png` | 1672 × 941 | `aaef7bb409f6a35a40029bdb518a92f511511f5908c84ce00ac07f0f54dc6099` |
| `images/six-scene-review.jpg` | 1984 × 2050 | `2d4132eac007a027373bbb11ffc9fa191010458f3709d7265ead5f8223c9ea9c` |
| `images/scenes/Sodafom-Shop-Walk-Character-Correction.png` | 1920 × 1080 | `60e260e695089327a9750309518c3d8fcceea5f2aa1a90151258a7a231bfd7bb` |
| `images/scenes/Sodafom-Funfair-Character-Correction.png` | 1920 × 1080 | `4d860c16e4ef4e2e1cf4890331e28b26571058cd453b56484dd366cd4e96807c` |
| `images/scenes/Sodafom-Funfair-Continuation-Character-Correction.png` | 1672 × 941 | `30567560ca34e013c3c8bd93522c5c7421f3fb535613cfa3de72af2c54398d8d` |
| `images/scenes/Sodafom-Coaster-Character-Correction.png` | 1672 × 941 | `c6cb4fe1fbc2f17ef5ba6e7f4e477f0405c5835b62312c52840613ff02450d6b` |
| `images/scenes/Sodafom-Waltzers-Character-Correction.png` | 1920 × 1080 | `0f500afac15358ef5cab6460fa21ef97d2a6d2af89122396f1903b32c2910628` |
| `images/scenes/Sodafom-Twister-Character-Correction.png` | 1920 × 1080 | `992d5f06ee21a4416528f88cbb623e90604935d1eba2f3c15989c23eb8b145ed` |

## Remaining owner actions

ART-04 additionally reported existing app assets `public/assets/approved/lessons.png` and `public/assets/approved/stories.png` with a brown-haired, blue-hoodie Michael, duplicate family/dog groups and a larger white bib on Jessica. ART-04 inspected those assets; ART-01 has not independently verified them. Keep their classroom/reader corrections separate from the six stills above, preserve the environments and established teachers, and use ART-04's report for consuming-path evidence.

1. **Agent 5 / [reference #32](https://github.com/drmichael1982-crypto/Sodafom.uk/issues/32):** review the private candidate, resolve Michael's original head direction, and obtain his approval before choosing a replacement. Correct the other five stills and rocket Michael from the same portrait, one localised change at a time. Keep before/after evidence private and preserve original source files. Agree collar/tag details from the rocket reference.
2. **[Fairground PR #31](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/31) owner:** apply only accepted assets within existing scope. Record the exact consuming paths/commit and actual preview results. Do not treat this handoff as six completed corrections or finished animation.
3. **Motion/theatre owner via Coordinator Codex:** review full opening/middle/close-up/transition/final frames and playback after still approval. Maintain Michael's established voice, dog count and coats, foot contact, boarding/exits and join continuity. Correct old learning text, including `7 × 4 = 28`. The manifest reports a failed funfair retry and a shop repair that failed sampled Jessica-coat QA; those source videos were not independently replayed by ART-01.
4. **Coordinator Codex:** reconcile owner acknowledgements and report each completion stage separately. Final moving clips, joined export, app routes, physical-phone playback and voice are **NOT TESTED** by this lane. No merge or deployment is authorised here.

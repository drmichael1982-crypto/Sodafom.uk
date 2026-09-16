# SOD-VIS-01 — shared character-reference handoff

For Michael Davis and Coordinator Codex. 16 September 2026.

**Archie's outfit failed the initial continuity review.** Michael's feedback prompted a closer comparison: the A badge, neckline/zip, pocket trim and garment details varied between pictures. The first broad cast-consistency assessment missed this. Six landscape scenes and the portrait Twister have now received targeted outfit corrections using the original rocket group's jacket. The revisions are candidates; fine-detail visual acceptance remains open. File checks do not establish visual approval.

## Branch and scope

- Branch: `codex/sod-vis-01-character-reference-review-20260916`.
- Parent: [handoff #33](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/33), `codex/sodafom-artwork-work-order-20260916` at `cbe4a727b2edd561fcc29d024844ca920904e1dc`.
- Exact published implementation/manifest commit tested: `88382666c1b82ca70c313972a34eee9780b63971`.
- This report is a subsequent documentation-only commit; the branch head records the publication tip.
- Contribution: the shared reference portion of SOD-VIS-01. No narrower world assignment was established for this session.

Owned additions are `docs/artwork/SOD-VIS-01-REFERENCE-REVIEW.md`, its JSON manifest, `scripts/verify-artwork-reference-pack.mjs` and this report. Application files, other agents' reports and existing artwork remain untouched. Town #29/PR #30, Fairground PR #31, Theatre Agent 7/#21/PR #28 and Books/scanners #20 retain ownership; no other agent acknowledgement is claimed.

Native Git push lacked credentials. Publication used the authenticated GitHub connector instead. The public branch contains only text, metadata and the read-only checker, respecting the reference-access restriction recorded in #33. No artwork bytes or private access URLs are included.

## Artwork delivered

Read #33, its ownership records and the supplied pack. The original Michael portrait is the authority for Michael throughout every edit. The original rocket group is the authority for Archie, Rob, Soda and the three dogs. All original files are preserved. The new rocket edit is a candidate, not a replacement approved master.

The private companion `Sodafom-Character-Review-v2.zip` contains the untouched originals, eight current candidates, a before/after `review.html`, exact edit prompts, manifest, review notes and this report. Superseded outfit candidates are excluded from the current review selection.

| Current candidate | Actual pixels | Review limit |
| --- | --- | --- |
| Rocket / shared group | 1672 × 941 | Michael portrait refinement; original group remains the cast authority. |
| Shop walk | 1672 × 941 | Portrait and outfit correction; supplied framing crops Soda's feet. |
| Funfair entrance | 1672 × 941 | Portrait and outfit correction; final close-detail approval outstanding. |
| Funfair continuation | 1672 × 941 | Portrait and outfit correction; cropped feet/dog bodies limit contact assessment. |
| Coaster | 1672 × 941 | Portrait and outfit correction; inherited daytime-to-night transition unresolved. |
| Waltzers | 1672 × 941 | Portrait and outfit correction; supplied airborne pose remains. |
| Twister landscape | 1672 × 941 | Portrait and outfit correction; inherited collar tags vary from the group reference. |
| Twister portrait | 941 × 1672 | Latest framing request, approximately 9:16; full cast retained. Exact 9:16 pixels were not returned. |

Michael's portrait features and navy three-piece suit remain the likeness target. Archie's exact royal-blue/gold zip-front hooded varsity jacket must match the original A geometry, size and position, hood/neckline, zip and cord details, two separate diagonal pocket trims, cuffs and waistband. Similar colours alone do not pass.

Rob's hat, glasses, moustache and brown/cream clothes, Soda's articulated white/blue body and the three Cockapoos were visually checked. Jessica remains black with only a tiny white chin, Sally black, and Daisy caramel-brown/white; all wear blue collars. Small collar-tag differences remain unresolved. Visual inspection is qualitative and does not claim pixel-identical preservation or user sign-off.

Michael's later 9:16 request superseded his earlier 16:9 request. The portrait output is 941 × 1672, approximately 9:16. The image editor did not return the requested exact 1152 × 2048 canvas. No exact-ratio, 4K, rig, motion or voice deliverable is claimed.

## Tests actually performed

The three implementation/guide files were fetched from published commit `88382666c1b82ca70c313972a34eee9780b63971`; all matched the local final files exactly. The following file-check tests used that fetched verifier and trusted manifest.

| Check | Result | Evidence or limitation |
| --- | --- | --- |
| Original archive integrity and image identity | PASS | ZIP CRC checks and all nine original image hashes, byte lengths, dimensions and decodes passed. |
| Current image file verification | PASS, 17/17 | Nine originals plus eight candidates match exact SHA-256 hashes and byte lengths. |
| Full image decoding and dimensions | PASS, 17/17 | All manifest paths are unique; full Pillow decoding and recorded dimensions passed. |
| Same-size altered candidate | PASS, defect detected | Disposable byte flip returned exit 1, `SHA-256 differs`, and 16/17. |
| Missing candidate | PASS, defect detected | Disposable deletion returned exit 1, `missing file`, and 16/17. |
| Duplicate manifest path | PASS, defect detected | Disposable trusted-manifest duplicate returned exit 2, `duplicate image paths`. |
| Comparison document references | PASS | Image/full-image targets, alt text and all eight scene anchors checked. |
| Checker syntax and repository whitespace | PASS | `node --check` and `git diff --check`. |
| Visual inspection | REVIEWED, 8/8 | Targeted outfit revisions inspected; final fine-detail and likeness acceptance remains open. |
| Rendered browser layout | NOT TESTED | Bundled Playwright Chromium executable unavailable. |
| Full application build, type-check and suite | NOT RUN | No application code or runtime configuration changed. |
| Real motion, audio, mouths, joins and app controls | NOT TESTED | This is a still-image/reference contribution. |
| Physical phone/tablet playback | NOT TESTED | No physical-device acceptance recorded. |

Reproduce the read-only file check after extracting the companion pack:

```bash
node scripts/verify-artwork-reference-pack.mjs /absolute/path/to/Sodafom-Character-Review-v2
```

The verifier uses the trusted manifest on this branch, not a replacement pack's manifest. Negative cases used disposable copies only. These results establish file identity and failure detection; they do not approve a character's likeness, outfit or movement.

## Remaining problems

1. Complete the detailed Archie outfit comparison and Michael likeness review across the eight candidates. Approval has not been recorded; retain the original masters as authorities.
2. Resolve collar-tag differences, cropped bodies/feet, Waltzers' airborne pose and intentional day/dusk/night transitions with the existing scene owners.
3. Produce exact-ratio portrait delivery and final-resolution masters after artwork acceptance. The current portrait is approximately 9:16 and the candidates are below 4K.
4. Existing owners integrate accepted assets. These changes do not alter in-app character rendering or deployed imagery.
5. Generate and inspect actual movement, foot contact, stopped boarding/exits, seated riding, cast order, established voices, mouth timing and scene joins. Correcting stills does not repair earlier videos.
6. Correct moving educational text, including the previously reported `7 × 4 = 28`, then test app routes, player controls and physical phones/tablets.

**No merge or deployment.** No force-push, main/master change, production-setting change or Sodafoam Systems 797 work.

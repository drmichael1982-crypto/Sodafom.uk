# Numbered Sodafom artwork coordination

Prepared for Michael Davis by Coordinator Codex on 16 September 2026.

The durable task desk is [GitHub issue #34](https://github.com/drmichael1982-crypto/Sodafom.uk/issues/34). The approved reference order remains [draft #33](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/33) at `cbe4a727b2edd561fcc29d024844ca920904e1dc`.

Michael can refer to a worker as **ART-01**, **ART-02**, and so on. These numbers identify this coordinator's artwork lanes. They do not renumber the existing agents or transfer their application files.

## Worker directory

| Number | Section | Review and next tasks | Existing implementation ownership |
| --- | --- | --- | --- |
| ART-01 | Characters and dog consistency | [Character report](ART-01-CHARACTERS.md) | Agent 5 content; #32 masters; PR #31 scene owner |
| ART-02 | Connected town, entrances and Sports Centre layout | [Town report](ART-02-TOWN.md) | Town #29 / PR #30 |
| ART-03 | Victorian shops and funfair | [Shop/fairground report](ART-03-FAIRGROUND.md) | PR #31; preserve SOD-13 street and SOD-04 preview |
| ART-04 | School/science, library/reading and museum | [Learning report](ART-04-LEARNING.md) | Agent 9 reader; Agent 12 scanners; existing living-library worker |
| ART-05 | Theatre, animation joins and voice | [Theatre report](ART-05-THEATRE.md) | Agent 7 / #21 / PR #28 |
| ART-06 | Rocket/space, birthday, settings and mobile checks | [Space/mobile report](ART-06-SPACE-MOBILE.md) | SOD-10 floating/planets; existing settings and screen-fit owners |

Six workers acknowledged and executed this first review/correction pass. Their reports record actual results and remaining work. Existing separate agent chats require their own acknowledgement of the new order; GitHub comments do not restart those sessions. A completed report is not completion of its artwork world.

## First-pass results

| Lane | Verified result | Next implementation task |
| --- | --- | --- |
| ART-01 | Nine reference assets verified; six stills compared. One private Shop Walk candidate improves Michael's face but changes head direction/resolution and is not accepted. | Refine Michael from the exact portrait; preserve pose, scenery and other cast; review all scene/rocket corrections before motion approval. |
| ART-02 | Eight Town route targets plus three downstream declarations exist. The Swimming entrance points to cue-sport pool. A source-based route map was rendered and inspected. | Correct the swimming destination; complete one real Town → Library → reader → Town loop with reliable query/return handling. |
| ART-03 | Shop continuation reopens its overlay; current fairground source's 8 × 4 = 32 is correct and separate from the old-film 7 × 4 error. | Repair the onward transition; verify actual ride controls, reduced motion and exits against the exact prototype source. |
| ART-04 | Twenty literal asset paths exist; ten books/100 pages and nine routes found. PR #24 reader/test blobs already match stable. Older learning artwork retains character/dog mismatches. | Correct the existing learning art, preserve the reserved living-library implementation and connect to the real reader/scanners. |
| ART-05 | Five committed theatre tests pass; two extra probes fail for Restart on scene 0 and speaking during manual Read. | Agent 7 repairs those behaviors plus pause/speech lifecycle, then implements the agreed finished-clip contract. |
| ART-06 | Repair planet rooms have eight labels but visible orbit guides and seven missing independent planet spins. Birthday candles and distinct windmill panels remain unfinished. | Preserve the existing planet implementation while completing the requested visuals, birthday/settings functions and mobile acceptance. |

No full app build, audible-film review or physical-phone acceptance is claimed by this coordination pass. Each report separates source inspection from exercised tests and historical evidence. The next owner work orders were posted to #20, #21, #29, #32, PRs #4, #5, #27, #28, #31 and #33. Current re-acknowledgement from separate historical sessions remains pending.

## Ownership decisions

1. Agent 7 is the sole existing shared theatre/player/movement writer for the scope acknowledged in #21 and PR #28. Episode owners retain their scripts and assets. Other worlds request the smallest reusable interface through #21.
2. Town #29/PR #30 owns connected entrance/return integration and Sports Centre navigation. The PR #31 standalone sports/library prototypes remain preserved while actual destinations use existing app contracts.
3. PR #31 owns its existing village/sweet-shop/fairground files and scene corrections. SOD-13's separate street and SOD-04's family preview remain separate owned work.
4. Agent 9 owns the reader and Agent 12 the actual scanners. The existing living-library worker has reserved `src/components/books/living-library/` and its declared tests/previews/docs. Avoid parallel writes to `ArchieStoryCollectionPage.tsx`.
5. Coordinator Codex owns the new files in this coordination directory. This pass does not edit existing application-owner files.
6. Numeric identities can collide: SOD-10 floating/planets is distinct from classroom/lessons Agent 10; cartoon science 29 is distinct from account Agent 29. Always include the branch and section when addressing legacy workers.

## Reference priority

The actual private artwork pack was retrieved and inspected in this session. Its reference filenames and hashes are evidence identifiers, not public media links. The source portrait/artwork bytes are not part of this commit.

Michael's latest approved portrait is the primary Michael reference. The group/rocket reference controls Archie, Rob, Soda and the three dogs. Keep Jessica jet-black with only a tiny white chin, Sally entirely jet-black, and Daisy brown/white. Preserve Michael's established voice. Use the existing approved settings and activities; change only the requested inconsistent details.

The ART-01 Shop Walk correction is a private candidate pending review. Corrected pictures, reviewed moving footage, working app integration and physical-phone acceptance are separate deliverables.

## Report and completion protocol

Owners acknowledge in their existing issue/PR and link #34:

`ACK — actual existing ID; ART lane; branch/head; exact owned files; next bounded task; dependencies.`

After a task, report the exact tested source commit, changed files, actual PASS / FAIL / NOT TESTED outcomes, screenshots or clips where applicable, and the next blocker. Only claim an agent is active after acknowledgement. A whole-world or app percentage requires an explicit denominator and evidence.

The coordinator checks new requests against this directory and the live GitHub heads before routing them. Shared files need one writer; completed edits go to an isolated draft PR for review.

## Review base and release boundary

- Branch: `codex/artwork-coordination-20260916`.
- Stable source base: PR #25, `442656b4e2ec76167b4d0b5fb7b804cf742904a5`.
- Current source heads inspected by each worker appear in its report.
- No merge, deployment, force-push, main/master edit or Sodafoam Systems 797 work.

This directory records artwork coordination and verified findings. Production build and physical-device acceptance are not certified by these documents.

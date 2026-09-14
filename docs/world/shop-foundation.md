# Victorian learning street: interactive 3D prototype

The frontend now includes a real procedural Three.js street and five enterable shop interiors at `/world/victorian`. `src/components/world/VictorianStreet.tsx` is the default route component; its scene, journey helpers, styling and tests live under `src/components/world/victorian/`.

This is an interactive prototype, not approved final art or a production/device certification. The existing registry remains the conservative record of pending matched artwork and disabled real purchasing; its original `registry-only`/`planned` metadata has not been changed into an approval claim.

## Implemented scene and visit

The street uses perspective WebGL rendering, solid geometry, lighting, fog, Victorian facades, gold trim, dark wood, deep-red shop fronts, windows, awnings, lamps and a paved street. The sweet shop has a double-fronted exterior, translucent glass jars with separate colourful contents, shelves and a central display. The other shops use the same room structure with distinct procedural fixtures.

| Shop | 3D fixtures | Existing practice activities |
| --- | --- | --- |
| Sweet shop | Clear-glass jars, central pick-and-mix display, wood counter | Coin Counter; Shopkeeper Change |
| Uniform and shoes | Uniform tops and shoe models on shelves/display | Pattern Maker; Money Maths |
| School supplies | Stacked books and stationery | Number Bonds; Shape Sorter |
| Cake and pie | Cake/pie-shaped displays and serving plates | Fraction Pizza; Ratio Recipe |
| Celebration and merchandise | Gift boxes and bows | Shopkeeper Change; Money Maths |

These are geometry-based scenes, not flat shop illustrations labelled as 3D. They remain simple starter models. The celebration room does not claim to provide approved character merchandise models.

Visitors can enter a shop by pointer/touch raycast or its visible link, look around by dragging or using camera buttons, move closer/back, reset the view, return to the street and return home. Each interior has a raycast exit and an equivalent visible return link. Loading/rendering is client-side; the Three.js renderer and geometry are disposed when the room changes or the component unmounts. WebGL creation failure or context loss offers a retry and retains usable shop links, learning links and surprise controls.

Motion has a pause control and follows the system reduced-motion preference. Display interactions reveal deterministic shuffled-bag surprises: a small display wobble, a wooden toy dog, a polite joke or a golden star. Each bag is exhausted before refill and consecutive bags avoid an immediate repeat. There is no audio autoplay, purchase, permission request or external navigation in these effects. The toy dog is a generic procedural toy, not a replacement or approved likeness of Jessica, Sally or Daisy.

## Learning and return contract

The existing frozen registry is still the only allowlist for shop/activity pairs. The frontend's journey helper additionally filters activity suggestions using an explicit age range; Ratio Recipe is available for ages 10–13 and Fraction Pizza for ages 8–13. Age filtering is a suggestion/navigation feature, not a claim that every underlying game's difficulty is configured by this UI. Games may retain their own challenge controls.

Outgoing game links use the existing game route and an encoded `returnTo` value with the exact shape `/world/victorian?shop=REGISTERED_SHOP_ID`. The selected age is a separate game query parameter, not part of the return target and not a security or difficulty override. Shared game-shell return handling is integrated separately by Coordinator Codex/SOD-06.

These remain existing maths games. Fraction Pizza still uses pizza; Ratio Recipe has not been reskinned into a shop-specific cake lesson. A completed, newly themed ten-question lesson for each shop is not claimed by this world prototype.

## Artwork and commerce boundaries

Approved Archie, founder/family and dog artwork is preserved. `public/assets/approved/shop.png` remains the existing blue voucher/merchandise illustration. It has not been repurposed, overwritten, removed or treated as a matched Victorian exterior/interior pair. All registry artwork pairs remain `null` with explicit pending approval status. No model/asset URLs or design approvals are invented.

The registry continues to reject every purchase/checkout target. The new world has no real purchase buttons, affiliate links, checkout, payment requests or parent-verification claims. Pretend-money practice does not enable commerce. This work changes no server, database, authentication, payment or hosting configuration.

The existing `/shop/back-to-school` and other payment routes are separate existing features; this world does not link to them or claim to protect them. Any future real purchasing needs separate authorized implementation and server-side adult verification.

## Checks actually performed for this prototype

- `corepack pnpm exec vitest run src/components/world/victorian`: **10 tests passed across 3 files**. Checks cover exact shop/activity lookup, hostile/invalid input, age boundaries, return URLs, reproducible non-repeating surprise bags, React navigation and activity filtering under simulated WebGL failure, system reduced motion, actual scene geometry, and raycasting the sweet-shop door/display and the exits in all five interiors.
- Scene tests construct real Three.js geometry and run real Three.js raycasting. They mock canvas text drawing and do not render GPU pixels.
- React tests simulate unavailable WebGL and exercise visible controls; they do not establish touchscreen or screen-reader compatibility on physical devices.
- `corepack pnpm exec vite build`: client build passed before final coordinator route integration, with an existing large-main-chunk warning. Final integrated client/server build belongs to the coordinator's verification.
- `corepack pnpm exec tsc --noEmit`: no reported errors in the Victorian files; at the worker's last run, the shared check was blocked by `src/lib/__tests__/learning-photo.test.ts:12` (`TS2348`), reported to the owner. The coordinator is handling that unrelated test declaration.
- `git diff --check` for the touched implementation/dependency files passed.
- Browser inspection was attempted but blocked by the browser runtime reporting that all 20 sessions were active. **No browser screenshot, actual GPU rendering, phone/tablet/desktop performance, keyboard traversal, touch accuracy, visual approval or full game-round completion is claimed.**

Three.js `0.186.0` and `@types/three` `0.186.0` were added using the project's Corepack/pnpm workflow; no unrelated dependency upgrades were requested by this worker. Existing concurrent build-worker package/lock changes were preserved.

The original registry checks remain available with `node --test scripts/test-shop-registry.cjs`; this worker did not rerun them because the registry was unchanged.

## Remaining work

1. Complete coordinator route/game-return integration and run the final integrated checks.
2. Inspect the actual rendered street and all interiors in a browser; tune composition, readable shop signs, mobile framing, raycast targets and performance from that evidence.
3. Verify keyboard, touch, reduced-motion, context-loss recovery and game-to-shop return in complete browser journeys and on representative devices.
4. Obtain approval for matched exterior/interior art and any future founder/family/dog/Archie character models.
5. Build and validate genuinely shop-specific learning activities if required; do not relabel existing pizza/recipe games as new cake-shop lessons.
6. Treat publishing, hosting and any future real purchasing as separate authorized work. This worker made no commit, push, merge or deployment.

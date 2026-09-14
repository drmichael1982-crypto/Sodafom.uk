# Victorian learning street: registry foundation

This is a small code foundation for the children's Sodafom app. It is **not a finished 3D scene**, a new interface, a working shop or a live deployment. No existing page, route, artwork or game is changed by this slice.

## Implemented

`src/lib/world/shop-registry.ts` defines five planned shops with stable IDs, one shared Victorian street style (deep red, dark wood and gold), pending matched exterior/interior artwork, and existing maths game targets. The sweet shop records a double-fronted exterior, clear-glass pick-and-mix jars and a central jar display.

| Planned shop | Existing practice activities | Scene and matched artwork |
| --- | --- | --- |
| Sweet shop | Coin Counter; Shopkeeper Change | Pending |
| Uniform and shoes | Pattern Maker; Money Maths | Pending |
| School supplies | Number Bonds; Shape Sorter | Pending |
| Cake and pie | Fraction Pizza; Ratio Recipe | Pending |
| Celebration and merchandise | Shopkeeper Change; Money Maths | Pending |

These are links to existing games, not newly created shop-specific lessons. The existing Fraction Pizza activity remains a pizza game; it has not been reskinned as a cake or pie. Activity age suitability and device behaviour need checking before a future shop UI exposes them; for example, Ratio Recipe currently declares ages 10–13 and should not be shown indiscriminately to five-year-olds.

## Artwork and design boundaries

The approved Archie, founder/family and dog artwork is preserved. The inspected `public/assets/approved/shop.png` is a blue Sodafom voucher/merchandise interior, not an approved matching Victorian red/gold exterior/interior pair. It has not been repurposed, replaced or deleted. All five registry artwork pairs therefore remain `null` with an explicit pending status. No image URLs, 3D model URLs or placeholder promises are invented.

The consistent street scene, matching shop exteriors/interiors, cameras, walking/door transitions, object interactions and shop-specific maths activities still need implementation and visual approval. Existing routes are not wired to this registry yet.

## Safe target contract

```ts
import { resolveShopTarget } from '@/lib/world/shop-registry';

resolveShopTarget('sweet-shop', 'learning', 'count-coins');
// { kind: 'learning', route: '/games/coin-counter' }

resolveShopTarget('sweet-shop', 'purchase');
// null — real purchases are unavailable in this foundation.
```

Only a registered shop/activity pair resolves to a local game route. Unknown IDs, arbitrary URLs, checkout actions and client-supplied parent/admin claims cannot create a purchase target. Definitions are frozen at runtime as well as readonly in TypeScript.

Real purchases are parent/guardian-only requirements for later implementation, **not a security feature completed here**. No checkout, affiliate link, payment call or live purchase is enabled by this registry, including for adults. A later purchase implementation must verify the adult and authorization on the server; a browser role, switch or registry flag is not sufficient.

This restriction applies to the new registry only. The existing `/shop/back-to-school` page contains external affiliate shopping links, and the existing app has other payment routes. This slice neither routes children to those destinations nor claims to protect or repair them.

## Verification and remaining work

Run `node --test scripts/test-shop-registry.cjs` with Node 24 or later. The script uses Node's built-in TypeScript type stripping and built-in test/assert modules. It needs no third-party dependencies and installs nothing.

Recorded result for this slice: **11 tests passed, 0 failed** on Node v24.19.0. `node --check scripts/test-shop-registry.cjs` also passed. No full-app build or browser/device test was run for this slice.

The checks cover isolated module syntax/runtime loading, unique shop/activity IDs, exact target lookups, actual route declarations and imported page-file existence, pending artwork, disabled real purchases, hostile/unknown input and runtime immutability. They do not perform a full TypeScript type check, render a page, execute game rounds, verify a database, certify child safety across the existing app, or test Railway. Route checks recognise the repository's current static `path`/`element` declarations and must be updated if that format changes.

Before this becomes a visible feature:

1. Approve matching exterior/interior designs and the street layout while preserving the established characters.
2. Build the 3D world with accessible keyboard/touch alternatives, read-aloud and reduced-motion support.
3. Connect shop doors and activity hotspots through the registry; keep learning and adult shopping separate.
4. Validate age/difficulty selection, ten-question lesson flow, answers, scoring and continuation for the selected activities.
5. Implement and test any adult-only purchasing separately, with server authorization, before enabling it.
6. Perform browser/device, performance, visual and end-to-end checks; then request deployment approval.

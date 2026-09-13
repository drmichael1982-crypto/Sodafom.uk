# Agent24 — Performance and Speed

Date: 13 September 2026. Repository: `drmichael1982-crypto/Sodafom.uk`.
Branch: `agent24/performance-speed-20260913`.
Base: `master` at `058097f78077015980460c0b359903fda5aa83a6`.
Status: performance-only implementation with isolated tests; full-app validation still required. No deployment or merge.

## Changes

- Deferred 141 activity route entries, covering 130 game modules, the shared learning-arena module, the lesson library and reading page. The router no longer eagerly imports these 133 unique modules. Home, routes, aliases, redirects and page implementations are preserved. Shared imports elsewhere can still affect final bundle sizes; no production-byte reduction is claimed.
- Used React Router route-level lazy loading so the existing static handler can resolve the matched page before server rendering. Reused the existing spinner for initial deep-link loading. No authentication, payment or data-loading policies changed.
- Added a pooled, event-driven visibility observer and React hook. The shared Archie/Soda/Bella/Rocky component stops its two infinite Motion loops and speaking-mouth timer off-screen, in a hidden tab, on pagehide and at unmount; it resumes when visible. Speech and lesson/game clocks are untouched.
- Shared one observer and lifecycle listeners per document. Last-unsubscribe cleanup releases observations/listeners; no scroll polling, global timer overrides, network requests or new runtime dependencies.
- Added native lazy loading, asynchronous decoding and explicit dimensions to shared character images, with an optional eager-loading override. Image files, asset paths, alternative text and visible animation timing are unchanged. No artwork was resized, deleted, redesigned or recompressed.

## Checks actually run

| Check | Result |
| --- | --- |
| Isolated Node units, source assertions, TS/TSX syntax and mocked route contracts | 17 passed |
| All lazy route module/export mappings and original paths/order/redirects | Passed against immutable master fixtures |
| Visibility utility strict TypeScript check | Passed |
| Chromium 144.0.7559.96 desktop fixture, 1365 × 900 | 4 passed |
| Chromium mobile emulation fixture, 390 × 844, touch, 3× pixel ratio, 4× CPU throttling | 4 passed |
| Browser fixture scrolling and off-screen timer/native-animation pause/resume | Passed |
| Simulated hidden-tab and pagehide/pageshow lifecycle | Passed |
| Cleanup including 100 unit-test mount/unmount cycles | Passed |
| Native lazy-image request timing and cache reuse | Not run; HTTP fixture navigation was blocked |

Browser checks executed local HTML in memory without URL navigation, API calls or changes to browser policies. They use the real visibility helper, IntersectionObserver and native Web Animations, NOT the production React/Motion component. Hidden-tab/lifecycle signals were simulated. The eight browser passes are not eight full-app page tests.

Full application dependency installation/build, full-project type checking, SSR integration, React/Motion runtime integration, real phones, Android WebView, iOS Safari, production network waterfalls, heap profiling, LCP/INP/CLS and image-quality comparisons were not completed. Shell network access/dependencies were unavailable; local Node was 22.16.0, below the repository's >=22.22.0 requirement. Browser localhost navigation returned `ERR_BLOCKED_BY_ADMINISTRATOR`; no policy was bypassed. These changes must not be represented as production-approved or a measured speedup.

## Audit notes and remaining work

The approved artwork directory was inspected via Git tree metadata. Its ten images range from 300,064 to 786,446 bytes; examples include `home-fire-v2.png` (786,446), `home-fire-v3.jpg` (493,683) and `game-islands.png` (481,508). This is a file-size sample, not a claim that every file loads on the homepage. Responsive/modern-format derivatives need visual comparisons before adoption; originals remain intact.

The existing QueryClient already has a five-minute stale window, ten-minute collection window and focus refetch disabled. Those settings and private/account data caching were left unchanged. Deferred router imports reduce unnecessary activity-code demand by construction; the actual production waterfall still needs measurement.

Off-screen suspension is integrated into the shared character component only. Other page-specific CSS, canvas, video or game animations still need their owners' profiling. Old WebViews without IntersectionObserver retain animations while the tab is visible but still stop background-tab work. No features were removed to meet a performance target.

## Reproduce

Use a checkout with the repository's supported Node version and installed dependencies. Run from the repository root:

```sh
node scripts/test-performance.mjs
npx --no-install tsc src/lib/performance/animation-visibility.ts --noEmit --strict --target ES2022 --module ES2022 --lib ES2022,DOM
python scripts/test-performance-browser.py --in-memory
```

The browser script additionally requires Python Playwright and a Chromium executable. Supply `--chromium /path/to/chromium` as needed. Without `--in-memory`, it serves the local fixture and also checks native image request timing, where local HTTP navigation is permitted. Generated outputs are ignored under `tests/performance/out/`.

Before any later integration, run the complete build and test suite, open fresh deep links to representative lazy game/reading/lesson pages, verify BrowserRouter and Capacitor HashRouter, check SSR output, then compare production bundle sizes/network waterfalls and actual character animation on desktop and mobile. Other agents' changes to shared `src/routes.tsx`, `src/App.tsx` or `ArchieCharacter.tsx` must be reconciled during a separately approved integration; no other branches were merged here.

## Technical references

React Router route objects: https://reactrouter.com/start/data/route-object
React Router Route API: https://reactrouter.com/api/components/Route
IntersectionObserver: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
Page Visibility: https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
Image loading: https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/loading

The text fixtures are exact source blobs from the base commit (routes: `4cb6d2671166e71bd73edc3f3a0e0169d16ec71d`; character: `1fe4ecafe2f9e4cfeb0155bcb186aacfeedc3f57`). They are test inputs, not alternate production implementations.

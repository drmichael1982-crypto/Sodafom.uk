# Agent25 — device compatibility report

Date: 13 September 2026
Repository: `drmichael1982-crypto/Sodafom.uk`
Branch: `agent25/device-compatibility-20260913`
Base: `master` at `058097f78077015980460c0b359903fda5aa83a6`

## Status

Layout-only patch, ready for integration review. **Not a full-app compatibility sign-off.** No merge, deployment, pull request or production changes were made. The branch contains six small existing-file edits plus one stylesheet, two isolated test files and this report.

GitHub connector access worked. Direct cloning from the execution environment failed. The six original source files were read using the connector and verified against their Git blob hashes. The full application and its production CSS/assets could not be built or run here. The environment's Node version was 22.16.0; the repository specifies at least 22.22.0. No dependency or package configuration was changed.

## Changes

- Shared dialogs have available-screen width/height limits, dynamic viewport height with a traditional viewport fallback, safe-area margins, wrapping and vertical scrolling. Long content no longer needs to extend beyond the screen in the fixtures.
- Side, top and bottom sheets scroll within the available height. Existing width caps remain intact. Close targets are 48 by 48 CSS pixels, with reserved heading space and safe-area offsets.
- Standard shared buttons can wrap long labels and grow vertically. Caller-defined custom heights are not reset. Touch-mode standard buttons, tabs and website navigation have minimum 48-pixel targets, including desktop navigation on wide touch tablets.
- Tab rows wrap; grid tab labels fit within their cells. Overlay footer actions wrap and retain spacing.
- The existing website header uses the existing hamburger/navigation below 1280 pixels or on short screens. Desktop links wrap rather than overflow. Mobile menu scrolling uses the actual remaining height, including when text is enlarged. Account actions wrap rather than collide.
- Logo geometry shrinks within available space; no image, character, theme, colour or artwork file was replaced. Short-screen website headers do not remain sticky over the content.

Existing-file changes only add CSS class hooks in Button, Dialog, Sheet, Tabs and RootLayout, plus one stylesheet import in main.tsx. Removing these additions restores all six source files byte-for-byte. No event handlers, routes, access rules, payments, AI, lessons, games, books or other feature logic changed. Header source is untouched; its layout rules are scoped under RootLayout's new shell class. Other agents' branches were not modified.

## What was actually tested

**Chromium 144.0.7559.96 on Linux**, driven by Python Playwright. These are offline, static layout fixtures, not live application routes or physical devices. The test reads class strings from the changed TSX but does not mount React or Radix. `baseline.css` is a hand-maintained subset of the relevant Tailwind 3.4 layout utilities, NOT the compiled production stylesheet. Header markup is a static replica of the inspected nesting. Its gray SVG is synthetic logo geometry, not actual artwork. All network requests are blocked.

The final reproducible run passed **678 of 678 cases** with zero failures. Omitting the fix stylesheet in the same final harness produced 89 passes and 589 failures. These are repeated scenario/screen combinations, not 589 separate bugs. Earlier exploratory harness totals are superseded by this final run.

The nine scenarios are a long dialog, four long sheet directions, wrapping flex tabs, three-column grid tabs, standard/custom-height buttons, and an expanded website header/menu. The final harness also checks wide-tablet touch targets, which caught and corrected a CSS-specificity issue during review.

Assertions cover document/content horizontal overflow; overlay bounds; close-button size and initial visibility; heading/close overlap; safe margins; preserved sheet width caps; scroll-to-action reachability and hit testing; clipped labels; tab/account overlaps; preserved custom button height; navigation visibility, logo overlap and final mobile-menu action reachability.

Every configuration below ran each scenario with 16-pixel and 32-pixel root font sizes. This approximates normal/doubled text; it is NOT actual browser zoom. There are 666 standard cases and 12 additional synthetic safe-area cases (24 top, 20 right, 34 bottom, 44 left) at 393×851 and 851×393.

| Configuration family | CSS-pixel viewport sizes | Orientation / result |
| --- | --- | --- |
| Phone-sized touch viewports | 320×568, 360×640, 375×667, 390×844, 393×851, 412×915, 430×932 | Each size and its reversed landscape dimensions; all fixture cases passed |
| Tablet/iPad-sized touch viewports | 600×960, 768×1024, 800×1280, 820×1180, 834×1194, 1024×1366 | Each size and its reversed landscape dimensions; all fixture cases passed |
| Laptop/desktop, non-touch | 1024×768, 1279×800, 1280×800, 1280×720, 1366×768, 1440×900, 1536×864, 1920×1080, 2560×1440, 320×800 | All fixture cases passed; the narrow case checks reflow |
| Short touch viewport | 667×280 | Passed; keyboard-sized approximation, not a real on-screen keyboard test |

37 configurations total, plus synthetic inset variations. Touch simulation used device scale factor 2; non-touch used 1. Device size labels do not certify Android, iOS or any named hardware model.

Additional checks passed: six TSX syntax/transpile checks (TypeScript 5.8.3), two CSS parse checks (PostCSS), six original source blob verifications and six byte-for-byte restoration checks. Transpilation is NOT a complete type-check, build or lint run.

## Still required before approval to merge

1. Install the repository's declared dependencies with a supported Node version; run the real type-check, build, lint and existing test suites.
2. Render actual routes with the full CSS, real fonts, artwork and animations. Review lessons, games, reading/books, scanner, parent/teacher/account screens, custom dialogs and all floating elements. Page-specific or inline sizing rules were not comprehensively tested.
3. Test physical Android Chrome/WebView, iPhone/iPad Safari and desktop Chrome, Edge, Firefox and Safari. Check genuine rotation, browser chrome, pinch zoom, keyboards, notches, safe areas and installed Capacitor apps. None of those real-device/native-browser checks was completed here.
4. Check Radix focus traps, tab-arrow navigation, animated open/close states, nested popovers and touch/keyboard interactions in the actual app. Static fixtures cannot validate those behaviours.
5. Re-run after the other agents' branches are integrated. Shared UI/style callers may need adjustments. No merge or deployment is authorised by this report.

## Reproduce the isolated checks

Requires Python 3.10+, the Playwright Python package, and an installed Chromium executable. No npm dependencies or live server are needed for these fixtures.

```sh
python tests/device-compatibility/run.py --browser /usr/bin/chromium --output /tmp/agent25-after
python tests/device-compatibility/run.py --browser /usr/bin/chromium --before --output /tmp/agent25-before
```

The baseline command deliberately returns a nonzero exit code for reproduced failures. The runner writes `results.json` plus selected screenshots. Screenshots depict fixtures, not redesigned Sodafom pages. Use `--quick` for five configurations / 90 cases.

# SOD-04 family-square handoff

For Michael and Coordinator Codex. Section [SOD-FIN-04 / #21](https://github.com/drmichael1982-crypto/Sodafom.uk/issues/21).

Open `Sodafom-Moving-Family-Square.html` locally, or serve this directory on localhost. This preserves the previously delivered HTML byte for byte. It is a separate family concept preview, not a route in the children’s app. GitHub displays source; this PR creates no hosted preview.

The Canvas 2D scene contains three displays (planets, carousel, circular upright balloons), illustrated walking characters, tap dialogue, optional browser speech, round controls, pause and lamp/shop-light toggles. It uses image sprites and procedural drawing, not full 3D skeletal animation or lip-sync. The portrait/landscape layout is intended to adapt to the viewport; physical-device fit and voice availability require testing.

All six artwork images are embedded. The original export also references three optional unpkg helper/icon scripts. No account, child-progress or app-service connection is added. Speech is device/browser-dependent and is not a confirmed character voice. Existing app character files are untouched.

The separately delivered **Sodafom-Family-Picture-Book.pdf** contains 227 pages including 205 earlier project pictures and new concepts/screenshots. Michael already has that file; its pictures are not animated by the PDF. The approximately 80 MB family archive is not duplicated in this source repository.

## Checks

```sh
node docs/prototypes/sod-04-family-square/verify-preview.cjs
node docs/prototypes/sod-04-family-square/browser-check.cjs
```

The first command compiles inline JavaScript and validates embedded WebP containers; it does not render the scene. The second needs Playwright and an installed Chromium; `CHROMIUM_EXECUTABLE_PATH` may select an existing executable. It loads only the local preview, blocks external requests and checks simulated viewports and controls. A missing browser is a blocked check, never a pass. Results go to stdout and an optional screenshot goes to `SOD04_SCREENSHOT_PATH`.

See [branch inventory](BRANCH-INVENTORY.md) and [SOD-04 report](../../../agent-reports/AGENT-SOD-04-REPORT.md) for source ownership and acceptance gaps. No merge or deploy.


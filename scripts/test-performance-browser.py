"""Run after node scripts/test-performance.mjs.
Requires Python Playwright and Chromium. This tests the shared visibility utility
and browser image loading in a fixture, NOT the complete React/Motion app.
No external requests, credentials, production services or paid APIs are used.
"""
from __future__ import annotations
import argparse
import functools
import json
import shutil
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'tests/performance/out'

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--chromium', default=shutil.which('chromium'))
    parser.add_argument('--in-memory', action='store_true', help='Test local DOM only; no navigation or image network checks')
    args = parser.parse_args()
    if not (OUT / 'animation-visibility.mjs').exists():
        raise SystemExit('Run node scripts/test-performance.mjs first.')
    server = None
    worker = None
    if not args.in_memory:
        server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(ROOT)))
        worker = threading.Thread(target=server.serve_forever, daemon=True)
        worker.start()
    results = []
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, executable_path=args.chromium)
            for name, width, height, mobile in [('desktop',1365,900,False), ('mobile-emulation',390,844,True)]:
                context = browser.new_context(viewport={'width':width,'height':height}, is_mobile=mobile,
                                              has_touch=mobile, device_scale_factor=3 if mobile else 1)
                page = context.new_page()
                errors, image_requests, external_requests = [], [], []
                page.on('pageerror', lambda error: errors.append(str(error)))
                def allow_local(route):
                    if args.in_memory or urlparse(route.request.url).hostname != '127.0.0.1':
                        external_requests.append(route.request.url)
                        route.abort()
                    else:
                        route.continue_()
                page.route('**/*', allow_local)
                page.on('request', lambda request: image_requests.append(request.url) if 'image-fixture.svg' in request.url else None)
                if mobile:
                    context.new_cdp_session(page).send('Emulation.setCPUThrottlingRate', {'rate':4})
                if args.in_memory:
                    # Execute a local fixture without navigating to any URL or
                    # relaxing browser policies. Image networking is NOT tested.
                    helper = (OUT / 'animation-visibility.mjs').read_text().replace('export function', 'function')
                    html = (ROOT / 'tests/performance/visibility.html').read_text()
                    html = html.replace('src="image-fixture.svg"', '')
                    html = html.replace('<script type="module">', '<script>')
                    html = html.replace("import { observeAnimationVisibility } from './out/animation-visibility.mjs';", helper)
                    page.set_content(html)
                else:
                    page.goto(f'http://127.0.0.1:{server.server_port}/tests/performance/visibility.html')
                page.wait_for_function('window.fixture && fixture.snapshot().targets.top.active')
                page.wait_for_function('fixture.snapshot().targets.top.ticks >= 2')
                snapshot = page.evaluate('fixture.snapshot()')
                assert snapshot['counters']['created'] == 1
                assert snapshot['targets']['bottom']['ticks'] == 0
                assert snapshot['targets']['bottom']['playState'] == 'paused'
                if not args.in_memory:
                    assert not image_requests, 'Far-below-fold lazy image loaded early'
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
                results.append({'profile':name,'check':'one shared observer; off-screen timer/animation paused; viewport layout fits','status':'PASS'})

                page.locator('#bottom').scroll_into_view_if_needed()
                page.wait_for_function('fixture.snapshot().targets.bottom.active && !fixture.snapshot().targets.top.active')
                ticks = page.evaluate('fixture.snapshot().targets.top.ticks')
                page.wait_for_timeout(360)
                assert page.evaluate('fixture.snapshot().targets.top.ticks') == ticks
                assert page.evaluate('fixture.snapshot().targets.top.playState') == 'paused'
                results.append({'profile':name,'check':'scroll stops off-screen work and resumes newly visible target','status':'PASS'})

                page.evaluate('fixture.setHidden(true)')
                ticks = page.evaluate('fixture.snapshot().targets.bottom.ticks')
                page.wait_for_timeout(360)
                assert page.evaluate('fixture.snapshot().targets.bottom.ticks') == ticks
                page.evaluate('fixture.setHidden(false)')
                page.wait_for_function('fixture.snapshot().targets.bottom.active')
                page.evaluate('fixture.lifecycle("pagehide")')
                assert not page.evaluate('fixture.snapshot().targets.bottom.active')
                page.evaluate('fixture.lifecycle("pageshow")')
                assert page.evaluate('fixture.snapshot().targets.bottom.active')
                results.append({'profile':name,'check':'simulated hidden-tab and page lifecycle pause/resume','status':'PASS'})

                if args.in_memory:
                    assert page.locator('#lazyImage').bounding_box()['width'] == 140
                    results.append({'profile':name,'check':'native lazy-image request timing and cache reuse','status':'NOT RUN: in-memory fixture has no image source/network'})
                else:
                    page.locator('#lazyImage').scroll_into_view_if_needed()
                    page.wait_for_function('document.querySelector("#lazyImage").complete && document.querySelector("#lazyImage").naturalWidth > 0')
                    assert len(image_requests) == 1
                    assert page.locator('#lazyImage').bounding_box()['width'] == 140
                    page.locator('#top').scroll_into_view_if_needed()
                    page.locator('#lazyImage').scroll_into_view_if_needed()
                    assert len(image_requests) == 1
                    results.append({'profile':name,'check':'lazy image loads once when approached; dimensions reserved','status':'PASS'})

                page.evaluate('fixture.disposeAll()')
                snapshot = page.evaluate('fixture.snapshot()')
                assert snapshot['counters']['unobserved'] == 2
                assert snapshot['counters']['disconnected'] == 1
                assert all(t['disposed'] and t['playState'] == 'idle' for t in snapshot['targets'].values())
                assert not errors, errors
                assert not external_requests, external_requests
                results.append({'profile':name,'check':'unmount cleanup releases observer and animation work; no JS errors/external requests','status':'PASS'})
                context.close()
            report = {'scope':f'Isolated helper fixture ({"in-memory; no navigation/network" if args.in_memory else "localhost HTTP"}); Chromium desktop and touch-mobile emulation (4x CPU throttling), not physical hardware or full app', 'browser':browser.version, 'results':results}
            (OUT / 'browser-results.json').write_text(json.dumps(report, indent=2)+'\n')
            print(json.dumps(report, indent=2))
            browser.close()
    finally:
        if server:
            server.shutdown(); server.server_close()
        if worker:
            worker.join(timeout=5)

if __name__ == '__main__':
    main()

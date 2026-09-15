"""Real Chromium/localStorage/fetch tests; server DB and authentication are synthetic.
Requires Node 22+ and Python Playwright with Chromium available.
Run: python scripts/agent28-browser-check.py
"""
from pathlib import Path
import json
import os
import shutil
import subprocess
import sys
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
results = []
def passed(name):
    results.append(name)
    print(f"PASS {len(results)}: {name}", flush=True)

def main():
    process = subprocess.Popen(
        ['node', '--experimental-vm-modules', 'scripts/agent28-browser-fixture.mjs'],
        cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
    )
    try:
        line = process.stdout.readline().strip()
        if not line.startswith('AGENT28_FIXTURE_PORT='):
            raise RuntimeError(f'Fixture did not start: {line}')
        origin = 'http://127.0.0.1:' + line.split('=', 1)[1]
        with sync_playwright() as p:
            executable = os.environ.get('CHROMIUM_PATH') or shutil.which('chromium') or shutil.which('chromium-browser')
            launch = {'headless': True}
            if hasattr(os, 'geteuid') and os.geteuid() == 0:
                launch['args'] = ['--no-sandbox']  # Root-only isolated test container.
            if executable:
                launch['executable_path'] = executable
            browser = p.chromium.launch(**launch)
            print(f'Browser: Chromium {browser.version}', flush=True)
            errors = []
            def context(parent):
                item = browser.new_context()
                item.add_cookies([{'name': 'agent28_fixture_parent', 'value': parent, 'url': origin}])
                page = item.new_page()
                page.on('pageerror', lambda error: errors.append(str(error)))
                page.goto(origin)
                page.wait_for_function('window.fixtureReady === true')
                return item, page
            a, page = context('parent-a')
            assert page.evaluate("window.make('parent-a',1)")['level'] == 1
            assert page.evaluate('window.client.record(3)') == 2
            saved = page.evaluate('window.client.snapshot()')
            assert saved['syncStatus'] == 'synced' and saved['bestStars'] == 3
            assert page.evaluate('JSON.parse(localStorage.getItem(window.client.cacheKey)).pending') is False
            passed('Confirmed result is saved through the existing handler and cached in real localStorage')

            page.reload(); page.wait_for_function('window.fixtureReady === true')
            assert page.evaluate("window.make('parent-a',1)")['level'] == 2
            passed('Refreshing the browser restores the confirmed game result')

            b, second = context('parent-a')
            assert second.evaluate('localStorage.length') == 0
            restored = second.evaluate("window.make('parent-a',1)")
            assert restored['level'] == 2 and restored['bestStars'] == 3
            passed('A clean second browser profile restores confirmed progress from the simulated server')

            other, different = context('parent-b')
            assert different.evaluate("window.make('parent-b',2)")['level'] == 1
            different.evaluate('window.client.record(1)')
            assert different.evaluate('window.client.snapshot().bestStars') == 1
            assert page.evaluate('window.client.snapshot().bestStars') == 3
            passed('Different parent and child records remain separate')

            page.request.get(origin + '/test/fail?value=1')
            assert page.evaluate('window.client.record(3)') == 3
            assert page.evaluate('window.client.snapshot().syncStatus') == 'pending'
            passed('A failed online save keeps a pending result locally instead of claiming cloud success')

            page.reload(); page.wait_for_function('window.fixtureReady === true')
            pending = page.evaluate("window.make('parent-a',1)")
            assert pending['level'] == 3 and pending['syncStatus'] == 'pending'
            passed('Pending progress survives a real browser refresh during an API outage')

            page.request.get(origin + '/test/fail?value=0')
            pending = page.evaluate('window.client.load()')
            assert pending['level'] == 3 and pending['syncStatus'] == 'pending'
            server_state = page.request.get(origin + '/test/state').json()
            assert next(row for row in server_state['gameLevels'] if row['childId'] == 1)['level'] == 2
            passed('Reconnection keeps the pending local result without replaying or duplicating it')

            second.reload(); second.wait_for_function('window.fixtureReady === true')
            remote = second.evaluate("window.make('parent-a',1)")
            assert remote['level'] == 2
            passed('Unconfirmed offline progress is not falsely represented as synced to another device')

            denied = different.evaluate("window.make('parent-b',1)")
            assert denied['level'] == 1 and denied['syncStatus'] == 'unavailable'
            passed('Another parent cannot restore this child’s result through the API')

            guest = browser.new_context(); gp = guest.new_page()
            gp.on('pageerror', lambda error: errors.append(str(error)))
            gp.goto(origin); gp.wait_for_function('window.fixtureReady === true')
            gp.evaluate("localStorage.setItem('sodafom_level_number-pop','{broken')")
            assert gp.evaluate('window.make(null,null)')['level'] == 1
            gp.evaluate('window.client.record(2)')
            gp.reload(); gp.wait_for_function('window.fixtureReady === true')
            guest_result = gp.evaluate('window.make(null,null)')
            assert guest_result['level'] == 2 and guest_result['syncStatus'] == 'local-only'
            passed('Corrupt guest data does not crash; a new guest result survives refresh')

            a.set_offline(True)
            page.evaluate('window.client.record(1)')
            assert page.evaluate('window.client.snapshot().syncStatus') == 'pending'
            a.set_offline(False)
            passed('A real browser network-disconnect retains the new result locally')

            assert not errors, errors
            passed('No uncaught browser JavaScript errors occurred in the fixture scenarios')
            browser.close()
        print(json.dumps({'passed': len(results), 'failed': 0, 'scope': 'Real Chromium; production persistence module; synthetic auth/DB'}, indent=2))
    finally:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill(); process.wait(timeout=5)

if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(f'FAIL after {len(results)} checks: {error}', file=sys.stderr)
        raise

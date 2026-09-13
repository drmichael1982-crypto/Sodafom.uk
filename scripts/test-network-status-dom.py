#!/usr/bin/env python3
"""Real Chromium DOM, simulated connection/worker events. No network navigation.
This does NOT test service-worker transport, real device storage, or the full app.
Requires Python playwright, a Chromium executable, and TypeScript.
"""
from __future__ import annotations
import argparse
import json
import shutil
import subprocess
import tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, default=Path('/tmp/agent34-dom.json'))
    args = parser.parse_args()
    results = []
    errors = []
    with tempfile.TemporaryDirectory(prefix='agent34-dom-') as tmp:
        tsc = ROOT / 'node_modules/.bin/tsc'
        compiler = str(tsc) if tsc.exists() else shutil.which('tsc')
        if not compiler:
            raise RuntimeError('TypeScript compiler is required')
        subprocess.run([compiler, '--strict', '--target', 'ES2022', '--module', 'ES2022', '--lib', 'ES2022,DOM', '--outDir', tmp, str(ROOT / 'src/lib/network-status.ts'), str(ROOT / 'src/lib/network-query-policy.ts')], check=True, capture_output=True, text=True)
        source = (Path(tmp) / 'network-status.js').read_text().replace('export ', '')
        policy = (Path(tmp) / 'network-query-policy.js').read_text().replace('export ', '')
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'), headless=True, args=['--no-sandbox'])
            page = browser.new_page(viewport={'width': 1280, 'height': 800})
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.clock.install()
            page.set_content('<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font:18px/1.5 system-ui}#app{padding:16px}input,button{font:inherit;min-height:44px;max-width:100%;box-sizing:border-box}input{display:block;width:100%}</style><div id="app"><h1>Agent34 connection fixture</h1><label for="answer">Your answer</label><input id="answer"><button id="step">Complete a step</button><p>Steps: <span id="score">0</span></p></div></html>')
            page.evaluate('''({source, policy}) => {
                const fixtureWindow = new EventTarget();
                fixtureWindow.isSecureContext = true;
                fixtureWindow.location = {protocol: 'https:'};
                const worker = new EventTarget();
                const fixtureNavigator = {onLine: true, serviceWorker: worker};
                const calls = [];
                worker.register = (...args) => { calls.push(args); return Promise.resolve({}); };
                window.fixture = {window: fixtureWindow, navigator: fixtureNavigator, worker, calls};
                window.api = new Function('window', 'document', 'navigator', source + '\\nreturn {startNetworkSupport,NETWORK_MESSAGES};')(fixtureWindow, document, fixtureNavigator);
                window.mutationPolicy = new Function(policy + '\\nreturn networkMutationDefaults;')();
                window.stopSupport = window.api.startNetworkSupport();
                window.originalApp = document.getElementById('app');
                window.steps = 0;
                document.getElementById('step').onclick = () => { document.getElementById('score').textContent = String(++window.steps); };
                window.sendStatus = (id, state) => worker.dispatchEvent(new MessageEvent('message', {data: {type:'sodafom-network',id,state}}));
                window.changeOnline = online => { fixtureNavigator.onLine = online; fixtureWindow.dispatchEvent(new Event(online ? 'online' : 'offline')); };
            }''', {'source': source, 'policy': policy})
            def passed(name):
                results.append({'name': name, 'status': 'passed'})
                print('PASS ' + name, flush=True)
            def visible():
                return page.locator('#sodafom-network-status').is_visible()
            def reset():
                page.evaluate('() => { window.stopSupport();fixture.navigator.onLine=true;window.stopSupport=api.startNetworkSupport(); }')
            assert not visible()
            assert page.evaluate('fixture.calls.length') == 1
            assert page.evaluate('fixture.calls[0][0]') == '/sw.js'
            page.evaluate('() => { api.startNetworkSupport(); api.startNetworkSupport(); }')
            assert page.locator('#sodafom-network-status').count() == 1
            assert page.evaluate('fixture.calls.length') == 1
            passed('Online initialization is quiet and repeated starts do not duplicate registration or banners')

            page.fill('#answer', 'Keep this fixture answer')
            page.evaluate('changeOnline(false)')
            assert visible() and 'activities already open' in page.locator('#sodafom-network-status').inner_text()
            page.click('#step')
            assert page.locator('#score').inner_text() == '1'
            assert page.input_value('#answer') == 'Keep this fixture answer'
            assert page.evaluate('document.getElementById("app") === originalApp')
            passed('Offline message leaves the activity DOM, typed answer, and working step button intact')

            page.evaluate('changeOnline(true)')
            assert 'connection is back' in page.locator('#sodafom-network-status').inner_text()
            page.clock.fast_forward(5001)
            assert not visible()
            passed('Reconnection message dismisses after five seconds without reloading the activity')

            page.evaluate("sendStatus('read1','slow');sendStatus('read2','slow');sendStatus('read1','settled')")
            assert visible() and 'taking a little longer' in page.locator('#sodafom-network-status').inner_text()
            page.evaluate("sendStatus('read2','settled')")
            assert not visible()
            passed('Concurrent slow requests keep one banner until both requests settle')

            page.evaluate("sendStatus('late','settled');sendStatus('late','slow')")
            assert not visible()
            page.evaluate("sendStatus('bad','<script>TEST_PRIVATE</script>')")
            assert not visible()
            passed('Late and unknown worker messages cannot produce a stale banner or injected content')

            page.evaluate("sendStatus('write1','uncertain');changeOnline(false);changeOnline(true);sendStatus('read3','settled')")
            assert 'may have reached us' in page.locator('#sodafom-network-status').inner_text()
            passed('Uncertain submission warning survives reconnection and unrelated read success')

            page.get_by_role('button', name='Close message').click()
            page.evaluate("sendStatus('read4','settled')")
            assert not visible()
            page.evaluate("sendStatus('write2','uncertain')")
            assert visible()
            passed('Dismissal is respected for unrelated requests; a new failed submission shows a new warning')

            reset()
            page.evaluate("sendStatus('read5','unavailable');changeOnline(true)")
            assert 'connection is back' in page.locator('#sodafom-network-status').inner_text()
            page.clock.fast_forward(5001)
            assert not visible()
            passed('Ordinary connection failure can recover without retaining an obsolete error')

            page.evaluate("sendStatus('read6','unavailable')")
            assert visible()
            page.evaluate("sendStatus('read7','settled')")
            assert not visible()
            passed('A successful request clears a read-outage warning without requiring an online event')

            page.evaluate('changeOnline(false)')
            page.set_viewport_size({'width': 360, 'height': 740})
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            page.click('#step')
            assert page.locator('#score').inner_text() == '2'
            assert page.locator('[role="status"]').get_attribute('aria-live') == 'polite'
            assert page.locator('#sodafom-network-status button').bounding_box()['height'] >= 44
            args.output.parent.mkdir(parents=True, exist_ok=True)
            page.screenshot(path=str(args.output.with_suffix('.png')), full_page=True)
            passed('360-pixel viewport has no horizontal overflow, accessible status semantics, and a 44-pixel button')

            page.evaluate('window.stopSupport();changeOnline(true);changeOnline(false)')
            assert page.locator('#sodafom-network-status').count() == 0
            assert page.input_value('#answer') == 'Keep this fixture answer'
            passed('Cleanup removes connection listeners and banner without removing the activity or answer')

            page.evaluate('() => { fixture.window.Capacitor={};fixture.navigator.onLine=false;fixture.calls.length=0;window.stopSupport=api.startNetworkSupport(); }')
            assert page.evaluate('fixture.calls.length') == 0
            assert visible()
            page.evaluate('window.stopSupport();delete fixture.window.Capacitor;')
            passed('Simulated native-app flag skips service-worker registration but retains offline feedback')

            page.evaluate('() => { fixture.navigator.serviceWorker=undefined;window.stopSupport=api.startNetworkSupport(); }')
            assert visible()
            page.evaluate('window.stopSupport();fixture.navigator.serviceWorker=fixture.worker;')
            passed('Unavailable service-worker API does not crash the offline message')

            page.evaluate("() => { fixture.navigator.onLine=true;fixture.calls.length=0;fixture.worker.register=(...args)=>{fixture.calls.push(args);return Promise.reject(new Error('TEST_PRIVATE_REGISTRATION_ERROR'))};window.stopSupport=api.startNetworkSupport(); }")
            page.wait_for_timeout(1)
            assert not visible()
            page.evaluate('changeOnline(false);changeOnline(true)')
            page.wait_for_timeout(1)
            assert page.evaluate('fixture.calls.length') == 2
            assert 'TEST_PRIVATE' not in page.locator('body').inner_text()
            passed('Registration failure is safely handled; reconnection retries registration without exposing error details')

            assert page.evaluate('mutationPolicy') == {'retry': 0, 'networkMode': 'always'}
            passed('Compiled mutation configuration disables retries and requests immediate rather than paused execution')
            assert not errors, errors
            passed('No uncaught page errors in the isolated DOM scenarios')
            browser.close()
    args.output.write_text(json.dumps({'scope': 'Real Chromium DOM with simulated connection/worker events; NOT browser network transport, storage, full app or real devices', 'passed': len(results), 'uncaught_page_errors': errors, 'results': results}, indent=2))


if __name__ == '__main__':
    main()

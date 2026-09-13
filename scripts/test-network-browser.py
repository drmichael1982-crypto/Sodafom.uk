#!/usr/bin/env python3
"""Chromium network harness for Agent34; NOT the complete Sodafom UI.
Requires Python playwright, Chromium, Node and TypeScript. No production access.
Run: python scripts/test-network-browser.py --output /tmp/agent34-browser.json
"""
from __future__ import annotations
import argparse
import json
import shutil
import socket
import subprocess
import tempfile
import threading
import time
from collections import Counter
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = b'''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Agent34 isolated network fixture</title><style>body{margin:0;font:18px/1.5 system-ui}#app{padding:20px}button,input{font:inherit;min-height:44px;max-width:100%;box-sizing:border-box}button{margin:6px}#answer{display:block;width:100%}</style><div id="app"><h1>Network test activity</h1><p>This is a test fixture, not the full application.</p><label for="answer">Keep your answer here</label><input id="answer"><button id="step" type="button">Complete a step</button><p>Steps: <span id="score">0</span></p></div><script type="module">import {startNetworkSupport} from '/network-status.js';window.startSupport=startNetworkSupport;window.stopSupport=startNetworkSupport();window.originalApp=document.getElementById('app');let n=Number(localStorage.getItem('fixture-progress')||0);const score=document.getElementById('score'),answer=document.getElementById('answer');score.textContent=String(n);answer.value=localStorage.getItem('fixture-answer')||'';document.getElementById('step').onclick=()=>{score.textContent=String(++n);localStorage.setItem('fixture-progress',String(n))};answer.oninput=()=>localStorage.setItem('fixture-answer',answer.value);window.fixtureReady=true;</script></html>'''


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, default=Path('/tmp/agent34-browser.json'))
    args = parser.parse_args()
    completed = False
    results: list[dict] = []
    errors: list[str] = []
    counts: Counter = Counter()
    lock = threading.Lock()
    with tempfile.TemporaryDirectory(prefix='agent34-') as tmp:
        compiled = Path(tmp)
        tsc = ROOT / 'node_modules/.bin/tsc'
        command = str(tsc) if tsc.exists() else shutil.which('tsc')
        if not command:
            raise RuntimeError('TypeScript compiler is required')
        subprocess.run([command, '--strict', '--target', 'ES2022', '--module', 'ES2022', '--lib', 'ES2022,DOM', '--outDir', str(compiled), str(ROOT / 'src/lib/network-status.ts'), str(ROOT / 'src/lib/network-query-policy.ts')], check=True, capture_output=True, text=True)

        class Handler(BaseHTTPRequestHandler):
            def log_message(self, *_args):
                pass

            def do_POST(self):
                self.respond()

            def do_GET(self):
                self.respond()

            def send(self, body: bytes, mime='text/html; charset=utf-8', status=200, headers=None):
                self.send_response(status)
                self.send_header('Content-Type', mime)
                self.send_header('Content-Length', str(len(body)))
                self.send_header('Cache-Control', 'no-cache')
                for key, value in (headers or {}).items():
                    self.send_header(key, value)
                self.end_headers()
                try:
                    self.wfile.write(body)
                except (BrokenPipeError, ConnectionResetError):
                    pass

            def respond(self):
                path = urlsplit(self.path).path
                if self.command == 'POST':
                    self.rfile.read(int(self.headers.get('Content-Length', 0)))
                with lock:
                    counts[(self.command, path)] += 1
                if path in ('/sw.js', '/network-worker.js'):
                    self.send((ROOT / 'public' / path[1:]).read_bytes(), 'application/javascript')
                elif path in ('/network-status.js', '/network-query-policy.js'):
                    self.send((compiled / path[1:]).read_bytes(), 'application/javascript')
                elif path == '/assets/fixture-AbCd1234.js':
                    body = b'export const fixture = 34;'
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/javascript')
                    self.send_header('Content-Length', str(len(body)))
                    self.send_header('Cache-Control', 'public,max-age=31536000,immutable')
                    self.end_headers()
                    self.wfile.write(body)
                elif path == '/api/slow':
                    time.sleep(5)
                    self.send(b'{"ok":true}', 'application/json')
                elif path == '/api/body-stall':
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Content-Length', '100')
                    self.end_headers()
                    self.wfile.write(b'{')
                    self.wfile.flush()
                    time.sleep(18)
                    self.close_connection = True
                elif path == '/api/commit-then-drop':
                    self.close_connection = True
                    try:
                        self.connection.shutdown(socket.SHUT_RDWR)
                    except OSError:
                        pass
                    self.connection.close()
                elif path == '/api/proxy-outage':
                    self.send(b'TEST_PRIVATE_PROXY_TRACE', 'text/html', 502)
                elif path.startswith('/api/'):
                    self.send(b'{"ok":true,"fixture":34}', 'application/json')
                else:
                    self.send(FIXTURE)

        server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        origin = f'http://127.0.0.1:{server.server_port}'
        def passed(name: str):
            results.append({'name': name, 'status': 'passed'})
            print(f'PASS {name}', flush=True)
        def count(method, path):
            with lock:
                return counts[(method, path)]

        try:
            with sync_playwright() as playwright:
                executable = shutil.which('chromium') or shutil.which('google-chrome')
                browser = playwright.chromium.launch(executable_path=executable, headless=True, args=['--no-sandbox'])
                context = browser.new_context(viewport={'width': 1280, 'height': 900})
                page = context.new_page()
                page.on('pageerror', lambda error: errors.append(str(error)))
                page.goto(origin, wait_until='networkidle')
                page.wait_for_function('window.fixtureReady && navigator.serviceWorker.controller !== null')
                page.evaluate('() => { window.startSupport(); }')
                assert page.locator('#sodafom-network-status').count() == 1
                assert page.locator('#sodafom-network-status').is_hidden()
                assert page.evaluate('Notification.permission') == 'default'
                passed('Initialization is idempotent and requests no notification permission')

                result = page.evaluate("async () => { const r=await fetch('/api/good'); return {status:r.status,body:await r.json()}; }")
                assert result == {'status': 200, 'body': {'ok': True, 'fixture': 34}}
                assert count('GET', '/api/good') == 1
                passed('Good internet returns the expected JSON in one attempt')

                page.fill('#answer', 'My fixture answer stays here')
                page.evaluate("() => { window.slowResult = fetch('/api/slow').then(async r=>({status:r.status,body:await r.json()})); }")
                page.wait_for_function("document.querySelector('#sodafom-network-status').textContent.includes('taking a little longer') && !document.querySelector('#sodafom-network-status').hidden", timeout=7000)
                page.click('#step')
                assert page.input_value('#answer') == 'My fixture answer stays here'
                assert page.evaluate('window.slowResult')['status'] == 200
                page.wait_for_function("document.querySelector('#sodafom-network-status').hidden")
                assert count('GET', '/api/slow') == 1
                passed('Five-second slow response shows a message while the activity stays usable')

                assert page.evaluate("async () => (await import('/assets/fixture-AbCd1234.js')).fixture") == 34
                page.wait_for_function("async () => Boolean(await (await caches.open('sodafom-network-assets-v1')).match('/assets/fixture-AbCd1234.js'))")
                asset_count = count('GET', '/assets/fixture-AbCd1234.js')
                context.set_offline(True)
                page.wait_for_function("!document.querySelector('#sodafom-network-status').hidden && document.querySelector('#sodafom-network-status').textContent.includes('internet connection has paused')")
                page.click('#step')
                assert page.locator('#score').inner_text() == '2'
                assert page.evaluate("localStorage.getItem('fixture-progress')") == '2'
                assert page.evaluate('document.getElementById("app") === window.originalApp')
                assert 'fixture = 34' in page.evaluate("async () => (await fetch('/assets/fixture-AbCd1234.js')).text()")
                assert count('GET', '/assets/fixture-AbCd1234.js') == asset_count
                passed('Offline: cached public script loads and fixture progress/input remain intact')

                result = page.evaluate("async () => { const r=await fetch('/api/offline'); return {status:r.status,body:await r.json()}; }")
                assert result['status'] == 503 and result['body']['ok'] is False
                assert 'internet' in result['body']['message']
                assert count('GET', '/api/offline') == 0
                passed('Offline API read fails safely without reaching a server')

                result = page.evaluate("async () => { const r=await fetch('/api/offline-write',{method:'POST',body:'fixture'}); return {status:r.status,body:await r.json()}; }")
                assert result['status'] == 503 and result['body']['submissionStatus'] == 'unknown'
                context.set_offline(False)
                page.wait_for_timeout(700)
                assert count('POST', '/api/offline-write') == 0
                assert 'may have reached us' in page.locator('#sodafom-network-status').inner_text()
                assert page.evaluate("localStorage.getItem('fixture-progress')") == '2'
                assert page.input_value('#answer') == 'My fixture answer stays here'
                passed('Reconnect does not replay an offline submission or erase its uncertainty warning')

                assert page.evaluate("async () => (await fetch('/api/reconnected')).status") == 200
                assert count('GET', '/api/reconnected') == 1
                assert count('POST', '/api/offline-write') == 0
                page.get_by_role('button', name='Close message').click()
                assert page.locator('#sodafom-network-status').is_hidden()
                page.click('#step')
                assert page.locator('#score').inner_text() == '3'
                passed('Explicit read works after reconnect; closing the message does not block learning')

                page.evaluate('() => { window.stopSupport(); window.stopSupport=window.startSupport(); }')
                result = page.evaluate("async () => { const r=await fetch('/api/commit-then-drop',{method:'POST',body:'fixture'}); return {status:r.status,body:await r.json()}; }")
                assert result['status'] == 503 and result['body']['submissionStatus'] == 'unknown'
                assert count('POST', '/api/commit-then-drop') == 1
                for _ in range(3):
                    context.set_offline(True)
                    page.wait_for_timeout(80)
                    context.set_offline(False)
                    page.wait_for_timeout(100)
                assert count('POST', '/api/commit-then-drop') == 1
                assert page.evaluate('document.getElementById("app") === window.originalApp')
                assert page.locator('#score').inner_text() == '3'
                passed('Lost acknowledgement after server received POST: one server submission across repeated reconnects')

                page.evaluate('() => { window.stopSupport(); window.stopSupport=window.startSupport(); }')
                started = time.monotonic()
                result = page.evaluate("async () => { const r=await fetch('/api/body-stall'); return {status:r.status,body:await r.json()}; }")
                elapsed = time.monotonic() - started
                assert result['status'] == 503 and 14 <= elapsed < 18
                assert count('GET', '/api/body-stall') == 1
                passed('JSON body stalls after headers: real browser receives safe failure at the 15-second deadline')

                result = page.evaluate("async () => { const r=await fetch('/api/proxy-outage'); return {status:r.status,text:await r.text()}; }")
                assert result['status'] == 503 and 'TEST_PRIVATE_PROXY_TRACE' not in result['text']
                passed('Upstream proxy diagnostics are not displayed or returned to the page')

                context.set_offline(True)
                page.set_viewport_size({'width': 360, 'height': 740})
                page.wait_for_timeout(100)
                assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
                page.click('#step')
                assert page.locator('#score').inner_text() == '4'
                args.output.parent.mkdir(parents=True, exist_ok=True)
                page.screenshot(path=str(args.output.with_suffix('.png')), full_page=True)
                passed('Narrow mobile viewport: offline message has no horizontal overflow and buttons still work')

                offline_tab = context.new_page()
                response = offline_tab.goto(origin + '/parent-dashboard?fixture=TEST_PRIVATE_NAME', wait_until='domcontentloaded')
                assert response.status == 503
                assert offline_tab.get_by_role('heading', name='The internet connection has paused').is_visible()
                assert 'TEST_PRIVATE_NAME' not in offline_tab.locator('body').inner_text()
                context.set_offline(False)
                offline_tab.get_by_role('link', name='Try opening Sodafom').click()
                offline_tab.wait_for_function('window.fixtureReady')
                assert offline_tab.locator('#score').inner_text() == '4'
                assert offline_tab.input_value('#answer') == 'My fixture answer stays here'
                passed('Offline navigation shows a safe page; explicit reconnect navigation restores fixture local progress')

                keys = page.evaluate("async () => (await (await caches.open('sodafom-network-assets-v1')).keys()).map(r=>r.url)")
                assert len(keys) == 1 and '/assets/fixture-AbCd1234.js' in keys[0]
                assert not any('/api/' in key or '?' in key for key in keys)
                passed('Browser cache contains only the public build fixture; no API, HTML, or personal URLs')

                page.evaluate('() => { window.stopSupport(); window.stopSupport=window.startSupport(); }')
                page.evaluate("navigator.serviceWorker.dispatchEvent(new MessageEvent('message',{data:{type:'sodafom-network',id:'out-of-order',state:'settled'}}));navigator.serviceWorker.dispatchEvent(new MessageEvent('message',{data:{type:'sodafom-network',id:'out-of-order',state:'slow'}}));")
                assert page.locator('#sodafom-network-status').is_hidden()
                page.evaluate("navigator.serviceWorker.dispatchEvent(new MessageEvent('message',{data:{type:'sodafom-network',id:'untrusted',state:'<script>TEST_PRIVATE</script>'}}));")
                assert page.locator('#sodafom-network-status').is_hidden()
                passed('Out-of-order and unknown status messages cannot leave a stale banner or inject content')

                page.evaluate('window.stopSupport();')
                context.set_offline(True)
                assert page.locator('#sodafom-network-status').count() == 0
                context.set_offline(False)
                assert page.locator('#sodafom-network-status').count() == 0
                passed('Cleanup removes the banner and connection listeners without changing stored progress')

                native = browser.new_context(viewport={'width': 390, 'height': 844})
                native.add_init_script('window.Capacitor = {};')
                native_page = native.new_page()
                native_page.on('pageerror', lambda error: errors.append(str(error)))
                native_page.goto(origin, wait_until='networkidle')
                assert native_page.evaluate('async () => (await navigator.serviceWorker.getRegistrations()).length') == 0
                native.set_offline(True)
                native_page.wait_for_function("!document.querySelector('#sodafom-network-status').hidden")
                native_page.click('#step')
                assert native_page.locator('#score').inner_text() == '1'
                passed('Simulated Capacitor flag skips service worker; offline banner and fixture activity still work')
                native.close()

                blocked = browser.new_context(service_workers='block')
                blocked_page = blocked.new_page()
                blocked_page.on('pageerror', lambda error: errors.append(str(error)))
                blocked_page.goto(origin, wait_until='networkidle')
                blocked.set_offline(True)
                blocked_page.wait_for_function("!document.querySelector('#sodafom-network-status').hidden")
                blocked_page.click('#step')
                assert blocked_page.locator('#score').inner_text() == '1'
                passed('Blocked service workers do not crash the connection banner or local fixture activity')
                blocked.close()

                assert not errors, errors
                passed('No uncaught page errors in the exercised harness scenarios')
                completed = True
                browser.close()
        finally:
            server.shutdown()
            server.server_close()
            args.output.parent.mkdir(parents=True, exist_ok=True)
            args.output.write_text(json.dumps({'status': 'passed' if completed else 'not_completed', 'scope': 'Isolated Chromium network harness, NOT full Sodafom application or physical devices', 'passed': len(results), 'uncaught_page_errors': errors, 'results': results}, indent=2))


if __name__ == '__main__':
    main()

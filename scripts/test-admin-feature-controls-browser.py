"""Isolated Chromium tests of the actual DOM view/CSS with a mocked API.
Requires Python playwright and Chromium (not a real iPhone/Android device).
Run: python scripts/test-admin-feature-controls-browser.py
No live Sodafom requests, real accounts, paid AI or production data are used.
"""
from __future__ import annotations
import copy
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parent.parent
CONNECTED = ['learning', 'games', 'reading', 'homework', 'cinema', 'rewards', 'shop', 'parent', 'teacher']
CRITICAL = ['learning', 'games', 'reading', 'homework', 'parent', 'teacher']
LABELS = {'learning': 'Learning', 'games': 'Games', 'reading': 'Reading', 'homework': 'Homework', 'cinema': 'Cinema', 'rewards': 'Rewards', 'shop': 'Shop', 'parent': 'Parent', 'teacher': 'Teacher'}
PASSED = []

def run_tests():
    with tempfile.TemporaryDirectory(prefix='sodafom-admin-test-') as directory:
        subprocess.run(['node', str(ROOT / 'scripts/admin-feature-test-support.mjs'), '--browser-dir', directory], check=True)
        defaults = json.loads((Path(directory) / 'default-snapshot.json').read_text())
        with sync_playwright() as p:
            executable = os.environ.get('CHROMIUM_PATH') or shutil.which('chromium') or shutil.which('chromium-browser')
            browser = p.chromium.launch(**({'executable_path': executable} if executable else {}), headless=True)
            css = (Path(directory) / 'controls.css').read_text()
            bundle = (Path(directory) / 'offline-bundle.js').read_text()
            html = '<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline Admin controls test</title><style>body{margin:0;padding:8px;font-family:Arial,sans-serif}main{max-width:1120px;margin:auto}' + css + '</style><main><div id="controls"></div></main></html>'
            class State:
                def __init__(self, page): self.page = page
                def __getitem__(self, key): return self.page.evaluate('(key)=>window.apiState[key]', key)
                def __setitem__(self, key, value): self.page.evaluate('([key,value])=>{window.apiState[key]=value}', [key, value])
            def mount(page, data, init_script=None):
                page.set_content(html)
                page.evaluate('(data)=>{window.apiState=data}', data)
                page.evaluate(r"""() => {
                  window.fetch = async (_url, init={}) => {
                    const d=window.apiState;
                    if (init.signal?.aborted) throw new DOMException('Aborted','AbortError');
                    const respond=(status,data)=>Promise.resolve(new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}}));
                    if (init.method==='GET') {
                      if(d.mode==='pending_get') return new Promise((resolve,reject)=>{window.completePending=()=>resolve(new Response(JSON.stringify({success:true,snapshot:d.snapshot}),{status:200}));init.signal?.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')),{once:true});});
                      if(d.mode==='get401') return respond(401,{error:'TEST_PRIVATE_SERVER_VALUE'});
                      if(d.mode==='badjson') return new Response('{broken',{status:200});
                      if(d.mode==='malformed') return respond(200,{success:true,snapshot:{revision:0,states:{games:'on'}}});
                      return respond(200,{success:true,snapshot:d.snapshot,private:'TEST_PRIVATE_SERVER_VALUE'});
                    }
                    const body=JSON.parse(init.body);d.posts.push(body);
                    if(d.mode.startsWith('post')) return respond(Number(d.mode.slice(4)),{error:'TEST_PRIVATE_SERVER_VALUE'});
                    if(body.revision!==d.snapshot.revision) return respond(409,{error:'stale'});
                    if(!['learning','games','reading','homework','cinema','rewards','shop','parent','teacher'].includes(body.key)||typeof body.enabled!=='boolean'||body.action!=='set-feature-control') return respond(400,{error:'invalid'});
                    if(!body.enabled&&['learning','games','reading','homework','parent','teacher'].includes(body.key)&&!body.confirmed) return respond(409,{error:'confirmation'});
                    d.snapshot.states[body.key]=body.enabled?'on':'off';d.snapshot.revision++;
                    if(d.mode==='pending_post') return new Promise((resolve,reject)=>{window.completePending=()=>resolve(new Response(JSON.stringify({success:true,snapshot:d.snapshot}),{status:200}));init.signal?.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')),{once:true});});
                    if(d.mode==='uncertain') throw new TypeError('Failed to fetch');
                    return respond(200,{success:true,snapshot:d.snapshot});
                  };
                }""")
                if init_script: page.evaluate(init_script)
                page.add_script_tag(content=bundle)
                page.evaluate("() => {window.cleanup=window.mountControls(document.getElementById('controls'),'/api');}")
            def setup(mode='normal', init_script=None):
                page = browser.new_page(viewport={'width': 1280, 'height': 900})
                errors = []
                page.on('pageerror', lambda error: errors.append(str(error)))
                data = {'snapshot': copy.deepcopy(defaults), 'posts': [], 'mode': mode}
                mount(page, data, init_script)
                return page, State(page), errors
            def refresh(page):
                data=page.evaluate('window.apiState')
                page.evaluate('window.cleanup()')
                page.reload()  # about:blank only; no network or live application.
                mount(page, data)
            def ready(page):
                expect(page.get_by_role('status')).to_have_text('Settings loaded. Choose one feature to change.')
            def switch(page, key):
                return page.get_by_role('switch', name=f'{LABELS[key]} page access', exact=True)
            def passed(name, page, errors):
                assert not errors, errors
                PASSED.append(name)
                print(f'PASS: {name}', flush=True)
                page.close()

            page, data, errors = setup(); ready(page)
            assert page.locator('article').count() == 13
            assert page.get_by_role('switch').count() == 9
            assert page.locator('.sfc-testing').count() == 3
            assert page.locator('.sfc-coming_soon').count() == 1
            for text in ['Ask Archie AI', 'Voice', 'Notifications', 'Sticker books']:
                card = page.locator('article').filter(has=page.get_by_role('heading', name=text, exact=True))
                assert card.get_by_role('switch').count() == 0
            assert 'TEST_PRIVATE_SERVER_VALUE' not in page.locator('body').inner_text()
            passed('13 unique controls, correct status labels, 4 read-only integrations, no private response fields', page, errors)

            page, data, errors = setup('pending_get')
            expect(page.get_by_role('status')).to_have_text('Loading feature settings…')
            assert page.locator('button[role="switch"]:enabled').count() == 0
            assert page.locator('.sfc-on').count() == 0
            page.evaluate('window.completePending()'); ready(page)
            passed('pending read shows no invented On states and disables all switches until loaded', page, errors)

            page, data, errors = setup('pending_post'); ready(page)
            switch(page, 'cinema').click()
            expect(page.get_by_role('status')).to_have_text('Saving Cinema…')
            assert page.locator('button[role="switch"]:enabled').count() == 0
            expect(switch(page, 'cinema')).to_have_attribute('aria-checked', 'true')
            page.evaluate('window.completePending()')
            expect(switch(page, 'cinema')).to_have_attribute('aria-checked', 'false')
            assert len(data['posts']) == 1
            passed('pending save keeps last-known status, blocks duplicate changes, updates only on confirmation', page, errors)

            for key in CONNECTED:
                page, data, errors = setup(); ready(page)
                switch(page, key).click()
                if key in CRITICAL:
                    expect(page.get_by_role('dialog')).to_be_visible()
                    page.get_by_role('button', name='Confirm turn off', exact=True).click()
                expect(switch(page, key)).to_have_attribute('aria-checked', 'false')
                assert len(data['posts']) == 1
                assert data['posts'][0]['key'] == key
                for other in CONNECTED:
                    if other != key:
                        assert data['snapshot']['states'][other] == 'on'
                refresh(page); ready(page)
                expect(switch(page, key)).to_have_attribute('aria-checked', 'false')
                switch(page, key).click()
                expect(switch(page, key)).to_have_attribute('aria-checked', 'true')
                assert len(data['posts']) == 2
                passed(f'{LABELS[key]}: confirmed off, persisted across reload, back on, unrelated controls unchanged', page, errors)

            page, data, errors = setup(); ready(page)
            switch(page, 'games').click()
            expect(page.get_by_role('button', name='Keep it on')).to_be_focused()
            page.keyboard.press('Tab')
            expect(page.get_by_role('button', name='Confirm turn off')).to_be_focused()
            page.keyboard.press('Escape')
            expect(page.get_by_role('dialog')).to_have_count(0)
            expect(switch(page, 'games')).to_be_focused()
            assert len(data['posts']) == 0
            switch(page, 'games').click()
            page.keyboard.press('Enter')
            expect(page.get_by_role('dialog')).to_have_count(0)
            expect(switch(page, 'games')).to_have_attribute('aria-checked', 'true')
            assert len(data['posts']) == 0
            passed('keyboard confirmation defaults to cancel; Escape/Enter cancel without writing and restore focus', page, errors)

            page, data, errors = setup(); ready(page)
            page.evaluate('''() => {const b=document.querySelector('[data-feature="cinema"]');b.click();b.click();b.click();}''')
            expect(switch(page, 'cinema')).to_have_attribute('aria-checked', 'false')
            assert len(data['posts']) == 1
            passed('rapid repeat clicks submit only one change', page, errors)

            for mode in ['post500', 'post401', 'post403', 'post409', 'uncertain']:
                page, data, errors = setup(mode); ready(page)
                switch(page, 'cinema').click()
                expect(page.get_by_role('alert')).to_be_visible()
                assert page.locator('button[role="switch"]:enabled').count() == 0
                assert 'TEST_PRIVATE_SERVER_VALUE' not in page.locator('body').inner_text()
                assert len(data['posts']) == 1
                data['mode'] = 'normal'
                page.get_by_role('button', name='Reload settings', exact=True).click(); ready(page)
                expect(switch(page, 'cinema')).to_have_attribute('aria-checked', 'false' if mode == 'uncertain' else 'true')
                assert len(data['posts']) == 1
                passed(f'{mode}: safe error, controls locked until reload, no false success or retry', page, errors)

            for mode in ['get401', 'badjson', 'malformed']:
                page, data, errors = setup(mode)
                expect(page.get_by_role('alert')).to_be_visible()
                assert page.locator('button[role="switch"]:enabled').count() == 0
                assert page.locator('.sfc-on').count() == 0
                assert 'TEST_PRIVATE_SERVER_VALUE' not in page.locator('body').inner_text()
                data['mode'] = 'normal'
                page.get_by_role('button', name='Reload settings', exact=True).click(); ready(page)
                assert page.locator('button[role="switch"]:enabled').count() == 9
                passed(f'{mode}: no invented status, disabled controls and successful recovery', page, errors)

            page, data, errors = setup(init_script='HTMLDialogElement.prototype.showModal=undefined;'); ready(page)
            switch(page, 'learning').click()
            expect(page.get_by_role('status')).to_contain_text('cannot show the secure confirmation')
            expect(switch(page, 'learning')).to_have_attribute('aria-checked', 'true')
            assert len(data['posts']) == 0
            passed('missing dialog support cannot bypass confirmation', page, errors)

            for width, height in [(320, 740), (375, 812), (768, 1024), (1280, 900), (812, 375)]:
                page, data, errors = setup(); ready(page)
                page.set_viewport_size({'width': width, 'height': height})
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'Overflow at {width}'
                assert page.evaluate('Array.from(document.querySelectorAll("button")).every(b=>b.getBoundingClientRect().height>=44)')
                switch(page, 'learning').click()
                expect(page.get_by_role('dialog')).to_be_visible()
                assert page.evaluate('document.querySelector("dialog").getBoundingClientRect().width <= innerWidth')
                page.get_by_role('button', name='Keep it on').click()
                if os.environ.get('ADMIN_TEST_SCREENSHOTS') and width in [320, 1280]:
                    dest = Path(os.environ['ADMIN_TEST_SCREENSHOTS']); dest.mkdir(parents=True, exist_ok=True)
                    page.screenshot(path=str(dest / f'admin-controls-{width}.png'), full_page=True)
                passed(f'{width}x{height}: no horizontal overflow, 44px controls, confirmation usable', page, errors)

            page, data, errors = setup(); ready(page)
            switch(page, 'learning').click()
            page.evaluate('window.cleanup()')
            assert page.locator('#controls').inner_text() == ''
            assert page.get_by_role('dialog').count() == 0
            assert len(data['posts']) == 0
            passed('unmount removes dialog/view and cancels pending work without writing', page, errors)
            browser.close()
    print(json.dumps({'passed': len(PASSED), 'failed': 0, 'environment': 'Chromium, mocked API, actual DOM view and scoped CSS'}, indent=2))

if __name__ == '__main__':
    run_tests()

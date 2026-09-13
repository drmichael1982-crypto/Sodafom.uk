"""Isolated Chromium UI checks. Run: python scripts/test-sticker-books-browser.py
Requires Python Playwright and Chromium (system or Playwright install), plus TypeScript.
Artwork requests are stubbed with a test pixel. These tests do NOT approve the real art,
run the full React application, or represent physical iOS/Android testing.
"""
import base64
import functools
import http.server
import json
import re
import sys
from pathlib import Path
import shutil
import subprocess
import tempfile
import threading
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OFFLINE = '--offline' in sys.argv
KEY = 'sodafom_sticker_books_v1'
PIXEL = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aM3sAAAAASUVORK5CYII=')
passed = []


def ok(name):
    passed.append(name)
    print('PASS ' + name, flush=True)


def centre(locator):
    box = locator.bounding_box()
    assert box
    return box['x'] + box['width']/2, box['y'] + box['height']/2


def move_mouse(page, source, x, y):
    sx, sy = centre(source)
    page.mouse.move(sx, sy)
    page.mouse.down()
    page.mouse.move(x, y, steps=8)
    page.mouse.up()


def styles(page):
    return page.locator('.sb-placed').evaluate_all('(nodes)=>nodes.map(n=>({id:n.dataset.stickerId,x:n.style.left,y:n.style.top,size:n.style.width}))')


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


with tempfile.TemporaryDirectory(prefix='sodafom-sticker-browser-') as folder:
    directory = Path(folder)
    compiler = ROOT / 'node_modules/typescript/bin/tsc'
    command = ['node', str(compiler)] if compiler.exists() else ['tsc']
    subprocess.run(command + ['--strict', '--target', 'ES2022', '--module', 'ES2022', '--moduleResolution', 'bundler', '--lib', 'ES2022,DOM', '--outDir', folder]
                   + [str(ROOT/'src/components/sticker-books'/name) for name in ['catalog.ts','model.ts','editor.ts']], check=True)
    shutil.copy(ROOT/'src/components/sticker-books/sticker-books.css', directory/'sticker-books.css')
    harness = '''<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/sticker-books.css"><title>Sticker editor test harness</title></head><body style="margin:0;font-family:Arial,sans-serif"><div id="root"></div><script type="module">import {mountStickerBook} from './editor.js'; window.cleanup=mountStickerBook(document.getElementById('root'),()=>{window.leftEditor=true;});</script></body></html>'''
    (directory/'index.html').write_text(harness)
    server = http.server.ThreadingHTTPServer(('127.0.0.1',0), functools.partial(QuietHandler,directory=folder))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{server.server_port}/'
    # --offline never navigates or requests a URL. It renders local code in about:blank
    # with an in-memory storage double and embedded test pixels. No policy is altered.
    offline_bundle = '\n'.join(re.sub(r'^import\b.*?;\n', '', (directory/name).read_text(), flags=re.M|re.S).replace('export ', '') for name in ['catalog.js','model.js','editor.js'])
    offline_bundle = re.sub(r"'/assets/[^']+'", "'data:image/png;base64," + base64.b64encode(PIXEL).decode() + "'", offline_bundle)
    offline_bundle = '(function(){' + offline_bundle + '\nwindow.mountStickerBook=mountStickerBook;})();'
    def load(target, seed=None, blocked=False):
        if not OFFLINE:
            if target.url == 'about:blank': target.goto(url)
            else: target.reload()
            return
        if seed is None:
            seed = target.evaluate("()=>window.offlineValues ? [...window.offlineValues] : []")
        target.evaluate("()=>{if(window.cleanup)window.cleanup()}")
        target.set_content('<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;font-family:Arial,sans-serif"><div id="root"></div></body></html>')
        target.add_style_tag(content=(directory/'sticker-books.css').read_text())
        target.evaluate("""({seed,blocked})=>{
          window.offlineValues=new Map(seed);
          class OfflineStorage {
            getItem(key){return window.offlineValues.get(key)??null}
            setItem(key,value){window.offlineValues.set(key,String(value))}
          }
          const storage=new OfflineStorage();
          Object.defineProperty(window,'localStorage',{configurable:true,get(){if(blocked)throw new DOMException('Blocked','SecurityError');return storage}});
        }""", {'seed':seed,'blocked':blocked})
        target.add_script_tag(content=offline_bundle)
        target.evaluate("()=>{window.cleanup=window.mountStickerBook(document.getElementById('root'),()=>{window.leftEditor=true})}")
    try:
        with sync_playwright() as p:
            executable = shutil.which('chromium') or shutil.which('chromium-browser')
            browser = p.chromium.launch(headless=True, **({'executable_path':executable} if executable else {}), args=['--no-sandbox'])
            context = browser.new_context(viewport={'width':1280,'height':1100})
            requests = []
            context.on('request', lambda request: requests.append(request.url))
            context.route('**/assets/**', lambda route: route.fulfill(status=200,content_type='image/png',body=PIXEL))
            page = context.new_page()
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            approve = [True]
            page.on('dialog', lambda dialog: dialog.accept() if approve[0] else dialog.dismiss())
            load(page)
            expect(page.get_by_role('heading',name="Archie's Sticker Books",exact=True)).to_be_visible()
            expect(page.get_by_role('group',name='Your sticker page',exact=True)).to_be_visible()
            ok('editor opens with accessible title and page')

            page.get_by_role('button',name='Add Archie',exact=True).click()
            assert page.locator('.sb-placed').count()==1
            ok('one pointer tap adds exactly one sticker')
            page.get_by_role('button',name='Add Bella',exact=True).focus()
            page.keyboard.press('Enter')
            assert page.locator('.sb-placed').count()==2
            ok('keyboard can add a sticker without dragging')

            bx,by=centre(page.locator('.sb-board'))
            move_mouse(page,page.get_by_role('button',name='Add Mia',exact=True),bx+30,by+20)
            assert page.locator('.sb-placed').count()==3
            ok('drag from tray places one sticker on the page')
            move_mouse(page,page.get_by_role('button',name='Add Toby',exact=True),10,10)
            assert page.locator('.sb-placed').count()==3
            ok('dropping outside the page does not add a sticker')

            sticker=page.locator('.sb-placed').last
            before=styles(page)
            x,y=centre(sticker)
            move_mouse(page,sticker,x+95,y+42)
            after=styles(page)
            assert before[-1]['x']!=after[-1]['x']
            page.get_by_role('button',name='Undo',exact=True).click()
            assert styles(page)==before
            page.get_by_role('button',name='Redo',exact=True).click()
            assert styles(page)==after
            ok('a placed drag is one undo/redo operation')

            sticker=page.locator('.sb-placed').last
            sticker.focus()
            before=styles(page)[-1]
            page.keyboard.press('ArrowLeft')
            assert float(styles(page)[-1]['x'][:-1]) < float(before['x'][:-1])
            page.get_by_role('button',name='Bigger',exact=True).click()
            assert float(styles(page)[-1]['size'][:-1])>float(before['size'][:-1])
            page.get_by_role('button',name='Smaller',exact=True).click()
            assert abs(float(styles(page)[-1]['size'][:-1])-float(before['size'][:-1]))<1e-8
            ok('keyboard movement and size controls work')
            page.get_by_role('button',name='Remove sticker',exact=True).click()
            assert page.locator('.sb-placed').count()==2
            page.get_by_role('button',name='Undo',exact=True).click()
            assert page.locator('.sb-placed').count()==3
            ok('remove and undo restore the correct sticker')

            page.get_by_label('Sticker category',exact=True).select_option('Animals')
            assert page.locator('.sb-sticker-choice').count()==1
            expect(page.get_by_role('button',name='Add Ziggy the dinosaur',exact=True)).to_be_visible()
            page.get_by_label('Sticker category',exact=True).select_option('Objects & cards')
            assert page.locator('.sb-sticker-choice').count()==4
            page.get_by_label('Sticker category',exact=True).select_option('All')
            assert page.locator('.sb-sticker-choice').count()==15
            ok('character, animal and object/card filters work')

            before=styles(page)
            page.get_by_label('Page theme',exact=True).select_option('seaside')
            assert styles(page)==before
            page.get_by_label('Story challenge',exact=True).check()
            expect(page.locator('.sb-prompt')).to_contain_text('postcard')
            ok('theme and age-appropriate story prompts preserve stickers')

            # Store titles as text, never markup.
            title='<img src=x onerror=window.bad=true>'
            page.get_by_label('Page title',exact=True).fill(title)
            page.get_by_role('button',name='New page',exact=True).click()
            assert page.locator('.sb-placed').count()==0
            page.get_by_role('button',name='Add Ziggy the dinosaur',exact=True).click()
            page.get_by_label('Page title',exact=True).fill('My second adventure')
            page.get_by_role('button',name='Save all pages',exact=True).click()
            saved=page.evaluate('(key)=>JSON.parse(localStorage.getItem(key))',KEY)
            assert len(saved['pages'])==2 and len(saved['pages'][0]['stickers'])==3 and len(saved['pages'][1]['stickers'])==1
            load(page)
            expect(page.get_by_label('Page title',exact=True)).to_have_value('My second adventure')
            first_id=saved['pages'][0]['id']
            page.get_by_label('Choose a page',exact=True).select_option(first_id)
            assert page.locator('.sb-placed').count()==3
            expect(page.get_by_label('Page title',exact=True)).to_have_value(title)
            assert page.locator('img[src="x"]').count()==0
            assert not page.evaluate('Boolean(window.bad)')
            ok('multiple pages, titles and themes survive save/reload without HTML injection')

            approve[0]=False
            page.get_by_role('button',name='Clear this page',exact=True).click()
            assert page.locator('.sb-placed').count()==3
            approve[0]=True
            page.get_by_role('button',name='Clear this page',exact=True).click()
            assert page.locator('.sb-placed').count()==0
            page.get_by_role('button',name='Undo',exact=True).click()
            assert page.locator('.sb-placed').count()==3
            ok('clear requires confirmation and supports undo')
            approve[0]=False
            page.get_by_role('button',name='Delete page',exact=True).click()
            assert page.locator('select[aria-label="Choose a page"] option').count()==2
            approve[0]=True
            page.get_by_role('button',name='Delete page',exact=True).click()
            assert page.locator('select[aria-label="Choose a page"] option').count()==1
            page.get_by_role('button',name='Undo',exact=True).click()
            assert page.locator('select[aria-label="Choose a page"] option').count()==2
            ok('delete page requires confirmation and supports undo')

            page.locator('.sb-placed').last.scroll_into_view_if_needed()
            before=styles(page)
            x,y=centre(page.locator('.sb-placed').last)
            page.mouse.move(x,y);page.mouse.down();page.mouse.move(x+70,y+15,steps=4)
            page.dispatch_event('#root','pointercancel',{'pointerId':1,'isPrimary':True})
            page.mouse.up()
            assert styles(page)==before
            ok('pointer cancellation restores the original placement')
            x,y=centre(page.locator('.sb-placed').last)
            page.mouse.move(x,y);page.mouse.down();page.mouse.move(x+70,y+15,steps=4)
            page.keyboard.press('Escape');page.mouse.up()
            assert styles(page)==before
            ok('Escape cancels an in-progress drag')

            page.get_by_role('button',name='Save all pages',exact=True).click()
            saved_raw=page.evaluate('(key)=>localStorage.getItem(key)',KEY)
            page.get_by_label('Page title',exact=True).fill('An unsaved title')
            expect(page.locator('.sb-save-status')).to_contain_text('not saved')
            approve[0]=False
            page.get_by_role('button',name='Back home',exact=True).click()
            assert not page.evaluate('Boolean(window.leftEditor)')
            approve[0]=True
            ok('unsaved typing is tracked before blur and leaving asks for confirmation')

            other=context.new_page();load(other,seed=page.evaluate('()=>[...window.offlineValues]') if OFFLINE else None)
            other.get_by_label('Page title',exact=True).fill('Other tab wins')
            other.get_by_role('button',name='Save all pages',exact=True).click()
            other_raw=other.evaluate('(key)=>localStorage.getItem(key)',KEY)
            assert other_raw!=saved_raw
            if OFFLINE:
                page.evaluate('(args)=>{localStorage.setItem(args.key,args.raw);window.dispatchEvent(new StorageEvent(\'storage\',{key:args.key,newValue:args.raw}))}',{'key':KEY,'raw':other_raw})
            page.get_by_role('button',name='Save all pages',exact=True).click()
            expect(page.get_by_role('status')).to_contain_text('Not saved. Another tab')
            assert page.evaluate('(key)=>localStorage.getItem(key)',KEY)==other_raw
            other.close()
            ok('sequential cross-tab conflict does not overwrite another save')

            page.get_by_role('button',name='Reload saved pages',exact=True).click()
            page.get_by_role('button',name='Add Archie',exact=True).click()
            page.evaluate("()=>{Object.getPrototypeOf(localStorage).setItem=function(){throw new DOMException('Full','QuotaExceededError')}}")
            page.get_by_role('button',name='Save all pages',exact=True).click()
            expect(page.get_by_role('status')).to_contain_text('Not saved. Browser storage')
            assert page.evaluate('(key)=>localStorage.getItem(key)',KEY)==other_raw
            ok('quota failure keeps the open page and the previous saved book')

            load(page)
            page.evaluate('(key)=>localStorage.setItem(key,"{broken")',KEY)
            load(page)
            expect(page.get_by_role('status')).to_contain_text('Saved pages could not be read')
            assert page.evaluate('(key)=>localStorage.getItem(key)',KEY)=='{broken'
            page.get_by_role('button',name='Add Archie',exact=True).click()
            approve[0]=False
            page.get_by_role('button',name='Save all pages',exact=True).click()
            assert page.evaluate('(key)=>localStorage.getItem(key)',KEY)=='{broken'
            approve[0]=True
            page.get_by_role('button',name='Save all pages',exact=True).click()
            assert len(page.evaluate('(key)=>JSON.parse(localStorage.getItem(key)).pages[0].stickers',KEY))==1
            ok('corrupt saves remain intact until explicit replacement confirmation')

            # Missing art must have readable, removable fallback rather than random symbols.
            page.route('**/assets/images/archie-character-v2.png',lambda route:route.fulfill(status=404,body='missing'))
            load(page)
            if OFFLINE: page.locator('.sb-placed img').evaluate("n=>n.src='data:image/png;base64,bad'")
            expect(page.locator('.sb-placed .sb-image-fallback')).to_be_visible()
            page.locator('.sb-placed').click()
            page.get_by_role('button',name='Remove sticker',exact=True).click()
            assert page.locator('.sb-placed').count()==0
            ok('missing artwork has a labelled fallback and remains removable')

            blocked=browser.new_context(viewport={'width':1024,'height':900})
            blocked.route('**/assets/**',lambda route:route.fulfill(status=200,content_type='image/png',body=PIXEL))
            blocked.add_init_script("Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError')}})")
            bp=blocked.new_page();load(bp,blocked=True)
            expect(bp.get_by_role('status')).to_contain_text('Browser storage is unavailable')
            bp.get_by_role('button',name='Add Archie',exact=True).click()
            bp.get_by_role('button',name='Save all pages',exact=True).click()
            expect(bp.get_by_role('status')).to_contain_text('Not saved')
            assert bp.locator('.sb-placed').count()==1
            blocked.close()
            ok('blocked storage does not crash editing or falsely report a save')

            mobile=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,device_scale_factor=2,reduced_motion='reduce')
            mobile.route('**/assets/**',lambda route:route.fulfill(status=200,content_type='image/png',body=PIXEL))
            mp=mobile.new_page();load(mp)
            mp.get_by_role('button',name='Add Archie',exact=True).tap()
            assert mp.locator('.sb-placed').count()==1
            mp.locator('.sb-placed').scroll_into_view_if_needed()
            before=styles(mp)
            x,y=centre(mp.locator('.sb-placed'))
            client=mobile.new_cdp_session(mp)
            client.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y}]})
            client.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x+45,'y':y+20}]})
            client.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
            assert styles(mp)[0]['x']!=before[0]['x']
            ok('Chromium touch emulation adds once and drags a placed sticker')
            for width in [320,390,768,1280]:
                mp.set_viewport_size({'width':width,'height':900})
                assert mp.evaluate('document.documentElement.scrollWidth <= window.innerWidth+1'),f'Overflow at {width}'
                assert mp.locator('.sb-button').evaluate_all('(nodes)=>nodes.every(n=>n.getBoundingClientRect().height>=44)'),f'Small controls at {width}'
            ok('320px–1280px layouts do not overflow; control heights remain at least 44px')
            assert mp.locator('.sb-button').first.evaluate('(n)=>getComputedStyle(n).transitionDuration')=='0s'
            ok('reduced-motion preference disables decorative transitions')
            mp.evaluate('window.cleanup()')
            assert mp.locator('#root > *').count()==0
            ok('unmount cleanup removes the editor and its global listeners')
            mobile.close()
            assert all(request.startswith(url) or (OFFLINE and request.startswith('data:')) for request in requests),requests
            assert not errors,errors
            ok('isolated editor makes no external data requests and has no uncaught desktop errors')
            context.close();browser.close()
    finally:
        server.shutdown();server.server_close()
print(f'\n{len(passed)} isolated Chromium browser checks passed. Offline mode: {OFFLINE}. Artwork was stubbed; offline storage and cross-tab events were test doubles. Full app and physical devices were not tested.',flush=True)

"""Isolated editor checks. Requires TypeScript CLI and Python Playwright + Chromium.
No deployed app, live accounts, AI, payments or network service is used.
Existing artwork requests are replaced with a 1px test image: these are interaction,
not approved-art visual, full React integration, or physical-device tests.
"""
from pathlib import Path
import base64
import functools
import http.server
import json
import os
import shutil
import subprocess
import tempfile
import threading
from playwright.sync_api import sync_playwright, expect

SOURCE = Path(__file__).resolve().parent
PIXEL = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aN2kAAAAASUVORK5CYII=')
HTML = '''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Sticker editor interaction test</title><link rel="stylesheet" href="stickers.css"><body style="margin:0"><main class="sb-page"><h1>Archie's Sticker Books</h1><div id="host"></div></main><script type="module">
import {mountStickerBook} from './editor.js';
window.testMount=(owner='sodafom.sticker-books.v1:parent-A:11', mode='normal')=>{
window.editor?.destroy(); window.owner=owner;
const store=mode==='blocked'?{getItem:()=>null,setItem:()=>{throw Error('QuotaExceededError')}}:mode==='null'?null:localStorage;
window.editor=mountStickerBook(document.querySelector('#host'),{owner,store,ageGroup:'8-10'});
};window.testMount();window.ready=true;
</script></body></html>'''

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_): pass
    def do_GET(self):
        if self.path.startswith('/assets/'):
            self.send_response(200); self.send_header('Content-Type','image/png'); self.end_headers(); self.wfile.write(PIXEL)
        else: super().do_GET()

def main():
    with tempfile.TemporaryDirectory(prefix='sticker-check-') as temp:
        work=Path(temp)
        subprocess.run(['tsc','--strict','--target','ES2022','--module','ES2022','--moduleResolution','bundler','--lib','ES2022,DOM,DOM.Iterable','--outDir',str(work),str(SOURCE/'model.ts'),str(SOURCE/'editor.ts')],check=True)
        shutil.copy(SOURCE/'stickers.css',work/'stickers.css'); (work/'index.html').write_text(HTML)
        server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(work)))
        thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
        base=f'http://127.0.0.1:{server.server_port}'
        passed=[]
        def ok(name): passed.append(name); print(f'PASS {len(passed)}: {name}',flush=True)
        with sync_playwright() as p:
            executable=os.environ.get('CHROMIUM_EXECUTABLE') or shutil.which('chromium')
            browser=p.chromium.launch(headless=True,executable_path=executable,args=['--no-sandbox'])
            context=browser.new_context(viewport={'width':1280,'height':1100})
            page=context.new_page(); errors=[]; requests=[]
            page.on('pageerror',lambda error:errors.append(str(error)))
            page.on('request',lambda req:requests.append(req.url))
            page.on('dialog',lambda dialog:dialog.accept())
            page.goto(base);page.wait_for_function('window.ready===true')
            def data(): return page.evaluate('JSON.parse(localStorage.getItem(window.owner))')
            def placed(): return page.locator('[data-placed]')
            def active():
                d=data();return next(x for x in d['pages'] if x['id']==d['activePageId'])
            def drag_mouse(locator,x,y):
                locator.scroll_into_view_if_needed(); b=locator.bounding_box(); page.mouse.move(b['x']+b['width']/2,b['y']+b['height']/2);page.mouse.down();page.mouse.move(x,y,steps=10);page.mouse.up()
            expect(page.get_by_label('Add Archie sticker',exact=True)).to_be_visible()
            expect(page.get_by_label('Sticker category')).to_be_visible();ok('Editor mounts with labelled controls and approved catalogue IDs')
            page.get_by_label('Add Archie sticker',exact=True).click();expect(placed()).to_have_count(1);assert active()['stickers'][0]['stickerId']=='archie';ok('Tap/click adds exactly one sticker and autosaves')
            before=active()['stickers'][0].copy(); box=page.get_by_label('Sticker page canvas',exact=True).bounding_box()
            drag_mouse(placed().first,box['x']+box['width']*.25,box['y']+box['height']*.30)
            after=active()['stickers'][0];assert after['x']<before['x'] and after['y']<before['y'];ok('Mouse drag moves and saves the selected sticker')
            page.wait_for_timeout(320)
            box=page.get_by_label('Sticker page canvas',exact=True).bounding_box()
            drag_mouse(page.get_by_label('Add Bella sticker',exact=True),box['x']+box['width']*.7,box['y']+box['height']*.6)
            expect(placed()).to_have_count(2);assert active()['stickers'][1]['stickerId']=='bella';ok('Dragging from the palette adds exactly one sticker')
            page.wait_for_timeout(320)
            drag_mouse(page.get_by_label('Add Mia sticker',exact=True),5,5)
            expect(placed()).to_have_count(2);ok('Dropping a palette sticker outside the canvas does not add it')
            page.wait_for_timeout(320)
            item=placed().first;item.focus();x=active()['stickers'][0]['x'];item.press('ArrowRight');assert active()['stickers'][0]['x']==x+1
            placed().first.press('Shift+ArrowDown');placed().first.press('Delete');expect(placed()).to_have_count(1)
            page.get_by_role('button',name='Undo',exact=True).click();expect(placed()).to_have_count(2);ok('Keyboard movement, Delete and Undo work without dragging')
            placed().first.click();size=active()['stickers'][0]['size'];page.get_by_role('button',name='Bigger',exact=True).click();assert active()['stickers'][0]['size']==size+3
            page.get_by_role('button',name='Smaller',exact=True).click();assert active()['stickers'][0]['size']==size
            x=active()['stickers'][0]['x'];page.get_by_role('button',name='Move right',exact=True).click();assert active()['stickers'][0]['x']==x+3;ok('Accessible move and resize buttons update the selected sticker')
            page.get_by_label('Page theme',exact=True).select_option('animals')
            page.get_by_label('Sticker page name',exact=True).fill('My dinosaur story');page.get_by_label('Sticker page name',exact=True).press('Tab')
            saved=data();page.reload();page.wait_for_function('window.ready===true');assert data()==saved
            expect(page.get_by_label('Sticker page name',exact=True)).to_have_value('My dinosaur story');expect(placed()).to_have_count(2);ok('Title, theme and positions survive reload')
            first_id=data()['activePageId'];page.get_by_role('button',name='New page',exact=True).click();expect(placed()).to_have_count(0)
            page.get_by_label('Add Soda Bot sticker',exact=True).click();expect(placed()).to_have_count(1)
            page.get_by_label('Choose saved sticker page',exact=True).select_option(first_id);expect(placed()).to_have_count(2);ok('New pages and switching pages preserve each page independently')
            page.get_by_label('Sticker category',exact=True).select_option('animals');expect(page.locator('[data-catalogue]')).to_have_count(1)
            expect(page.get_by_label('Add Ziggy the dinosaur sticker',exact=True)).to_be_visible()
            page.get_by_label('Sticker category',exact=True).select_option('objects');expect(page.get_by_label('Add Soda Bot sticker',exact=True)).to_be_visible();ok('Animal and object categories use existing Ziggy and Soda artwork')
            page.get_by_role('button',name='Clear page',exact=True).click();expect(placed()).to_have_count(0)
            page.get_by_role('button',name='Undo',exact=True).click();expect(placed()).to_have_count(2)
            page.get_by_role('button',name='Delete page',exact=True).click();assert len(data()['pages'])==1
            page.get_by_role('button',name='Undo',exact=True).click();assert len(data()['pages'])==2;ok('Confirmed clear/delete operations can be undone')
            original=page.evaluate('localStorage.getItem(window.owner)');page.evaluate("window.testMount('sodafom.sticker-books.v1:parent-A:12')")
            expect(placed()).to_have_count(0);page.get_by_label('Add Archie sticker',exact=True).click()
            page.evaluate("window.testMount('sodafom.sticker-books.v1:parent-A:11')")
            assert page.evaluate('localStorage.getItem(window.owner)')==original;ok('Switching child namespaces cannot load or overwrite the other book')
            page.evaluate("window.testMount('sodafom.sticker-books.v1:blocked:1','blocked')")
            page.get_by_label('Add Archie sticker',exact=True).click();expect(page.get_by_role('status')).to_contain_text('Not saved:')
            assert page.evaluate('window.editor.hasUnsavedChanges()');expect(placed()).to_have_count(1);ok('Storage quota failure leaves the page editable with an honest unsaved warning')
            page.evaluate("localStorage.setItem('sodafom.sticker-books.v1:corrupt:1','{broken');window.testMount('sodafom.sticker-books.v1:corrupt:1')")
            page.get_by_label('Add Archie sticker',exact=True).click();assert page.evaluate('localStorage.getItem(window.owner)')=='{broken'
            expect(page.get_by_role('status')).to_contain_text('not saved');ok('Corrupt saves are not overwritten by editing')
            page.get_by_role('button',name='Start again',exact=True).click();assert data()['pages'][0]['stickers']==[];ok('Unreadable data is replaced only after explicit confirmed reset')
            page.get_by_label('Add Archie sticker',exact=True).click()
            page.evaluate("{const other=JSON.parse(localStorage.getItem(window.owner));other.pages[0].title='Other tab';localStorage.setItem(window.owner,JSON.stringify(other));}")
            page.get_by_label('Add Bella sticker',exact=True).click();expect(page.get_by_role('status')).to_contain_text('Another tab')
            assert data()['pages'][0]['title']=='Other tab';page.get_by_role('button',name='Reload saved pages',exact=True).click();expect(placed()).to_have_count(1);ok('Stale-tab saves are refused; confirmed reload restores the saved version')
            raw=page.evaluate('localStorage.getItem(window.owner)')
            page.locator('[data-placed]').first.dispatch_event('pointerdown',{'pointerId':99,'pointerType':'touch','isPrimary':True,'button':0,'clientX':300,'clientY':500})
            page.evaluate("window.dispatchEvent(new PointerEvent('pointermove',{pointerId:99,pointerType:'touch',isPrimary:true,clientX:360,clientY:550}))")
            page.evaluate("window.dispatchEvent(new PointerEvent('pointercancel',{pointerId:99,pointerType:'touch',isPrimary:true}))")
            assert page.evaluate('localStorage.getItem(window.owner)')==raw;ok('Cancelled pointer gestures do not save partial movements')
            page.get_by_label('Sticker page name',exact=True).fill('<img src=x onerror=alert(1)>');page.get_by_label('Sticker page name',exact=True).press('Tab')
            assert page.locator('img[src="x"]').count()==0;ok('Page names are treated as text, never HTML')
            page.locator('[data-placed] img').first.evaluate("img=>{img.src='/missing-sticker.png'}")
            expect(page.locator('.sb-image-error')).to_have_count(1);page.locator('[data-placed]').first.focus();page.get_by_role('button',name='Remove sticker',exact=True).click();expect(placed()).to_have_count(0);ok('Missing images have a text fallback and remain removable')
            page.emulate_media(reduced_motion='reduce');assert page.locator('.sb-editor button').first.evaluate("node=>getComputedStyle(node).transitionDuration")=='0s';ok('Reduced-motion preference disables button transitions')
            mobile=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,device_scale_factor=2)
            touch=mobile.new_page();touch.goto(base);touch.wait_for_function('window.ready===true')
            touch.get_by_label('Add Archie sticker',exact=True).tap();expect(touch.locator('[data-placed]')).to_have_count(1)
            touch.get_by_label('Sticker page canvas',exact=True).scroll_into_view_if_needed()
            b=touch.locator('[data-placed]').first.bounding_box();x=b['x']+b['width']/2;y=b['y']+b['height']/2
            cdp=mobile.new_cdp_session(touch)
            for typ,points in [('touchStart',[{'x':x,'y':y}]),('touchMove',[{'x':x+45,'y':y+30}]),('touchEnd',[])]:cdp.send('Input.dispatchTouchEvent',{'type':typ,'touchPoints':points})
            moved=touch.evaluate('JSON.parse(localStorage.getItem(window.owner)).pages[0].stickers[0]');assert moved['x']>40 and moved['y']>40
            assert touch.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
            ok('390px mobile emulation supports touch tap/drag with no horizontal overflow')
            page.evaluate('window.editor.destroy();window.editor.destroy()');expect(page.locator('.sb-editor')).to_have_count(0)
            page.evaluate("window.dispatchEvent(new PointerEvent('pointermove',{pointerId:99,clientX:200,clientY:200}))");assert not errors;ok('Cleanup is idempotent and removes pointer handlers without runtime errors')
            assert all(url.startswith(base) for url in requests);assert not any('/api/' in url for url in requests);ok('Editor makes no AI, payment, API or external requests')
            print(json.dumps({'passed':len(passed),'failed':0,'checks':passed,'scope':'isolated DOM editor; Chromium desktop + mobile emulation; artwork stubbed'},indent=2))
            browser.close()
        server.shutdown();server.server_close()

if __name__=='__main__': main()

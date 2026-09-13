#!/usr/bin/env python3
"""Offline, isolated layout regression tests, NOT a full-app device certification.

Requires Python 3.10+, Playwright's Python package and a Chromium executable.
Reads class strings from the modified TSX but does not mount React or Radix.
Uses baseline.css, a manually maintained subset of Tailwind 3.4 layout rules,
not the compiled production stylesheet. Header markup is a static replica of
its inspected layout. The gray SVG logo is synthetic test geometry, NOT artwork.
Animations, actual fonts, feature routes, focus traps and browser permissions
are outside this fixture's coverage. 200% means root font-size 32px, not zoom.

Run: python tests/device-compatibility/run.py --browser /usr/bin/chromium
Use --before to omit the fix stylesheet (failures are expected).
No requests reach production; all network traffic is blocked.
"""
from __future__ import annotations
import argparse
import html
import json
import re
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
SCENARIOS = ['dialog', 'sheet-left', 'sheet-right', 'sheet-top', 'sheet-bottom',
             'tabs', 'grid-tabs', 'buttons', 'header']


def classes(file: str, marker: str) -> str:
    """Exact class token match: sodafom-device-tab must not match *-tabs."""
    text = (ROOT / 'src/components/ui' / file).read_text()
    matches = [s for s in re.findall(r'"([^"\n]+)"', text) if marker in s.split()]
    if len(matches) != 1:
        raise ValueError(f'{file}: expected one class string containing {marker}')
    return matches[0]


def button(text: str, ident: str, size: str = 'h-10 px-4 py-2') -> str:
    return f'<button id="{ident}" class="{classes("button.tsx", "sodafom-device-button")} {size}"><span>{html.escape(text)}</span></button>'


def fixture(scenario: str) -> str:
    if scenario == 'dialog' or scenario.startswith('sheet-'):
        dialog = scenario == 'dialog'
        file = 'dialog.tsx' if dialog else 'sheet.tsx'
        marker = 'sodafom-device-dialog' if dialog else 'sodafom-device-sheet'
        content_class = classes(file, marker)
        if not dialog:
            side = scenario.split('-')[1]
            extras = {'left': 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
                      'right': 'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
                      'top': 'inset-x-0 top-0 border-b',
                      'bottom': 'inset-x-0 bottom-0 border-t'}
            content_class += ' ' + extras[side]
        paras = ''.join(f'<p>Step {i}: Please choose an activity and read the instructions with a grown-up. Long labels must stay readable.</p>' for i in range(1, 19))
        footer = button('Save these learning preferences', 'action') + button('Return to my activities', 'cancel')
        return (f'<section id="overlay" class="{content_class}">'
                f'<div id="heading" class="{classes(file, "sodafom-device-overlay-header")}">'
                '<h2 class="text-lg font-semibold">Choose your learning activities together</h2></div>'
                f'<div>{paras}</div><div class="{classes(file, "sodafom-device-overlay-footer")}">{footer}</div>'
                f'<button id="close" aria-label="Close" class="{classes(file, "sodafom-device-close")}">'
                '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 3L13 13M13 3L3 13" stroke="currentColor"/></svg></button></section>')
    if scenario in ['tabs', 'grid-tabs']:
        labels = ['Today’s learning', 'Reading and homework', 'Achievements and certificates', 'Games and activities', 'My progress', 'Help and support']
        list_class = classes('tabs.tsx', 'sodafom-device-tabs')
        if scenario == 'grid-tabs':
            list_class = list_class.replace('inline-flex', 'grid') + ' grid-cols-3 w-full'
        tab_class = classes('tabs.tsx', 'sodafom-device-tab')
        tabs = ''.join(f'<button role="tab" class="{tab_class}"><span>{html.escape(s)}</span></button>' for s in labels)
        return f'<main class="p-4"><div id="tabs" role="tablist" class="{list_class}">{tabs}</div></main>'
    if scenario == 'buttons':
        return '<main class="p-4 flex flex-col gap-4">' + ''.join([
            button('Continue to your next learning activity', 'normal'),
            button('Save my homework and reading progress', 'small', 'h-9 px-3'),
            button('Show all my achievements and certificates', 'large', 'h-11 px-4 py-2'),
            button('?', 'icon', 'h-10 w-10'),
            button('Custom activity artwork area', 'custom', 'h-24 px-4'),
        ]) + '</main>'
    # This mirrors Header's relevant nesting/classes, not its state or hooks.
    links = ['Home', '1-to-1 Tutor', 'Games', 'Cartoons', 'Daily Challenge', 'Leaderboard', 'Blog', 'Pricing', 'Hub']
    desktop = ''.join(f'<a href="#" class="px-3 py-2 text-sm font-bold">{s}</a>' for s in links)
    desktop += ''.join(f'<button class="px-3 py-2 text-sm">{s}</button>' for s in ['Search', 'Ask Archie', 'Free Trial', 'Sign In', 'Sign Up'])
    mobile = ''.join(f'<a href="#" class="px-4 py-3 text-base font-bold">{s}</a>' for s in links)
    mobile += ''.join(f'<button class="px-4 py-3 text-base">{s}</button>' for s in ['Search games &amp; pages', 'Ask Archie', 'Start Free Trial'])
    mobile += '<div class="flex gap-2 mt-2">' + ''.join(f'<button id="account-{i}" class="flex-1 px-4 py-3 text-base">{s}</button>' for i, s in enumerate(['Star Bank', 'My Profile', 'Sign Out'])) + '</div>'
    logo = '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="100"><rect width="480" height="100" fill="gray"/></svg>'
    from urllib.parse import quote
    return f'''<div class="sodafom-device-shell"><header class="sticky top-0 z-50 bg-primary">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div id="header-row" class="flex items-center justify-between h-16 md:h-20 gap-3">
       <a id="logo" href="#" class="shrink-0 flex items-center min-w-0"><img alt="Synthetic logo geometry" src="data:image/svg+xml,{quote(logo)}" class="block h-auto max-h-10 md:max-h-14 w-auto max-w-full object-contain self-center"></a>
       <nav aria-label="Main navigation" class="hidden md:flex items-center gap-1 ml-auto">{desktop}</nav>
       <div id="tools" class="md:hidden flex items-center gap-2 ml-auto"><button aria-label="Search" class="p-2"><svg width="20" height="20"></svg></button><a href="#" aria-label="Cart" class="p-2"><svg width="20" height="20"></svg></a><button aria-label="Menu" class="p-2"><svg width="24" height="24"></svg></button></div>
      </div></div><div id="mobile-panel" class="md:hidden overflow-hidden bg-primary/95"><nav aria-label="Mobile navigation" class="px-4 py-4 flex flex-col gap-2">{mobile}</nav></div>
    </header><main class="p-4">Static header layout test, not the production app.</main></div>'''


CHECKS = r'''({scenario, touch, font, safe}) => {
 const failures=[], W=innerWidth, H=innerHeight, eps=2;
 const check=(ok,msg)=>{if(!ok)failures.push(msg)};
 const box=e=>e.getBoundingClientRect();
 const visible=e=>e && box(e).width>0 && box(e).height>0 && getComputedStyle(e).visibility!=='hidden';
 const inside=(r,b)=>r.left>=b.left-eps&&r.right<=b.right+eps&&r.top>=b.top-eps&&r.bottom<=b.bottom+eps;
 const viewport={left:0,right:W,top:0,bottom:H};
 const overlap=(a,b)=>a.left<b.right-1&&a.right>b.left+1&&a.top<b.bottom-1&&a.bottom>b.top+1;
 const reachable=e=>{
  e.scrollIntoView({block:'nearest',inline:'nearest'});
  const r=box(e),x=Math.max(1,Math.min(W-1,(r.left+r.right)/2)),y=Math.max(1,Math.min(H-1,(r.top+r.bottom)/2));
  const hit=document.elementFromPoint(x,y);
  return inside(r,viewport) && !!hit && (hit===e||e.contains(hit));
 };
 check(document.documentElement.scrollWidth<=W+eps,'document horizontal overflow');
 if(scenario==='dialog'||scenario.startsWith('sheet-')){
  const e=document.querySelector('#overlay'),c=document.querySelector('#close');
  const r=box(e),cr=box(c);
  check(inside(r,viewport),'overlay outside viewport');
  check(e.scrollWidth<=e.clientWidth+eps,'overlay content horizontal overflow');
  check(cr.width>=48-eps&&cr.height>=48-eps,'close target below 48px');
  check(inside(cr,viewport),'initial close not on screen');
  const h=document.querySelector('#heading h2');
  check(!overlap(box(h),cr),'title overlaps close');
  if(scenario==='dialog'){
   check(r.left>=safe.left+font-eps&&r.right<=W-safe.right-font+eps,'dialog horizontal safe gutter');
   check(r.top>=safe.top+font-eps&&r.bottom<=H-safe.bottom-font+eps,'dialog vertical safe gutter');
  } else {
   check(cr.right<=W-safe.right+eps && cr.top>=safe.top-eps,'sheet close safe inset');
   if(scenario.endsWith('left')||scenario.endsWith('right')){
    const expected=W>=640?Math.min(W*.75,24*font):W*.75;
    check(Math.abs(r.width-expected)<=eps,'caller sheet width cap changed');
   }
  }
  for(const id of ['action','cancel']){
   const a=document.getElementById(id);
   check(reachable(a),'cannot reach '+id+' after scrolling');
   check(a.scrollWidth<=a.clientWidth+eps,'clipped action text');
  }
 } else if(scenario==='tabs'||scenario==='grid-tabs'){
  const list=document.querySelector('#tabs'), lr=box(list), tabs=[...list.querySelectorAll('button')];
  check(lr.left>=-eps&&lr.right<=W+eps,'tab list off-screen');
  const rects=tabs.map(box);
  tabs.forEach((e,i)=>{
   check(inside(rects[i],lr),'tab outside list '+i);
   check(e.scrollWidth<=e.clientWidth+eps&&e.scrollHeight<=e.clientHeight+eps,'clipped tab '+i);
   if(touch||W<=640)check(rects[i].width>=48-eps&&rects[i].height>=48-eps,'small tab target '+i);
   for(let j=0;j<i;j++)check(!overlap(rects[i],rects[j]),'tab overlap');
  });
 } else if(scenario==='buttons'){
  for(const id of ['normal','small','large','icon','custom']){
   const e=document.getElementById(id),r=box(e);
   check(r.left>=-eps&&r.right<=W+eps,'button off-screen '+id);
   check(e.scrollWidth<=e.clientWidth+eps&&e.scrollHeight<=e.clientHeight+eps,'clipped button '+id);
   if(id!=='custom'&&(touch||W<=640))check(r.height>=48-eps&&r.width>=48-eps,'small button target '+id);
   check(reachable(e),'button cannot be reached '+id);
  }
  check(Math.abs(box(document.getElementById('custom')).height-6*font)<=eps,'custom height changed');
 } else {
  const desktop=document.querySelector('nav[aria-label="Main navigation"]'),tools=document.querySelector('#tools');
  const panel=document.querySelector('#mobile-panel'),row=document.querySelector('#header-row'),logo=document.querySelector('#logo');
  const mobile=W<1280||H<=500;
  check(visible(desktop)!==mobile,'wrong desktop navigation breakpoint');
  check(visible(tools)===mobile&&visible(panel)===mobile,'mobile controls/menu unavailable');
  const peer=mobile?tools:desktop;
  check(!overlap(box(logo),box(peer)),'logo overlaps navigation');
  check(box(row).left>=safe.left-eps&&box(row).right<=W-safe.right+eps,'header outside safe area');
  for(const e of peer.querySelectorAll('button,a')){
   const r=box(e);
   check(r.left>=safe.left-eps&&r.right<=W-safe.right+eps,'navigation control off-screen');
   if(touch||W<=640)check(r.width>=48-eps&&r.height>=48-eps,'navigation target below 48px');
  }
  if(mobile){
   check(inside(box(panel),viewport),'mobile menu panel off-screen');
   const last=document.getElementById('account-2');
   check(reachable(last),'last menu action not reachable');
   const items=[...document.querySelectorAll('nav[aria-label="Mobile navigation"] > div.flex > *')].map(box);
   for(let i=0;i<items.length;i++)for(let j=0;j<i;j++)check(!overlap(items[i],items[j]),'account actions overlap');
  }
 }
 return failures;
}'''


def configurations() -> list[dict]:
    result = []
    for category, sizes in [('phone', [(320,568),(360,640),(375,667),(390,844),(393,851),(412,915),(430,932)]),
                            ('tablet', [(600,960),(768,1024),(800,1280),(820,1180),(834,1194),(1024,1366)])]:
        for w,h in sizes:
            for x,y,orientation in [(w,h,'portrait'),(h,w,'landscape')]:
                result.append(dict(name=f'{category}-{x}x{y}-{orientation}',w=x,h=y,touch=True))
    for w,h in [(1024,768),(1279,800),(1280,800),(1280,720),(1366,768),(1440,900),(1536,864),(1920,1080),(2560,1440),(320,800)]:
        result.append(dict(name=f'desktop-{w}x{h}',w=w,h=h,touch=False))
    result.append(dict(name='short-viewport-667x280',w=667,h=280,touch=True))
    return result


def run(args: argparse.Namespace) -> int:
    baseline = (HERE/'baseline.css').read_text()
    patch = '' if args.before else (ROOT/'src/styles/device-compatibility.css').read_text()
    configs = configurations()
    if args.quick:
        configs = [configs[i] for i in [0,1,14,28,36]]
    cases = [(c,s,font,dict(top=0,right=0,bottom=0,left=0)) for c in configs for font in [16,32] for s in SCENARIOS]
    if not args.quick:
        for w,h in [(393,851),(851,393)]:
            c=dict(name=f'synthetic-insets-{w}x{h}',w=w,h=h,touch=True)
            cases.extend((c,s,16,dict(top=24,right=20,bottom=34,left=44)) for s in SCENARIOS[:5]+['header'])
    args.output.mkdir(parents=True,exist_ok=True)
    results=[]
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path=str(args.browser),headless=True,args=['--no-sandbox'])
        version=browser.version
        context=None; key=None
        for c,s,font,safe in cases:
            next_key=(c['w'],c['h'],c['touch'])
            if next_key != key:
                if context: context.close()
                context=browser.new_context(viewport={'width':c['w'],'height':c['h']},has_touch=c['touch'],is_mobile=c['touch'],device_scale_factor=2 if c['touch'] else 1)
                context.route('**/*',lambda route: route.abort())
                page=context.new_page();key=next_key
            safe_css=':root{'+''.join(f'--sodafom-safe-{side}:{value}px;' for side,value in safe.items())+'}'
            doc=f'<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>{baseline}\n{patch}\nhtml{{font-size:{font}px}}\n{safe_css}</style>{fixture(s)}'
            page.set_content(doc,wait_until='load')
            page.evaluate('window.scrollTo(0, 0)')
            failures=page.evaluate(CHECKS,dict(scenario=s,touch=c['touch'],font=font,safe=safe))
            result=dict(configuration=c['name'],width=c['w'],height=c['h'],touch=c['touch'],root_font_px=font,scenario=s,synthetic_safe_insets=safe,passed=not failures,failures=failures)
            results.append(result)
            selected=(c['name'],s,font) in [('phone-390x844-portrait','tabs',16),('tablet-768x1024-portrait','header',16),('phone-568x320-landscape','dialog',16)]
            if selected or (failures and sum(not r['passed'] for r in results)<=8):
                page.screenshot(path=str(args.output/f'{c["name"]}-{s}-{font}px.png'),full_page=False)
        browser.close()
    output=dict(scope='Isolated static CSS fixtures; not full production CSS, live routes, React/Radix, genuine Safari/Firefox, physical devices or artwork rendering.',browser=f'Chromium {version}',before=args.before,screen_configurations=len(configs),cases=len(results),passed=sum(r['passed'] for r in results),failed=sum(not r['passed'] for r in results),results=results)
    (args.output/'results.json').write_text(json.dumps(output,indent=2))
    print(json.dumps({k:v for k,v in output.items() if k!='results'},indent=2))
    for r in results:
        if not r['passed']:
            print(r['configuration'],r['root_font_px'],r['scenario'],r['failures'])
    return int(output['failed']>0)


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--browser',type=Path,default=Path('/usr/bin/chromium'))
    parser.add_argument('--output',type=Path,default=Path('/tmp/agent25-device-layout-results'))
    parser.add_argument('--before',action='store_true')
    parser.add_argument('--quick',action='store_true')
    opts=parser.parse_args()
    if not opts.browser.is_file(): parser.error(f'Chromium executable not found: {opts.browser}')
    raise SystemExit(run(opts))

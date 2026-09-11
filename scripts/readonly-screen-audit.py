"""Anonymous public-screen QA. Blocks all network writes; never uses real accounts.
A route loading is NOT proof that its lesson, microphone, AI or payment works.
Run: python scripts/readonly-screen-audit.py (requires Playwright + Chromium).
"""
import asyncio
import json
import os
import re
from pathlib import Path
from urllib.parse import urlsplit
from playwright.async_api import async_playwright

BASE = os.environ.get('SODAFOM_QA_URL', 'https://sodafomuk-production-3f3a.up.railway.app').rstrip('/')
if urlsplit(BASE).hostname not in {'sodafomuk-production-3f3a.up.railway.app', 'localhost', '127.0.0.1'}:
    raise SystemExit('Refusing an unapproved audit host.')
OUT = Path('qa-screen-results')
OUT.mkdir(exist_ok=True)
SCREENS = ['/', '/stories', '/reading', '/lessons', '/lesson-library', '/game-islands', '/games', '/homework-helper', '/homework-tools', '/museum', '/archie-theatre', '/cartoons', '/birthday', '/sodafom-settings', '/archie-friends']
SIZES = [('phone-small', 320, 568), ('phone', 390, 844), ('phone-landscape', 844, 390), ('tablet', 768, 1024), ('laptop', 1366, 768)]
MEASURE = r'''() => {
 const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden';};
 const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
 const buttons=[...document.querySelectorAll('button,a[href],[role="button"]')].filter(visible).map(e=>{
  const r=e.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
  const inView=x>=0&&y>=0&&x<innerWidth&&y<innerHeight,top=inView?document.elementFromPoint(x,y):null;
  return {label:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,100),href:e.getAttribute('href'),...rect(e),disabled:!!e.disabled,small:r.width<44||r.height<44,inView,covered:inView&&!!top&&top!==e&&!e.contains(top)};
 });
 const images=[...document.images].filter(visible).map(e=>{
  const r=e.getBoundingClientRect(),s=getComputedStyle(e),natural=e.naturalWidth/e.naturalHeight;
  const decorative=e.getAttribute('aria-hidden')==='true'||e.alt==='';
  return {src:new URL(e.currentSrc||e.src,location.href).pathname,...rect(e),loaded:e.complete&&e.naturalWidth>0,fit:s.objectFit,decorative,stretched:!decorative&&s.objectFit==='fill'&&Number.isFinite(natural)&&Math.abs(r.width/r.height/natural-1)>.03,cropReview:!decorative&&s.objectFit==='cover'&&Number.isFinite(natural)&&Math.abs(r.width/r.height/natural-1)>.03};
 });
 return {horizontalOverflow:document.documentElement.scrollWidth>innerWidth+2,pageHeight:document.documentElement.scrollHeight,viewportHeight:innerHeight,buttons,images,technicalError:/Unexpected Application Error|404 Not Found|Cannot GET/.test(document.body.innerText),mainCount:document.querySelectorAll('main').length};
}'''

async def main():
    report={'base':BASE,'sourceCommit':os.environ.get('GITHUB_SHA','local'),'scope':'Anonymous public pages only; all network writes blocked. No authenticated, AI, checkout or real-device certification.','screens':[],'gameRoutes':[],'navigation':[]}
    routes=Path('src/routes.tsx')
    games=sorted(set(re.findall(r"path:\s*['\"](/games/[^'\":?]+)['\"]",routes.read_text()))) if routes.exists() else []
    async with async_playwright() as p:
        browser=await p.chromium.launch()
        context=await browser.new_context(service_workers='block',reduced_motion='reduce')
        async def readonly(route):
            if route.request.method not in ('GET','HEAD','OPTIONS'):
                await route.abort()
            else:
                await route.continue_()
        await context.route('**/*',readonly)
        page=await context.new_page()
        failures=[]
        page.on('pageerror',lambda error:failures.append(str(error)[:400]))
        try:
            await page.goto(BASE,wait_until='domcontentloaded',timeout=30000)
        except Exception as exc:
            report['blocked']=str(exc)[:400]
            (OUT/'report.json').write_text(json.dumps(report,indent=2))
            print('AUDIT_BLOCKED',report['blocked'],flush=True)
            await browser.close()
            raise SystemExit(2)
        for label,w,h in SIZES:
            await page.set_viewport_size({'width':w,'height':h})
            for path in SCREENS:
                row={'path':path,'viewport':label}
                failures.clear()
                try:
                    response=await page.goto(BASE+path,wait_until='domcontentloaded',timeout=15000)
                    await page.wait_for_timeout(1200)
                    final=urlsplit(page.url).path
                    if re.search(r'/(admin|parent|hub|auth|login|sign-in|signup|checkout|subscribe)',final):
                        row.update({'status':'private-or-auth-redirect','finalPath':final})
                    else:
                        row.update(await page.evaluate(MEASURE))
                        row.update({'http':response.status if response else None,'finalPath':final,'pageErrors':list(failures)})
                        name=(path.strip('/').replace('/','_') or 'home')+'-'+label+'.png'
                        await page.screenshot(path=str(OUT/name),full_page=False)
                        row['screenshot']=name
                except Exception as exc:
                    row['error']=str(exc)[:400]
                report['screens'].append(row)
                print('SCREEN',label,path,json.dumps({k:v for k,v in row.items() if k in ('http','status','error','horizontalOverflow','technicalError')}),flush=True)
        await page.set_viewport_size({'width':390,'height':844})
        for path in games:
            row={'path':path}
            try:
                response=await page.goto(BASE+path,wait_until='domcontentloaded',timeout=15000)
                await page.wait_for_timeout(500)
                text=await page.locator('body').inner_text()
                row.update({'http':response.status if response else None,'technicalError':bool(re.search(r'Unexpected Application Error|404 Not Found|Cannot GET',text))})
            except Exception as exc:
                row['error']=str(exc)[:400]
            report['gameRoutes'].append(row)
            print('GAME_ROUTE',json.dumps(row),flush=True)
        await page.set_viewport_size({'width':1366,'height':768})
        for name in ["Open Archie's Stories","Open Archie's Lessons",'Ask Archie','Open Game Islands','Open Homework Helper','Open Museum Explorer','Open Archie Theatre','Open Birthday and Parties','Open Settings','Meet Archie and Friends','Open School Trip Adventure']:
            row={'button':name}
            try:
                await page.goto(BASE,wait_until='domcontentloaded',timeout=15000)
                button=page.get_by_role('button',name=name,exact=True)
                await button.wait_for(timeout=5000)
                await button.click(timeout=5000)
                await page.wait_for_timeout(1800)
                row['finalPath']=urlsplit(page.url).path
                row['changedRoute']=row['finalPath']!='/'
            except Exception as exc:
                row['error']=str(exc)[:400]
            report['navigation'].append(row)
            print('NAVIGATION',json.dumps(row),flush=True)
        await browser.close()
    report['summary']={
        'screenChecks':len(report['screens']),
        'screenErrors':sum('error'in r for r in report['screens']),
        'horizontalOverflows':sum(bool(r.get('horizontalOverflow'))for r in report['screens']),
        'stretchedImageOccurrences':sum(sum(bool(i['stretched'])for i in r.get('images',[]))for r in report['screens']),
        'smallControlOccurrences':sum(sum(bool(i['small'])for i in r.get('buttons',[]))for r in report['screens']),
        'gameRouteChecks':len(report['gameRoutes']),
        'gameRouteErrors':sum(bool(r.get('error'))or bool(r.get('technicalError'))or (r.get('http')or 200)>=400 for r in report['gameRoutes']),
        'navigationChecks':len(report['navigation']),
        'navigationFailures':sum(not r.get('changedRoute',False)for r in report['navigation'])}
    (OUT/'report.json').write_text(json.dumps(report,indent=2))
    print('AUDIT_SUMMARY',json.dumps(report['summary']),flush=True)
    # Green means the audit ran; it does not mean all findings passed.

if __name__=='__main__':
    asyncio.run(main())

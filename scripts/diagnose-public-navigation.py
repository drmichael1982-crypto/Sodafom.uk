"""Read-only follow-up: distinguish an app routing fault from a pathname-only test fault."""
import asyncio
import json
from pathlib import Path
from urllib.parse import urlsplit
from playwright.async_api import async_playwright

BASE = 'https://sodafomuk-production-3f3a.up.railway.app'
OUT = Path('qa-navigation-results')
OUT.mkdir(exist_ok=True)
PROBE = r'''() => ({
 path:location.pathname,hash:location.hash,title:document.title,ready:document.readyState,
 capacitorPresent:!!window.Capacitor,
 capacitorNative:typeof window.Capacitor?.isNativePlatform==='function'?window.Capacitor.isNativePlatform():null,
 capacitorPlatform:typeof window.Capacitor?.getPlatform==='function'?window.Capacitor.getPlatform():null,
 appStarted:!!window._APP_START_TIME,
 foregroundImages:[...document.images].filter(x=>x.alt&&x.getAttribute('aria-hidden')!=='true').map(x=>({src:new URL(x.src,location.href).pathname,loaded:x.complete&&x.naturalWidth>0})),
 buttons:[...document.querySelectorAll('button')].map(x=>(x.getAttribute('aria-label')||x.textContent||'').trim()).slice(0,24),
 bodyExcerpt:document.body.innerText.slice(0,600)
})'''

async def main():
 report={'scope':'Anonymous public routes only; all non-read requests blocked. No microphone, account or payment test.','probes':[],'clicks':[]}
 async with async_playwright() as p:
  browser=await p.chromium.launch()
  context=await browser.new_context(service_workers='block',reduced_motion='reduce',viewport={'width':390,'height':844})
  async def readonly(route):
   if route.request.method not in ('GET','HEAD','OPTIONS'):await route.abort()
   else:await route.continue_()
  await context.route('**/*',readonly)
  page=await context.new_page()
  errors=[]
  network=[]
  page.on('pageerror',lambda e:errors.append(str(e)[:800]))
  page.on('requestfailed',lambda r:network.append({'path':urlsplit(r.url).path,'type':r.resource_type,'method':r.method,'failure':r.failure}))
  async def decline():
   b=page.get_by_role('button',name='Decline',exact=True)
   if await b.count() and await b.is_visible():
    await b.click()
    await page.wait_for_timeout(300)
  for target in ['/', '/lessons', '/reading', '/game-islands', '/games/number-pop', '/museum', '/#/lessons', '/#/reading', '/#/games/number-pop']:
   errors.clear();network.clear()
   row={'requested':target}
   try:
    response=await page.goto(BASE+target,wait_until='load',timeout=30000)
    await page.wait_for_timeout(2500)
    await decline()
    row.update(await page.evaluate(PROBE))
    row.update({'http':response.status if response else None,'pageErrors':list(errors),'failedReads':[e for e in network if e['method']=='GET'][:12]})
    await page.screenshot(path=str(OUT/(target.strip('/').replace('/','_').replace('#','hash') or 'home'))+'.png')
   except Exception as e:row['error']=str(e)[:800]
   print('PROBE',json.dumps(row),flush=True)
   report['probes'].append(row)
  for name,expected in [("Open Archie's Stories",'/stories'),("Open Archie's Lessons",'/lessons'),('Open School Trip Adventure','/museum'),('Open Game Islands','/game-islands')]:
   row={'button':name,'expected':expected}
   errors.clear();network.clear()
   try:
    await page.goto(BASE,wait_until='load',timeout=30000)
    await page.wait_for_timeout(2500)
    await decline()
    await page.get_by_role('button',name=name,exact=True).click(timeout=5000)
    await page.wait_for_timeout(3000)
    row.update(await page.evaluate(PROBE))
    effective=urlsplit(row['hash'][1:]).path if row['hash'].startswith('#/') else row['path']
    row.update({'effectivePath':effective,'passed':effective==expected,'pageErrors':list(errors),'failedReads':[e for e in network if e['method']=='GET'][:12]})
   except Exception as e:row['error']=str(e)[:800]
   print('CLICK',json.dumps(row),flush=True)
   report['clicks'].append(row)
  await browser.close()
 (OUT/'navigation.json').write_text(json.dumps(report,indent=2))
 print('NAV_DIAGNOSTIC_SUMMARY',json.dumps({'checks':len(report['clicks']),'passed':sum(r.get('passed',False) for r in report['clicks'])}),flush=True)

if __name__=='__main__':asyncio.run(main())

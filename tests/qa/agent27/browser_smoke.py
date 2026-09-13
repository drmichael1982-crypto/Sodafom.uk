"""Offline Chromium route smoke checks, not a live-service/device certification.

Requires Python Playwright and Chromium. No outgoing request is allowed: every
request is fulfilled from dist/client, answered by an explicit unauthenticated
API fixture, or aborted. This script does NOT start or contact the backend.
Run from repo root with: python tests/qa/agent27/browser_smoke.py --dist dist/client
"""
from __future__ import annotations
import argparse, asyncio, json, mimetypes, re, shutil
from pathlib import Path
from urllib.parse import urlsplit, unquote
from playwright.async_api import async_playwright
BASE = 'https://qa.sodafom.invalid'

def route_paths() -> list[str]:
    routes = re.findall(r"\bpath:\s*['\"]([^'\"]+)['\"]", Path('src/routes.tsx').read_text())
    return [re.sub(r':[^/]+', 'qa-example', r) for r in routes if r != '*']

async def install_offline_routing(context, dist: Path, log: list[dict], auth=None):
    """No continue_ / fallback / fetch calls: zero real network access."""
    async def handle(route):
        req = route.request
        u = urlsplit(req.url)
        path = unquote(u.path)
        headers = {'access-control-allow-origin': BASE,
                   'access-control-allow-credentials': 'true',
                   'access-control-allow-headers': '*',
                   'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
                   'cache-control': 'no-store'}
        if req.method == 'OPTIONS':
            await route.fulfill(status=204, headers=headers); return
        if '/api/' in path or path == '/api':
            log.append({'method': req.method, 'path': path, 'query': u.query})
            if path.endswith('/auth/get-session'):
                await route.fulfill(status=200, content_type='application/json',
                                    body=json.dumps(auth), headers=headers)
            else:
                await route.fulfill(status=503, content_type='application/json',
                                    body=json.dumps({'error': 'Offline QA: external service unavailable',
                                                     'message': 'Offline QA: external service unavailable'}), headers=headers)
            return
        if u.scheme in ('data', 'blob'):
            await route.abort(); return
        if u.netloc == urlsplit(BASE).netloc:
            file = (dist / path.lstrip('/')).resolve()
            if file.is_relative_to(dist) and file.is_file():
                await route.fulfill(path=str(file), content_type=mimetypes.guess_type(file.name)[0] or 'application/octet-stream'); return
            if req.resource_type == 'document':
                await route.fulfill(path=str(dist / 'index.html'), content_type='text/html'); return
            log.append({'method': req.method, 'path': path, 'missing_local_asset': True})
            await route.fulfill(status=404, body='Offline QA: missing local asset'); return
        log.append({'method': req.method, 'host': u.netloc, 'external_blocked': True, 'type': req.resource_type})
        await route.abort('blockedbyclient')
    await context.route('**/*', handle)

async def main(args):
    dist = Path(args.dist).resolve()
    if not (dist/'index.html').exists(): raise SystemExit('Build dist/client first or extract its QA artifact.')
    output = Path(args.out); output.mkdir(parents=True, exist_ok=True)
    paths = args.paths.split(',') if args.paths else route_paths()
    all_results = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(executable_path=args.chromium or shutil.which('chromium'), headless=True,
                                          args=['--no-sandbox', '--disable-background-networking'])
        version = browser.version
        for label,width,height in [('desktop',1366,900),('mobile-emulation',390,844)]:
            for start in range(0,len(paths),4):
                async def check(path):
                    context = await browser.new_context(viewport={'width':width,'height':height},
                                                        is_mobile=label!='desktop', has_touch=label!='desktop',
                                                        service_workers='block')
                    requests, errors = [], []
                    await install_offline_routing(context,dist,requests)
                    page = await context.new_page()
                    page.on('pageerror', lambda e: errors.append(str(e)))
                    result = {'viewport':label,'path':path}
                    try:
                        await page.goto(BASE+path,wait_until='domcontentloaded', timeout=20000)
                        await page.wait_for_timeout(args.settle_ms)
                        state = await page.evaluate('''() => ({
                          title: document.title,
                          text: (document.body.innerText || '').slice(0,1600),
                          controls: document.querySelectorAll('button,a,input,select,textarea').length,
                          images: document.querySelectorAll('img').length,
                          appNodes: document.querySelector('#app')?.childElementCount || 0,
                          width: document.documentElement.scrollWidth,
                          viewport: innerWidth,
                          recovery: !!document.getElementById('sodafom-critical-error'),
                        })''')
                        result.update(state)
                        result['finalPath'] = urlsplit(page.url).path
                        result['pageErrors'] = errors
                        result['missingAssets'] = [r['path'] for r in requests if r.get('missing_local_asset')]
                        result['apiRequests'] = [r for r in requests if 'query' in r]
                        result['externalRequestsBlocked'] = sum(bool(r.get('external_blocked')) for r in requests)
                        recovery_words = re.search(r'(Something went wrong|Sodafom Critical Error|Sodafom could not start|Unexpected Application Error)',state['text'],re.I)
                        result['renderStatus'] = 'FAIL' if errors or state['recovery'] or recovery_words or not state['appNodes'] else 'RENDERED'
                        result['horizontalOverflow'] = state['width'] > state['viewport'] + 2
                    except Exception as exc:
                        result.update(renderStatus='BLOCKED',error=str(exc),pageErrors=errors)
                    if result['renderStatus']!='RENDERED' or path in ['/','/hub/login','/homework-tools']:
                        name = re.sub(r'[^\w-]','_',path)[:75]
                        try: await page.screenshot(path=str(output/f'{label}-{name}.png'),full_page=False)
                        except Exception: pass
                    await context.close()
                    return result
                batch=await asyncio.gather(*(check(p) for p in paths[start:start+4]))
                all_results.extend(batch)
                (output/'routes.json').write_text(json.dumps({'browser':version,'mode':'offline unauthenticated API fixture',
                  'networkPolicy':'All requests fulfilled or aborted; no network pass-through', 'results':all_results},indent=2))
                print(label, start+len(batch),'/',len(paths), 'failures',sum(r['renderStatus']!='RENDERED' for r in all_results),flush=True)
        await browser.close()
    print(json.dumps({'checks':len(all_results),'rendered':sum(r['renderStatus']=='RENDERED' for r in all_results),
                      'failed':[{'viewport':r['viewport'],'path':r['path'],'status':r['renderStatus'],'errors':r.get('pageErrors')} for r in all_results if r['renderStatus']!='RENDERED']},indent=2))

    if any(r['renderStatus'] != 'RENDERED' for r in all_results):
        raise SystemExit(1)

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dist',default='dist/client');parser.add_argument('--out',default='qa-output/browser')
    parser.add_argument('--paths',help='Optional comma-separated subset');parser.add_argument('--chromium')
    parser.add_argument('--settle-ms',type=int,default=1000)
    asyncio.run(main(parser.parse_args()))

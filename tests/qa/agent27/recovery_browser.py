"""In-memory recovery-component regression, not whole-app browser certification.
Run from repository root after dependency installation:
  python tests/qa/agent27/recovery_browser.py
Requires Python Playwright, Chromium, Node and the project's TypeScript.
All browser requests are blocked; no URL navigation or live data is used.
"""
import argparse
import json
from pathlib import Path
import shutil
import subprocess
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--out', default='qa-output/recovery-browser.json')
parser.add_argument('--chromium', default=shutil.which('chromium'))
args = parser.parse_args()
compiler = """
const ts=require('typescript'),fs=require('fs');
process.stdout.write(ts.transpileModule(fs.readFileSync('src/lib/critical-error-display.ts','utf8'),
 {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText);
"""
js = subprocess.run(['node', '-e', compiler], check=True, text=True, capture_output=True).stdout
results = []
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=args.chromium, headless=True, args=['--no-sandbox'])
    version = browser.version
    for name, width, height in [('desktop', 1366, 900), ('phone-emulation', 390, 844)]:
        context = browser.new_context(viewport={'width': width, 'height': height}, service_workers='block')
        context.route('**/*', lambda route: route.abort())
        page = context.new_page()
        page.set_content('<main id="app">Original app content</main>')
        page.add_script_tag(type='module', content=js + '\nwindow.showCriticalError=showCriticalError;')
        page.wait_for_function('!!window.showCriticalError')
        checks = page.evaluate('''() => {
          window.reloads=0;
          const payload='<img src="x" onerror="window.qaInjected=true"><script>window.qaInjected=true</script>';
          const render=message=>showCriticalError(document,()=>{window.reloads++},
            {message,url:payload,line:0,column:0,error:{stack:payload}});
          render(payload);
          const inert=document.querySelector('#sodafom-critical-error pre').textContent.includes(payload)
            && !document.querySelector('#sodafom-critical-error img');
          for(let i=0;i<100;i++) render('Error '+i);
          const onePanel=document.querySelectorAll('#sodafom-critical-error').length===1;
          const latest=document.querySelector('#sodafom-critical-error pre').textContent.startsWith('Error 99');
          document.querySelector('#sodafom-critical-error button').click();
          return {inert,onePanel,latest,clickReloadsOnce:window.reloads===1,
            appPreserved:document.getElementById('app').textContent==='Original app content',
            noInjectedCode:!window.qaInjected};
        }''')
        results.append({'viewport': name, 'checks': checks})
        context.close()
    browser.close()
report = {'browser': 'Chromium ' + version, 'mode': 'in-memory recovery component only', 'results': results}
output = Path(args.out)
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps(report, indent=2))
print(json.dumps(report, indent=2))
if not all(all(r['checks'].values()) for r in results):
    raise SystemExit(1)

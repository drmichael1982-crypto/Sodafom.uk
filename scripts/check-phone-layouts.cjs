const fs=require('node:fs');
const {chromium,webkit}=require('playwright');
const catalog=require('../src/lib/archie/game-catalog.json');
const base=process.env.ARCHIE_TEST_URL||'http://127.0.0.1:4173';
const sizes=[[320,568],[360,640],[375,667],[390,664],[393,852],[412,915],[430,932],[540,720],[768,1024],[844,390]];
const core=['/','/world','/games','/lesson','/library','/reader/lost-key','/homework','/cartoons','/stickers','/rewards','/progress','/parents','/settings','/tutor','/teacher-mode','/ai-teacher'];
(async()=>{
 const browser=await (process.env.ARCHIE_BROWSER==='webkit'?webkit.launch({headless:true}):chromium.launch({headless:true,executablePath:process.env.ARCHIE_CHROMIUM_PATH||'/root/.cache/ms-playwright/chromium-1161/chrome-linux/chrome'}));
 const results=[],errors=[];let index=0;
 const jobs=sizes.flatMap(([width,height])=>core.map(route=>({width,height,route}))).concat([320,390,430].flatMap(width=>catalog.map(g=>({width,height:width===320?568:844,route:g.route}))));
 await Promise.all(Array.from({length:6},async()=>{
  const page=await browser.newPage({ignoreHTTPSErrors:true,reducedMotion:'reduce'});page.on('pageerror',e=>errors.push({url:page.url(),error:String(e)}));
  while(index<jobs.length){const job=jobs[index++];await page.setViewportSize({width:job.width,height:job.height});await page.goto(base+job.route);await page.locator('.art-hit,.a-page,.archie-launcher,.compact-home,.compact-lesson').first().waitFor();await page.waitForTimeout(80);
   const metrics=await page.evaluate(()=>{
    const vw=innerWidth,vh=innerHeight;
    const visible=e=>{const r=e.getBoundingClientRect();const s=getComputedStyle(e);return r.width>1&&r.height>1&&s.visibility!=='hidden'&&s.display!=='none'&&!e.closest('.sr-only')};
    const bad=[...document.querySelectorAll('button,a,input,select,textarea,canvas,svg,table')].filter(visible).map(e=>{const r=e.getBoundingClientRect();return {name:(e.getAttribute('aria-label')||e.textContent||e.tagName).trim().slice(0,70),left:r.left,right:r.right,bottom:r.bottom,width:r.width,height:r.height}}).filter(r=>r.left< -1||r.right>vw+1);
    const art=[...document.querySelectorAll('.art-hit')].map(e=>({name:e.getAttribute('aria-label'),bottom:e.getBoundingClientRect().bottom})).filter(r=>r.bottom>vh+1);
    return {horizontal:document.documentElement.scrollWidth>vw+1,scrollHeight:document.documentElement.scrollHeight,overflow:bad,artBelow:art};
   });results.push({...job,...metrics});
  }await page.close();
 }));
 await browser.close();fs.mkdirSync('test-results',{recursive:true});fs.writeFileSync(`test-results/phone-layouts-${process.env.ARCHIE_BROWSER||'chromium'}.json`,JSON.stringify({results,errors},null,2));
 console.log(JSON.stringify({checked:results.length,horizontal:results.filter(r=>r.horizontal||r.overflow.length),artClipped:results.filter(r=>r.artBelow.length),errors},null,2));
 if(errors.length||results.some(r=>r.horizontal||r.overflow.length||r.artBelow.length))throw new Error('Phone layout checks failed; see the saved report.');
})().catch(e=>{console.error(e);process.exit(1)});

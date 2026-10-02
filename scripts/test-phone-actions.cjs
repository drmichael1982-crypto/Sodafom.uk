const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium,webkit}=require('playwright');
const base=process.env.ARCHIE_TEST_URL||'http://127.0.0.1:4173';
(async()=>{
 const engine=process.env.ARCHIE_BROWSER||'chromium';
 const browser=await(engine==='webkit'?webkit.launch({headless:true}):chromium.launch({headless:true,executablePath:'/root/.cache/ms-playwright/chromium-1161/chrome-linux/chrome'}));
 const page=await browser.newPage({viewport:{width:320,height:568},ignoreHTTPSErrors:true,reducedMotion:'reduce'});const errors=[],passed=[];page.on('pageerror',e=>errors.push(String(e)));
 const button=name=>page.getByRole('button',{name,exact:true});
 const go=route=>page.goto(base+route);
 for(const [width,height]of[[320,568],[375,667],[390,664],[430,932],[844,390]]){
  await page.setViewportSize({width,height});await go('/');
  for(const label of ['Explore my world','Games','Lessons','Parents','Rewards','Sticker book','Cartoons','Progress','Settings']){const el=page.getByRole('link',{name:label,exact:true}),r=await el.boundingBox();assert(r&&r.y>=-1&&r.y+r.height<=height+1,`${label} below ${width}x${height}`);await el.click();assert(new URL(page.url()).pathname!=='/');await go('/');}
  await button('Ask Archie').click();await page.getByLabel('Your question for Archie').fill('What is 8 plus 4?');await button('Send question').click();await page.getByRole('log').getByText(/8 plus 4 is 12/i).waitFor();await button('Close Ask Archie').click();
  await go('/lesson');await button('Try spelling').click();await page.getByLabel('Your spelling').fill('wrong');await button('Rubber: clear spelling').click();assert.equal(await page.getByLabel('Your spelling').inputValue(),'');await page.getByLabel('Your spelling').fill('Wednesday');await button('Check').click();await page.getByText('Brilliant! You spelled it correctly.').waitFor();await button('Next word').click();await page.getByText('beautiful',{exact:true}).first().waitFor();await button('Pause lesson').click();await button('Resume lesson').last().click();
  await page.screenshot({path:`test-results/${engine}-lesson-${width}.png`,fullPage:true});await go('/');await page.screenshot({path:`test-results/${engine}-home-${width}.png`,fullPage:true});passed.push(`navigation / helper / lesson / rubber / pause at ${width}x${height}`);
 }
 await page.setViewportSize({width:375,height:667});await go('/games/number-pop');
 for(let i=1;i<=10;i++){await page.getByText(`Question ${i} of 10`,{exact:true}).waitFor();const text=await page.locator('body').innerText();const match=text.match(/(\d+)\s*([+−×÷-])\s*(\d+)\s*=\s*\?/);assert(match,'Maths question visible');const a=+match[1],b=+match[3],answer=match[2]==='+'?a+b:match[2]==='×'?a*b:match[2]==='÷'?a/b:a-b;const target=button(`Pop balloon ${answer}`);await target.evaluate(el=>el.scrollIntoView({block:"center"}));const box=await target.boundingBox();assert(box);await page.mouse.click(box.x+box.width/2,box.y+box.height/2);}
 await page.getByText('10 correct out of 10 questions',{exact:true}).waitFor();await page.getByRole('button',{name:/View Certificate/}).click();await page.getByRole('button',{name:/close/i}).last().click();passed.push('Number Pop: ten correct answers, results and certificate open / close');
 assert.deepEqual(errors,[]);fs.writeFileSync(`test-results/phone-actions-${engine}.json`,JSON.stringify({engine,passed,errors},null,2));console.log(JSON.stringify({engine,passed,errors}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

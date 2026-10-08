const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/playwright' : 'playwright');
const base = process.env.ARCHIE_TEST_URL || 'http://127.0.0.1:4173';
(async()=>{
  const browser = await chromium.launch({headless:true,...(process.env.ARCHIE_CHROMIUM_PATH?{executablePath:process.env.ARCHIE_CHROMIUM_PATH}:{})});
  const page = await browser.newPage({viewport:{width:390,height:844}});
  try {
    await page.goto(base);await page.getByRole('button',{name:'Planets',exact:true}).click();
    const model=page.locator('.orbit-model');assert.equal(await model.locator('.home-orbit').count(),8);
    const positions=()=>model.locator('.home-orbit').evaluateAll(elements=>elements.map(element=>getComputedStyle(element).transform));
    const before=await positions();await page.waitForTimeout(350);const after=await positions();
    before.forEach((position,index)=>assert.notEqual(after[index],position,`Planet ${index+1} should orbit the Sun`));
    const moon=model.locator('.home-orbit-2 .home-moon-orbit');
    const moonBefore=await moon.evaluate(element=>getComputedStyle(element).transform);await page.waitForTimeout(250);
    assert.notEqual(await moon.evaluate(element=>getComputedStyle(element).transform),moonBefore,'Moon should orbit Earth');
    await page.getByRole('button',{name:'Pause planets',exact:true}).click();
    const paused=await positions();await page.waitForTimeout(250);assert.deepEqual(await positions(),paused);
    assert.equal(await moon.evaluate(element=>getComputedStyle(element).animationPlayState),'paused');
    await page.getByRole('button',{name:'Move planets',exact:true}).click();
    fs.mkdirSync('test-results',{recursive:true});await page.screenshot({path:'test-results/planets-mobile.png',fullPage:true});
    await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await model.locator('.is-moving').count(),0);
    await page.getByRole('button',{name:'Still planets',exact:true}).waitFor();await page.emulateMedia({reducedMotion:'no-preference'});
    for (const viewport of [{width:320,height:568},{width:390,height:844},{width:844,height:390}]) {
      await page.setViewportSize(viewport);await page.getByRole('button',{name:'Explore',exact:true}).click();
      await page.getByRole('heading',{name:'Privacy',exact:true}).scrollIntoViewIfNeeded();
      const last=await page.getByRole('heading',{name:'Privacy',exact:true}).boundingBox();
      assert.ok(last.y>=0 && last.y+last.height<=viewport.height,'Last menu must be reachable on short phones');
      await page.getByRole('heading',{name:'Lessons',exact:true}).scrollIntoViewIfNeeded();
      await page.getByRole('navigation',{name:'Home activities'}).locator('a').first().hover();
      await page.screenshot({path:`test-results/home-${viewport.width}x${viewport.height}.png`,fullPage:true});
    }
    console.log('PASS all eight orbit transforms, Earth Moon movement, shared pause, reduced motion and reachable phone menus');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

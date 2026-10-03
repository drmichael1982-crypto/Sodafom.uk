const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium, webkit } = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/playwright' : 'playwright');
const base = process.env.ARCHIE_TEST_URL || 'http://127.0.0.1:4173';
const catalog = require('../src/lib/archie/game-catalog.json');
const browserOptions = { headless: true };
if (process.env.ARCHIE_CHROMIUM_PATH) browserOptions.executablePath = process.env.ARCHIE_CHROMIUM_PATH;
const results=[];
(async()=>{
  const browser=await (process.env.ARCHIE_BROWSER==='webkit'?webkit.launch({headless:true}):chromium.launch(browserOptions));
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const errors=[];const liveApi=[];
  page.on('pageerror',e=>errors.push({url:page.url(),error:String(e)}));
  page.on('request',r=>{if(r.url().includes('sodafomuk-production')&&r.url().includes('/api'))liveApi.push(r.url());});
  const check=async(name,fn)=>{await fn();results.push(name);console.log('PASS '+name);};
  const goto=async(route)=>{await page.goto(base+route);await page.locator('.art-hit, .a-page, .archie-launcher').first().waitFor();};
  const button=name=>page.getByRole('button',{name,exact:true});
  const link=name=>page.getByRole('link',{name,exact:true});
  fs.mkdirSync('test-results',{recursive:true});
  try{
    await check('Approved home: every navigation button opens its destination',async()=>{
      for(const [label,route] of [['Settings','/settings'],['Explore my world','/world'],['Games','/games'],['Lessons','/lesson'],['Parents','/parents'],['Rewards','/rewards'],['Sticker book','/stickers'],['Cartoons','/cartoons'],['Progress','/progress']]){
        await goto('/');await link(label).click();await page.waitForURL(base+route);assert.equal(await page.getByRole('main').count(),1);
      }
      await goto('/');await button('Turn sound off').click();await button('Turn sound on').click();
      await page.screenshot({path:'test-results/home-mobile.png',fullPage:true});
    });
    await check('One shared Ask Archie: local maths, close, context and navigation',async()=>{
      await button('Ask Archie').click();assert.equal(await page.getByRole('dialog').count(),1);
      await page.getByLabel('Your question for Archie').fill('What is 8 plus 4?');await button('Send question').click();await page.getByRole('log').getByText(/8 plus 4 is 12/i).waitFor();await button('Listen to Archie').waitFor({state:'visible'});await button('Listen to Archie').click();
      await button('Close Ask Archie').click();await link('Lessons').click();await button('Start spoken lesson').click();await page.getByText('Helping with My spelling lesson').waitFor();
      await page.getByLabel('Your question for Archie').fill('Open maths games');await button('Send question').click();await page.waitForURL(base+'/games?subject=maths');
      await button('Ask Archie').waitFor({state:'visible'});assert.equal(await button('Ask Archie').count(),1);
    });
    await check('Spelling whiteboard: wrong answer, seven correct answers, pause and saved reward',async()=>{
      await goto('/lesson');await button('Hear the word').click();await button('Try spelling').click();await page.getByLabel('Your spelling').fill('wrong');await button('Check').click();await page.getByText('Good try.',{exact:false}).waitFor();
      await button('Pause lesson').click();await page.getByRole('heading',{name:'Lesson paused'}).waitFor();await button('Resume lesson').last().click();
      const words=['Wednesday','beautiful','because','different','important','remember','question'];
      for(let i=0;i<words.length;i++){
        if(i)await button('Try spelling').click();await page.getByLabel('Your spelling').fill(words[i]);await button('Check').click();await page.getByText('Brilliant! You spelled it correctly.').waitFor();await button(i===6?'Finish lesson':'Next word').click();
      }
      await page.getByRole('heading',{name:'3 stars earned'}).waitFor();await link('See my rewards').click();await button('Collect sticker').first().click();await button('Collected ✓').first().waitFor();await page.reload();await button('Collected ✓').first().waitFor();
    });
    await check('Books: reader pagination, read aloud and completion saved once',async()=>{
      await goto('/library');await page.getByRole('link',{name:/Archie and the Lost Key/}).click();await button('Read aloud').click();
      for(let i=0;i<3;i++)await button('Next page').click();await button('Finish book • Earn 1 star').click();assert.equal(await button('Book completed ✓').isDisabled(),true);await button('Previous').click();await button('Next page').click();assert.equal(await button('Book completed ✓').isDisabled(),true);
    });
    await check('Homework: upload/remove and the typed question reaches shared Archie',async()=>{
      await goto('/homework');await page.locator('input[type=file]').setInputFiles({name:'question.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a7p0AAAAASUVORK5CYII=','base64')});await page.getByAltText('Your homework reference').waitFor();await button('Remove photo').click();await page.getByRole('textbox').fill('What is half of 12?');await button('Get help with this question').click();await page.getByRole('dialog').waitFor();await page.waitForFunction(()=>document.querySelector('[aria-label="Your question for Archie"]').value==='What is half of 12?');assert.equal(await page.getByLabel('Your question for Archie').inputValue(),'What is half of 12?');await button('Send question').click();await page.getByRole('log').getByText(/half of 12 is 6/i).waitFor();await button('Close Ask Archie').click();
    });
    await check('Parents: saved year group, large text, setup status and progress',async()=>{
      await goto('/parents');await page.getByLabel('School year').selectOption('2');await page.getByLabel('Larger text on menus and books').check();await button('Save learning settings').click();await page.reload();assert.equal(await page.getByLabel('School year').inputValue(),'2');await button('Check AI setup').click();await page.getByText(/Online AI is not configured/).waitFor();await link('Try the lesson').click();await page.getByText('Year 2',{exact:true}).waitFor();await goto('/parents');await page.getByLabel('School year').selectOption('4');await page.getByLabel('Larger text on menus and books').uncheck();await button('Save learning settings').click();await goto('/parents');await page.getByLabel('School year').selectOption('9');await button('Save learning settings').click();await link('Try the lesson').click();await page.getByText('Year 9',{exact:true}).waitFor();await goto('/parents');await page.getByLabel('School year').selectOption('4');await button('Save learning settings').click();await link('View progress').click();await page.getByText('Year 4 spelling',{exact:true}).waitFor();
    });
    await check('Cartoons: selection, play/pause, next, restart and return',async()=>{
      await goto('/cartoons');await page.getByRole('button',{name:/The Number Island/}).click();await button('Pause').click();await button('Play').click();await button('Next scene').click();await page.getByText('Scene 2 of 3',{exact:true}).waitFor();await button('Restart').click();await page.getByText('Scene 1 of 3',{exact:true}).waitFor();await button('Read this scene').click();await page.getByRole('button',{name:/All episodes/}).click();
    });
    await check('Games menu: filter, search and existing game launches',async()=>{
      await goto('/games');assert.equal(await page.locator('[data-game-link]').count(),127);await button('Spelling').click();await page.waitForURL(base+'/games?subject=spelling');await page.waitForFunction(()=>document.querySelectorAll('[data-game-link]').length===31);assert.equal(await page.locator('[data-game-link]').count(),catalog.filter(g=>g.subject==='spelling').length);await button('All games').click();await page.getByLabel('Search games').fill('Number Pop');await page.waitForFunction(()=>document.querySelectorAll('[data-game-link]').length===1);await page.locator('[data-game-link]').click();await page.waitForURL(base+'/games/number-pop');assert.equal(await button('Ask Archie').count(),1);await button('Ask Archie').click();await page.getByText(/Helping with Number Pop/).waitFor();await button('Close Ask Archie').click();
    });
    await check('All 127 linked game routes render without a crash or home redirect',async()=>{
      for(const game of catalog){await goto(game.route);await page.waitForTimeout(70);console.log('ROUTE '+game.route);assert.equal(new URL(page.url()).pathname,game.route);assert.equal(await page.getByText('Something went wrong',{exact:false}).count(),0);}
    });
    await check('Phone and desktop layouts: no horizontal overflow',async()=>{
      for(const width of [360,390,1280]){await page.setViewportSize({width,height:900});for(const route of ['/','/world','/games','/lesson','/library','/reader/lost-key','/homework','/cartoons','/stickers','/rewards','/progress','/parents']){await goto(route);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),`${width}px ${route} overflows`);}}
      await page.setViewportSize({width:390,height:844});await goto('/lesson');await page.screenshot({path:'test-results/lesson-mobile.png',fullPage:true});await goto('/world');await page.screenshot({path:'test-results/world-mobile.png',fullPage:true});
    });
    assert.deepEqual(liveApi,[],'Preview contacted the live production API');assert.deepEqual(errors,[],'Browser errors');
    fs.writeFileSync('test-results/archie-ui.json',JSON.stringify({passed:results,gameRoutes:catalog.length,browserErrors:errors,productionApiRequests:liveApi},null,2));
    console.log(`FINISHED: ${results.length} journeys; ${catalog.length} game routes; zero browser errors; zero live API requests.`);
  }catch(error){await page.screenshot({path:'test-results/failure.png',fullPage:true});console.error(error);console.error(errors);process.exitCode=1;}
  finally{await browser.close();}
})();

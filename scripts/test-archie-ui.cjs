const assert = require('node:assert/strict');
const fs = require('node:fs');
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
  const goto=async(route)=>{await page.goto(base+route);await page.locator('#app > *').first().waitFor();await page.getByRole('heading').first().waitFor();};
  const button=name=>page.getByRole('button',{name,exact:true});
  const link=name=>page.getByRole('link',{name,exact:true});
  const checkbox=name=>page.getByRole('checkbox',{name,exact:true});
  // Follow the instruction displayed to the adult; never unlock through storage or events.
  const unlockGrownUpArea=async({rejectWrongAnswer=false}={})=>{
    const title='A grown-up needs to help here';
    await page.getByRole('heading',{name:title,exact:true}).waitFor();
    assert.equal(await page.getByLabel('School year').count(),0,'Learning settings must remain behind the gate');
    if(rejectWrongAnswer){
      await page.getByLabel('Grown-up answer',{exact:true}).fill('incorrect instruction');
      await button('Continue with a grown-up').click();
      await page.getByRole('alert').getByText('Please follow the written instruction, or ask a grown-up to help.',{exact:true}).waitFor();
      assert.equal(await page.getByLabel('School year').count(),0,'An incorrect answer must not unlock settings');
    }
    const form=page.getByRole('form',{name:title,exact:true});
    const words=(await form.locator('p strong').first().innerText()).trim().split(/\s+/);
    assert.ok(words.length>=2,'The visible gate sentence must contain the requested words');
    await page.getByLabel('Grown-up answer',{exact:true}).fill(words.at(-1)+' '+words[1]);
    await button('Continue with a grown-up').click();
    await page.getByLabel('School year').waitFor();
    assert.equal(await page.getByRole('heading',{name:title,exact:true}).count(),0);
  };
  const openParents=async()=>{await goto('/parents');await unlockGrownUpArea();};
  const waitForGameCount=async expected=>{
    await page.waitForFunction(count=>document.querySelectorAll('[data-game-link]').length===count,expected);
    assert.equal(await page.locator('[data-game-link]').count(),expected);
  };
  fs.mkdirSync('test-results',{recursive:true});
  try{
    await check('Approved home: every navigation button opens its destination',async()=>{
      for(const [label,route] of [['Settings','/settings'],['Explore my world','/world'],['Games','/games'],['Lessons','/courses'],['Parents','/parents'],['Rewards','/rewards'],['Sticker book','/stickers'],['Cartoons','/cartoons'],['Progress','/progress']]){
        await goto('/');await link(label).click();await page.waitForURL(base+route);
        if(route==='/settings'||route==='/parents'){
          await unlockGrownUpArea({rejectWrongAnswer:route==='/settings'});
          await page.getByRole('heading',{level:1,name:route==='/settings'?'Settings':'Parents & learning',exact:true}).waitFor();
          if(route==='/settings'){
            await page.getByLabel('School year').selectOption('4');await button('Save learning settings').click();
            assert.equal(await checkbox('Allow online learning help').isChecked(),false);
            assert.equal(await checkbox('Read aloud and sound').isChecked(),true);
          }
        }
        assert.equal(await page.getByRole('main').count(),1);
      }
      await goto('/');await button('Turn sound off').click();await button('Turn sound on').click();
      await page.screenshot({path:'test-results/home-mobile.png',fullPage:true});
    });
    await check('Live home personalisation saves, applies and clears interests on device',async()=>{
      await goto('/');
      await page.evaluate(()=>{for(const key of Object.keys(localStorage)){if(key.startsWith('sodafom_child_interests:'))localStorage.removeItem(key);}localStorage.removeItem('sodafom_active_child');});
      await page.reload();
      await page.getByRole('button',{name:'Personalise my home screen'}).click();
      await page.getByLabel('What are you into?').fill('dinosaurs');
      await page.getByRole('button',{name:'Save',exact:true}).click();
      await page.getByText('Your jungle learning world').waitFor();
      assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('sodafom_child_interests:default')||'[]')),['dinosaurs']);
      await page.getByRole('button',{name:'Remove interest dinosaurs'}).click();
      await page.getByText('Make your learning world yours').waitFor();
      assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('sodafom_child_interests:default')||'[]')),[]);
      await page.getByRole('button',{name:'Done',exact:true}).click();
    });
    await check('One shared Ask Archie: local maths, close, context and navigation',async()=>{
      await button('Ask Archie').click();assert.equal(await page.getByRole('dialog').count(),1);
      await page.getByLabel('Your question for Archie').fill('What is 8 plus 4?');await button('Send question').click();await page.getByRole('log').getByText(/8 plus 4 is 12/i).waitFor();await button('Listen to Archie').waitFor({state:'visible'});await button('Listen to Archie').click();
      await button('Close Ask Archie').click();await goto('/lesson');await button('Start spoken lesson').click();await page.getByText('Helping with My spelling lesson').waitFor();
      // This exercises the typed fallback in the spoken-lesson UI, not microphone recognition.
      await page.getByLabel('Your question for Archie').fill('Wednesday');await button('Send question').click();await page.getByRole('log').getByText(/spelled Wednesday correctly/i).waitFor();
      await button('Close Ask Archie').click();
      await page.getByRole('heading',{level:1,name:/Step 1 of 7/}).waitFor();
      assert.equal(await page.getByLabel('Your spelling').inputValue(),'Wednesday');
      assert.equal(await page.getByLabel('Your spelling').isDisabled(),true);
      await button('Next word').click();await page.getByRole('heading',{level:1,name:/Step 2 of 7/}).waitFor();
      await button('Start spoken lesson').click();await page.getByText('Helping with My spelling lesson').waitFor();
      await page.getByLabel('Your question for Archie').fill('Open maths games');await button('Send question').click();await page.waitForURL(base+'/games?subject=maths');
      await button('Ask Archie').waitFor({state:'visible'});assert.equal(await button('Ask Archie').count(),1);
    });
    await check('Spelling whiteboard: wrong answer, seven correct answers, pause and saved reward',async()=>{
      await goto('/lesson');await button('Hear the word').click();await button('Try spelling').click();await page.getByLabel('Your spelling').fill('wrong');await button('Check').click();await page.getByText('Good try.',{exact:false}).waitFor();
      await page.getByRole('heading',{level:1,name:/Step 1 of 7/}).waitFor();
      assert.equal(await page.getByLabel('Your spelling').isDisabled(),false);
      await button('Rubber: clear spelling').click();await page.getByText('Cleared. Have another go.',{exact:true}).waitFor();
      assert.equal(await page.getByLabel('Your spelling').inputValue(),'');
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
    await check('Parents: gate, saved year group, sound, large text, setup status and progress',async()=>{
      await openParents();await page.getByLabel('School year').selectOption('2');
      await checkbox('Larger text on menus and books').check();await checkbox('Read aloud and sound').uncheck();
      await button('Save learning settings').click();await page.reload();await unlockGrownUpArea();
      assert.equal(await page.getByLabel('School year').inputValue(),'2');
      assert.equal(await checkbox('Larger text on menus and books').isChecked(),true);
      assert.equal(await checkbox('Read aloud and sound').isChecked(),false);
      await button('Turn sound on').waitFor();
      assert.equal(await checkbox('Allow online learning help').isChecked(),false);
      const [statusResponse]=await Promise.all([
        page.waitForResponse(response=>new URL(response.url()).pathname==='/api/archie/status'&&response.request().method()==='GET'),
        button('Check AI setup').click(),
      ]);
      assert.equal(new URL(statusResponse.url()).origin,new URL(base).origin,'Setup must use the preview server');
      assert.equal(statusResponse.ok(),true,'Preview setup status must respond successfully');
      const status=await statusResponse.json();
      assert.equal(typeof status.message,'string');assert.ok(status.message.trim(),'Setup status must explain its configuration');
      await page.getByText(status.message,{exact:true}).waitFor();
      assert.equal(await checkbox('Allow online learning help').isChecked(),false,'Checking setup must not enable online help');
      await checkbox('Read aloud and sound').check();
      await link('Try the lesson').click();await page.getByRole('heading',{level:1,name:/My spelling lesson.*Year 2/}).waitFor();
      await openParents();await page.getByLabel('School year').selectOption('4');await checkbox('Larger text on menus and books').uncheck();await button('Save learning settings').click();
      await openParents();await page.getByLabel('School year').selectOption('9');await button('Save learning settings').click();
      await link('Try the lesson').click();await page.getByRole('heading',{level:1,name:/My spelling lesson.*Year 9/}).waitFor();
      await openParents();await page.getByLabel('School year').selectOption('4');await button('Save learning settings').click();
      await link('View progress').click();await page.getByText('Year 4 spelling',{exact:true}).waitFor();
    });
    await check('Cartoons: selection, play/pause, next, restart and return',async()=>{
      await goto('/cartoons');await page.getByRole('button',{name:/The Number Island/}).click();await button('Pause').click();await button('Play').click();await button('Next scene').click();await page.getByText('Scene 2 of 3',{exact:true}).waitFor();await button('Restart').click();await page.getByText('Scene 1 of 3',{exact:true}).waitFor();await button('Read this scene').click();await page.getByRole('button',{name:/All episodes/}).click();
    });
    await check('Games menu: filter, search and existing game launches',async()=>{
      await goto('/games');await button('My year · Year 4').waitFor();
      const forYear4=catalog.filter(g=>g.ageGroups.some(group=>{
        const [minimum,maximum]=group.split(/[–-]/).map(Number);
        return 8>=minimum&&8<=maximum;
      })).length;
      await waitForGameCount(forYear4);assert.equal(await button('My year · Year 4').getAttribute('aria-pressed'),'true');
      await button('Browse all ages').click();await waitForGameCount(catalog.length);
      assert.equal(await button('Browse all ages').getAttribute('aria-pressed'),'true');
      for(const route of ['/games/star-trail','/games/number-planets'])assert.equal(await page.locator(`[data-game-link][href="${route}"]`).count(),1);
      await button('Spelling').click();await page.waitForURL(base+'/games?subject=spelling');await waitForGameCount(catalog.filter(g=>g.subject==='spelling').length);
      await button('All games').click();await waitForGameCount(catalog.length);
      await page.getByLabel('Search games').fill('Number Pop');await waitForGameCount(1);await page.locator('[data-game-link]').click();await page.waitForURL(base+'/games/number-pop');
      await button('Ask Archie').waitFor();assert.equal(await button('Ask Archie').count(),1);await button('Ask Archie').click();await page.getByText(/Helping with Number Pop/).waitFor();await button('Close Ask Archie').click();
    });
    await check(`All ${catalog.length} linked game routes render without a crash or home redirect`,async()=>{
      assert.equal(new Set(catalog.map(game=>game.route)).size,catalog.length,'Game routes must be distinct');
      for(const game of catalog){await goto(game.route);await page.getByRole('heading',{level:1}).first().waitFor();console.log('ROUTE '+game.route);assert.equal(new URL(page.url()).pathname,game.route);assert.equal(await page.getByText('Something went wrong',{exact:false}).count(),0);}
    });
    await check('Phone, foldable, tablet and landscape layouts: no horizontal overflow',async()=>{
      const routes=['/','/world','/games','/courses','/lesson','/library','/reader/lost-key','/homework','/cartoons','/stickers','/rewards','/progress','/parents','/settings'];
      const viewports=[
        {width:320,height:640,label:'small phone'},
        {width:360,height:740,label:'compact phone'},
        {width:375,height:812,label:'phone'},
        {width:390,height:844,label:'phone'},
        {width:414,height:896,label:'large phone'},
        {width:430,height:932,label:'large phone'},
        {width:600,height:960,label:'foldable portrait'},
        {width:768,height:1024,label:'small tablet'},
        {width:820,height:1180,label:'tablet'},
        {width:1024,height:768,label:'tablet landscape'},
        {width:1280,height:900,label:'laptop'},
        {width:1440,height:900,label:'desktop'},
        {width:640,height:360,label:'phone landscape'},
        {width:844,height:390,label:'phone landscape'},
        {width:932,height:430,label:'foldable landscape'},
      ];
      for(const viewport of viewports){
        await page.setViewportSize({width:viewport.width,height:viewport.height});
        for(const route of routes){
          await goto(route);
          const dimensions=await page.evaluate(()=>({viewport:window.innerWidth,document:document.documentElement.scrollWidth}));
          assert.ok(dimensions.document<=dimensions.viewport+1,viewport.label+' '+viewport.width+'x'+viewport.height+' '+route+' overflows: '+JSON.stringify(dimensions));
          if(route==='/parents'||route==='/settings'){
            await unlockGrownUpArea();
            const unlocked=await page.evaluate(()=>({viewport:window.innerWidth,document:document.documentElement.scrollWidth}));
            assert.ok(unlocked.document<=unlocked.viewport+1,viewport.label+' '+viewport.width+'x'+viewport.height+' '+route+' unlocked overflows: '+JSON.stringify(unlocked));
          }
        }
      }
      await page.setViewportSize({width:390,height:844});await goto('/lesson');await page.screenshot({path:'test-results/lesson-mobile.png',fullPage:true});await goto('/world');await page.screenshot({path:'test-results/world-mobile.png',fullPage:true});
    });
    assert.deepEqual(liveApi,[],'Preview contacted the live production API');assert.deepEqual(errors,[],'Browser errors');
    fs.writeFileSync('test-results/archie-ui.json',JSON.stringify({passed:results,gameRoutes:catalog.length,browserErrors:errors,productionApiRequests:liveApi},null,2));
    console.log(`FINISHED: ${results.length} journeys; ${catalog.length} game routes; zero browser errors; zero live API requests.`);
  }catch(error){await page.screenshot({path:'test-results/failure.png',fullPage:true});console.error(error);console.error(errors);process.exitCode=1;}
  finally{await browser.close();}
})();

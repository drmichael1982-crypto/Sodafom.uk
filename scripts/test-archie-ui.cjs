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
    await page.getByLabel('Grown-up area opened',{exact:true}).waitFor();
    assert.equal(await page.getByLabel('Grown-up area opened',{exact:true}).evaluate(element=>element===document.activeElement),true,'Unlock confirmation must receive focus and announce that the area opened');
    await page.getByLabel('School year').waitFor();
    assert.equal(await page.getByRole('heading',{name:title,exact:true}).count(),0);
  };
  const openParents=async()=>{await goto('/parents');await unlockGrownUpArea();};
  const waitForGameCount=async expected=>{
    await page.waitForFunction(count=>document.querySelectorAll('[data-game-link]').length===count,expected);
    assert.equal(await page.locator('[data-game-link]').count(),expected);
  };
  const isEligible=(game,year)=>game.ageGroups.some(group=>{
    const match=group.trim().match(/^(\d+)\s*[–-]\s*(\d+)$/);
    assert.ok(match,'Catalogue must advertise a clear age range: '+game.title);
    return year+4>=Number(match[1])&&year+4<=Number(match[2]);
  });
  const assertGameIntersection=async(year,subject='all',query='')=>{
    const expected=catalog.filter(game=>isEligible(game,year)&&(subject==='all'||game.subject===subject)&&
      `${game.title} ${game.description}`.toLowerCase().includes(query.toLowerCase()));
    await waitForGameCount(expected.length);
    assert.deepEqual(await page.locator('[data-game-link]').evaluateAll(items=>items.map(item=>item.getAttribute('href'))),expected.map(game=>game.route),
      'Rendered games must match year, subject and search together');
    return expected;
  };
  const chooseGameYear=async year=>{
    await page.getByRole('combobox',{name:'My learning year',exact:true}).selectOption(String(year));
    assert.equal(await page.getByRole('combobox',{name:'My learning year',exact:true}).inputValue(),String(year));
  };
  const studyWord=async()=>{
    const board=page.getByRole('region',{name:'Lesson whiteboard',exact:true});
    const word=await (await board.locator('.lesson-word').count()?board.locator('.lesson-word'):board.getByRole('heading',{level:2})).innerText();
    assert.match(word.trim(),/^[a-z]+(?:['’\-][a-z]+)*$/i,'Read the visible study word before independent spelling hides it');
    assert.ok(!/^(?:listen|paused)$/i.test(word.trim()),'A lesson instruction is not the study word');
    return word.trim();
  };
  const escapeRegex=text=>text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const unlockPreviewControls=async()=>{
    await page.getByLabel('Preview code',{exact:true}).fill('1182');
    await button('Open preview controls').click();
    await page.getByRole('heading',{name:'Stripe and pricing preparation',exact:true}).waitFor();
    await page.getByText('Payments are off in this school preview.',{exact:true}).waitFor();
  };
  fs.mkdirSync('test-results',{recursive:true});
  try{
    await check('Approved home: every navigation button opens its destination',async()=>{
      const homeLinks = [
        ...[['Lessons','/courses'],['Quests','/quests'],['Maths','/games?subject=maths'],['Reading','/games?subject=reading'],['Spelling','/games?subject=spelling'],['Science','/games?subject=science'],['Geography','/games/geography-quiz'],['Whiteboard','/lesson'],['Library','/library'],['Homework','/homework'],['Cartoons','/cartoons'],['Stickers','/stickers'],['Rewards','/rewards'],['Parents','/parents'],['Class','/class'],['Teachers','/teacher'],['Games','/games'],['History','/history'],['Trail','/games/archie-adventure-trail'],['My world','/world'],['Ask Archie','/ask-archie'],['Clock lab','/time-lab'],['Progress','/progress'],['Artwork','/artwork'],['Settings','/settings'],['Privacy','/privacy']].map(([label,route])=>({label,route,area:'Home activities',card:true})),
        {label:'Parents and learning settings',route:'/parents'},
      ];
      for(const {label,route,area,card} of homeLinks){
        await goto('/');
        const navigation=area?page.getByRole('navigation',{name:area,exact:true}):page;
        let destination=card?navigation.getByRole('link').filter({has:page.getByRole('heading',{name:label,exact:true})}):navigation.getByRole('link',{name:label,exact:true});
        for(let screen=0;card&&await destination.count()===0&&screen<20;screen++){
          const next=page.getByRole('button',{name:'Next →',exact:true});
          if(await next.count()!==1||await next.isDisabled())break;
          await next.click();
          destination=navigation.getByRole('link').filter({has:page.getByRole('heading',{name:label,exact:true})});
        }
        assert.equal(await destination.count(),1,'Home destination must be unambiguous: '+label);
        await destination.click();await page.waitForURL(base+route);
        if(route==='/settings'||route==='/parents'){
          await unlockGrownUpArea({rejectWrongAnswer:route==='/settings'});
          await page.getByRole('heading',{level:1,name:route==='/settings'?'Settings':'Parents & learning',exact:true}).waitFor();
          if(route==='/settings'){
            await page.getByLabel('School year').selectOption('4');await button('Save learning settings').click();
            assert.equal(await checkbox('Allow online learning help').isChecked(),false);
            assert.equal(await checkbox('Read aloud and sound').isChecked(),true);
          }
        }
        if(route.startsWith('/games/')) await button('Back to games').waitFor({state:'visible'});
        else assert.equal(await page.getByRole('main').count(),1);
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
      await page.getByText('Saved on this device. Archie uses an original colour palette and abstract shapes.',{exact:true}).waitFor();
      assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('sodafom_child_interests:default')||'[]')),['dinosaurs']);
      await page.getByRole('button',{name:'Remove interest dinosaurs'}).click();
      await page.getByText('Interest removed. Your home screen colours have been updated.',{exact:true}).waitFor();
      assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('sodafom_child_interests:default')||'[]')),[]);
      await page.getByRole('button',{name:'Done',exact:true}).click();
    });
    await check('One shared Ask Archie: local maths, close, context and navigation',async()=>{
      await button('Ask Archie').click();assert.equal(await page.getByRole('dialog').count(),1);
      await page.getByLabel('Your question for Archie').fill('What is 8 plus 4?');await button('Send question').click();await page.getByRole('log').getByText(/8 plus 4 is 12/i).waitFor();await button('Listen to Archie').waitFor({state:'visible'});await button('Listen to Archie').click();
      await button('Close Ask Archie').click();await goto('/lesson');const spokenWord=await studyWord();await button('Start spoken lesson').click();await page.getByText('Helping with My spelling lesson').waitFor();
      // This exercises the typed fallback in the spoken-lesson UI, not microphone recognition.
      await page.getByLabel('Your question for Archie').fill(spokenWord);await button('Send question').click();await page.getByRole('log').getByText(new RegExp('spelled '+escapeRegex(spokenWord)+' correctly','i')).waitFor();
      await button('Close Ask Archie').click();
      await page.getByRole('heading',{level:1,name:/Step 1 of 7/}).waitFor();
      assert.equal(await page.getByLabel('Your spelling').inputValue(),spokenWord);
      assert.equal(await page.getByLabel('Your spelling').isDisabled(),true);
      await button('Next word').click();await page.getByRole('heading',{level:1,name:/Step 2 of 7/}).waitFor();
      await button('Start spoken lesson').click();await page.getByText('Helping with My spelling lesson').waitFor();
      await page.getByLabel('Your question for Archie').fill('Open maths games');await button('Send question').click();await page.waitForURL(base+'/games?subject=maths');
      await button('Ask Archie').waitFor({state:'visible'});assert.equal(await button('Ask Archie').count(),1);
    });
    await check('Spelling whiteboard: wrong answer, seven correct answers, pause and saved reward',async()=>{
      await goto('/lesson');
      const firstWord=await studyWord();
      await button('Hear the word').click();await button('Try spelling').click();await page.getByLabel('Your spelling').fill('wrong');await button('Check').click();await page.getByText('Good try.',{exact:false}).waitFor();
      await page.getByRole('heading',{level:1,name:/Step 1 of 7/}).waitFor();
      assert.equal(await page.getByLabel('Your spelling').isDisabled(),false);
      await button('Rubber: clear spelling').click();await page.getByText('Cleared. Have another go.',{exact:true}).waitFor();
      assert.equal(await page.getByLabel('Your spelling').inputValue(),'');
      await button('Pause lesson').click();await page.getByRole('heading',{name:'Lesson paused'}).waitFor();await button('Resume lesson').last().click();
      const studied=[];
      for(let i=0;i<7;i++){
        await page.getByRole('heading',{level:1,name:new RegExp('Step '+(i+1)+' of 7')}).waitFor();
        const word=i===0?firstWord:await studyWord();studied.push(word);
        if(i){
          await button('Try spelling').click();
          await page.getByLabel('Your spelling').fill('wrong');await button('Check').click();
          await page.getByText('Good try.',{exact:false}).waitFor();
          assert.equal(await page.getByLabel('Your spelling').isDisabled(),false);
          await page.getByRole('heading',{level:1,name:new RegExp('Step '+(i+1)+' of 7')}).waitFor();
          await button('Rubber: clear spelling').click();
          assert.equal(await page.getByLabel('Your spelling').inputValue(),'');
        }
        await page.getByLabel('Your spelling').fill(word);await button('Check').click();
        await page.getByText('Brilliant! You spelled it correctly.').waitFor();
        assert.equal(await page.getByLabel('Your spelling').inputValue(),word);
        assert.equal(await page.getByLabel('Your spelling').isDisabled(),true);
        await button(i===6?'Finish lesson':'Next word').click();
      }
      assert.equal(studied.length,7,'All seven displayed study words were attempted');
      assert.equal(new Set(studied.map(word=>word.toLowerCase())).size,7,'Each spelling step has its own study word');
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
    await check('History and Fraction completions appear once in the teacher device summary',async()=>{
      await openParents();await page.getByLabel('School year').selectOption('1');await button('Save learning settings').click();
      await page.setViewportSize({width:390,height:844});await goto('/history');
      await button('The Thames').click();await page.getByText('Try another answer. Ask Archie for a clue if you need one.',{exact:true}).waitFor();
      for(const answer of ['The Nile','Royal tombs','Hieroglyphs','A pharaoh','Evidence','Ancient Egypt'])await button(answer).click();
      await page.getByText('You completed Ancient Egypt!',{exact:false}).waitFor();
      await page.screenshot({path:'test-results/history-complete-390.png',fullPage:true});
      await page.setViewportSize({width:820,height:1180});await page.screenshot({path:'test-results/history-complete-820.png',fullPage:true});

      await page.setViewportSize({width:390,height:844});await goto('/');await button('Puzzles').click();await button('Fractions').click();
      await page.getByRole('button',{name:'Fraction section 1'}).click();await button('Check the fraction').click();await button('Next fraction').click();
      await page.getByRole('button',{name:'Fraction section 1'}).click();await button('Check the fraction').click();
      await button('Practise the fractions again').waitFor();
      await page.screenshot({path:'test-results/fraction-complete-390.png',fullPage:true});
      await page.setViewportSize({width:820,height:1180});await page.screenshot({path:'test-results/fraction-complete-820.png',fullPage:true});

      await page.setViewportSize({width:390,height:844});await goto('/teacher');await unlockGrownUpArea();
      const puzzleSummary=page.getByRole('heading',{name:'Recent puzzle learning on this device',exact:true});await puzzleSummary.waitFor();
      await page.getByRole('heading',{name:'Maths · Year 1',exact:true}).waitFor();
      await page.getByRole('heading',{name:'History · Year not recorded',exact:true}).waitFor();
      await page.getByText('History records have no saved year, so none is guessed.',{exact:false}).waitFor();
      await page.getByText('Ancient Egypt history picture puzzle',{exact:true}).waitFor();
      await page.getByText('Year 1 fraction picture puzzles',{exact:true}).waitFor();
      const savedIds=await page.evaluate(()=>JSON.parse(localStorage.getItem('sodafom_archie_design_v1')||'{"activities":[]}').activities.map(activity=>activity.id));
      assert.equal(savedIds.filter(id=>id==='history-jigsaw-egypt').length,1,'History completion must be stored once');
      assert.equal(savedIds.filter(id=>id==='fraction-jigsaw-year-1').length,1,'Fraction completion must be stored once');
      const pager=page.getByRole('navigation',{name:'Page screens',exact:true});
      const pagerStatus=pager.getByRole('status');
      const previous=pager.getByRole('button',{name:'← Previous',exact:true});
      const next=pager.getByRole('button',{name:'Next →',exact:true});
      while(!await previous.isDisabled()){await previous.click();await page.waitForTimeout(180);}
      await next.click();await page.waitForTimeout(180);
      await pagerStatus.getByText(/Screen 2 of \d+/).waitFor();
      await page.evaluate(()=>window.scrollTo(0,0));
      await page.screenshot({path:'test-results/teacher-puzzle-learning-390.png',fullPage:true});
      await next.click();await page.waitForTimeout(180);
      await pagerStatus.getByText(/Screen 3 of \d+/).waitFor();
      await page.evaluate(()=>window.scrollTo(0,0));
      await page.screenshot({path:'test-results/teacher-puzzle-learning-history-390.png',fullPage:true});
      await page.setViewportSize({width:820,height:1180});
      while(!await previous.isDisabled()){await previous.click();await page.waitForTimeout(180);}
      await page.screenshot({path:'test-results/teacher-puzzle-learning-820.png',fullPage:true});
    });
    await check('Cartoons: selection, play/pause, next, restart and return',async()=>{
      await goto('/cartoons');await page.getByRole('button',{name:/The Number Island/}).click();await button('Pause').click();await button('Play').click();await button('Next scene').click();await page.getByText('Scene 2 of 3',{exact:true}).waitFor();await button('Restart').click();await page.getByText('Scene 1 of 3',{exact:true}).waitFor();await button('Read this scene').click();await page.getByRole('button',{name:/All episodes/}).click();
    });
    await check('Games menu: filter, search and existing game launches',async()=>{
      await goto('/games');await chooseGameYear(4);
      await assertGameIntersection(4);
      assert.equal(await button('Browse all ages').count(),0,'Age bypass must not return');
      const yearSelect=page.getByRole('combobox',{name:'My learning year',exact:true});
      assert.equal(await yearSelect.locator('option').count(),9,'All nine school years remain selectable');
      assert.deepEqual(await yearSelect.locator('optgroup').evaluateAll(groups=>groups.map(group=>group.label)),['Main pathway · ages 5–12','Optional older extensions'],'Core and extension years must be clearly grouped');
      await page.getByText("Archie's main pathway is ages 5–12. Year 8 can include age 12; choose Years 8–9 with a grown-up for optional older content.",{exact:true}).waitFor();
      for(const route of ['/games/star-trail','/games/number-planets'])assert.equal(await page.locator(`[data-game-link][href="${route}"]`).count(),1);
      await button('Spelling').click();await page.waitForURL(base+'/games?subject=spelling');
      await assertGameIntersection(4,'spelling');
      await page.getByLabel('Search games').fill('word');await assertGameIntersection(4,'spelling','word');
      await chooseGameYear(1);await assertGameIntersection(1,'spelling','word');
      await page.getByLabel('Search games').fill('');
      await button('All games').click();await assertGameIntersection(1);
      await chooseGameYear(7);await assertGameIntersection(7);
      await chooseGameYear(4);await assertGameIntersection(4);
      await page.getByLabel('Search games').fill('Phonics Parrot');await assertGameIntersection(4,'all','Phonics Parrot');
      assert.equal(await page.locator('[data-game-link]').count(),0,'Phonics Parrot must stay hidden for Year 4');
      await page.getByText('No games match those filters for Year 4. Try a shorter search or choose another subject.',{exact:true}).waitFor();
      await button('Show Year 4 games').click();await assertGameIntersection(4);
      assert.equal(await page.getByRole('combobox',{name:'My learning year',exact:true}).inputValue(),'4','Reset must preserve the selected year');
      assert.equal(await page.getByLabel('Search games').evaluate(input=>input===document.activeElement),true,'Reset returns keyboard focus to search');
      await chooseGameYear(3);await page.getByLabel('Search games').fill('Phonics Parrot');await assertGameIntersection(3,'all','Phonics Parrot');
      await page.locator('[data-game-link]').click();await page.waitForURL(base+'/games/phonics-parrot');
      await button('Ask Archie').waitFor();assert.equal(await button('Ask Archie').count(),1);await button('Ask Archie').click();await page.getByText(/Helping with Phonics Parrot/).waitFor();await button('Close Ask Archie').click();
    });
    await check(`All ${catalog.length} linked game routes render without a crash or home redirect`,async()=>{
      assert.equal(new Set(catalog.map(game=>game.route)).size,catalog.length,'Game routes must be distinct');
      assert.equal(catalog.length,130,'The existing complete game-route inventory must remain covered');
      for(const game of catalog){
        const year=[1,2,3,4,5,6,7,8,9].find(year=>isEligible(game,year));
        assert.ok(year,'Every linked game must have an eligible school year: '+game.route);
        await goto('/games');await chooseGameYear(year);await assertGameIntersection(year);
        const gameLink=page.locator(`[data-game-link][href="${game.route}"]`);
        assert.equal(await gameLink.count(),1,'The eligible game must appear in the actual menu');
        await gameLink.click();await page.waitForURL(base+game.route);
        await page.getByRole('heading',{level:1}).first().waitFor();
        await button('Back to games').waitFor({state:'visible'});
        assert.equal(await page.getByRole('heading',{name:'Let’s find a game for your year',exact:true}).count(),0,'A guard is not a rendered game');
        assert.equal(await button('Ask Archie').count(),1,'The real game helper must mount exactly once');
        console.log('ROUTE '+game.route+' YEAR '+year);assert.equal(new URL(page.url()).pathname,game.route);
        assert.equal(await page.getByText('Something went wrong',{exact:false}).count(),0);
      }
    });
    await check('Phone, foldable, tablet and landscape layouts: no horizontal overflow',async()=>{
      const routes=['/','/world','/games','/courses','/lesson','/library','/reader/lost-key','/homework','/history','/cartoons','/stickers','/rewards','/progress','/parents','/settings','/teacher','/class','/time-lab','/preview-admin','/artwork','/privacy'];
      const viewports=[
        {width:280,height:653,label:'narrow phone'},
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
          if(route==='/preview-admin'){
            await unlockPreviewControls();
            const unlocked=await page.evaluate(()=>({viewport:window.innerWidth,document:document.documentElement.scrollWidth}));
            assert.ok(unlocked.document<=unlocked.viewport+1,viewport.label+' '+viewport.width+'x'+viewport.height+' '+route+' unlocked overflows: '+JSON.stringify(unlocked));
          }
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

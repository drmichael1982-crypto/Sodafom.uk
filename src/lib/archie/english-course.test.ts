import { describe, expect, it } from 'vitest';
import { ENGLISH_LESSONS, ENGLISH_SOURCE, ENGLISH_YEAR_PLANS, formatSplitDigraph } from './english-course';
const answer=(q:(typeof ENGLISH_LESSONS)[number]['questions'][number])=>q.options[q.answer];
describe('English learning year',()=>{
  it('has 972 distinct lessons and practice sets, with 108 lessons for each year',()=>{
    expect(ENGLISH_LESSONS).toHaveLength(972);
    expect(new Set(ENGLISH_LESSONS.map(l=>l.id)).size).toBe(972);
    expect(new Set(ENGLISH_LESSONS.map(l=>JSON.stringify(l.questions))).size).toBe(972);
    for(let year=1;year<=9;year++){
      expect(ENGLISH_YEAR_PLANS[year]).toHaveLength(36);
      const lessons=ENGLISH_LESSONS.filter(l=>l.year===year);expect(lessons).toHaveLength(108);
      for(let week=1;week<=36;week++)expect(lessons.filter(l=>l.week===week).map(l=>l.session)).toEqual([1,2,3]);
    }
  });
  it('has teaching, a worked answer, vocabulary, five valid questions and a practical seven-minute mission',()=>{
    const violations:string[]=[];
    for(const l of ENGLISH_LESSONS){
      const check=(valid:boolean,field:string)=>{if(!valid)violations.push(`${l.id}: ${field}`);};
      check(l.subject==='english','subject');check(l.source===ENGLISH_SOURCE,'source');
      check(l.teaching.length===4,'four teaching paragraphs');check(l.teaching.every(p=>p.length>20),'teaching length');
      check(l.vocabulary.length>=2,'vocabulary');check(/^Answer:/.test(l.example.explanation),'worked answer');
      check(l.questions.length===5,'five questions');check(l.mission.instructions.length===3,'three mission steps');
      check(l.mission.instructions[0]?.includes('2 minutes')===true,'first mission timing');check(l.mission.instructions[1]?.includes('3 minutes')===true,'middle mission timing');check(l.mission.instructions[2]?.includes('2 minutes')===true,'final mission timing');
      for(const [index,q] of l.questions.entries()){
        check(new Set(q.options).size===q.options.length,`question ${index+1} duplicate options`);
        check(q.options.length>=3,`question ${index+1} option count`);check(Number.isInteger(q.answer),`question ${index+1} integer answer`);
        check(q.answer>=0&&q.answer<q.options.length,`question ${index+1} answer range`);
        check(q.hint.length>10,`question ${index+1} hint`);check(q.explanation.length>10,`question ${index+1} explanation`);
      }
    }
    expect(violations).toEqual([]);
  });
  it('covers word work, grammar, reading, writing and discussion without pretending KS3 is a statutory year order',()=>{
    for(let year=1;year<=9;year++){
      const lessons=ENGLISH_LESSONS.filter(l=>l.year===year);
      expect(lessons.some(l=>l.unit.startsWith('Spelling:'))).toBe(true);
      expect(lessons.some(l=>l.unit.startsWith('Grammar'))).toBe(true);
      expect(lessons.some(l=>l.unit.startsWith('Reading'))).toBe(true);
      expect(lessons.some(l=>l.unit.startsWith('Spoken language'))).toBe(true);
      expect(lessons.some(l=>l.title.includes('Create and review'))).toBe(true);
    }
  });
  it('independently checks every generated regular object plural',()=>{
    const plurals:Record<string,string>={box:'boxes',map:'maps',kite:'kites',gate:'gates',book:'books',coin:'coins',shell:'shells',bag:'bags',clock:'clocks',ball:'balls',card:'cards'};
    const checkedByLesson=new Map<string,number>();
    for(const l of ENGLISH_LESSONS)for(const q of l.questions){
      const m=q.prompt.match(/^Write the plural of “([^”]+)”/);
      if(m){expect(answer(q),`${l.id}: ${q.prompt}`).toBe(plurals[m[1]]);checkedByLesson.set(l.id,(checkedByLesson.get(l.id)??0)+1);}
    }
    // Direct object-plural practice belongs to these two KS1 noun weeks. Later
    // noun-phrase weeks now practise phrase expansion rather than unrelated plurals.
    const expectedIds=[1,2,3].flatMap(session=>[`english-y1-w06-s${session}`,`english-y2-w05-s${session}`]).sort();
    expect([...checkedByLesson.keys()].sort()).toEqual(expectedIds);
    for(const id of expectedIds)expect(checkedByLesson.get(id),id).toBe(1);
  });
  it('independently checks past verbs and present subject agreement',()=>{
    const forms:Record<string,[string,string]>={carry:['carries','carried'],paint:['paints','painted'],open:['opens','opened'],touch:['touches','touched'],find:['finds','found'],move:['moves','moved'],clean:['cleans','cleaned'],lift:['lifts','lifted'],make:['makes','made'],watch:['watches','watched'],check:['checks','checked']};
    let checked=0;
    for(const l of ENGLISH_LESSONS)for(const q of l.questions){
      const m=q.prompt.match(/^(?:Choose the past form of|What is the past form of) “([^”]+)”/);
      if(m){expect(answer(q),`${l.id}: ${q.prompt}`).toBe(forms[m[1]][1]);checked++;}
      if(q.prompt.startsWith('Complete: They __'))expect(Object.keys(forms)).toContain(answer(q));
      if(q.prompt.startsWith('Complete this present-tense sentence:'))expect(Object.values(forms).map(x=>x[0])).toContain(answer(q));
    }
    expect(checked).toBeGreaterThan(15);
  });
  it('checks contractions and singular/plural possessive distinctions',()=>{
    const contractions:Record<string,string>={'do not':"don't",cannot:"can't",'I am':"I'm",'we will':"we'll",'it is':"it's"};let checked=0;
    for(const l of ENGLISH_LESSONS)for(const q of l.questions){
      const m=q.prompt.match(/^Which contraction means “([^”]+)”/);if(m){expect(answer(q)).toBe(contractions[m[1]]);checked++;}
      if(q.prompt.startsWith('Several dogs share'))expect(answer(q)).toBe("the dogs' bowl");
      if(q.prompt.includes('bag belonging to the children'))expect(answer(q)).toBe("the children's bag");
      if(q.prompt==='Which ordinary plural needs no apostrophe?')expect(answer(q)).toBe('three books');
    }
    expect(checked).toBeGreaterThan(20);
  });
  it('represents split digraphs as one vowel pair, and teaches genuine ee/ea/y contrasts',()=>{
    const split=ENGLISH_LESSONS.filter(l=>l.year===1&&/Split [aio]-e/.test(l.title));
    const blends=split.flatMap(l=>l.questions).filter(q=>q.prompt.startsWith('Blend these parts:'));
    expect(blends.length).toBeGreaterThan(0);
    const splitViolations:string[]=[];
    for(const q of blends){
      const parts=q.prompt.match(/^Blend these parts: ([a-z_-]+)\./)?.[1];
      const word=answer(q);const vowel=word.match(/([aio])[^aeiou]+e$/)?.[1];
      if(!parts||!vowel||!parts.includes(`${vowel}_e`)||parts.match(/_e/g)?.length!==1)splitViolations.push(`${word}: wrong split pair ${parts}`);
      if(parts?.replace('_e','').replaceAll('-','')+'e'!==word)splitViolations.push(`${word}: parts do not reconstruct the word ${parts}`);
      if(!q.explanation.includes('not an extra sound'))splitViolations.push(`${word}: missing sound explanation`);
    }
    expect(splitViolations).toEqual([]);
    // Authored expected sound groups for every word in the three split-digraph banks,
    // including initial blends (slide/smile/stone) and the sh digraph in shape.
    const grouped:Record<string,string>={cake:'c-a_e-k',name:'n-a_e-m',game:'g-a_e-m',gate:'g-a_e-t',lake:'l-a_e-k',shape:'sh-a_e-p',bike:'b-i_e-k',kite:'k-i_e-t',time:'t-i_e-m',line:'l-i_e-n',slide:'s-l-i_e-d',smile:'s-m-i_e-l',home:'h-o_e-m',rope:'r-o_e-p',hope:'h-o_e-p',note:'n-o_e-t',stone:'s-t-o_e-n',bone:'b-o_e-n'};
    for(const [word,expected] of Object.entries(grouped)){
      const raw=word==='shape'?'sh-a-p-e':[...word].join('-');
      const vowel=word.match(/([aio])[^aeiou]+e$/)![1];
      expect(formatSplitDigraph(raw,vowel),word).toBe(expected);
    }
    const contrast=ENGLISH_LESSONS.find(l=>l.id==='english-y2-w02-s1')!;
    expect(contrast.teaching.join(' ')).toContain('ee in see');expect(contrast.teaching.join(' ')).toContain('ea in sea');expect(contrast.teaching.join(' ')).toContain('y at the end of happy');
  });
  it('keeps Year 2 vocabulary and conjunction practice concrete',()=>{
    const vocab=ENGLISH_LESSONS.filter(l=>l.year===2&&l.week===27);
    expect(vocab).toHaveLength(3);
    for(const l of vocab)expect(JSON.stringify(l.questions)).not.toMatch(/meticulous|dictionary definition|concession/);
    for(const l of ENGLISH_LESSONS.filter(l=>l.year<=2&&l.unit.startsWith('Grammar:')&&l.title.includes('Link'))){expect(JSON.stringify(l.questions)).not.toContain('concession');}
    for(const l of ENGLISH_LESSONS.filter(l=>l.year===1&&l.unit.startsWith('Word reading')))for(const q of l.questions)expect(q.prompt.split(/\s+/).length).toBeLessThan(65);
  });
  it('uses explicitly stated evidence for reading retrieval questions',()=>{
    let checked=0;
    for(const l of ENGLISH_LESSONS)for(const q of l.questions){
      if(q.prompt.includes('How many')&&q.prompt.includes('are stated?')){
        const count=answer(q);expect(q.prompt).toMatch(new RegExp(`\\b${count}\\b`));expect(q.explanation).toContain(`states ${count}`);checked++;
      }
    }
    expect(checked).toBeGreaterThan(10);
  });
  it('keeps every generated scene summary faithful to its actors and stated actions',()=>{
    const violations:string[]=[];const scenes=new Set<string>();const modes=new Set<string>();let checked=0;
    for(const l of ENGLISH_LESSONS)for(const q of l.questions){
      if(q.prompt.includes('Which summary keeps the central event?')){
        const first=q.prompt.match(/^Read: ([^.]+)\./)?.[1]??'';let expected:string|undefined;let m:RegExpMatchArray|null;
        if((m=first.match(/^(\w+) could not find the (\w+)$/))){scenes.add('lost');expected=`${m[1]} could not find the ${m[2]}; a friend found it behind a chair.`;}
        else if((m=first.match(/^(\w+) waited to show a new (\w+)$/))){scenes.add('show');expected=`${m[1]} waited to show a new ${m[2]}; a friend came to look at it.`;}
        else if((m=first.match(/^(\w+) brought a (\w+) to the (\w+)$/))){scenes.add('shelf');expected=`${m[1]} brought a ${m[2]} to the ${m[3]}; a friend helped put it on a shelf.`;}
        else if((m=first.match(/^(\w+) dropped a (\w+) in the \w+$/))){scenes.add('dropped');expected=`${m[1]} dropped a ${m[2]}; a friend checked that it was safe to pick up.`;}
        else if((m=first.match(/^(\w+) saw an unfamiliar (\w+) in the \w+$/))){scenes.add('unfamiliar');expected=`${m[1]} saw an unfamiliar ${m[2]}; a friend explained what it was used for.`;}
        else if((m=first.match(/^(\w+) had two paper cards in the \w+$/))){scenes.add('sharing');expected=`${m[1]} offered a spare card to a friend, who received it.`;if(!q.prompt.includes(`${m[1]} offered the spare card to a friend who had none`)||!q.prompt.includes('A friend received one of the cards.'))violations.push(`${l.id}: missing sharing evidence`);}
        else if((m=first.match(/^(\w+) planned to draw a (\w+) in the \w+$/))){scenes.add('drawing');expected=`${m[1]} planned to draw a ${m[2]}; a friend supplied a pencil so the drawing could begin.`;}
        if(!expected||answer(q)!==expected)violations.push(`${l.id}: ${first}: unsupported summary ${answer(q)}`);
        modes.add('central');checked++;
      }else if(q.prompt.includes('Which detail is not a valid addition to its summary?')){
        if(answer(q)!=='The character secretly won a national race'||!q.prompt.includes('friend')||!q.options.includes('A friend takes part in the scene.'))violations.push(`${l.id}: summary addition`);
        modes.add('addition');checked++;
      }else if(q.prompt==='What should a short summary usually prioritise?'){
        if(answer(q)!=='The main ideas and central events')violations.push(`${l.id}: summary priorities`);modes.add('priorities');checked++;
      }else if(q.prompt.includes('Which short statement is faithful to the passage?')){
        if(answer(q)!=='A friend takes part in the scene.'||!q.prompt.includes('friend'))violations.push(`${l.id}: faithful statement`);modes.add('faithful');checked++;
      }else if(q.prompt==='How can you check your summary?'){
        if(answer(q)!=='Compare its claims with the original text')violations.push(`${l.id}: summary checking`);modes.add('checking');checked++;
      }
    }
    expect(violations).toEqual([]);expect(scenes.size).toBe(7);expect(modes.size).toBe(5);expect(checked).toBeGreaterThan(100);
  });
  it('grounds all inference variants in evidence and treats kindness as a quality',()=>{
    const clues:[string,string][]=[['kept checking the door and biting a lip','Worried'],['grinned and bounced on the spot','Excited'],['yawned and rubbed sleepy eyes','Tired'],['let out a long breath after seeing it was unbroken','Relieved'],['leaned closer and asked several questions','Curious'],['offered the spare card to a friend who had none','Kind'],['looked at the empty pencil case and sighed','Disappointed at first']];
    const violations:string[]=[];const interpretations=new Set<string>();const modes=new Set<string>();let checked=0;
    for(const l of ENGLISH_LESSONS)for(const q of l.questions){
      if(!q.prompt.startsWith('Read this original story:'))continue;
      const evidence=q.prompt.match(/^Read this original story: [^.]+\. ([^.]+)\./)?.[1]??'';
      const interpretation=clues.find(([clue])=>evidence.includes(clue))?.[1];
      const name=q.prompt.match(/^Read this original story: (\w+) /)?.[1];
      if(!interpretation||!name){violations.push(`${l.id}: unsupported inference scene`);continue;}
      interpretations.add(interpretation);
      if(q.prompt.endsWith('What does the action clue most strongly suggest?')){if(answer(q)!==interpretation)violations.push(`${l.id}: inference meaning`);modes.add('meaning');}
      else if(q.prompt.endsWith('Which detail best supports that interpretation?')){if(answer(q)!==evidence)violations.push(`${l.id}: inference evidence`);modes.add('evidence');}
      else if(q.prompt.endsWith('Which claim goes beyond the evidence?')){if(answer(q)!=='The character will always feel the same way')violations.push(`${l.id}: inference limit`);modes.add('limit');}
      else if(q.prompt.endsWith('Which approach gives the strongest explanation?')){if(answer(q)!=='Name a text clue and explain what it suggests')violations.push(`${l.id}: inference explanation`);modes.add('explanation');}
      else if(q.prompt.endsWith('Which is the fairest wording of the interpretation?')){if(answer(q)!==`The clue suggests ${name} may be ${interpretation.toLowerCase()}.`)violations.push(`${l.id}: inference wording`);modes.add('wording');}
      else violations.push(`${l.id}: unreviewed inference variant`);
      if(interpretation==='Kind'&&/feel kind|that feeling/.test(JSON.stringify(q)))violations.push(`${l.id}: kindness presented as a feeling`);
      checked++;
    }
    expect(violations).toEqual([]);expect(interpretations.size).toBe(7);expect(modes.size).toBe(5);expect(checked).toBeGreaterThan(100);
  });
  it('teaches actual expanded noun phrases in Years 3 and 4 week two',()=>{
    const lessons=ENGLISH_LESSONS.filter(l=>[3,4].includes(l.year)&&l.week===2);expect(lessons).toHaveLength(6);
    const violations:string[]=[];const modes=new Set<string>();let checked=0;
    for(const l of lessons){
      if(!l.teaching.join(' ').includes('head noun')||!l.mission.instructions[0].includes('expand it with a describing word and a location'))violations.push(`${l.id}: noun-phrase teaching/mission`);
      for(const q of l.questions){
        const phrase=q.prompt.match(/the (\w+) (\w+) beside the bench/);
        if(q.prompt.endsWith('Which is the whole expanded noun phrase describing the object?')){if(answer(q)!==phrase?.[0])violations.push(`${l.id}: whole phrase`);modes.add('whole');}
        else if(q.prompt.endsWith('which is the head noun: the main thing being described?')){if(answer(q)!==phrase?.[2])violations.push(`${l.id}: head noun`);modes.add('head');}
        else if(q.prompt.startsWith('Expand ')){
          const original=q.prompt.match(/“the (\w+)”/)?.[1];const expanded=answer(q).match(/^the (\w+) (\w+) beside the bench$/);
          if(!expanded||expanded[2]!==original)violations.push(`${l.id}: expansion changes head noun`);modes.add('expand');
        }else if(q.prompt.endsWith('which part tells us where the object is?')){if(answer(q)!=='beside the bench')violations.push(`${l.id}: location phrase`);modes.add('location');}
        else if(q.prompt.startsWith('Which version adds both a description and a location')){
          const original=q.prompt.match(/“the (\w+)”/)?.[1];const expanded=answer(q).match(/^the (\w+) (\w+) beside the bench$/);
          if(!expanded||expanded[2]!==original)violations.push(`${l.id}: missing describing/location detail`);modes.add('detail');
        }else violations.push(`${l.id}: unrelated noun practice`);
        checked++;
      }
    }
    expect(violations).toEqual([]);expect(modes.size).toBe(5);expect(checked).toBe(30);
  });
  it('matches Year 5 possibility adverbs to contextual degrees of certainty',()=>{
    const lessons=ENGLISH_LESSONS.filter(l=>l.year===5&&l.week===32);expect(lessons).toHaveLength(3);
    const violations:string[]=[];const modes=new Set<string>();let checked=0;
    for(const l of lessons){
      if(!l.teaching.join(' ').includes('perhaps, probably and certainly')||!l.mission.instructions[0].includes('predictions'))violations.push(`${l.id}: missing possibility teaching/mission`);
      for(const q of l.questions){
        if(q.prompt.includes('which word marks the event as possible rather than certain?')){if(answer(q)!=='Perhaps')violations.push(`${l.id}: possible`);modes.add('possible');}
        else if(q.prompt.includes('but nobody knows yet. Choose an adverb')){if(answer(q)!=='Perhaps')violations.push(`${l.id}: uncertainty`);modes.add('uncertainty');}
        else if(q.prompt.endsWith('Which adverb means likely, but not certain?')){if(answer(q)!=='Probably')violations.push(`${l.id}: likelihood`);modes.add('likely');}
        else if(q.prompt.endsWith('Which adverb expresses stronger certainty?')){if(answer(q)!=='certainly')violations.push(`${l.id}: certainty comparison`);modes.add('stronger');}
        else if(q.prompt.endsWith('before the plan is confirmed?')){if(answer(q)!=='To present a possible event without claiming it is certain')violations.push(`${l.id}: qualified claim`);modes.add('qualification');}
        else violations.push(`${l.id}: unrelated manner practice`);
        checked++;
      }
    }
    expect(violations).toEqual([]);expect(modes.size).toBe(5);expect(checked).toBe(15);
  });
});

import { describe, expect, it } from 'vitest';
import { MATHS_LESSONS, MATHS_SOURCE, MATHS_YEAR_PLANS } from './maths-course';

const correct = (q: (typeof MATHS_LESSONS)[number]['questions'][number]) => q.options[q.answer];
// Canonicalise numerical labels, including reduced/unreduced fractions and pi
// coefficients, so differently written but equal options cannot both be offered.
function numericLabel(label: string): string | undefined {
  const match=label.replaceAll('−','-').match(/^(-?\d+(?:\.\d+)?)(?:\/(\d+))?(π)?(.*)$/);
  if(!match || (match[4] && !/^(?:p|°|%| [A-Za-z²³/°%]+)$/.test(match[4]))) return undefined;
  const value=Number(match[1]) / (match[2]?Number(match[2]):1);
  return `${Number(value.toFixed(8))}|${match[3]??''}|${match[4]}`;
}

describe('the maths year course',()=>{
  it('contains nine complete 36-week schedules with five uniquely identified sessions per week',()=>{
    expect(MATHS_LESSONS).toHaveLength(1620);
    expect(new Set(MATHS_LESSONS.map(l=>l.id)).size).toBe(1620);
    expect(new Set(MATHS_LESSONS.map(l=>JSON.stringify(l.questions))).size).toBe(1620);
    for(let year=1;year<=9;year++){
      expect(MATHS_YEAR_PLANS[year]).toHaveLength(36);
      const lessons=MATHS_LESSONS.filter(l=>l.year===year);
      expect(lessons).toHaveLength(180);
      for(let week=1;week<=36;week++) expect(lessons.filter(l=>l.week===week).map(l=>l.session)).toEqual([1,2,3,4,5]);
    }
  });
  it('gives every session substantive teaching, a worked answer, five questions and a safe seven-minute practical task',()=>{
    for(const lesson of MATHS_LESSONS){
      expect(lesson.subject).toBe('maths'); expect(lesson.source).toBe(MATHS_SOURCE);
      expect(lesson.objective.length).toBeGreaterThan(40);
      expect(lesson.teaching).toHaveLength(4); expect(lesson.teaching.every(p=>p.length>20)).toBe(true);
      expect(lesson.vocabulary.length).toBeGreaterThanOrEqual(2);
      expect(lesson.example.explanation).toMatch(/^Answer:/);
      expect(lesson.questions.length).toBeGreaterThanOrEqual(5);
      expect(lesson.mission.instructions).toHaveLength(3);
      expect(lesson.mission.instructions.join(' ')).toContain('2 minutes');
      expect(lesson.mission.instructions.join(' ')).toContain('3 minutes');
      expect(lesson.reflection.length).toBeGreaterThan(30);
    }
  });
  it('offers exactly one labelled correct answer and no mathematically equivalent numeric alternatives',()=>{
    const violations:string[]=[];
    for(const lesson of MATHS_LESSONS) for(const q of lesson.questions){
      const check=(valid:boolean,field:string)=>{if(!valid)violations.push(`${lesson.id}: ${q.prompt}: ${field}`);};
      check(q.options.length>=3,'option count');
      check(new Set(q.options).size===q.options.length,'duplicate labelled options');
      check(Number.isInteger(q.answer),'integer answer');
      check(q.answer>=0&&q.answer<q.options.length,'answer range');
      check(q.hint.length>10,'hint');check(q.explanation.length>4,'explanation');
      const numbers=q.options.map(numericLabel).filter((n):n is string=>n!==undefined);
      check(new Set(numbers).size===numbers.length,`equivalent numeric options: ${q.options.join('; ')}`);
    }
    expect(violations).toEqual([]);
  });
  it('covers all primary domains in the appropriate years and every KS3 domain',()=>{
    const domains=(year:number)=>new Set(MATHS_LESSONS.filter(l=>l.year===year).map(l=>l.unit.split(':')[0]));
    for(let year=1;year<=6;year++)for(const domain of ['Number','Arithmetic','Fractions','Measurement','Geometry']) expect(domains(year).has(domain),`Year ${year}: ${domain}`).toBe(true);
    for(let year=2;year<=6;year++)expect(domains(year).has('Statistics')).toBe(true);
    for(let year=7;year<=9;year++)for(const domain of ['Number','Algebra','Ratio and proportion','Geometry','Statistics','Probability'])expect(domains(year).has(domain),`Year ${year}: ${domain}`).toBe(true);
    expect(domains(6).has('Ratio and proportion')).toBe(true); expect(domains(6).has('Algebra')).toBe(true);
  });
  it('independently recomputes direct integer and decimal arithmetic across the generated bank',()=>{
    let checked=0;
    for(const l of MATHS_LESSONS)for(const q of l.questions){
      const m=q.prompt.match(/^(-?\d+(?:\.\d+)?) ([+−×÷]) (-?\d+(?:\.\d+)?) = \?$/);
      if(!m)continue;
      const left=Number(m[1]),right=Number(m[3]);
      const value=m[2]==='+'?left+right:m[2]==='−'?left-right:m[2]==='×'?left*right:left/right;
      expect(Number(correct(q)),`${l.id}: ${q.prompt}`).toBeCloseTo(value,7);checked++;
    }
    expect(checked).toBeGreaterThan(500);
  });
  it('independently recomputes generated fraction operations and quantity problems',()=>{
    let checked=0;
    for(const l of MATHS_LESSONS)for(const q of l.questions){
      const operation=q.prompt.match(/^(\d+)\/(\d+) ([+−×÷]) (\d+)(?:\/(\d+))? = \?/);
      const amount=q.prompt.match(/^Find (\d+)\/(\d+) of (\d+)\.$/);
      if(!operation && !amount)continue;
      let expected=0;
      if(operation){const a=Number(operation[1])/Number(operation[2]),b=Number(operation[4])/Number(operation[5]??1);expected=operation[3]==='+'?a+b:operation[3]==='−'?a-b:operation[3]==='×'?a*b:a/b;}
      else if(amount)expected=Number(amount[1])*Number(amount[3])/Number(amount[2]);
      const answer=correct(q).split('/').map(Number);const actual=answer[0]/(answer[1]??1);
      expect(actual,`${l.id}: ${q.prompt}`).toBeCloseTo(expected,7);checked++;
    }
    expect(checked).toBeGreaterThan(300);
  });
  it('keeps Year 1 addition within 20 and uses child-friendly primary teaching',()=>{
    for(const lesson of MATHS_LESSONS.filter(l=>l.year===1 && l.unit.startsWith('Arithmetic:'))){
      if(!lesson.unit.includes('Adding')&&!lesson.unit.includes('Joining')&&!lesson.unit.includes('Missing'))continue;
      for(const q of lesson.questions){const match=q.prompt.match(/^(\d+) \+ (\d+) = \?$/);if(match)expect(Number(match[1])+Number(match[2])).toBeLessThanOrEqual(20);}
      expect(lesson.teaching.join(' ')).not.toMatch(/distributiv|carry remainder|dividend/i);
    }
  });
  it('varies the questions when the same skill returns in a later week',()=>{
    const year1=MATHS_LESSONS.filter(l=>l.year===1&&l.session===1&&l.unit.startsWith('Arithmetic:')&&l.title.includes('bonds'));
    expect(new Set(year1.map(l=>JSON.stringify(l.questions))).size).toBe(year1.length);
    const first=MATHS_LESSONS.find(l=>l.id==='maths-y9-w21-s1')!;
    expect(first.title).toContain('right triangles');
    expect(first.questions.some(q=>q.prompt.includes('hypotenuse'))).toBe(true);
  });
  it('actually practises crossing one hundred, with independently checked counting answers',()=>{
    const lessons=MATHS_LESSONS.filter(l=>l.year===1&&l.week===30);
    expect(lessons).toHaveLength(5);
    const violations:string[]=[];let forwardCrossings=0;let backwardCrossings=0;let checked=0;
    for(const lesson of lessons)for(const q of lesson.questions){
      const single=q.prompt.match(/^Count 1 (on|back) from (\d+)\. Where do you land\?$/);
      const jumps=q.prompt.match(/starts at (\d+) and takes three jumps of 1 (forwards|backwards)/);
      const trail=q.prompt.match(/^Complete the equal-step trail: (\d+), (\d+), __, (\d+)\.$/);
      const start=single?Number(single[2]):jumps?Number(jumps[1]):trail?Number(trail[1]):undefined;
      if(start===undefined)continue;
      const direction=single?(single[1]==='back'?-1:1):jumps?(jumps[2]==='backwards'?-1:1):Number(trail![2])-start;
      const expected=start+direction*(single?1:jumps?3:2);const end=trail?Number(trail[3]):expected;
      if(Number(correct(q))!==expected)violations.push(`${lesson.id}: ${q.prompt}`);
      if(Math.abs(direction)!==1||end<0)violations.push(`${lesson.id}: unsafe counting step`);
      if(trail&&(Number(trail[2])!==start+direction||Number(trail[3])!==start+3*direction))violations.push(`${lesson.id}: inconsistent trail`);
      if(start<=100&&end>100)forwardCrossings++;
      if(start>=100&&end<100)backwardCrossings++;
      checked++;
    }
    expect(violations).toEqual([]);expect(checked).toBe(15);expect(forwardCrossings).toBeGreaterThan(0);expect(backwardCrossings).toBeGreaterThan(0);
    expect(lessons.flatMap(l=>l.questions).some(q=>Number(correct(q))>100)).toBe(true);
  });
  it('covers every advertised decimal scaling factor with independently checked arithmetic',()=>{
    for(const [year,week,expectedFactors] of [[4,19,[10,100]],[5,12,[10,100,1000]]] as const){
      const lessons=MATHS_LESSONS.filter(l=>l.year===year&&l.week===week);expect(lessons).toHaveLength(5);
      const seen=new Set<number>();const operations=new Set<string>();const violations:string[]=[];let checked=0;
      for(const l of lessons)for(const q of l.questions){
        const match=q.prompt.match(/^(\d+(?:\.\d+)?) ([×÷]) (10|100|1000) = \?$/);
        if(!match){violations.push(`${l.id}: missing scaling calculation`);continue;}
        const input=Number(match[1]),factor=Number(match[3]);seen.add(factor);operations.add(match[2]);
        const expected=match[2]==='÷'?input/factor:input*factor;
        if(Math.abs(Number(correct(q))-expected)>1e-8)violations.push(`${l.id}: ${q.prompt} wrong answer`);
        if(year===4&&(!Number.isInteger(input)||input<0||input>99||match[2]!=='÷'))violations.push(`${l.id}: Year 4 division range`);
        checked++;
      }
      expect(violations).toEqual([]);expect(checked).toBe(25);expect([...seen].sort((a,b)=>a-b)).toEqual([...expectedFactors]);
      expect(operations).toEqual(new Set(year===4?['÷']:['×','÷']));
    }
  });
  it('keeps the Year 3 unit-fraction topic to numerator one and recomputes its quantities',()=>{
    const lessons=MATHS_LESSONS.filter(l=>l.year===3&&l.week===14);expect(lessons).toHaveLength(5);
    const violations:string[]=[];let checked=0;let chosenChecked=0;
    for(const l of lessons)for(const q of l.questions){
      const calculation=q.prompt.match(/^Find (\d+)\/(\d+) of (\d+)\.$/)??q.prompt.match(/selects (\d+)\/(\d+) of (\d+) map tiles/);
      if(calculation){
        if(Number(calculation[1])!==1||Number(correct(q))!==Number(calculation[3])/Number(calculation[2]))violations.push(`${l.id}: ${q.prompt}`);
        checked++;
      }
      const chosen=q.prompt.match(/split into (\d+) equal parts and (\d+) (is|are) chosen/);
      if(chosen){
        if(Number(chosen[2])!==1||chosen[3]!=='is'||correct(q)!==`1/${chosen[1]}`)violations.push(`${l.id}: non-unit part choice`);
        chosenChecked++;
      }
      const whole=q.prompt.match(/^A 1\/(\d+) share of a collection contains (\d+) items/);
      if(whole&&Number(correct(q))!==Number(whole[1])*Number(whole[2]))violations.push(`${l.id}: incorrect whole from unit share`);
    }
    expect(violations).toEqual([]);expect(checked).toBe(15);expect(chosenChecked).toBe(5);
  });
  it('matches KS1 mass and capacity missions to equal units of those quantities',()=>{
    for(const year of [1,2]){
      const mass=MATHS_LESSONS.filter(l=>l.year===year&&/mass/i.test(l.unit));
      const capacity=MATHS_LESSONS.filter(l=>l.year===year&&/capacity/i.test(l.unit));
      expect(mass).toHaveLength(5);expect(capacity).toHaveLength(5);
      for(const l of mass){const mission=l.mission.instructions.join(' ');expect(mission).toContain('equal mass units');expect(mission).toContain('heavier');expect(mission).not.toContain('ribbon');}
      for(const l of capacity){const mission=l.mission.instructions.join(' ');expect(mission).toContain('full cups');expect(mission).toContain('every cup the same size');expect(mission).toContain('capacities');expect(mission).not.toContain('ribbon');}
    }
  });
  it('keeps Year 1 clock readings to hours and half hours while retaining Year 2 quarter hours',()=>{
    const yearOne=MATHS_LESSONS.filter(l=>l.year===1&&l.week===17);expect(yearOne).toHaveLength(5);
    for(const l of yearOne)for(const q of l.questions){
      const time=q.prompt.match(/^What does (\d+):(\d+) mean\?$/);expect(time,`${l.id}: ${q.prompt}`).not.toBeNull();
      const minute=Number(time![2]),hour=Number(time![1]);expect([0,30]).toContain(minute);
      expect(correct(q)).toBe(minute===0?`${hour} o’clock`:`half past ${hour}`);
    }
    const quarters=MATHS_LESSONS.filter(l=>l.year===2&&l.week===23).flatMap(l=>l.questions);
    expect(new Set(quarters.map(q=>q.prompt.match(/:(\d+) mean/)?.[1]))).toEqual(new Set(['15','45']));
  });
});

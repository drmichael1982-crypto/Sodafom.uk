import { describe, expect, it } from 'vitest';
import { HISTORY_ALLOCATION_NOTE, HISTORY_LESSONS } from './history-course';
import { COURSE_PHASES } from './course-types';

describe('the authored history enquiry programme', () => {
  it('provides a distinct thirty-minute enquiry for all 36 weeks of Years 1–9', () => {
    expect(HISTORY_LESSONS).toHaveLength(324);
    expect(new Set(HISTORY_LESSONS.map(lesson => lesson.id)).size).toBe(324);
    expect(new Set(HISTORY_LESSONS.map(lesson => lesson.title)).size).toBe(324);
    expect(COURSE_PHASES.reduce((minutes, phase) => minutes + phase.minutes, 0)).toBe(30);
    for (let year=1; year<=9; year+=1) {
      const lessons = HISTORY_LESSONS.filter(lesson => lesson.year === year);
      expect(lessons).toHaveLength(36);
      expect(lessons.map(lesson => lesson.week)).toEqual(Array.from({length:36}, (_,n)=>n+1));
      expect(new Set(lessons.map(lesson => lesson.unit)).size).toBe(6);
    }
  });

  it('includes original teaching, evidence limits, practical enquiries and valid answer keys', () => {
    for (const lesson of HISTORY_LESSONS) {
      expect(lesson.subject).toBe('history');
      expect(lesson.session).toBe(1);
      expect(lesson.objective.length).toBeGreaterThan(65);
      expect(lesson.teaching.length).toBeGreaterThanOrEqual(3);
      expect(lesson.teaching.join(' ').split(/\s+/).length).toBeGreaterThan(130);
      expect(lesson.teaching.join(' ')).toContain('Imagine finding this clue:');
      expect(lesson.vocabulary).toHaveLength(3);
      expect(lesson.example.explanation).toContain(lesson.year<=2 ? 'what it cannot tell us' : 'state a limit');
      expect(lesson.mission.instructions.length).toBeGreaterThanOrEqual(5);
      expect(lesson.reflection).toContain(lesson.year<=2 ? 'find out' : 'unanswered');
      expect(new URL(lesson.source).protocol).toBe('https:');
      expect(lesson.questions.length).toBeGreaterThanOrEqual(5);
      for (const question of lesson.questions) {
        expect(question.options).toHaveLength(3);
        expect(new Set(question.options).size).toBe(3);
        expect(Number.isInteger(question.answer)).toBe(true);
        expect(question.answer).toBeGreaterThanOrEqual(0);
        expect(question.answer).toBeLessThan(question.options.length);
        expect(question.hint.length).toBeGreaterThan(15);
        expect(question.explanation.length).toBeGreaterThan(40);
      }
      const vocabularyQuestion = lesson.questions[4];
      expect(vocabularyQuestion.options[vocabularyQuestion.answer]).toBe(lesson.vocabulary[1].meaning);
    }
  });

  it('spirals chronology, evidence, change, causation, perspective and explanation in every unit', () => {
    for (let offset=0; offset<HISTORY_LESSONS.length; offset+=6) {
      const unit = HISTORY_LESSONS.slice(offset,offset+6);
      expect(new Set(unit.map(lesson=>lesson.objective)).size).toBe(6);
      expect(new Set(unit.map(lesson=>lesson.mission.title)).size).toBe(6);
      expect(new Set(unit.map(lesson=>lesson.questions[0].prompt)).size).toBe(6);
      expect(unit.map(lesson=>lesson.vocabulary[1].word)).toEqual(unit[0].year<=2 ? ['order','clue','same','reason','view','question'] : ['chronology','evidence','continuity','cause','perspective','enquiry']);
    }
  });

  it('introduces Years 1–2 skills with spoken-friendly questions instead of adult evidence language',()=>{
    const young=HISTORY_LESSONS.filter(lesson=>lesson.year<=2);
    expect(young).toHaveLength(72);
    for(const lesson of young){
      for(const item of lesson.questions){
        const childText=[item.prompt,...item.options,item.hint,item.explanation].join(' ');
        expect(childText).not.toMatch(/\b(claim|establish|perspective|chronology|continuity|enquiry|institution|fabricated)\b/i);
      }
      expect(lesson.vocabulary[1].meaning.split(/\s+/).length).toBeLessThanOrEqual(10);
      const discovery=[lesson.objective,...lesson.teaching,lesson.example.prompt,lesson.example.explanation,lesson.reflection,...lesson.vocabulary.flatMap(item=>[item.word,item.meaning])].join(' ');
      expect(discovery).not.toMatch(/\b(claim|establish|perspective|chronology|continuity|enquiry|institution|fabricated|implementation)\b/i);
      expect(lesson.teaching.join(' ')).toContain('Imagine finding this clue:');
      expect(lesson.example.prompt).toContain('Imagine finding this clue:');
      expect(discovery).not.toContain('teaching example of a type of source');
    }
    const older=HISTORY_LESSONS.find(lesson=>lesson.year===3&&lesson.week===2)!;
    expect(older.questions[0].prompt).toContain('Which claim can it support?');
    expect(older.vocabulary[1].word).toBe('evidence');
  });

  it('keeps young answer keys anchored to the given sequence and the limits of a clue',()=>{
    const firstUnit=HISTORY_LESSONS.filter(lesson=>lesson.year===1).slice(0,6);
    const answer=(lesson:number,item:number)=>{
      const q=firstUnit[lesson].questions[item];return q.options[q.answer];
    };
    expect(answer(0,0)).toBe('being a baby');
    expect(answer(0,1)).toBe('learning in school now');
    expect(answer(1,0)).toBe('what that entrance looked like on that day');
    expect(answer(1,1)).toBe('No, we need other clues');
    expect(answer(3,1)).toBe('Look for a reason and a clue');
    expect(answer(4,0)).toBe('Ask who made or remembered it');
    expect(answer(4,1)).toBe('Look for another clue');
    for(const lesson of HISTORY_LESSONS.filter(lesson=>lesson.year<=2)){
      expect(lesson.questions[3].options[lesson.questions[3].answer]).toBe('No, we need another clue');
      expect(lesson.questions[3].explanation).toContain('It does not tell us');
    }
  });

  it('covers the allocated key-stage themes and labels year placement honestly', () => {
    expect(HISTORY_ALLOCATION_NOTE).toContain('not statutory year-by-year');
    const primary = HISTORY_LESSONS.filter(lesson=>lesson.year>=3 && lesson.year<=6);
    const primaryTitles = primary.map(lesson=>lesson.unit).join(' ');
    for (const topic of ['Hunter-gatherers','Bronze Age','Iron Age','Egypt','Rome','Anglo-Saxon','Scots','Vikings','Greek','Benin','Local','beyond 1066']) {
      expect(primaryTitles).toContain(topic);
    }
    const younger = HISTORY_LESSONS.filter(lesson=>lesson.year<=2);
    expect(younger.every(lesson=>lesson.mission.instructions[0].includes('trusted grown-up'))).toBe(true);
    const holocaust = HISTORY_LESSONS.filter(lesson=>lesson.unit.includes('Holocaust'));
    expect(holocaust).toHaveLength(6);
    const sensitive = HISTORY_LESSONS.filter(lesson=>lesson.sensitive);
    expect(sensitive.map(lesson=>lesson.id)).toEqual(holocaust.map(lesson=>lesson.id));
    expect(sensitive.every(lesson=>lesson.year>=7)).toBe(true);
    expect(holocaust.every(lesson=>lesson.year===9)).toBe(true);
    expect(holocaust.every(lesson=>lesson.teaching[0].includes('pause at any time'))).toBe(true);
    expect(holocaust.every(lesson=>lesson.teaching[0].includes('six million European Jews'))).toBe(true);
  });

  it('anchors the main Benin study in the early period and separates its later-art extension', () => {
    const early = HISTORY_LESSONS.filter(lesson=>lesson.unit==='The Kingdom of Benin');
    const extension = HISTORY_LESSONS.filter(lesson=>lesson.unit==='Benin art: evidence and ownership');
    expect(early).toHaveLength(6);
    expect(extension).toHaveLength(6);
    for(const lesson of early){
      expect(lesson.year).toBe(6);
      expect(lesson.teaching[0]).toContain('c.AD 900–1300');
      expect(lesson.teaching[0]).toContain('Ogiso');
      expect(lesson.teaching[0]).toContain('around 1200; exact early dates are uncertain');
      expect(lesson.teaching[0]).toContain('conquest of England in 1066');
      expect(lesson.teaching[0]).toContain('different histories during overlapping centuries');
      expect(lesson.source).toContain('nms.ac.uk');
    }
    const chronology=early[0];
    expect(chronology.questions[0].options[chronology.questions[0].answer]).toContain('earlier Ogiso rulers');
    const evidence=early[1];
    expect(evidence.questions[0].options[evidence.questions[0].answer]).toBe('how changes in early royal leadership were remembered');
    expect(evidence.questions[1].options[evidence.questions[1].answer]).toBe('No: we need other evidence');
    for(const lesson of extension){
      expect(lesson.teaching[0]).toContain('later extension');
      expect(lesson.teaching[0]).toContain('1500s onwards');
      expect(lesson.teaching[0]).toContain('do not treat them as direct pictures of the earlier period');
      expect(lesson.teaching[0]).toContain('1897');
    }
  });

  it('balances answer positions and repeats only two core retrieval checks within each six-lesson unit', () => {
    const counts = [0,0,0];
    for (const lesson of HISTORY_LESSONS) {
      for (const question of lesson.questions) counts[question.answer]+=1;
    }
    expect(counts).toEqual([540,540,540]);
    for (let offset=0; offset<HISTORY_LESSONS.length; offset+=6) {
      const unit = HISTORY_LESSONS.slice(offset,offset+6);
      // The topic's change/cause and source limitation are intentionally revisited.
      expect(new Set(unit.map(lesson=>lesson.questions[2].prompt)).size).toBe(1);
      expect(new Set(unit.map(lesson=>lesson.questions[3].prompt)).size).toBe(1);
      // Each week's two enquiry checks and focus vocabulary check are distinct.
      expect(new Set(unit.flatMap(lesson=>[lesson.questions[0].prompt,lesson.questions[1].prompt,lesson.questions[4].prompt])).size).toBe(18);
    }
  });
});

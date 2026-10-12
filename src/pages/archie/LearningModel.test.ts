import { expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { within } from '@testing-library/react';
import { MATHS_LESSONS } from '@/lib/archie/maths-course';
import LearningModel, { clockHandAngles, getLearningModel } from './LearningModel';

function picture(prompt:string) {
  const container=document.createElement('div');
  container.innerHTML=renderToStaticMarkup(createElement(LearningModel,{prompt}));
  return container;
}
it('exposes the actual introductory addition picture by its two given groups',()=>{
  const lesson=MATHS_LESSONS.find(item=>item.id==='maths-y1-w04-s1');
  expect(lesson?.questions[0].prompt).toBe('1 + 1 = ?');
  const rendered=picture(lesson!.questions[0].prompt);
  const image=within(rendered).getByRole('img',{name:'1 blue counters and 1 gold counters'});
  expect(within(rendered).getAllByRole('img')).toHaveLength(1);
  expect(image.querySelectorAll('span')).toHaveLength(2);
  expect(image.querySelectorAll('.gold')).toHaveLength(1);
  expect(image).not.toHaveAccessibleName(/2|answer|total/i);
});

it.each([
  {prompt:'4 + 3 = ?',name:'4 blue counters and 3 gold counters',counters:7,gold:3,crossed:0},
  {prompt:'9 − 2 = ?',name:'9 counters with 2 crossed out',counters:9,gold:0,crossed:2},
])('exposes $prompt as one named counter picture without changing the drawn groups',({prompt,name,counters,gold,crossed})=>{
  const rendered=picture(prompt);
  const image=within(rendered).getByRole('img',{name});
  expect(within(rendered).getAllByRole('img')).toHaveLength(1);
  expect(image.querySelectorAll('span')).toHaveLength(counters);
  expect(image.querySelectorAll('.gold')).toHaveLength(gold);
  expect(image.querySelectorAll('.crossed')).toHaveLength(crossed);
  expect(image.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(counters);
  expect(image).not.toHaveAccessibleName(/7|answer|total|remainder/i);
});

it('exposes the equal fraction parts without announcing the calculated amount',()=>{
  const rendered=picture('Find 2/3 of 12.');
  const image=within(rendered).getByRole('img',{name:'3 equal parts, 2 shaded'});
  expect(within(rendered).getAllByRole('img')).toHaveLength(1);
  expect(image.querySelectorAll('span')).toHaveLength(3);
  expect(image.querySelectorAll('.shaded')).toHaveLength(2);
  expect(image).not.toHaveAccessibleName(/8|answer/i);
});

it('exposes the ordered number path without announcing its calculated step',()=>{
  const rendered=picture('What is the equal step in 1, 2, 3?');
  const image=within(rendered).getByRole('img',{name:'Number path: 1, 2, 3'});
  expect(within(rendered).getAllByRole('img')).toHaveLength(1);
  expect(Array.from(image.querySelectorAll('strong'),node=>node.textContent)).toEqual(['1','2','3']);
  expect(within(image).queryAllByRole('strong')).toHaveLength(0);
  expect(image).not.toHaveAccessibleName(/step|answer/i);
  expect(within(image).queryAllByRole('button')).toHaveLength(0);
});

it('models counters, commas in place value and equal fractional parts safely',()=>{
  expect(getLearningModel('What is the equal step in 1, 2, 3?')).toEqual({kind:'sequence',values:[1,2,3]});
  expect(getLearningModel('What is the equal step in 40, 41, 42?')).toBeNull();
  expect(getLearningModel('4 + 3 = ?')).toEqual({kind:'dots',a:4,b:3,operation:'+'});
  expect(getLearningModel('9 − 2 = ?')).toEqual({kind:'dots',a:9,b:2,operation:'−'});
  expect(getLearningModel('In 70,145, what is the value of the digit 7?')).toEqual({kind:'place',digits:'70145'});
  expect(getLearningModel('Find 2/3 of 12.')).toEqual({kind:'fraction',numerator:2,denominator:3});
  expect(getLearningModel('Find 4/3 of 12.')).toBeNull();
  expect(getLearningModel('4 − 9 = ?')).toBeNull();
  expect(getLearningModel('Which source is trustworthy?')).toBeNull();
});

it('places the hour hand between numbers, including the last minute before midnight',()=>{
  expect(clockHandAngles(7,30)).toEqual({hour:225,minute:180});
  expect(clockHandAngles(3,15)).toEqual({hour:97.5,minute:90});
  expect(clockHandAngles(6,45)).toEqual({hour:202.5,minute:270});
  expect(clockHandAngles(12,0)).toEqual({hour:0,minute:0});
  expect(clockHandAngles(23,59)).toEqual({hour:359.5,minute:354});
  expect(getLearningModel('What does 07:30 mean?')).toEqual({kind:'clock',hour:7,minute:30,label:'07:30'});
  const rendered=picture('What does 06:30 mean?');
  // These expectations check the drawn hands against independently known clock positions.
  expect(rendered.querySelector('[data-clock-hand="hour"]')?.getAttribute('transform')).toBe('rotate(195 120 120)');
  expect(rendered.querySelector('[data-clock-hand="minute"]')?.getAttribute('transform')).toBe('rotate(180 120 120)');
  expect(rendered.querySelector('svg[role="img"]')?.getAttribute('aria-label')).toContain('06:30');
  expect(rendered.querySelectorAll('text')).toHaveLength(12);
  expect(rendered.querySelector('figcaption')?.textContent).toBe('Clock picture · 06:30');
});

it('models only valid explicit clock givens, without inferring a time from other prompts',()=>{
  for (const prompt of ['What does 24:00 mean?','What does 07:60 mean?','What does 7:30 mean?','What does -1:30 mean?','The clock shows half past seven. What time is it?','What does 07:30 mean? Then add an hour.']) {
    expect(getLearningModel(prompt),prompt).toBeNull();
  }
});

it('shows each supplied UK denomination on a labelled pretend coin without converting pounds to the answer',()=>{
  for (const denomination of ['1p','2p','5p','10p','20p','50p','£1','£2']) {
    const prompt=`A ${denomination} coin is worth how many pence?`;
    expect(getLearningModel(prompt)).toEqual({kind:'coin',denomination});
    const rendered=picture(prompt);
    expect(rendered.querySelector('svg text')?.textContent).toBe(denomination);
    expect(rendered.querySelector('figcaption')?.textContent).toBe('Pretend UK coin');
    expect(rendered.querySelector('svg')?.getAttribute('aria-label')).toContain(`written denomination ${denomination}`);
    expect(rendered.textContent).toContain('does not show a real coin');
  }
  expect(picture('A £1 coin is worth how many pence?').textContent).not.toContain('100');
  expect(picture('A £2 coin is worth how many pence?').textContent).not.toContain('200');
  for (const denomination of ['3p','£3','100p','£1.50']) expect(getLearningModel(`A ${denomination} coin is worth how many pence?`)).toBeNull();
});

it('labels all rectangle sides from the givens without calculating a perimeter or guessing a missing length',()=>{
  const prompt='A rectangle is 8 cm long and 3 cm wide. What is its perimeter?';
  expect(getLearningModel(prompt)).toEqual({kind:'rectangle',length:8,width:3});
  const rendered=picture(prompt);
  expect(Array.from(rendered.querySelectorAll('svg text'),node=>node.textContent)).toEqual(['8 cm','8 cm','3 cm','3 cm']);
  expect(rendered.querySelector('svg[role="img"]')?.getAttribute('aria-label')).toContain('two sides are 8 centimetres');
  expect(rendered.textContent).not.toContain('22 cm');
  expect(rendered.textContent).toContain('not to scale');
  for (const missing of ['A rectangle has perimeter 22 cm and width 3 cm. Find its length.','A rectangle has area 24 cm² and width 3 cm. What is its length?']) expect(getLearningModel(missing)).toBeNull();
});

it('draws equal unit tiles in the supplied rows and columns and bounds the tile count',()=>{
  const prompt='A rectangular grid has 4 columns and 3 rows of 1 cm² tiles. What is its area?';
  expect(getLearningModel(prompt)).toEqual({kind:'grid',columns:4,rows:3});
  const rendered=picture(prompt);
  const tiles=Array.from(rendered.querySelectorAll('svg rect'));
  expect(tiles).toHaveLength(12);
  expect(new Set(tiles.map(tile=>tile.getAttribute('x'))).size).toBe(4);
  expect(new Set(tiles.map(tile=>tile.getAttribute('y'))).size).toBe(3);
  expect(tiles.every(tile=>tile.getAttribute('width')==='24' && tile.getAttribute('height')==='24')).toBe(true);
  expect(rendered.querySelector('svg')?.getAttribute('aria-label')).toContain('Every tile has area 1 square centimetre');
  expect(rendered.textContent).not.toContain('12 cm²');
  expect(picture('A rectangular grid has 1 columns and 1 rows of 1 cm² tiles. What is its area?').querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 240 104');
  expect(picture('A rectangular grid has 12 columns and 12 rows of 1 cm² tiles. What is its area?').querySelectorAll('rect')).toHaveLength(144);
  expect(getLearningModel('A rectangular grid has 13 columns and 12 rows of 1 cm² tiles. What is its area?')).toBeNull();
});

it('draws supplied bar values from a common zero baseline on a common scale',()=>{
  const rendered=picture('Two chart bars show 8 and 12. What is their difference?');
  const first=rendered.querySelector('[data-chart-bar="First bar"]');
  const second=rendered.querySelector('[data-chart-bar="Second bar"]');
  expect(first?.getAttribute('height')).toBe('80');
  expect(first?.getAttribute('y')).toBe('80');
  expect(second?.getAttribute('height')).toBe('120');
  expect(second?.getAttribute('y')).toBe('40');
  expect(Number(first?.getAttribute('height'))+Number(first?.getAttribute('y'))).toBe(160);
  expect(Number(second?.getAttribute('height'))+Number(second?.getAttribute('y'))).toBe(160);
  expect(rendered.querySelector('svg')?.getAttribute('aria-label')).toContain('First bar: 8; Second bar: 12');
  expect(rendered.textContent).not.toContain('difference is 4');
  expect(getLearningModel('Two chart bars show 8 and 12. What is their combined total?')).toEqual({kind:'chart',source:'bars',labels:['First bar','Second bar'],values:[8,12]});
  const zero=picture('Two chart bars show 0 and 0. What is their difference?');
  expect(Array.from(zero.querySelectorAll('[data-chart-bar]'),bar=>bar.getAttribute('height'))).toEqual(['0','0']);
  expect(zero.innerHTML).not.toMatch(/NaN|Infinity/);
});

it('retains table category labels and values without adding invented data or a derived total',()=>{
  for (const question of ['How many Robots?','What is the total?','How many more Robots than Kites?']) {
    const prompt=`A table reads Kites 6; Boats 3; Robots 8. ${question}`;
    expect(getLearningModel(prompt)).toEqual({kind:'chart',source:'table',labels:['Kites','Boats','Robots'],values:[6,3,8]});
    const rendered=picture(prompt);
    expect(rendered.querySelector('svg')?.getAttribute('aria-label')).toContain('Kites: 6; Boats: 3; Robots: 8');
    expect(Array.from(rendered.querySelectorAll('[data-chart-bar]'),bar=>bar.getAttribute('data-chart-bar'))).toEqual(['Kites','Boats','Robots']);
    expect(Array.from(rendered.querySelectorAll('[data-chart-bar]'),bar=>bar.getAttribute('height'))).toEqual(['90','45','120']);
    expect(rendered.textContent).not.toContain('17');
  }
  expect(getLearningModel('A scatter plot shows an association. Which conclusion is justified?')).toBeNull();
  expect(getLearningModel('A chart shows Kites and Boats. What is the total?')).toBeNull();
});

it('declines malformed or excessive data instead of rendering huge or misleading pictures',()=>{
  for (const prompt of ['A rectangle is 0 cm long and 3 cm wide. What is its perimeter?','A rectangle is 1001 cm long and 3 cm wide. What is its perimeter?','A rectangular grid has 0 columns and 3 rows of 1 cm² tiles. What is its area?','Two chart bars show 1001 and 2. What is their difference?','Two chart bars show -2 and 4. What is their difference?','A table reads Kites 2; Boats 3; Robots 1001. What is the total?','A table reads Kites 2; Boats 3; Bears 4. What is the total?','x'.repeat(2049)]) {
    expect(getLearningModel(prompt),prompt).toBeNull();
    expect(picture(prompt).innerHTML,prompt).toBe('');
  }
});

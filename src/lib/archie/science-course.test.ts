import { describe, expect, it } from 'vitest';
import { SCIENCE_ALLOCATION_NOTE, SCIENCE_CURRICULUM_SOURCE, SCIENCE_LESSONS, SCIENCE_REFERENCE_SOURCES, SCIENCE_YEAR_PLANS } from './science-course';

const correct = (q:(typeof SCIENCE_LESSONS)[number]['questions'][number]) => q.options[q.answer];
const lesson = (title:string) => {
  const result=SCIENCE_LESSONS.find(l=>l.title===title);
  if(!result)throw new Error(`Missing science lesson: ${title}`);
  return result;
};
const answer = (title:string) => correct(lesson(title).questions[0]);

describe('the science year course',()=>{
  it('provides 324 distinct weekly concepts in nine complete 36-week schedules',()=>{
    expect(SCIENCE_LESSONS).toHaveLength(324);
    expect(new Set(SCIENCE_LESSONS.map(l=>l.id)).size).toBe(324);
    expect(new Set(SCIENCE_LESSONS.map(l=>l.title)).size).toBe(324);
    expect(new Set(SCIENCE_LESSONS.map(l=>JSON.stringify(l.questions))).size).toBe(324);
    for(let year=1;year<=9;year++){
      const yearly=SCIENCE_LESSONS.filter(l=>l.year===year);
      expect(yearly).toHaveLength(36);
      expect(SCIENCE_YEAR_PLANS[year]).toEqual(yearly.map(l=>l.title));
      expect(new Set(yearly.map(l=>l.unit)).size).toBe(6);
      expect(yearly.map(l=>l.week)).toEqual(Array.from({length:36},(_,n)=>n+1));
      for(const l of yearly){
        expect(l.id).toBe(`science-y${year}-w${String(l.week).padStart(2,'0')}-s1`);
        expect(l.session).toBe(1);expect(l.subject).toBe('science');
      }
    }
  });
  it('gives every week content teaching, a worked explanation and a seven-minute topic task',()=>{
    for(const l of SCIENCE_LESSONS){
      expect(l.objective.length).toBeGreaterThan(45);
      expect(l.teaching).toHaveLength(4);
      expect(l.teaching.every(p=>p.length>40)).toBe(true);
      expect(l.teaching.join(' ').split(/\s+/).length,l.id).toBeGreaterThan(100);
      expect(l.vocabulary).toHaveLength(3);
      expect(new Set(l.vocabulary.map(v=>v.word)).size,l.id).toBe(3);
      expect(l.vocabulary.every(v=>v.word.length>1&&v.meaning.length>10),`${l.id}: ${JSON.stringify(l.vocabulary)}`).toBe(true);
      expect(l.example.prompt).toBe(l.questions[0].prompt);
      expect(l.example.explanation).toContain(correct(l.questions[0]));
      expect(l.example.explanation.length).toBeGreaterThan(100);
      expect(l.questions).toHaveLength(5);
      expect(new Set(l.questions.map(q=>q.prompt)).size).toBe(5);
      expect(l.mission.instructions).toHaveLength(3);
      expect(l.mission.instructions.map(s=>s.match(/^([23]) minutes:/)?.[1])).toEqual(['2','3','2']);
      expect(l.mission.instructions[0]).toMatch(/paper|picture|observation/);
      expect(l.reflection.length).toBeGreaterThan(60);
      expect(new URL(l.source).protocol).toBe('https:');
    }
  });
  it('has unique alternatives, valid answer positions and balanced answer keys',()=>{
    const positions=[0,0,0];
    for(const l of SCIENCE_LESSONS)for(const q of l.questions){
      expect(q.options).toHaveLength(3);
      expect(new Set(q.options.map(s=>s.trim().toLowerCase())).size,`${l.id}: ${q.prompt}`).toBe(3);
      expect(q.answer).toBeGreaterThanOrEqual(0);expect(q.answer).toBeLessThan(3);
      expect(Number.isInteger(q.answer)).toBe(true);
      expect(q.hint.length).toBeGreaterThan(15);expect(q.explanation.length).toBeGreaterThan(35);
      positions[q.answer]++;
    }
    expect(positions).toEqual([540,540,540]);
  });
  it('covers primary topics in their intended years and biology, chemistry and physics at KS3',()=>{
    const units=(year:number)=>SCIENCE_LESSONS.filter(l=>l.year===year).map(l=>l.unit).join(' ');
    expect(units(1)).toMatch(/Plants.*Animal.*bodies.*materials.*Seasons/);
    expect(units(2)).toMatch(/Living.*Habitats.*Seeds.*Animals.*healthy.*materials/);
    expect(units(3)).toMatch(/plants.*Nutrition.*Rocks.*Light.*forces.*Magnets/i);
    expect(units(4)).toMatch(/Classification.*digestion.*States.*water.*Sound.*electrical/i);
    expect(units(5)).toMatch(/Life cycles.*Human growth.*Properties.*changes.*solar.*Gravity/);
    expect(units(6)).toMatch(/Classifying.*circulatory.*Inheritance.*Evolution.*Light.*Circuit/);
    expect(units(7)).toMatch(/Cells.*Body.*Particles.*separation.*Forces.*Energy/);
    expect(units(8)).toMatch(/Photosynthesis.*Ecosystems.*Atoms.*Chemical.*Waves.*Current/);
    expect(units(9)).toMatch(/reproduction.*Genes.*Earth.*Periodic.*Thermal.*Space/);
    expect(SCIENCE_ALLOCATION_NOTE).toMatch(/KS3.*editorially/);
    expect(SCIENCE_ALLOCATION_NOTE).toMatch(/teacher.*review/);
    expect(SCIENCE_ALLOCATION_NOTE).toMatch(/do not replace supervised practical/);
    expect(SCIENCE_REFERENCE_SOURCES).toContain(SCIENCE_CURRICULUM_SOURCE);
  });
  it('checks misconceptions about living things, plants, waves and materials independently',()=>{
    expect(answer('Birds have feathers')).toBe('Feathers');
    expect(answer('A dormant seed')).toBe('Yes');
    expect(answer('Seeds beginning to grow')).toBe('No');
    expect(answer('Not all metals')).toBe('Aluminium');
    expect(answer('Evaporation from a surface')).toBe('No');
    expect(answer('Plants respire too')).toBe('Yes');
    expect(answer('Sound needs a medium')).toBe('No');
    expect(answer('Current in a series path')).toBe('No');
    expect(answer('The rock cycle has branches')).toBe('No');
    expect(answer('Tectonic plates')).toBe('No');
    expect(answer('Extinction')).toBe('No living members remain');
  });
  it('distinguishes scientific models from literal solar-system and atomic pictures',()=>{
    expect(answer('Eight planets in order')).toBe('Mars');
    expect(answer('Electron energy levels')).toBe('No');
    expect(answer('Elements and proton number')).toBe('Proton number');
    expect(answer('Molecules and compounds')).toBe('No');
    expect(answer('Mixtures keep constituents')).toBe('No; it is a mixture');
    expect(answer('Planets and dwarf planets')).toBe('No; it is a dwarf planet');
    expect(answer('Light-years measure distance')).toBe('Distance');
    const atom=lesson('Electron energy levels');
    expect(atom.teaching.join(' ')).toMatch(/not.*literal.*paths|not.*literal.*tracks/);
    expect(atom.teaching.join(' ')).toContain('not to scale');
    for(const l of SCIENCE_LESSONS.filter(l=>l.unit==='Earth and the solar system'||l.unit==='Space, scale and physical models')){
      expect(l.teaching.join(' ')).toContain('not to scale');
    }
  });
  it('independently verifies numerical answers and their units',()=>{
    const cases:[string,number,string][]=[
      ['Density calculations',20/10,'g/cm³'],
      ['Microscopes and scale',20/2,''],
      ['Resultant forces',8-3,'N right'],
      ['Speed as distance over time',30/10,'m/s'],
      ['Moments about a pivot',4*0.5,'N m'],
      ['Work done',5*2,'J'],
      ['Power and time',60/3,'W'],
      ['Resistance calculations',6/2,'Ω'],
      ['Efficiency calculations',100*20/50,'%'],
      ['Weight on another world',2*5,'N'],
    ];
    for(const [title,value,unit] of cases){
      const label=answer(title).replace('×','');
      expect(parseFloat(label),title).toBeCloseTo(value,8);
      expect(label,title).toContain(unit);
    }
  });
  it('provides the data needed for chromatography and displacement paper missions',()=>{
    const chromatography=lesson('Chromatography');
    const task=chromatography.mission.instructions[0];
    const spots=task.match(/ink A has spots (\d+) cm and (\d+) cm.*ink B has one spot (\d+) cm/);
    expect(spots).not.toBeNull();
    const [a1,a2,b1]=spots!.slice(1).map(Number);
    expect(new Set([a1,a2]).size).toBe(2);
    expect(a1).toBeLessThan(a2);
    expect(b1).toBe(a2);
    expect(chromatography.teaching.join(' ')).toContain('ink A has two detected spots and ink B has one');
    expect(chromatography.teaching.join(' ')).toContain('One spot does not prove purity');
    expect(task).toContain('fictional example data, not a real experiment');
    const displacement=lesson('Displacement reactions');
    const order=displacement.mission.instructions[0].match(/most to least reactive: ([A-Z]) > ([A-Z]) > ([A-Z])/);
    expect(order).not.toBeNull();
    const metals=order!.slice(1);
    expect(new Set(metals).size).toBe(3);
    expect(metals.indexOf('A')).toBeLessThan(metals.indexOf('C'));
    expect(displacement.teaching[0]).toContain('A can displace C from a suitable C compound');
    expect(displacement.teaching[0]).toContain('C cannot displace A from an A compound');
    expect(displacement.mission.instructions[0]).toContain('imaginary model order');
    expect(displacement.mission.instructions[0]).toContain('paper model only');
  });

  it('names common plants and checks species-specific tree groups without prescribing collection',()=>{
    const flowers=lesson('Flowers and petals');
    expect(flowers.id).toBe('science-y1-w04-s1');
    for(const name of ['dandelion','common daisy','rose','sunflower']){
      expect(flowers.mission.instructions[0].toLowerCase()).toContain(name);
    }
    expect(correct(flowers.questions[4])).toBe('A common daisy');
    expect(correct(lesson('Roots below the ground').questions[4])).toBe('A dandelion');
    const deciduous=lesson('Deciduous trees'),evergreen=lesson('Evergreen trees');
    expect(deciduous.id).toBe('science-y1-w05-s1');
    expect(evergreen.id).toBe('science-y1-w06-s1');
    expect(correct(deciduous.questions[4])).toBe('Common oak');
    expect(correct(evergreen.questions[4])).toBe('Common holly');
    expect(evergreen.teaching[0]).toContain('though they can shed old leaves');
    expect(flowers.teaching[0]).toContain('A plant can grow in a garden and in the wild');
    expect(flowers.teaching[0]).toContain('Do not pick or taste unknown plants');
    expect(evergreen.mission.instructions[0]).toContain('Do not touch spiny leaves or pick berries');
  });

  it('teaches mitochondria and vacuole functions while keeping the plant-cell qualifications',()=>{
    const animal=lesson('Animal-cell structures'),plant=lesson('Plant-cell structures');
    expect(animal.id).toBe('science-y7-w01-s1');
    expect(plant.id).toBe('science-y7-w02-s1');
    expect(correct(animal.questions[4])).toBe('Mitochondria');
    expect(animal.questions[4].prompt).toContain('many stages of aerobic respiration');
    expect(animal.teaching[0]).toContain('energy is not created from nothing');
    expect(animal.teaching[0]).toContain('Cytoplasm is where many chemical reactions happen');
    expect(correct(plant.questions[4])).toBe('Cell sap presses the contents against the cell wall');
    expect(plant.teaching[0]).toContain('this support is called turgor');
    expect(plant.teaching[0]).toContain('Plant cells also have mitochondria and carry out respiration');
    expect(answer('Plant-cell structures')).toBe('No');
    expect(plant.mission.instructions[0]).toContain('Explain how the filled vacuole helps support the cell');
  });

  it('checks fluid-pressure comparisons and balanced upthrust under stated conditions',()=>{
    const pressure=lesson('Gas pressure and collisions'),density=lesson('Density calculations');
    expect(pressure.id).toBe('science-y7-w18-s1');
    expect(density.id).toBe('science-y7-w17-s1');
    const depths=pressure.questions[3].options.map(s=>s.match(/point (\d+) cm/)?.[1]).filter(Boolean).map(Number);
    expect(depths.sort((a,b)=>a-b)).toEqual([2,8]);
    expect(Number(correct(pressure.questions[3]).match(/point (\d+) cm/)![1])).toBe(Math.max(...depths));
    expect(pressure.questions[3].prompt).toContain('same still water');
    expect(correct(pressure.questions[4])).toBe('There is less weight of air above you');
    expect(pressure.questions[4].prompt).toContain('generally');
    expect(density.questions[4].prompt).toContain('only weight and upthrust acting vertically');
    expect(correct(density.questions[4])).toBe('Upthrust balances weight');
    expect(density.questions[4].explanation).toContain('Greater water pressure beneath the object than above it');
    expect(density.mission.instructions[0]).toContain('equal-length arrows show weight down and upthrust up');
  });

  it('checks electron transfer, conserved net charge and non-contact electric forces',()=>{
    const electric=lesson('Current and charge conservation');
    expect(electric.id).toBe('science-y8-w31-s1');
    expect(electric.mission.instructions[0]).toContain('arrows for three electrons moving from B to A');
    const transferred=3;
    // Initially neutral objects retain equal and opposite charges after the
    // same electrons move between them; electron charge is negative.
    const aChange=-transferred,bChange=transferred;
    expect(aChange).toBeLessThan(0);expect(bChange).toBeGreaterThan(0);
    expect(aChange+bChange).toBe(0);
    expect(correct(electric.questions[3])).toBe('A is negative and B is positive by equal amounts');
    expect(correct(electric.questions[4])).toBe('They attract through a non-contact electric force');
    expect(electric.teaching[0]).toContain('Like charges repel and unlike charges attract');
    expect(electric.teaching[0]).toContain('Total charge is conserved, not created');
    expect(electric.teaching[0]).toContain('a region where a charge experiences an electric force');
    expect(answer('Current and charge conservation')).toBe('No');
    expect(electric.mission.instructions[0]).toContain('not an instruction to build a circuit or charge objects');
  });

  it('distinguishes element symbols, formula subscripts and counts of complete molecules',()=>{
    const element=lesson('Elements and proton number'),molecules=lesson('Molecules and compounds');
    expect(element.id).toBe('science-y8-w15-s1');
    expect(molecules.id).toBe('science-y8-w17-s1');
    expect(correct(element.questions[4])).toBe('C');
    for(const mapping of ['H is hydrogen','O is oxygen','C is carbon'])expect(element.teaching[0]).toContain(mapping);
    // Independently count the atom symbols in the formulas presented by the
    // lesson. The bank stores prose and keys, rather than deriving these counts.
    const atoms=(formula:string)=>{
      const coefficient=Number(formula.match(/^\d+/)?.[0]??1);
      const result:Record<string,number>={};
      for(const match of formula.matchAll(/([A-Z][a-z]?)(\d*)/g))result[match[1]]=(result[match[1]]??0)+coefficient*Number(match[2]||1);
      return result;
    };
    const oneFormula=molecules.questions[3].prompt.match(/\bH2O\b/)![0];
    const twoFormula=molecules.questions[4].prompt.match(/\b2H2O\b/)![0];
    expect(atoms(oneFormula)).toEqual({H:2,O:1});
    expect(atoms(twoFormula)).toEqual({H:4,O:2});
    expect(atoms('CO2')).toEqual({C:1,O:2});
    expect(atoms('O2')).toEqual({O:2});
    expect(correct(molecules.questions[3])).toBe('Two hydrogen atoms and one oxygen atom');
    expect(correct(molecules.questions[4])).toBe('Four hydrogen atoms and two oxygen atoms in two water molecules');
    expect(molecules.teaching[0]).toContain('CO2, has one carbon atom and two oxygen atoms per molecule');
    expect(molecules.teaching[0]).toContain('no subscript means one');
    expect(molecules.mission.instructions[0]).toContain('changes the molecule count, not the formula of each molecule');
    expect(answer('Molecules and compounds')).toBe('No');
  });

  it('uses paper and observation missions without prescribing hazardous experiments or personal disclosures',()=>{
    for(const l of SCIENCE_LESSONS){
      expect(l.mission.instructions.join(' ')).toContain('No heating, chemicals, electrical assembly, animal handling or tasting is needed.');
      expect(l.mission.instructions[0]).not.toMatch(/heat (?:a|the)\b|taste |mix chemicals|plug |light a flame|collect eggs|grow mould/i);
      expect(l.mission.instructions[1]).toContain('Mark imagined numbers as example data');
    }
    for(const l of SCIENCE_LESSONS.filter(l=>l.unit==='Human growth and change'||l.unit==='Human reproduction and development')){
      expect(l.teaching[0]).toMatch(/nobody needs to share|Nobody needs to share/);
      expect(l.mission.instructions[0]).not.toMatch(/measure your|photograph your|share your/);
    }
  });
});

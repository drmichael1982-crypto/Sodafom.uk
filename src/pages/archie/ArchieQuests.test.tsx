import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('./ArchiePages',()=>({Page:({children,title}:{children:React.ReactNode;title:string})=><main><h1>{title}</h1>{children}</main>}));
const { stop,speak,setGameContext,clearGameContext } = vi.hoisted(()=>({stop:vi.fn(),speak:vi.fn(),setGameContext:vi.fn(),clearGameContext:vi.fn()}));
vi.mock('@/lib/voice-context',()=>({useVoice:()=>({stop,speak,playing:false})}));
vi.mock('@/contexts/ArchieContext',()=>({useArchieContext:()=>({setGameContext,clearGameContext})}));
import ArchieQuests from './ArchieQuests';
import quests from '@/lib/archie/curriculum-quests.json';
beforeEach(()=>localStorage.clear());
afterEach(()=>{cleanup();vi.clearAllMocks();});
describe('curriculum starter quests',()=>{
  it('includes sourced, complete practice for every year and subject',()=>{
    expect(quests).toHaveLength(27);
    expect(new Set(quests.map(q=>q.id)).size).toBe(27);
    for(let year=1;year<=9;year++)expect(quests.filter(q=>q.year===year).map(q=>q.subject).sort()).toEqual(['english','maths','science']);
    for(const quest of quests){
      expect(quest.source).toMatch(/^https:\/\/www.gov.uk\/government\/publications\/national-curriculum-in-england-/);
      expect(quest.objective.length).toBeGreaterThan(10);
      expect(quest.questions).toHaveLength(3);
      for(const q of quest.questions){
        expect(new Set(q.options).size).toBe(q.options.length);
        expect(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.options.length).toBe(true);
        expect(q.hint.length).toBeGreaterThan(10);expect(q.explanation.length).toBeGreaterThan(10);
      }
    }
  });
  it('offers a hint after a mistake, pauses, and saves one star only once',()=>{
    render(<MemoryRouter><ArchieQuests/></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Choose a school year'),{target:{value:'1'}});
    fireEvent.click(screen.getByRole('button',{name:/Numbers and shapes/}));
    fireEvent.click(screen.getByRole('button',{name:'8'}));
    expect(screen.getByText(/Good try/)).toBeInTheDocument();
    expect(screen.getByText(/Count on three steps/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Pause quest'}));
    expect(screen.getByText('Time for a breather')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Resume quest'}));
    for(const [i,answer] of ['9','3','8'].entries()){
      fireEvent.click(screen.getByRole('button',{name:answer}));
      fireEvent.click(screen.getByRole('button',{name:i===2?'Finish quest · Earn a star':'Next challenge'}));
    }
    expect(screen.getByRole('heading',{name:'Quest complete!'})).toBeInTheDocument();
    const saved=JSON.parse(localStorage.getItem('sodafom_archie_design_v1')!);
    expect(saved.activities).toHaveLength(1);expect(saved.activities[0].stars).toBe(1);
    fireEvent.click(screen.getByRole('button',{name:'Choose another quest'}));
    fireEvent.click(screen.getByRole('button',{name:/Numbers and shapes/}));
    for(const [i,answer] of ['9','3','8'].entries()){
      fireEvent.click(screen.getByRole('button',{name:answer}));
      fireEvent.click(screen.getByRole('button',{name:i===2?'Finish quest · Earn a star':'Next challenge'}));
    }
    expect(JSON.parse(localStorage.getItem('sodafom_archie_design_v1')!).activities).toHaveLength(1);
  });
});

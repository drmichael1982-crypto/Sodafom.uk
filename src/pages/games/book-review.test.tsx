import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
const captured=vi.hoisted(()=>({complete:vi.fn(),shell:vi.fn(),engine:vi.fn()}));
vi.mock('@dr.pogodin/react-helmet',()=>({Helmet:()=>null}));
vi.mock('@/components/games/GameShell',()=>({default:({children,...props}:{children:(callback:typeof captured.complete)=>React.ReactNode})=>{captured.shell(props);return children(captured.complete);}}));
vi.mock('@/components/games/LevelledQuizEngine',()=>({default:(props:{questionsByLevel:unknown[][];onComplete:(result:unknown)=>void})=>{captured.engine(props);return <button onClick={()=>props.onComplete({stars:2,correct:8,total:10,score:80})}>Finish review practice</button>;}}));
import BookReviewGame,{L3,L4,L5} from './book-review';
afterEach(()=>{cleanup();vi.clearAllMocks();});
it('has 30 age-appropriate high-level questions with one unique answer and useful hints',()=>{
 const banks=[L3,L4,L5];expect(banks.flat()).toHaveLength(30);
 expect(new Set(banks.flat().map(question=>question.question)).size).toBe(30);
 for(const question of banks.flat()){
  expect(question.options).toHaveLength(4);
  expect(new Set(question.options).size).toBe(4);
  expect(question.options.filter(option=>option===question.answer)).toHaveLength(1);
  expect(question.hint?.length).toBeGreaterThan(20);
  expect(question.question+' '+question.answer).not.toMatch(/rhizome|palimpsest|deconstruction|heteroglossia|implied author|écriture|hermeneutic/i);
 }
 expect(L3.some(question=>question.question.includes('opinion'))).toBe(true);
 expect(L4.some(question=>question.question.includes('compares two characters'))).toBe(true);
 expect(L5.some(question=>question.question.includes('quotation'))).toBe(true);
});
it('keeps the game age contract, supplies revised high-level banks and forwards the actual result unchanged',()=>{
 render(<BookReviewGame/>);
 expect(captured.shell).toHaveBeenCalledWith(expect.objectContaining({title:'Book Review',subject:'reading',ageGroups:['9–11','12–13']}));
 const props=captured.engine.mock.calls[0][0];
 expect(props.questionsByLevel).toHaveLength(5);
 expect(props.questionsByLevel.slice(2)).toEqual([L3,L4,L5]);
 fireEvent.click(screen.getByRole('button',{name:'Finish review practice'}));
 expect(captured.complete).toHaveBeenCalledExactlyOnceWith({stars:2,correct:8,total:10,score:80});
});

import { describe, expect, it, vi } from 'vitest';
const captured=vi.hoisted(()=>({definition:null as any}));
vi.mock('@/components/games/makeGame',()=>({makeGame:(definition:any)=>{captured.definition=definition;return ()=>null;}}));
import './fraction-match';
const value=(text:string)=>{const parts=text.split('/').map(Number);return parts.length===2?parts[0]/parts[1]:parts[0];};
function expected(prompt:string):number {
  const of=prompt.match(/What is ([\d/]+) of (\d+)\?/);if(of)return value(of[1])*Number(of[2]);
  const equivalent=prompt.match(/equivalent to ([\d/]+)\?/);if(equivalent)return value(equivalent[1]);
  const calculation=prompt.match(/^([\d/]+) ([+−\-×÷]) ([\d/]+) = \?$/)!;
  const left=value(calculation[1]),right=value(calculation[3]);
  return calculation[2]==='+'?left+right:calculation[2]==='-'?left-right:calculation[2]==='×'?left*right:left/right;
}
describe('Fraction Match mathematical answer choices',()=>{
  it('has exactly one mathematically correct option even when fractions can be equivalent',()=>{
    for(const level of captured.definition.questionsByLevel)for(const question of level){
      const result=expected(question.question);
      expect(value(question.answer)).toBeCloseTo(result);
      expect(question.options.filter((option:string)=>Math.abs(value(option)-result)<1e-10)).toHaveLength(1);
      expect(new Set(question.options.map(value)).size).toBe(question.options.length);
    }
  });
});

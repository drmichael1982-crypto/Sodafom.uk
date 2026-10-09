import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
vi.mock('@/lib/voice-context',()=>({useVoice:()=>({speak:vi.fn(),stop:vi.fn()})}));
vi.mock('@/lib/archie/storage',()=>({useArchieData:()=>({settings:{year:1}})}));
import CompletionScene from './CompletionScene';
beforeEach(()=>vi.stubGlobal('matchMedia',()=>({matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()})));
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
it.each([['maths','4','5','Five stars'],['science','Mars','The Sun','gives Earth light'],['art','Purple','Green','paint mix']] as const)('makes the %s scene respond only after a correct learning answer',(kind,wrong,right,fact)=>{
 render(<CompletionScene kind={kind} onClose={()=>{}}/>);
 fireEvent.click(screen.getByRole('button',{name:wrong}));
 expect(screen.getByRole('status')).toHaveTextContent('Good try');
 expect(document.querySelector('.scene-explored')).toBeNull();
 fireEvent.click(screen.getByRole('button',{name:right}));
 expect(screen.getByRole('status')).toHaveTextContent(fact);
 expect(document.querySelector('.scene-explored')).not.toBeNull();
 fireEvent.click(screen.getByRole('button',{name:'Pause scene'}));
 expect(document.querySelector('.scene-paused')).not.toBeNull();
});
it('builds a word one letter at a time before changing the scene',()=>{
 render(<CompletionScene kind="words" onClose={()=>{}}/>);
 for(const letter of ['S','U']){fireEvent.click(screen.getByRole('button',{name:letter}));expect(document.querySelector('.scene-explored')).toBeNull();}
 fireEvent.click(screen.getByRole('button',{name:'N'}));
 expect(screen.getByRole('status')).toHaveTextContent('SUN!');
 fireEvent.click(screen.getByRole('button',{name:'Play with the scene again'}));
 expect(screen.getByRole('button',{name:'S'})).toBeInTheDocument();
});

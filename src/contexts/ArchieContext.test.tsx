import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ArchieProvider, useArchieContext } from './ArchieContext';
describe('one shared Archie',()=>{
  it('keeps callbacks stable and clears old questions when a new activity starts',()=>{
    const {result}=renderHook(()=>useArchieContext(),{wrapper:ArchieProvider});
    const setContext=result.current.setGameContext;
    act(()=>setContext('Number Pop','Maths','2 + 2?',['3','4']));
    expect(result.current.currentQuestion).toBe('2 + 2?');
    act(()=>setContext('Library','Reading'));
    expect(result.current.currentQuestion).toBeNull();
    expect(result.current.currentOptions).toBeNull();
    expect(result.current.setGameContext).toBe(setContext);
  });
  it('opens the same assistant with homework text and closes it',()=>{
    const {result}=renderHook(()=>useArchieContext(),{wrapper:ArchieProvider});
    act(()=>result.current.openArchie('What is half of 12?'));
    expect(result.current.isOpen).toBe(true);expect(result.current.draft).toBe('What is half of 12?');
    act(()=>result.current.closeArchie());expect(result.current.isOpen).toBe(false);
  });
});

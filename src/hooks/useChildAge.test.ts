import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const preview = vi.hoisted(()=>({enabled:true}));
vi.mock('@/lib/config',()=>({get ARCHIE_PREVIEW(){return preview.enabled;}}));
import { ageToDifficulty, normaliseAge, schoolYearToAgeGroup, setActiveChild, useChildAge } from './useChildAge';
import { updateSavedData } from '@/lib/archie/storage';

beforeEach(()=>{localStorage.clear();preview.enabled=true;});
const saveYear=(year:number)=>updateSavedData(previous=>({...previous,settings:{...previous.settings,year}}));

describe('child game difficulty',()=>{
  it('maps older children to tier three and accepts printed en dashes',()=>{
    expect(normaliseAge('11–13')).toBe('11-13');
    expect(ageToDifficulty('5-7')).toBe(1);
    expect(ageToDifficulty('8-10')).toBe(2);
    expect(ageToDifficulty('11-13')).toBe(3);
    expect(ageToDifficulty(null)).toBe(2);
    for(const year of [1,2,3])expect(schoolYearToAgeGroup(year)).toBe('5-7');
    for(const year of [4,5,6])expect(schoolYearToAgeGroup(year)).toBe('8-10');
    for(const year of [7,8,9])expect(schoolYearToAgeGroup(year)).toBe('11-13');
  });
  it('uses saved Archie year for a preview guest and responds to year changes',()=>{
    saveYear(2);const {result}=renderHook(()=>useChildAge());
    expect(result.current.ageGroup).toBe('5-7');expect(result.current.tier).toBe(1);
    act(()=>saveYear(9));
    expect(result.current.ageGroup).toBe('11-13');expect(result.current.tier).toBe(3);
  });
  it('prioritises an active child and responds to same-tab child selection',()=>{
    saveYear(9);const {result}=renderHook(()=>useChildAge());
    act(()=>setActiveChild({id:1,name:'Test learner',ageGroup:'5-7',avatarEmoji:'⭐'}));
    expect(result.current.tier).toBe(1);
    act(()=>saveYear(7));expect(result.current.tier).toBe(1);
    act(()=>setActiveChild(null));expect(result.current.tier).toBe(3);
  });
  it('keeps the existing guest default outside the Archie preview',()=>{
    preview.enabled=false;saveYear(1);
    const {result}=renderHook(()=>useChildAge());
    expect(result.current.ageGroup).toBeNull();expect(result.current.tier).toBe(2);
  });
});

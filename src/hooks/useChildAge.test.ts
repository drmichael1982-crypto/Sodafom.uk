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
  it('prioritises an active child outside preview and responds to same-tab child selection',()=>{
    preview.enabled=false;
    saveYear(9);const {result}=renderHook(()=>useChildAge());
    act(()=>setActiveChild({id:1,name:'Test learner',ageGroup:'5-7',avatarEmoji:'⭐'}));
    expect(result.current.tier).toBe(1);
    act(()=>saveYear(7));expect(result.current.tier).toBe(1);
    act(()=>setActiveChild(null));expect(result.current.ageGroup).toBeNull();expect(result.current.tier).toBe(2);
  });
  it.each([
    {year:3,ageGroup:'5-7',tier:1,stale:'11-13'},
    {year:6,ageGroup:'8-10',tier:2,stale:'5-7'},
    {year:9,ageGroup:'11-13',tier:3,stale:'8-10'},
  ] as const)('uses preview Year $year difficulty rather than a stale profile selection',({year,ageGroup,tier,stale})=>{
    const profile={id:1,name:'Test learner',ageGroup:stale,avatarEmoji:'⭐'};
    setActiveChild(profile);saveYear(year);
    const {result}=renderHook(()=>useChildAge());
    expect(result.current.ageGroup).toBe(ageGroup);expect(result.current.tier).toBe(tier);
    expect(result.current.child).toEqual(profile);
    expect(JSON.parse(localStorage.getItem('sodafom_active_child')!)).toEqual(profile);
  });
  it('responds to saved preview year changes across both age boundaries while preserving profile selection',()=>{
    const profile={id:2,name:'Test learner',ageGroup:'11-13' as const,avatarEmoji:'⭐'};
    setActiveChild(profile);saveYear(3);
    const {result}=renderHook(()=>useChildAge());
    expect(result.current.tier).toBe(1);
    act(()=>saveYear(4));expect(result.current.ageGroup).toBe('8-10');expect(result.current.tier).toBe(2);
    act(()=>saveYear(6));expect(result.current.tier).toBe(2);
    act(()=>saveYear(7));expect(result.current.ageGroup).toBe('11-13');expect(result.current.tier).toBe(3);
    act(()=>saveYear(1));expect(result.current.tier).toBe(1);
    expect(result.current.child).toEqual(profile);
  });
  it('keeps the existing guest default outside the Archie preview',()=>{
    preview.enabled=false;saveYear(1);
    const {result}=renderHook(()=>useChildAge());
    expect(result.current.ageGroup).toBeNull();expect(result.current.tier).toBe(2);
  });
});

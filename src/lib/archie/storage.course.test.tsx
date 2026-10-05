import { renderHook, act, cleanup } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { useArchieData } from './storage';
afterEach(()=>{cleanup();localStorage.clear();});
it('keeps a multi-year course record beyond 500 lessons and never awards a repeat twice',()=>{
  const activities=Array.from({length:1000},(_,i)=>({id:'course-'+i,kind:'lesson',title:'Lesson '+i,stars:2,date:'2026-10-04T10:00:00Z'}));
  localStorage.setItem('sodafom_archie_design_v1',JSON.stringify({settings:{year:4,sound:true},activities,stickers:[]}));
  const {result}=renderHook(()=>useArchieData());
  expect(result.current.activities).toHaveLength(1000);
  act(()=>result.current.complete({id:'course-0',kind:'lesson',title:'Lesson 0',stars:2}));
  expect(result.current.activities).toHaveLength(1000);
  act(()=>result.current.complete({id:'course-new',kind:'lesson',title:'New lesson',stars:2}));
  expect(result.current.activities).toHaveLength(1001);
  expect(JSON.parse(localStorage.getItem('sodafom_archie_design_v1')!).activities[0].id).toBe('course-0');
});

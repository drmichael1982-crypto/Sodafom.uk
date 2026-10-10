import { renderHook, act, cleanup } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { claimScopedSticker, currentProgressProfile, scopedStickersKey, useArchieData } from './storage';
afterEach(()=>{cleanup();localStorage.clear();});
it('keeps a multi-year course record beyond 500 lessons and never awards a repeat twice',()=>{
  localStorage.setItem('sodafom_active_child',JSON.stringify({id:12,name:'Synthetic learner'}));
  const profileId=currentProgressProfile().id;
  const activities=Array.from({length:1000},(_,i)=>({id:'course-'+i,kind:'lesson',title:'Lesson '+i,stars:2,date:'2026-10-04T10:00:00Z',profileId}));
  localStorage.setItem('sodafom_archie_design_v1',JSON.stringify({settings:{year:4,sound:true},activities,stickers:[]}));
  const {result}=renderHook(()=>useArchieData());
  expect(result.current.activities).toHaveLength(1000);
  act(()=>result.current.complete({id:'course-0',kind:'lesson',title:'Lesson 0',stars:2}));
  expect(result.current.activities).toHaveLength(1000);
  act(()=>result.current.complete({id:'course-new',kind:'lesson',title:'New lesson',stars:2}));
  expect(result.current.activities).toHaveLength(1001);
  expect(JSON.parse(localStorage.getItem('sodafom_archie_design_v1')!).activities[0].id).toBe('course-0');
});
it('does not attribute older shared activities or another child\'s records to the selected learner',()=>{
  localStorage.setItem('sodafom_active_child',JSON.stringify({id:21,name:'Mia'}));
  localStorage.setItem('sodafom_archie_design_v1',JSON.stringify({settings:{year:4,sound:true},activities:[
    {id:'legacy-book',kind:'book',title:'Older shared book',stars:1,date:'2026-10-01T10:00:00Z'},
    {id:'mia-lesson',kind:'lesson',title:'Mia lesson',stars:2,date:'2026-10-02T10:00:00Z',profileId:'child:21'},
    {id:'leo-lesson',kind:'lesson',title:'Leo lesson',stars:3,date:'2026-10-03T10:00:00Z',profileId:'child:22'},
  ],stickers:[]}));
  const {result}=renderHook(()=>useArchieData());
  expect(result.current.activities.map(activity=>activity.id)).toEqual(['mia-lesson']);
  expect(result.current.legacyActivities.map(activity=>activity.id)).toEqual(['legacy-book']);
});
it('keeps collected stickers with the selected learner and preserves older shared stickers separately',()=>{
  localStorage.setItem('sodafom_active_child',JSON.stringify({id:21,name:'Mia'}));
  localStorage.setItem('sodafom_archie_design_v1',JSON.stringify({settings:{year:4,sound:true},activities:[],stickers:['legacy-key']}));
  const {result}=renderHook(()=>useArchieData());
  act(()=>claimScopedSticker('book'));
  expect(result.current.stickers).toEqual(['book']);
  expect(result.current.legacyStickers).toEqual(['legacy-key']);
  expect(JSON.parse(localStorage.getItem(scopedStickersKey())!)).toEqual(['book']);
  act(()=>{
    localStorage.setItem('sodafom_active_child',JSON.stringify({id:22,name:'Leo'}));
    window.dispatchEvent(new Event('sodafom:active-child-changed'));
  });
  expect(result.current.progressProfile.name).toBe('Leo');
  expect(result.current.stickers).toEqual([]);
  act(()=>claimScopedSticker('key'));
  expect(result.current.stickers).toEqual(['key']);
  act(()=>{
    localStorage.setItem('sodafom_active_child',JSON.stringify({id:21,name:'Mia'}));
    window.dispatchEvent(new Event('sodafom:active-child-changed'));
  });
  expect(result.current.stickers).toEqual(['book']);
});

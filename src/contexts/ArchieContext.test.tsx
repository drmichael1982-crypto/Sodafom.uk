import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ArchieProvider, useArchieContext, type LessonTutorContext } from './ArchieContext';
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
  it('keeps authored question identity with its activity and clears it for a legacy game or on exit',()=>{
    const {result}=renderHook(()=>useArchieContext(),{wrapper:ArchieProvider});
    const callbacks={set:result.current.setGameContext,clear:result.current.clearGameContext};
    const lesson:LessonTutorContext={activityId:'history-y3-w01-s1',questionId:'history-y3-w01-s1:question:0',
      stepId:'history-y3-w01-s1:phase:2',status:'answering',readText:'Which river?',
      teachingText:'The Nile supported farming.',hintText:'Think about the river in Egypt.',answerTarget:'scoped-question-0'};
    act(()=>callbacks.set('River life','History','Which river?',['Nile','Thames'],lesson));
    expect(result.current.lessonTutor).toEqual(lesson);
    act(()=>callbacks.set('River life','History','Which river?',['Nile','Thames'],{...lesson,questionId:'history-y3-w01-s1:question:1',answerTarget:'scoped-question-1'}));
    expect(result.current.lessonTutor?.questionId).toBe('history-y3-w01-s1:question:1');
    expect(result.current.setGameContext).toBe(callbacks.set);
    act(()=>callbacks.set('Number Pop','Maths','2 + 2?',['3','4']));
    expect(result.current.lessonTutor).toBeNull();
    act(()=>callbacks.set('River life','History','Which river?',[],lesson));
    act(()=>callbacks.clear());
    expect(result.current.lessonTutor).toBeNull();
    expect(result.current.currentQuestion).toBeNull();
  });
  it('shares optional lesson phase and subject details, and clears them with the old activity',()=>{
    const {result}=renderHook(()=>useArchieContext(),{wrapper:ArchieProvider});
    act(()=>result.current.setGameContext('Fractions','Maths','1/2 of 8?',['2','4'],{phase:'practice',subject:'maths',hint:'Share into 2 groups.'}));
    expect(result.current.lesson).toMatchObject({phase:'practice',subject:'maths',hint:'Share into 2 groups.'});
    act(()=>result.current.setGameContext('Number Pop','Maths','2 + 2?',['3','4']));
    expect(result.current.lesson).toBeNull();
    act(()=>result.current.clearGameContext());
    expect(result.current.lesson).toBeNull();expect(result.current.gameTitle).toBeNull();
  });
  it('shares scoped voice metadata and phase coaching together without replacing either',()=>{
    const {result}=renderHook(()=>useArchieContext(),{wrapper:ArchieProvider});
    const tutor:LessonTutorContext={activityId:'maths-y2-w01-s1',questionId:'q0',stepId:'phase2',status:'answering',
      readText:'Which number?',teachingText:'Count on one.',answerTarget:'scoped-q0'};
    act(()=>result.current.setGameContext('Adding','Maths','Which number?',['3','4'],tutor,
      {phase:'practice',subject:'maths',hint:'Count on one.',correctOption:'4',answeredCorrectly:false}));
    expect(result.current.lessonTutor).toEqual(tutor);
    expect(result.current.lesson).toMatchObject({phase:'practice',hint:'Count on one.'});
    act(()=>result.current.clearGameContext());
    expect(result.current.lessonTutor).toBeNull();expect(result.current.lesson).toBeNull();
  });
});

describe('explicit lesson voice handoff',()=>{
  it('opens one requested lesson once, after authored context is mounted, without saving permission',()=>{
    const {result}=renderHook(()=>useArchieContext(),{wrapper:ArchieProvider});
    const saved=localStorage.length;
    act(()=>result.current.requestLessonVoice('maths-y1-w01-s1'));
    expect(result.current.isOpen).toBe(false);
    act(()=>{
      result.current.setGameContext('Adding','Maths','Add two groups.',[],{
        activityId:'maths-y1-w01-s1',questionId:null,stepId:'phase0',status:'learning',readText:'Add two groups.',teachingText:'Add two groups.'});
      result.current.consumeLessonVoice('maths-y1-w01-s1');
    });
    expect(result.current.isOpen).toBe(true);expect(result.current.voiceOnOpen).toBe(true);
    act(()=>result.current.closeArchie());
    act(()=>result.current.consumeLessonVoice('maths-y1-w01-s1'));
    expect(result.current.isOpen).toBe(false);expect(localStorage.length).toBe(saved);
  });
  it('does not start another lesson, a cancelled handoff, or an expired request',()=>{
    const now=vi.spyOn(Date,'now').mockReturnValue(1000);
    try {
      const {result}=renderHook(()=>useArchieContext(),{wrapper:ArchieProvider});
      act(()=>result.current.requestLessonVoice('history-y3-w01-s1'));
      act(()=>result.current.consumeLessonVoice('history-y4-w01-s1'));
      expect(result.current.isOpen).toBe(false);
      act(()=>result.current.requestLessonVoice('history-y3-w01-s1'));
      act(()=>result.current.requestLessonVoice(null));
      act(()=>result.current.consumeLessonVoice('history-y3-w01-s1'));
      expect(result.current.isOpen).toBe(false);
      act(()=>result.current.requestLessonVoice('history-y3-w01-s1'));
      now.mockReturnValue(11001);
      act(()=>result.current.consumeLessonVoice('history-y3-w01-s1'));
      expect(result.current.isOpen).toBe(false);
    } finally { now.mockRestore(); }
  });
});

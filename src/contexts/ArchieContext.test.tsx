import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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
});

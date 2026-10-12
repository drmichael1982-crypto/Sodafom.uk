import type { LessonCoachContext } from '@/lib/archie/lesson-coach';
export type { LessonCoachContext } from '@/lib/archie/lesson-coach';
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

/** Authored help for one mounted lesson step. This is context, never a grading key. */
export interface LessonTutorContext {
  activityId: string;
  questionId: string | null;
  stepId: string;
  status: 'learning' | 'answering' | 'answered' | 'paused' | 'finished';
  readText: string;
  teachingText: string;
  hintText?: string;
  answerTarget?: string;
}
interface LearningContext {
  gameTitle: string | null;
  subject: string | null;
  currentQuestion: string | null;
  currentOptions: string[] | null;
  lessonTutor: LessonTutorContext | null;
  /** Optional phase-aware lesson coaching, separate from answer identity. */
  lesson: LessonCoachContext | null;
}
export interface ArchieContextType extends LearningContext {
  isOpen: boolean;
  draft: string;
  voiceOnOpen: boolean;
  openArchie: (question?: string, spokenLesson?: boolean) => void;
  closeArchie: () => void;
  requestLessonVoice: (lessonId: string | null) => void;
  consumeLessonVoice: (lessonId: string) => void;
  setGameContext: (title: string, subject: string, question?: string, options?: string[], details?: LessonTutorContext | LessonCoachContext, coach?: LessonCoachContext) => void;
  clearGameContext: () => void;
}
const EMPTY: LearningContext = { gameTitle: null, subject: null, currentQuestion: null, currentOptions: null, lessonTutor: null, lesson: null };
const ArchieContext = createContext<ArchieContextType | undefined>(undefined);
export function ArchieProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState(EMPTY);
  const [isOpen, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [voiceOnOpen, setVoiceOnOpen] = useState(false);
  const lessonVoiceRequest = useRef<{id:string;requestedAt:number}|null>(null);
  const requestLessonVoice = useCallback((lessonId:string|null)=>{
    lessonVoiceRequest.current=lessonId?{id:lessonId,requestedAt:Date.now()}:null;
  },[]);
  const consumeLessonVoice = useCallback((lessonId:string)=>{
    const request=lessonVoiceRequest.current;
    lessonVoiceRequest.current=null;
    if(!request||request.id!==lessonId||Date.now()-request.requestedAt>10000)return;
    setDraft('');setVoiceOnOpen(true);setOpen(true);
  },[]);
  const setGameContext = useCallback((title: string, subject: string, question?: string, options?: string[], details?: LessonTutorContext | LessonCoachContext, coach?: LessonCoachContext) => {
    const lessonTutor = details && "activityId" in details ? details : null;
    const lesson = coach ?? (details && "phase" in details ? details : null);
    setContext(previous => {
      const next = { gameTitle: title, subject, currentQuestion: question ?? null, currentOptions: options ?? null, lessonTutor, lesson };
      return JSON.stringify(previous) === JSON.stringify(next) ? previous : next;
    });
  }, []);
  const clearGameContext = useCallback(() => setContext(EMPTY), []);
  const openArchie = useCallback((question = '', spokenLesson = false) => { setDraft(question); setVoiceOnOpen(spokenLesson); setOpen(true); }, []);
  const closeArchie = useCallback(() => { lessonVoiceRequest.current=null; setVoiceOnOpen(false); setOpen(false); }, []);
  const value = useMemo(() => ({ ...context, isOpen, draft, voiceOnOpen, openArchie, closeArchie, requestLessonVoice, consumeLessonVoice, setGameContext, clearGameContext }),
    [context, isOpen, draft, voiceOnOpen, openArchie, closeArchie, requestLessonVoice, consumeLessonVoice, setGameContext, clearGameContext]);
  return <ArchieContext.Provider value={value}>{children}</ArchieContext.Provider>;
}
export function useArchieContext() {
  const context = useContext(ArchieContext);
  if (!context) throw new Error('useArchieContext must be used within an ArchieProvider');
  return context;
}

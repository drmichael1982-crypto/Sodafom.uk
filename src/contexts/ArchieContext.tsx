import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

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
}
export interface ArchieContextType extends LearningContext {
  isOpen: boolean;
  draft: string;
  voiceOnOpen: boolean;
  openArchie: (question?: string, spokenLesson?: boolean) => void;
  closeArchie: () => void;
  setGameContext: (title: string, subject: string, question?: string, options?: string[], lessonTutor?: LessonTutorContext) => void;
  clearGameContext: () => void;
}
const EMPTY: LearningContext = { gameTitle: null, subject: null, currentQuestion: null, currentOptions: null, lessonTutor: null };
const ArchieContext = createContext<ArchieContextType | undefined>(undefined);
export function ArchieProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState(EMPTY);
  const [isOpen, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [voiceOnOpen, setVoiceOnOpen] = useState(false);
  const setGameContext = useCallback((title: string, subject: string, question?: string, options?: string[], lessonTutor?: LessonTutorContext) => {
    setContext(previous => {
      const next = { gameTitle: title, subject, currentQuestion: question ?? null, currentOptions: options ?? null, lessonTutor: lessonTutor ?? null };
      return JSON.stringify(previous) === JSON.stringify(next) ? previous : next;
    });
  }, []);
  const clearGameContext = useCallback(() => setContext(EMPTY), []);
  const openArchie = useCallback((question = '', spokenLesson = false) => { setDraft(question); setVoiceOnOpen(spokenLesson); setOpen(true); }, []);
  const closeArchie = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ ...context, isOpen, draft, voiceOnOpen, openArchie, closeArchie, setGameContext, clearGameContext }),
    [context, isOpen, draft, voiceOnOpen, openArchie, closeArchie, setGameContext, clearGameContext]);
  return <ArchieContext.Provider value={value}>{children}</ArchieContext.Provider>;
}
export function useArchieContext() {
  const context = useContext(ArchieContext);
  if (!context) throw new Error('useArchieContext must be used within an ArchieProvider');
  return context;
}

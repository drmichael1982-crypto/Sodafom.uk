import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ArchieContextType {
  gameTitle: string | null;
  subject: string | null;
  currentQuestion: string | null;
  currentOptions: string[] | null;
  setGameContext: (title: string, subject: string, question?: string, options?: string[]) => void;
  clearGameContext: () => void;
}

const ArchieContext = createContext<ArchieContextType | undefined>(undefined);

export function ArchieProvider({ children }: { children: ReactNode }) {
  const [gameTitle, setGameTitle] = useState<string | null>(null);
  const [subject, setSubject] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [currentOptions, setCurrentOptions] = useState<string[] | null>(null);

  const setGameContext = (title: string, subject: string, question?: string, options?: string[]) => {
    setGameTitle(title);
    setSubject(subject);
    if (question !== undefined) setCurrentQuestion(question);
    if (options !== undefined) setCurrentOptions(options);
  };

  const clearGameContext = () => {
    setGameTitle(null);
    setSubject(null);
    setCurrentQuestion(null);
    setCurrentOptions(null);
  };

  return (
    <ArchieContext.Provider value={{ gameTitle, subject, currentQuestion, currentOptions, setGameContext, clearGameContext }}>
      {children}
    </ArchieContext.Provider>
  );
}

export function useArchieContext() {
  const context = useContext(ArchieContext);
  if (context === undefined) {
    throw new Error('useArchieContext must be used within an ArchieProvider');
  }
  return context;
}

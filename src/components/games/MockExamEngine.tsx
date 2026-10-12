import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClipboardList, CheckCircle2, XCircle, ChevronRight, Trophy, BookOpen, RotateCcw } from 'lucide-react';
import type { YearExam } from '@/lib/curriculum-exams';

import ArchieGameHelper from '@/components/games/ArchieGameHelper';
import { useEffect } from 'react';

interface MockExamEngineProps {
  exam: YearExam;
  onExit: () => void;
  onQuestionChange?: (question: string, options?: string[]) => void;
}

export default function MockExamEngine({ exam, onExit, onQuestionChange }: MockExamEngineProps) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(new Array(exam.questions.length).fill(null));
  const [showResults, setShowResults] = useState(false);

  const questions = exam.questions;
  const current = questions[idx];

  // Report current question to context
  useEffect(() => {
    if (!showResults && current) {
      onQuestionChange?.(current.question, current.options);
    }
  }, [idx, showResults, current, onQuestionChange]);

  const handlePick = (opt: string) => {
    const newAnswers = [...answers];
    newAnswers[idx] = opt;
    setAnswers(newAnswers);
  };

  const next = () => {
    if (idx < questions.length - 1) setIdx(idx + 1);
    else setShowResults(true);
  };

  const prev = () => {
    if (idx > 0) setIdx(idx - 1);
  };

  if (showResults) {
    const score = answers.reduce((acc, ans, i) => (ans === questions[i].answer ? acc + 1 : acc), 0);
    const pct = Math.round((score / questions.length) * 100);

    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="bg-card rounded-3xl border-4 border-primary/20 p-8 text-center shadow-xl">
          <Trophy size={64} className="mx-auto text-yellow-500 mb-4" />
          <h2 className="text-3xl font-black text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Exam Results
          </h2>
          <p className="text-muted-foreground font-bold mb-6">
            Year {exam.year} {exam.subject} Mock Test
          </p>

          <div className="flex justify-center items-baseline gap-2 mb-8">
            <span className="text-6xl font-black text-primary">{pct}%</span>
            <span className="text-xl font-bold text-muted-foreground">Score</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
              <p className="text-green-800 font-black text-2xl">{score}</p>
              <p className="text-green-700 text-xs font-bold uppercase tracking-wider">Correct</p>
            </div>
            <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
              <p className="text-red-800 font-black text-2xl">{questions.length - score}</p>
              <p className="text-red-700 text-xs font-bold uppercase tracking-wider">Incorrect</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setIdx(0); setAnswers(new Array(questions.length).fill(null)); setShowResults(false); }}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-lg hover:opacity-90 transition-opacity"
            >
              <RotateCcw size={20} /> Try Again
            </button>
            <button
              onClick={onExit}
              className="text-muted-foreground font-black text-sm hover:text-foreground transition-colors"
            >
              Back to Exam Center
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-black text-foreground px-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Review Questions
          </h3>
          {questions.map((q, i) => (
            <div key={i} className={`bg-card rounded-2xl p-5 border-2 ${answers[i] === q.answer ? 'border-green-200' : 'border-red-200'} shadow-sm`}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <p className="font-bold text-foreground leading-tight">{q.question}</p>
                {answers[i] === q.answer ? (
                  <CheckCircle2 size={20} className="text-green-500 shrink-0" />
                ) : (
                  <XCircle size={20} className="text-red-500 shrink-0" />
                )}
              </div>
              <div className="text-sm space-y-1">
                <p className="text-muted-foreground">Your answer: <span className={answers[i] === q.answer ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>{answers[i] || 'Skipped'}</span></p>
                {answers[i] !== q.answer && (
                  <p className="text-green-700 font-bold">Correct answer: {q.answer}</p>
                )}
                <div className="mt-3 p-3 bg-muted rounded-xl flex gap-3">
                  <BookOpen size={16} className="text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    {q.explanation}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ClipboardList className="text-primary" size={24} />
          </div>
          <div>
            <h2 className="font-black text-foreground leading-tight">Year {exam.year} Mock Exam</h2>
            <p className="text-xs text-muted-foreground font-bold">{exam.subject}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Question</p>
          <p className="text-lg font-black text-foreground">{idx + 1} / {questions.length}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${((idx + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-card rounded-3xl border-2 border-border p-8 shadow-lg"
        >
          <div className="flex items-center gap-4 mb-8">
            <p className="flex-1 text-2xl font-black text-foreground text-center leading-snug" style={{ fontFamily: 'var(--font-heading)' }}>
              {current.question}
            </p>
            <ArchieGameHelper />
          </div>

          <div className="grid grid-cols-1 gap-3">
            {current.options.map(opt => (
              <button
                key={opt}
                onClick={() => handlePick(opt)}
                className={`w-full py-4 px-6 rounded-2xl border-2 font-bold text-lg text-left transition-all ${
                  answers[idx] === opt
                    ? 'bg-primary/5 border-primary text-primary shadow-md'
                    : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  {opt}
                  {answers[idx] === opt && <div className="w-4 h-4 rounded-full bg-primary" />}
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-4">
        {idx > 0 && (
          <button
            onClick={prev}
            className="flex-1 py-4 rounded-2xl border-2 border-border font-black text-muted-foreground hover:bg-muted transition-colors"
          >
            Previous
          </button>
        )}
        <button
          onClick={next}
          disabled={!answers[idx]}
          className={`flex-1 py-4 rounded-2xl font-black text-primary-foreground shadow-lg flex items-center justify-center gap-2 transition-all ${
            answers[idx] ? 'bg-primary hover:opacity-90' : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          {idx === questions.length - 1 ? 'Finish Exam' : 'Next Question'}
          <ChevronRight size={20} />
        </button>
      </div>

      <p className="text-center text-xs text-muted-foreground font-bold">
        Take your time. This is a practice exam.
      </p>
    </div>
  );
}

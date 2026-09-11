import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sparkles, Lightbulb, HelpCircle, CheckCircle2, XCircle } from 'lucide-react';

export interface BlackboardProps {
  subject: string;
  topicTitle: string;
  mode: 'explain' | 'question' | 'feedback' | 'summary';
  explanationText: string;
  exampleText?: string;
  questionText?: string;
  options?: string[];
  selectedOption?: string;
  typedInput?: string;
  onTypedInputChange?: (val: string) => void;
  onOptionSelect?: (option: string) => void;
  onSubmitAnswer?: () => void;
  hintText?: string | null;
  simplerText?: string | null;
  feedback?: { isCorrect: boolean; message: string } | null;
  progressPercent: number;
  isLocalMode?: boolean;
}

export function Blackboard({
  subject,
  topicTitle,
  mode,
  explanationText,
  exampleText,
  questionText,
  options,
  selectedOption,
  typedInput = '',
  onTypedInputChange,
  onOptionSelect,
  onSubmitAnswer,
  hintText,
  simplerText,
  feedback,
  progressPercent,
  isLocalMode = true
}: BlackboardProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-[2rem] border-4 border-white bg-gradient-to-br from-sky-500 via-blue-600 to-violet-600 p-5 font-sans text-slate-900 shadow-2xl">
      {/* Wooden frame top header */}
      <div className="mb-4 flex items-center justify-between border-b border-white/50 pb-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 bg-yellow-400 text-amber-950 font-black text-[10px] uppercase rounded-full tracking-wider shadow">
            {subject}
          </span>
          <span className={`px-2.5 py-0.5 font-black text-[10px] uppercase rounded-full border tracking-wider ${
            isLocalMode ? 'bg-white text-blue-800 border-sky-200' : 'bg-white text-violet-800 border-violet-200'
          }`}>
            {isLocalMode ? 'LOCAL / FREE TUTOR' : 'OPENAI AI'}
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 min-w-[100px]">
          <div className="h-2.5 flex-1 overflow-hidden rounded-full border border-white/70 bg-white/40">
            <div
              className="h-full bg-yellow-400 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
          <span className="text-[10px] font-black text-white">{Math.round(progressPercent)}%</span>
        </div>
      </div>

      {/* Lesson Title */}
      <h3 className="mb-3 flex items-center gap-2 text-lg font-black text-white">
        <BookOpen size={18} className="text-yellow-300" />
        {topicTitle}
      </h3>

      {/* Blackboard Main Screen Content */}
      <div className="space-y-4">
        {/* Explanation & Example Box */}
        {(mode === 'explain' || mode === 'question' || mode === 'summary') && (
          <div className="rounded-2xl border-2 border-sky-100 bg-white/95 p-4 text-sm leading-relaxed shadow-lg">
            <p className="font-semibold text-slate-800">{explanationText}</p>
            {exampleText && (
              <div className="mt-3 rounded-r-xl border-l-4 border-yellow-400 bg-yellow-50 p-2.5 font-mono text-xs text-blue-900">
                <strong>Worked Example:</strong> {exampleText}
              </div>
            )}
          </div>
        )}

        {/* Simpler / Alternative Explanation Overlay */}
        {simplerText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-900/40 border border-amber-500/50 rounded-2xl p-3.5 text-xs text-amber-100 flex gap-2"
          >
            <Lightbulb size={18} className="text-yellow-300 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-yellow-300 font-extrabold mb-0.5">Simpler Explanation:</strong>
              {simplerText}
            </div>
          </motion.div>
        )}

        {/* Hint Box */}
        {hintText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-950/50 border border-yellow-500/40 rounded-2xl p-3 text-xs text-yellow-200 flex items-center gap-2"
          >
            <Sparkles size={16} className="text-yellow-400 shrink-0" />
            <span><strong>Hint:</strong> {hintText}</span>
          </motion.div>
        )}

        {/* Current Question & Options/Input */}
        {questionText && (
          <div className="rounded-2xl border-2 border-yellow-200 bg-white/95 p-4 shadow-lg">
            <p className="mb-3 flex items-center gap-2 text-sm font-black text-blue-950">
              <HelpCircle size={16} className="text-yellow-400" />
              {questionText}
            </p>

            {/* Multiple Choice Options */}
            {options && options.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 mt-3">
                {options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onOptionSelect && onOptionSelect(opt)}
                    className={`p-3 rounded-xl text-xs font-extrabold border-2 transition-all ${
                      selectedOption === opt
                        ? 'bg-yellow-400 text-amber-950 border-yellow-500 font-black shadow-lg scale-[1.02]'
                        : 'border-sky-300 bg-gradient-to-b from-sky-50 to-blue-100 text-blue-950 hover:from-yellow-50 hover:to-yellow-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              /* Typed Answer Input */
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={typedInput}
                  onChange={(e) => onTypedInputChange && onTypedInputChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onSubmitAnswer && onSubmitAnswer()}
                  placeholder="Type your answer here..."
                  className="flex-1 rounded-xl border-2 border-sky-300 bg-white px-4 py-2.5 text-xs font-bold text-blue-950 placeholder-slate-400 focus:border-yellow-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={onSubmitAnswer}
                  disabled={!typedInput.trim()}
                  className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-amber-950 font-black text-xs rounded-xl shadow transition-all"
                >
                  Submit
                </button>
              </div>
            )}
          </div>
        )}

        {/* Answer Feedback Banner */}
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-3.5 rounded-2xl border flex items-center gap-2 text-xs font-bold ${
              feedback.isCorrect
                ? 'bg-emerald-900/90 border-emerald-400 text-emerald-100'
                : 'bg-amber-900/90 border-amber-400 text-amber-100'
            }`}
          >
            {feedback.isCorrect ? <CheckCircle2 className="text-emerald-400 shrink-0" size={18} /> : <XCircle className="text-amber-400 shrink-0" size={18} />}
            <span>{feedback.message}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

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
    <div className="w-full bg-[#1a2e22] text-amber-50 rounded-3xl p-5 border-8 border-[#5c3a21] shadow-2xl relative font-sans overflow-hidden">
      {/* Wooden frame top header */}
      <div className="flex items-center justify-between border-b border-green-700/60 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 bg-yellow-400 text-amber-950 font-black text-[10px] uppercase rounded-full tracking-wider shadow">
            {subject}
          </span>
          <span className={`px-2.5 py-0.5 font-black text-[10px] uppercase rounded-full border tracking-wider ${
            isLocalMode ? 'bg-emerald-900/80 text-emerald-200 border-emerald-500' : 'bg-blue-900/80 text-blue-200 border-blue-500'
          }`}>
            {isLocalMode ? 'LOCAL / FREE TUTOR' : 'OPENAI AI'}
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 min-w-[100px]">
          <div className="flex-1 h-2.5 bg-green-950 rounded-full overflow-hidden border border-green-700">
            <div
              className="h-full bg-yellow-400 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
          <span className="text-[10px] font-black text-amber-300">{Math.round(progressPercent)}%</span>
        </div>
      </div>

      {/* Lesson Title */}
      <h3 className="text-lg font-black text-yellow-300 mb-3 flex items-center gap-2">
        <BookOpen size={18} className="text-yellow-400" />
        {topicTitle}
      </h3>

      {/* Blackboard Main Screen Content */}
      <div className="space-y-4">
        {/* Explanation & Example Box */}
        {(mode === 'explain' || mode === 'question' || mode === 'summary') && (
          <div className="bg-green-950/60 border border-green-700/50 rounded-2xl p-4 leading-relaxed text-sm">
            <p className="font-medium text-green-100">{explanationText}</p>
            {exampleText && (
              <div className="mt-3 p-2.5 bg-green-900/40 border-l-4 border-yellow-400 rounded-r-xl text-xs font-mono text-yellow-200">
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
          <div className="bg-green-900/40 border border-yellow-400/30 rounded-2xl p-4">
            <p className="text-sm font-black text-white mb-3 flex items-center gap-2">
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
                        : 'bg-green-950/80 border-green-700 text-green-100 hover:bg-green-900'
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
                  className="flex-1 px-4 py-2.5 bg-green-950/90 border-2 border-green-600 rounded-xl text-xs font-bold text-white placeholder-green-400 focus:outline-none focus:border-yellow-400"
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

import { useId } from 'react';
import { BookOpen, Lightbulb, Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';

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

/** Public prop contract kept so every existing answer handler continues to work. */
export function Blackboard({ subject, topicTitle, mode, explanationText, exampleText,
  questionText, options, selectedOption, typedInput = '', onTypedInputChange,
  onOptionSelect, onSubmitAnswer, hintText, simplerText, feedback,
  progressPercent, isLocalMode = true }: BlackboardProps) {
  const inputId = useId();
  const progress = Number.isFinite(progressPercent) ? Math.max(0, Math.min(100, progressPercent)) : 0;
  return <section className="sf-lesson" aria-label={`${subject} lesson`}>
    <div className="sf-lesson-heading">
      <div className="flex flex-wrap gap-2">
        <span className="sf-pill"><BookOpen size={18} aria-hidden="true" />{subject}</span>
        <span className="sf-pill">{isLocalMode ? 'Local AI' : 'OpenAI'}</span>
      </div>
      <label className="sf-lesson-progress">Lesson progress · {Math.round(progress)}%
        <progress value={progress} max={100} aria-label="Lesson progress" />
      </label>
    </div>
    <h3>{topicTitle}</h3>
    {(mode === 'explain' || mode === 'question' || mode === 'summary') &&
      <div className="sf-lesson-copy">
        <p>{explanationText}</p>
        {exampleText && <div className="sf-lesson-example"><strong>Let’s try an example</strong><p>{exampleText}</p></div>}
      </div>}
    {simplerText && <aside className="sf-lesson-note"><Lightbulb size={24} className="shrink-0" aria-hidden="true" /><div><strong>Let’s make it simpler</strong><p>{simplerText}</p></div></aside>}
    {hintText && <aside className="sf-lesson-note"><Sparkles size={24} className="shrink-0" aria-hidden="true" /><div><strong>A little clue</strong><p>{hintText}</p></div></aside>}
    {questionText && <fieldset className="sf-question">
      <legend>{questionText}</legend>
      <p className="text-sm mt-2">Choose an answer, or use the lesson’s Voice button to speak.</p>
      {options?.length ? <div className="sf-answer-grid">
        {options.map((option, index) => <button key={`${index}-${option}`} type="button"
          className="sf-answer" aria-pressed={selectedOption === option}
          disabled={!onOptionSelect} onClick={() => onOptionSelect?.(option)}>
          <span className="sf-answer-number" aria-hidden="true">{index + 1}</span><span>{option}</span>
        </button>)}
      </div> : <div className="sf-typed-answer">
        <label className="sr-only" htmlFor={inputId}>Your answer</label>
        <input id={inputId} value={typedInput} onChange={e => onTypedInputChange?.(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && typedInput.trim()) onSubmitAnswer?.(); }}
          placeholder="Tell Archie your answer…" autoComplete="off" />
        <button type="button" className="sf-primary" disabled={!typedInput.trim() || !onSubmitAnswer} onClick={onSubmitAnswer}>Check answer</button>
      </div>}
    </fieldset>}
    {feedback && <div className="sf-lesson-feedback flex gap-3" data-correct={feedback.isCorrect} role="status">
      {feedback.isCorrect ? <CheckCircle2 className="shrink-0" aria-hidden="true" /> : <HelpCircle className="shrink-0" aria-hidden="true" />}
      <p>{feedback.message}</p>
    </div>}
  </section>;
}

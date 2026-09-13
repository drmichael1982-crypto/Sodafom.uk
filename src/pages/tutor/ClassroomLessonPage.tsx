import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  Mic,
  MicOff,
  Pause,
  Play,
  Settings,
  Timer,
  Volume2,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { ArchieCharacter } from '@/components/ArchieCharacter';
import { Blackboard } from '@/components/Blackboard';
import { ChildProfileManager } from '@/components/ChildProfileManager';
import { getTeacherProfile } from '@/lib/teacher-auth';
import { stopTts, ttsSpeak } from '@/lib/voice-context';
import { CURRICULUM_LESSONS, type LessonQuestion, type TopicLesson } from '@/lib/tutor/curriculum';
import {
  LESSON_DURATIONS,
  buildClassroomStages,
  classroomAnswerMatches,
  classroomInstruction,
  createPeLesson,
  formatLessonTime,
  getPeActivity,
  selectClassroomLesson,
  teacherConnectionMessage,
  type ClassroomStageKind,
  type LessonDuration,
} from '@/lib/tutor/classroom-lesson';
import {
  loadTutorMemory,
  recordQuestionAnswer,
  saveTutorMemory,
  type ChildTutorProfile,
} from '@/lib/tutor/memory';

type RecognitionResultLike = { transcript?: string };
type RecognitionEventLike = { results?: { [index: number]: { [index: number]: RecognitionResultLike } } };
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  abort?: () => void;
  onstart?: () => void;
  onresult?: (event: RecognitionEventLike) => void;
  onerror?: (event: { error?: string }) => void;
  onend?: () => void;
};
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const SUBJECTS = [...new Set(CURRICULUM_LESSONS.map(lesson => lesson.subject)), 'PE'];
const QUESTION_STAGES = new Set<ClassroomStageKind>(['guided', 'practice', 'assessment']);
const SUBJECT_EMOJI: Record<string, string> = {
  Maths: '🔢',
  English: '✍️',
  Science: '🔬',
  Geography: '🌍',
  Reading: '📖',
  Technology: '💻',
  RE: '🕊️',
  PE: '🏃',
};

function sceneFor(subject: string, day: number): { label: string; emoji: string; detail: string } {
  if (subject !== 'PE') return {
    label: 'Classroom',
    emoji: '🏫',
    detail: 'A calm classroom is ready: board, desk, pencil, and a learning buddy nearby.',
  };
  const activity = getPeActivity(day);
  if (activity.environment === 'football-field') return { label: 'Football field', emoji: '⚽', detail: 'A clear football field scene is ready for gentle, controlled practice.' };
  if (activity.environment === 'athletics-track') return { label: 'Athletics track', emoji: '🏃', detail: 'A clear track scene is ready for steady pacing between safe markers.' };
  if (activity.environment === 'sports-hall') return { label: 'Sports hall', emoji: '🏀', detail: 'A clear sports hall scene is ready for low-risk practice.' };
  return { label: 'Safe practice space', emoji: '🎯', detail: 'A clear practice space is ready for careful coordination work.' };
}

function characterForSubject(subject: string, preferred: ChildTutorProfile['preferredTutor']): 'archie' | 'soda' | 'bella' | 'rocky' {
  if (subject === 'English' || subject === 'Reading') return 'bella';
  if (subject === 'Science') return 'soda';
  if (subject === 'Geography') return 'rocky';
  return preferred ?? 'archie';
}

export default function ClassroomLessonPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ChildTutorProfile>(() => loadTutorMemory());
  const [showProfileSetup, setShowProfileSetup] = useState(!profile.childName);
  const [subject, setSubject] = useState(() => SUBJECTS.includes(profile.recentSubject ?? '') ? profile.recentSubject! : 'Maths');
  const [duration, setDuration] = useState<LessonDuration>(30);
  const [lessonDay, setLessonDay] = useState(1);
  const [stageIndex, setStageIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(duration * 60);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [activityDone, setActivityDone] = useState(false);
  const [complete, setComplete] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [typedAnswer, setTypedAnswer] = useState('');
  const [activityResponse, setActivityResponse] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [voiceStatus, setVoiceStatus] = useState('Voice input is optional. Your browser asks before listening; Sodafom does not save raw audio. Touch and typing work too.');
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [hasTeacherSession] = useState(() => Boolean(getTeacherProfile()));
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const ageGroup: TopicLesson['ageGroup'] = profile.ageGroup ?? '8-10';
  const lesson = useMemo(() => {
    if (subject === 'PE') return createPeLesson(ageGroup, lessonDay);
    return selectClassroomLesson(CURRICULUM_LESSONS, subject, ageGroup, lessonDay) ?? CURRICULUM_LESSONS[0];
  }, [ageGroup, lessonDay, subject]);
  const peActivity = subject === 'PE' ? getPeActivity(lessonDay) : undefined;
  const stages = useMemo(() => buildClassroomStages(duration, subject === 'PE'), [duration, subject]);
  const stage = stages[stageIndex] ?? stages[0];
  const instruction = classroomInstruction(stage.kind, lesson, peActivity);
  const currentQuestion: LessonQuestion | undefined = QUESTION_STAGES.has(stage.kind) && lesson.questions.length
    ? lesson.questions[questionIndex % lesson.questions.length]
    : undefined;
  const timerPaused = showProfileSetup || complete || manuallyPaused || helpOpen;
  const scene = sceneFor(subject, lessonDay);
  const progressPercent = Math.round((stageIndex / Math.max(1, stages.length - 1)) * 100);

  const stopRecognition = useCallback(() => {
    try {
      recognitionRef.current?.abort?.();
    } catch {
      // Some browsers report an error after their recognition session already ended.
    }
    recognitionRef.current = null;
    setListening(false);
  }, []);

  const speak = useCallback((text: string) => {
    if (profile.readAloudPreference === false) return;
    stopRecognition();
    stopTts();
    setSpeaking(true);
    ttsSpeak(text, () => setSpeaking(false));
  }, [profile.readAloudPreference, stopRecognition]);

  useEffect(() => {
    setStageIndex(0);
    setQuestionIndex(0);
    setTimeRemaining(duration * 60);
    setManuallyPaused(false);
    setHelpOpen(false);
    setActivityDone(false);
    setSelectedOption('');
    setTypedAnswer('');
    setActivityResponse('');
    setFeedback(null);
    setComplete(false);
  }, [ageGroup, duration, lessonDay, subject]);

  useEffect(() => {
    if (timerPaused || timeRemaining <= 0) return;
    const timer = window.setInterval(() => setTimeRemaining(value => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [timeRemaining, timerPaused]);

  const finishLesson = useCallback(() => {
    if (complete) return;
    stopRecognition();
    stopTts();
    const currentMemory = loadTutorMemory();
    const updated: ChildTutorProfile = {
      ...currentMemory,
      recentSubject: lesson.subject,
      recentTopic: lesson.topic,
      recentLessonTime: new Date().toISOString(),
    };
    saveTutorMemory(updated);
    setProfile(updated);
    setComplete(true);
    setManuallyPaused(true);
    setVoiceStatus('Lesson complete. Your local learning memory has been updated.');
  }, [complete, lesson.subject, lesson.topic, stopRecognition]);

  useEffect(() => {
    if (!complete && timeRemaining === 0) finishLesson();
  }, [complete, finishLesson, timeRemaining]);

  useEffect(() => () => {
    stopRecognition();
    stopTts();
  }, [stopRecognition]);

  const submitAnswer = useCallback((answer: string) => {
    if (!currentQuestion || !answer.trim()) return;
    const correct = classroomAnswerMatches(answer, currentQuestion.answer, currentQuestion.alternateAnswers ?? []);
    recordQuestionAnswer(lesson.subject, lesson.topic, correct);
    if (correct) {
      const message = `Well done${profile.childName ? ` ${profile.childName}` : ''}. ${currentQuestion.explanation}`;
      setFeedback({ isCorrect: true, message });
      speak(message);
    } else {
      const message = `Good try. ${currentQuestion.hint}`;
      setFeedback({ isCorrect: false, message });
      speak(message);
    }
  }, [currentQuestion, lesson.subject, lesson.topic, profile.childName, speak]);

  const requestHelp = useCallback(() => {
    setHelpOpen(true);
    const simpler = currentQuestion?.simplerExplanation ?? lesson.simplerExplanation;
    speak(`Let's make it smaller. ${simpler}`);
  }, [currentQuestion?.simplerExplanation, lesson.simplerExplanation, speak]);

  const startVoiceAnswer = useCallback(() => {
    if (!currentQuestion || listening || timerPaused || recognitionRef.current) return;
    const browser = window as unknown as {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const Recognition = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceStatus('Voice input is not supported here. Use touch or typing instead.');
      return;
    }
    stopTts();
    const recognition = new Recognition();
    recognition.lang = 'en-GB';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognitionRef.current = recognition;
    recognition.onstart = () => {
      setListening(true);
      setVoiceStatus('Your browser is listening for one answer. Sodafom does not save raw audio.');
    };
    recognition.onresult = event => {
      const answer = String(event.results?.[0]?.[0]?.transcript ?? '').trim();
      if (answer) submitAnswer(answer);
    };
    recognition.onerror = event => {
      setVoiceStatus(event.error === 'not-allowed' || event.error === 'service-not-allowed'
        ? 'Microphone permission was not allowed. Use touch or typing instead.'
        : 'Voice input could not hear that clearly. Try touch or typing instead.');
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
    };
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setListening(false);
      setVoiceStatus('Voice input could not start. Use touch or typing instead.');
    }
  }, [currentQuestion, listening, submitAnswer, timerPaused]);

  const nextStage = () => {
    if (stage.kind === 'assessment' && currentQuestion && questionIndex + 1 < lesson.questions.length) {
      setQuestionIndex(value => value + 1);
      setSelectedOption('');
      setTypedAnswer('');
      setFeedback(null);
      return;
    }
    if (stageIndex + 1 >= stages.length) {
      finishLesson();
      return;
    }
    setStageIndex(value => value + 1);
    setSelectedOption('');
    setTypedAnswer('');
    setFeedback(null);
    setActivityDone(false);
  };

  const restartLesson = () => {
    stopRecognition();
    stopTts();
    setStageIndex(0);
    setQuestionIndex(0);
    setTimeRemaining(duration * 60);
    setManuallyPaused(false);
    setHelpOpen(false);
    setActivityDone(false);
    setFeedback(null);
    setComplete(false);
  };

  const saveActivity = () => {
    if (subject !== 'PE' && !activityResponse.trim()) {
      setFeedback({ isCorrect: false, message: 'Add a short idea, or use the knowledge check instead.' });
      return;
    }
    setActivityDone(true);
    setFeedback({
      isCorrect: true,
      message: subject === 'PE'
        ? 'Thanks for taking part safely. Sodafom does not observe or score physical performance.'
        : 'Thanks for sharing your idea. It stays in this lesson tab and is not sent to anyone.',
    });
  };

  const handleProfileComplete = (updated: ChildTutorProfile) => {
    setProfile(updated);
    setShowProfileSetup(false);
  };

  if (showProfileSetup) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-sky-700 via-indigo-800 to-violet-950 p-4">
        <Helmet><title>Set up your classroom lesson — Sodafom</title></Helmet>
        <div className="mx-auto mt-8 max-w-xl">
          <ChildProfileManager onComplete={handleProfileComplete} />
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-950 via-indigo-950 to-slate-950 text-white">
      <Helmet><title>{lesson.title} classroom lesson — Sodafom</title></Helmet>
      <header className="sticky top-0 z-30 border-b border-white/20 bg-slate-950/90 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
          <button type="button" onClick={() => { stopRecognition(); stopTts(); navigate('/'); }} className="flex min-h-11 items-center gap-2 rounded-xl bg-white px-3 font-black text-slate-900" aria-label="Back to Sodafom home">
            <ArrowLeft size={18} /> Home
          </button>
          <div className="min-w-44 flex-1">
            <h1 className="font-black">{subject} classroom lesson</h1>
            <p className="text-xs font-bold text-cyan-200">Ages {ageGroup.replace('-', '–')} · Lesson {lessonDay} · {duration} minutes</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-black" aria-label="Lesson timer">
            <Timer size={17} aria-hidden="true" /> {formatLessonTime(timeRemaining)}
          </div>
          <button type="button" onClick={() => setShowProfileSetup(true)} className="flex min-h-11 items-center gap-2 rounded-xl bg-amber-300 px-3 font-black text-amber-950">
            <Settings size={17} /> Profile
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-5 p-4 pb-10">
        <section className="rounded-3xl border border-white/20 bg-white/10 p-4" aria-labelledby="lesson-controls-title">
          <h2 id="lesson-controls-title" className="sr-only">Lesson controls</h2>
          <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-sm font-black text-cyan-100">Choose a local subject</p>
              <div className="mt-2 flex flex-wrap gap-2" aria-label="Lesson subjects">
                {SUBJECTS.map(value => (
                  <button key={value} type="button" aria-pressed={subject === value} onClick={() => setSubject(value)} className={`min-h-11 rounded-xl px-3 text-sm font-black transition ${subject === value ? 'bg-yellow-300 text-amber-950' : 'bg-white/15 text-white hover:bg-white/25'}`}>
                    <span aria-hidden="true">{SUBJECT_EMOJI[value] ?? '📚'} </span>{value}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-black text-cyan-100">Lesson length</p>
              <div className="mt-2 flex gap-2" aria-label="Lesson lengths">
                {LESSON_DURATIONS.map(value => (
                  <button key={value} type="button" aria-pressed={duration === value} onClick={() => setDuration(value)} className={`min-h-11 rounded-xl px-3 text-sm font-black transition ${duration === value ? 'bg-fuchsia-300 text-fuchsia-950' : 'bg-white/15 text-white hover:bg-white/25'}`}>
                    {value} min
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-200">
            <label htmlFor="classroom-lesson-day">Lesson rotation</label>
            <input id="classroom-lesson-day" type="number" min="1" max="365" value={lessonDay} onChange={event => setLessonDay(Math.min(365, Math.max(1, Number(event.target.value) || 1)))} className="min-h-11 w-20 rounded-xl border border-white/30 bg-white px-3 text-center font-black text-slate-900" />
            <span>Choose a different number to rotate the local lesson or PE activity.</span>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[2rem] border-2 border-cyan-200/50 bg-gradient-to-br from-cyan-500/30 to-indigo-600/40 p-5 shadow-xl">
            <p className="text-xs font-black uppercase tracking-wide text-cyan-100">{scene.label}</p>
            <div className="mt-3 flex items-center gap-4">
              <span className="text-6xl" aria-hidden="true">{scene.emoji}</span>
              <ArchieCharacter size={94} speaking={speaking} character={characterForSubject(subject, profile.preferredTutor)} />
            </div>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-cyan-50">{scene.detail}</p>
            {subject === 'PE' && <p className="mt-3 rounded-2xl bg-slate-950/35 p-3 text-xs font-bold text-cyan-100">{peActivity?.safety}</p>}
          </div>

          <div className="rounded-[2rem] border-2 border-white/25 bg-white/10 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-yellow-200">Stage {stageIndex + 1} of {stages.length}: {stage.label}</p>
                <p className="text-xs font-bold text-slate-300">Planned learning time: {stage.minutes} minutes</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setManuallyPaused(value => !value)} className="flex min-h-11 items-center gap-2 rounded-xl bg-white px-3 text-sm font-black text-slate-900">
                  {manuallyPaused ? <Play size={17} /> : <Pause size={17} />}{manuallyPaused ? 'Resume' : 'Pause'}
                </button>
                <button type="button" onClick={() => speak(instruction)} className="flex min-h-11 items-center gap-2 rounded-xl bg-yellow-300 px-3 text-sm font-black text-amber-950">
                  <Volume2 size={17} /> Read
                </button>
                <button type="button" onClick={requestHelp} className="flex min-h-11 items-center gap-2 rounded-xl bg-amber-300 px-3 text-sm font-black text-amber-950">
                  <Lightbulb size={17} /> Help
                </button>
              </div>
            </div>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-slate-100">{instruction}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-200/40 bg-emerald-100/10 p-4 text-sm font-semibold text-emerald-50">
          {teacherConnectionMessage(hasTeacherSession)} {hasTeacherSession && <Link to="/teacher-hub" className="ml-1 font-black underline underline-offset-2">Open Teacher Hub</Link>}
        </section>

        {helpOpen && (
          <section className="rounded-3xl border-4 border-amber-300 bg-amber-50 p-5 text-amber-950 shadow-xl" aria-labelledby="classroom-help-title">
            <h2 id="classroom-help-title" className="font-black">Lesson paused for help</h2>
            <p className="mt-2 font-semibold">{currentQuestion?.simplerExplanation ?? lesson.simplerExplanation}</p>
            <button type="button" onClick={() => setHelpOpen(false)} className="mt-4 min-h-11 rounded-xl bg-amber-500 px-4 font-black text-white">I’m ready to continue</button>
          </section>
        )}

        {!complete && (
          <>
            <Blackboard
              subject={lesson.subject}
              topicTitle={lesson.title}
              mode={currentQuestion ? 'question' : 'explain'}
              explanationText={instruction}
              exampleText={lesson.examples[0]}
              questionText={currentQuestion?.question}
              options={currentQuestion?.options}
              selectedOption={selectedOption}
              typedInput={typedAnswer}
              onTypedInputChange={setTypedAnswer}
              onOptionSelect={option => { setSelectedOption(option); submitAnswer(option); }}
              onSubmitAnswer={() => submitAnswer(typedAnswer)}
              hintText={feedback?.isCorrect === false ? currentQuestion?.hint : null}
              simplerText={helpOpen ? currentQuestion?.simplerExplanation ?? lesson.simplerExplanation : null}
              feedback={feedback}
              progressPercent={progressPercent}
              isLocalMode
            />

            {currentQuestion && (
              <section className="rounded-3xl border border-white/25 bg-white/10 p-4" aria-label="Optional voice answer">
                <button type="button" onClick={startVoiceAnswer} disabled={listening || timerPaused} className="flex min-h-11 items-center gap-2 rounded-xl bg-emerald-300 px-4 font-black text-emerald-950 disabled:cursor-not-allowed disabled:opacity-60">
                  {listening ? <MicOff size={18} /> : <Mic size={18} />}{listening ? 'Listening…' : 'Use voice answer'}
                </button>
                <p className="mt-2 text-xs font-semibold text-slate-200" role="status" aria-live="polite">{voiceStatus}</p>
              </section>
            )}

            {stage.kind === 'activity' && (
              <section className="rounded-3xl border-4 border-cyan-200 bg-white p-5 text-slate-900 shadow-xl" aria-labelledby="activity-title">
                <h2 id="activity-title" className="font-black">Try it your way</h2>
                {subject === 'PE' ? (
                  <p className="mt-2 text-sm font-semibold">Try the movement only if your space feels safe. This button is not a score and does not mean Sodafom saw your movement.</p>
                ) : (
                  <>
                    <p className="mt-2 text-sm font-semibold">Write one fact, example, or question. It stays in this lesson tab and is not sent to anyone.</p>
                    <textarea value={activityResponse} onChange={event => setActivityResponse(event.target.value)} rows={3} maxLength={500} className="mt-3 w-full rounded-xl border-2 border-cyan-300 p-3 font-semibold" placeholder="Type your idea here…" />
                  </>
                )}
                <button type="button" onClick={saveActivity} className="mt-3 flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-4 font-black text-white"><CheckCircle2 size={18} /> {subject === 'PE' ? 'I tried this safely' : 'Keep my idea in this lesson'}</button>
              </section>
            )}

            <nav className="rounded-3xl border border-white/20 bg-white/10 p-4" aria-label="Lesson stages">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
                {stages.map((item, index) => (
                  <div key={`${item.kind}-${index}`} className={`rounded-xl p-2 text-center text-xs font-black ${index === stageIndex ? 'bg-yellow-300 text-amber-950' : index < stageIndex ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-200'}`}>
                    {item.label}<span className="block text-[10px] opacity-80">{item.minutes} min</span>
                  </div>
                ))}
              </div>
            </nav>

            <div className="flex justify-end">
              <button type="button" onClick={nextStage} disabled={stage.kind === 'activity' && !activityDone} className="flex min-h-12 items-center gap-2 rounded-2xl bg-yellow-300 px-5 font-black text-amber-950 shadow-xl disabled:cursor-not-allowed disabled:opacity-60">
                {stageIndex + 1 >= stages.length ? 'Finish lesson' : stage.kind === 'assessment' && currentQuestion && questionIndex + 1 < lesson.questions.length ? 'Next knowledge check' : 'Next stage'} <ChevronRight size={19} />
              </button>
            </div>
          </>
        )}

        {complete && (
          <section className="rounded-[2rem] border-4 border-emerald-300 bg-emerald-50 p-6 text-center text-emerald-950 shadow-xl" aria-labelledby="lesson-complete-title">
            <CheckCircle2 className="mx-auto text-emerald-600" size={44} aria-hidden="true" />
            <h2 id="lesson-complete-title" className="mt-3 text-2xl font-black">Lesson complete</h2>
            <p className="mt-2 font-semibold">Your recent lesson was saved in the existing on-device tutor memory. No answers, microphone recordings, PE performance, or marks were sent to a teacher service.</p>
            <button type="button" onClick={restartLesson} className="mt-5 min-h-11 rounded-xl bg-emerald-600 px-5 font-black text-white">Start this lesson again</button>
          </section>
        )}
      </main>
    </div>
  );
}

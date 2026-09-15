import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  ChevronRight,
  Cloud,
  CloudOff,
  Lightbulb,
  Mic,
  MicOff,
  Pause,
  Play,
  Settings,
  Volume2,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { Blackboard } from '@/components/Blackboard';
import ClassroomScene from '@/components/ClassroomScene';
import { ChildProfileManager } from '@/components/ChildProfileManager';
import { getActiveChild } from '@/hooks/useChildAge';
import { ttsSpeak, stopTts } from '@/lib/voice-context';
import { CURRICULUM_LESSONS, type LessonQuestion, type TopicLesson } from '@/lib/tutor/curriculum';
import {
  buildDailyCurriculumLesson,
  type CurriculumAgeGroup,
  type CurriculumSubject,
} from '@/lib/tutor/curriculum-year-plan';
import {
  loadTutorMemory,
  recordQuestionAnswer,
  saveTutorMemory,
  type ChildTutorProfile,
} from '@/lib/tutor/memory';
import {
  answerMatches,
  buildLessonStagePlan,
  getPeFocus,
  getTeacherForSubject,
  isContinueRequest,
  isHelpRequest,
  lessonProgressPercent,
  type LessonDuration,
  type LessonStageKind,
} from '@/lib/tutor/classroom-system';

const SUBJECTS: CurriculumSubject[] = ['Maths', 'English', 'Science', 'History', 'Geography', 'French', 'German', 'PE'];
const DURATIONS: LessonDuration[] = [15, 20, 30, 60];
const QUESTION_STAGES = new Set<LessonStageKind>(['guided', 'practice', 'assessment']);

interface CloudLessonResponse {
  available: boolean;
  reason?: string;
  verifiedInventoryCount?: number | null;
  lesson?: {
    lessonKey: string;
    topic: string;
    title: string;
    content: {
      objective?: string;
      phases?: Array<{ minutes?: number; name?: string; activities?: string[] }>;
      quiz?: Array<{ q?: string; a?: string }>;
      adaptation?: { easier?: string; harder?: string };
    };
  };
}

function explicitAge(): CurriculumAgeGroup | null {
  if (typeof window === 'undefined') return null;
  const active = getActiveChild();
  if (active?.ageGroup) return active.ageGroup;
  const stored = localStorage.getItem('sodafom_lesson_age');
  if (stored === '5-7' || stored === '8-10' || stored === '11-13') return stored;
  try {
    const raw = localStorage.getItem('sodafom_tutor_memory');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { ageGroup?: string };
    return parsed.ageGroup === '5-7' || parsed.ageGroup === '8-10' || parsed.ageGroup === '11-13'
      ? parsed.ageGroup
      : null;
  } catch {
    return null;
  }
}

function cloudLessonToTopic(
  response: CloudLessonResponse,
  subject: CurriculumSubject,
  age: CurriculumAgeGroup,
): TopicLesson | null {
  if (!response.available || !response.lesson) return null;
  const cloud = response.lesson;
  const content = cloud.content ?? {};
  const quiz = Array.isArray(content.quiz) ? content.quiz : [];
  const questions: LessonQuestion[] = quiz
    .filter((item) => typeof item?.q === 'string' && typeof item?.a === 'string')
    .map((item, index) => ({
      id: `${cloud.lessonKey}:q:${index + 1}`,
      question: item.q!.trim(),
      answer: item.a!.trim(),
      alternateAnswers: [],
      hint: content.adaptation?.easier ?? 'Think back to the worked example and take one small step.',
      explanation: `The stored answer is ${item.a!.trim()}.`,
      simplerExplanation: content.adaptation?.easier ?? 'Try a smaller example first, then return to this question.',
      difficulty: age === '5-7' ? 1 : age === '8-10' ? 2 : 3,
    }));
  const examples = (content.phases ?? [])
    .flatMap((phase) => (Array.isArray(phase.activities) ? phase.activities : []))
    .filter((value): value is string => typeof value === 'string')
    .slice(0, 3);
  return {
    id: cloud.lessonKey,
    subject,
    topic: cloud.topic || 'cloud-lesson',
    ageGroup: age,
    title: cloud.title,
    explanation: content.objective
      ? `Learning goal: ${content.objective}`
      : `This lesson comes from Sodafom's existing education cloud library.`,
    simplerExplanation: content.adaptation?.easier ?? 'We can break the idea into smaller steps.',
    examples: examples.length ? examples : [`Use today's ${subject} goal in a worked example.`],
    questions,
  };
}

function instructionForStage(
  kind: LessonStageKind,
  lesson: TopicLesson,
  subject: CurriculumSubject,
  day: number,
  score: { correct: number; attempted: number },
): string {
  const pe = subject === 'PE' ? getPeFocus(day) : null;
  if (pe) {
    if (kind === 'intro') return `${pe.label}. Check the space first. ${pe.equipment} ${pe.safety}`;
    if (kind === 'teach') return 'Warm up gently. Start slowly, keep breathing comfortably and rest whenever you need to.';
    if (kind === 'example') return `Teacher demonstration: ${pe.demonstration}`;
    if (kind === 'guided') return `Guided practice: ${pe.practice}`;
    if (kind === 'activity') return `Skill challenge: ${pe.challenge}`;
    if (kind === 'practice') return `Practice at a comfortable pace. ${pe.safety}`;
    if (kind === 'assessment') return 'Cool down with slower movement and calm breathing. This is not a performance test.';
    return score.attempted
      ? `Reflection: you completed ${score.attempted} knowledge checks. Think about what felt comfortable and what to practise next.`
      : 'Reflection: choose one movement you enjoyed and one you would like to practise again.';
  }
  if (kind === 'intro') return `${lesson.title}. ${lesson.explanation}`;
  if (kind === 'teach') return lesson.explanation;
  if (kind === 'example') return `Worked example: ${lesson.examples[0] ?? lesson.simplerExplanation}`;
  if (kind === 'guided') return 'Now try one with the teacher. You can tap, type or speak your answer.';
  if (kind === 'activity') {
    if (subject === 'Maths') return 'Fun activity: show the idea in two different ways, then choose which representation is clearest.';
    if (subject === 'English') return 'Fun activity: make one short example using today’s idea, then improve one word or detail.';
    if (subject === 'French' || subject === 'German') return 'Fun activity: say a key word, match it to its meaning, then use it in a short phrase.';
    return 'Fun activity: sort what you know into a fact, an example and a question, then explain one choice.';
  }
  if (kind === 'practice') return `Further practice: ${lesson.simplerExplanation}`;
  if (kind === 'assessment') return 'End quiz: answer independently where you can. Asking for help pauses the lesson timer.';
  return score.attempted
    ? `Feedback: ${score.correct} of ${score.attempted} completed checks were correct on the first try. Say one thing you learned and one thing to practise next.`
    : 'Say one thing you learned, then choose: confident, nearly there, or need more practice.';
}

export default function ClassroomLessonPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedSubject = searchParams.get('subject');
  const requestedAge = searchParams.get('age');
  const directLesson = searchParams.get('direct') === '1';

  const [profile, setProfile] = useState<ChildTutorProfile>(() => loadTutorMemory());
  const [showProfileSetup, setShowProfileSetup] = useState(() => !directLesson && !profile.childName);
  const [ageGroup, setAgeGroup] = useState<CurriculumAgeGroup | null>(() => {
    if (requestedAge === '5-7' || requestedAge === '8-10' || requestedAge === '11-13') return requestedAge;
    return explicitAge();
  });
  const [subject, setSubject] = useState<CurriculumSubject>(() => {
    const stored = typeof window === 'undefined' ? null : localStorage.getItem('sodafom_lesson_subject');
    const candidate = requestedSubject ?? stored ?? profile.recentSubject ?? 'Maths';
    return SUBJECTS.includes(candidate as CurriculumSubject) ? (candidate as CurriculumSubject) : 'Maths';
  });
  const [duration, setDuration] = useState<LessonDuration>(() => {
    const stored = typeof window === 'undefined' ? 30 : Number(localStorage.getItem('sodafom_lesson_minutes') ?? 30);
    return DURATIONS.includes(stored as LessonDuration) ? (stored as LessonDuration) : 30;
  });
  const [day, setDay] = useState(() => {
    const stored = typeof window === 'undefined' ? 1 : Number(localStorage.getItem('sodafom_lesson_day') ?? 1);
    return Number.isInteger(stored) ? Math.min(365, Math.max(1, stored)) : 1;
  });
  const [cloud, setCloud] = useState<CloudLessonResponse | null>(null);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(() => duration * 60);
  const [paused, setPaused] = useState(false);
  const [helpPaused, setHelpPaused] = useState(false);
  const [complete, setComplete] = useState(false);
  const [activityDone, setActivityDone] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [micEnabled, setMicEnabled] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('sodafom_lesson_mic_enabled') === 'true',
  );
  const [listening, setListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('Microphone off');
  const [hint, setHint] = useState(false);
  const [simpler, setSimpler] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [typedInput, setTypedInput] = useState('');
  const [attemptedIds, setAttemptedIds] = useState<Record<string, boolean>>({});
  const [score, setScore] = useState({ correct: 0, attempted: 0 });
  const [saveStatus, setSaveStatus] = useState('Progress saves as you learn');
  const recognitionRef = useRef<any>(null);
  const progressSavedRef = useRef(false);

  const activeChild = typeof window === 'undefined' ? null : getActiveChild();
  const childName = activeChild?.name || profile.childName || 'Learner';
  const safeAge = ageGroup ?? '8-10';
  const localLesson = useMemo(
    () => buildDailyCurriculumLesson({ subject, ageGroup: safeAge, day, durationMinutes: duration }),
    [subject, safeAge, day, duration],
  );
  const cloudLesson = useMemo(
    () => cloudLessonToTopic(cloud ?? { available: false }, subject, safeAge),
    [cloud, subject, safeAge],
  );
  const lesson = cloudLesson ?? localLesson ?? CURRICULUM_LESSONS[0];
  const stages = useMemo(() => buildLessonStagePlan(duration, subject === 'PE'), [duration, subject]);
  const stage = stages[stageIndex] ?? stages[0];
  const stageText = instructionForStage(stage.kind, lesson, subject, day, score);
  const teacher = getTeacherForSubject(subject);
  const currentQuestion = QUESTION_STAGES.has(stage.kind) ? lesson.questions[questionIndex] : undefined;
  const progress = lessonProgressPercent(duration * 60, secondsRemaining);
  const effectivePaused = paused || helpPaused || !ageGroup || complete || showProfileSetup;

  const stopRecognition = useCallback(() => {
    try {
      recognitionRef.current?.abort?.();
    } catch {
      // The browser may already have stopped recognition.
    }
    recognitionRef.current = null;
    setListening(false);
  }, []);

  const speak = useCallback((text: string) => {
    stopRecognition();
    if (profile.readAloudPreference === false) {
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    stopTts();
    ttsSpeak(text, () => setSpeaking(false));
  }, [profile.readAloudPreference, stopRecognition]);

  useEffect(() => {
    if (!ageGroup) return;
    localStorage.setItem('sodafom_lesson_subject', subject);
    localStorage.setItem('sodafom_lesson_minutes', String(duration));
    localStorage.setItem('sodafom_lesson_age', ageGroup);
    localStorage.setItem('sodafom_lesson_day', String(day));
  }, [ageGroup, day, duration, subject]);

  useEffect(() => {
    if (!ageGroup) {
      setCloud(null);
      return;
    }
    const controller = new AbortController();
    setCloudLoading(true);
    fetch(`/api/education/lessons?subject=${encodeURIComponent(subject)}&age=${encodeURIComponent(ageGroup)}&day=${day}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Cloud lesson request failed');
        return response.json() as Promise<CloudLessonResponse>;
      })
      .then(setCloud)
      .catch((error) => {
        if ((error as Error).name !== 'AbortError') setCloud({ available: false, reason: 'cloud-library-unavailable' });
      })
      .finally(() => setCloudLoading(false));
    return () => controller.abort();
  }, [ageGroup, day, subject]);

  useEffect(() => {
    setSecondsRemaining(duration * 60);
    setStageIndex(0);
    setQuestionIndex(0);
    setComplete(false);
    setPaused(false);
    setHelpPaused(false);
    setActivityDone(false);
    setAttemptedIds({});
    setScore({ correct: 0, attempted: 0 });
    setFeedback(null);
    progressSavedRef.current = false;
  }, [duration, subject, ageGroup, day]);

  useEffect(() => {
    if (effectivePaused || secondsRemaining <= 0) return;
    const timer = window.setInterval(() => setSecondsRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [effectivePaused, secondsRemaining]);

  useEffect(() => {
    if (secondsRemaining !== 0 || complete || !ageGroup) return;
    setComplete(true);
    stopRecognition();
    speak(`Great work ${childName}. Your ${duration} minute lesson is complete.`);
  }, [ageGroup, childName, complete, duration, secondsRemaining, speak, stopRecognition]);

  useEffect(() => {
    if (!ageGroup || showProfileSetup || complete) return;
    const spoken = currentQuestion ? `${stageText} Question: ${currentQuestion.question}` : stageText;
    speak(spoken);
    // Each stage is announced once. Voice recognition waits until speech ends.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageIndex, questionIndex, lesson.id, ageGroup, showProfileSetup]);

  const requestHelp = useCallback(() => {
    setHelpPaused(true);
    setHint(true);
    setSimpler(true);
    const helpText = currentQuestion
      ? `Let's make it smaller. ${currentQuestion.simplerExplanation || currentQuestion.hint}`
      : `Let's make it smaller. ${lesson.simplerExplanation}`;
    speak(helpText);
  }, [currentQuestion, lesson.simplerExplanation, speak]);

  const submitAnswer = useCallback((given: string) => {
    if (!currentQuestion || !given.trim()) return;
    const correct = answerMatches(given, currentQuestion.answer, currentQuestion.alternateAnswers ?? []);
    const firstAttempt = !attemptedIds[currentQuestion.id];
    if (firstAttempt) {
      setAttemptedIds((previous) => ({ ...previous, [currentQuestion.id]: true }));
      setScore((previous) => ({
        attempted: previous.attempted + 1,
        correct: previous.correct + (correct ? 1 : 0),
      }));
      recordQuestionAnswer(lesson.subject, lesson.topic, correct);
    }
    if (correct) {
      const message = `Well done ${childName}. ${currentQuestion.explanation}`;
      setFeedback({ isCorrect: true, message });
      speak(message);
    } else {
      const message = `Good try. ${currentQuestion.hint}`;
      setFeedback({ isCorrect: false, message });
      setHint(true);
      speak(message);
    }
  }, [attemptedIds, childName, currentQuestion, lesson.subject, lesson.topic, speak]);

  const startListening = useCallback(() => {
    if (!micEnabled || speaking || effectivePaused || listening || recognitionRef.current) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceStatus('Speech recognition is not supported here. Use the touch or typing controls.');
      setMicEnabled(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = subject === 'French' ? 'fr-FR' : subject === 'German' ? 'de-DE' : 'en-GB';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognitionRef.current = recognition;
    recognition.onstart = () => {
      setListening(true);
      setVoiceStatus('Listening…');
    };
    recognition.onresult = (event: any) => {
      const phrase = String(event.results?.[0]?.[0]?.transcript ?? '').trim();
      if (!phrase) return;
      if (isHelpRequest(phrase)) {
        requestHelp();
        return;
      }
      if (helpPaused && isContinueRequest(phrase)) {
        setHelpPaused(false);
        setHint(false);
        setSimpler(false);
        speak('Okay. We will continue from the same place.');
        return;
      }
      if (currentQuestion) submitAnswer(phrase);
      else if (stage.kind === 'activity') {
        setTypedInput(phrase);
        setActivityDone(true);
        setFeedback({ isCorrect: true, message: 'Thanks. Your activity response is ready to continue.' });
      }
    };
    recognition.onerror = (event: any) => {
      const denied = event?.error === 'not-allowed' || event?.error === 'service-not-allowed';
      setVoiceStatus(denied ? 'Microphone permission was blocked. Use touch or typing, or allow mic access in browser settings.' : 'I could not hear that clearly. Try again or use touch or typing.');
      if (denied) {
        setMicEnabled(false);
        localStorage.setItem('sodafom_lesson_mic_enabled', 'false');
      }
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
      setVoiceStatus((current) => current === 'Listening…' ? 'Listening ready' : current);
    };
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setListening(false);
    }
  }, [currentQuestion, effectivePaused, helpPaused, listening, micEnabled, requestHelp, speak, speaking, stage.kind, subject, submitAnswer]);

  useEffect(() => {
    if (!micEnabled || speaking || effectivePaused || listening) return;
    const timer = window.setTimeout(startListening, 300);
    return () => window.clearTimeout(timer);
  }, [effectivePaused, listening, micEnabled, speaking, startListening]);

  useEffect(() => () => {
    stopRecognition();
    stopTts();
  }, [stopRecognition]);

  const saveCompletion = useCallback(async () => {
    if (progressSavedRef.current) return;
    progressSavedRef.current = true;
    const updated: ChildTutorProfile = {
      ...profile,
      childName: profile.childName ?? activeChild?.name,
      ageGroup: ageGroup ?? profile.ageGroup,
      recentSubject: subject,
      recentTopic: lesson.topic,
      recentLessonTime: new Date().toISOString(),
    };
    saveTutorMemory(updated);
    setProfile(updated);
    setSaveStatus('Saved on this device');
    if (!activeChild?.id) return;
    const percentage = score.attempted ? Math.round((score.correct / score.attempted) * 100) : 0;
    try {
      const response = await fetch(`/api/children/${activeChild.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          activityId: lesson.id,
          activityTitle: lesson.title,
          score: percentage,
          maxScore: 100,
          durationSeconds: Math.max(0, duration * 60 - secondsRemaining),
        }),
      });
      if (response.ok) setSaveStatus('Saved on this device and to your signed-in progress');
    } catch {
      // Local learning memory is the supported offline fallback.
    }
  }, [activeChild?.id, activeChild?.name, ageGroup, duration, lesson.id, lesson.title, lesson.topic, profile, score.attempted, score.correct, secondsRemaining, subject]);

  const finishLesson = useCallback(() => {
    setComplete(true);
    stopRecognition();
    void saveCompletion();
    speak(`Lesson complete. Well done ${childName}.`);
  }, [childName, saveCompletion, speak, stopRecognition]);

  useEffect(() => {
    if (complete) void saveCompletion();
  }, [complete, saveCompletion]);

  const nextStage = () => {
    if (stage.kind === 'assessment' && currentQuestion && questionIndex + 1 < lesson.questions.length) {
      setQuestionIndex((value) => value + 1);
      setSelectedOption('');
      setTypedInput('');
      setFeedback(null);
      setHint(false);
      setSimpler(false);
      return;
    }
    if (stageIndex + 1 >= stages.length) {
      finishLesson();
      return;
    }
    const nextIndex = stageIndex + 1;
    if (QUESTION_STAGES.has(stages[nextIndex].kind) && stage.kind !== 'assessment') {
      setQuestionIndex((value) => Math.min(value + (currentQuestion ? 1 : 0), Math.max(0, lesson.questions.length - 1)));
    }
    setStageIndex(nextIndex);
    setSelectedOption('');
    setTypedInput('');
    setFeedback(null);
    setHint(false);
    setSimpler(false);
    setActivityDone(false);
  };

  const changeSubject = (next: CurriculumSubject) => {
    stopRecognition();
    stopTts();
    setSubject(next);
  };

  const changeDuration = (next: LessonDuration) => {
    stopRecognition();
    stopTts();
    setDuration(next);
  };

  const toggleMic = () => {
    if (micEnabled) {
      stopRecognition();
      setMicEnabled(false);
      setVoiceStatus('Microphone off');
      localStorage.setItem('sodafom_lesson_mic_enabled', 'false');
    } else {
      setMicEnabled(true);
      setVoiceStatus('Requesting microphone permission…');
      localStorage.setItem('sodafom_lesson_mic_enabled', 'true');
    }
  };

  if (!ageGroup) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-sky-700 via-indigo-800 to-purple-950 p-4 text-white">
        <div className="mx-auto mt-16 max-w-xl rounded-[2rem] border-4 border-white/80 bg-white/95 p-6 text-slate-900 shadow-2xl">
          <h1 className="text-2xl font-black">Choose the learner’s age</h1>
          <p className="mt-2 font-semibold text-slate-600">We need the age group before choosing lesson content. Sodafom will not silently guess.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {(['5-7', '8-10', '11-13'] as CurriculumAgeGroup[]).map((age) => (
              <button key={age} type="button" onClick={() => setAgeGroup(age)} className="min-h-16 rounded-2xl bg-sky-600 px-4 font-black text-white shadow hover:bg-sky-700">
                Ages {age.replace('-', '–')}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => navigate('/lessons')} className="mt-5 flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-800">
            <ArrowLeft size={16} /> Back to lessons
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-900 via-indigo-950 to-slate-950 text-white">
      <Helmet><title>{subject} Classroom Lesson — Sodafom</title></Helmet>
      <header className="sticky top-0 z-40 border-b border-white/20 bg-slate-950/90 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2">
          <button type="button" onClick={() => { stopRecognition(); stopTts(); navigate('/lessons'); }} className="rounded-xl bg-white px-3 py-2 font-black text-slate-900" aria-label="Back to lessons">
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-40 flex-1">
            <h1 className="font-black">{subject} Classroom</h1>
            <p className="text-xs font-bold text-cyan-200">Ages {ageGroup.replace('-', '–')} · Day {day} · {duration} minutes</p>
          </div>
          <select value={subject} onChange={(event) => changeSubject(event.target.value as CurriculumSubject)} className="rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-900" aria-label="Subject">
            {SUBJECTS.map((value) => <option key={value}>{value}</option>)}
          </select>
          <select value={duration} onChange={(event) => changeDuration(Number(event.target.value) as LessonDuration)} className="rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-900" aria-label="Lesson length">
            {DURATIONS.map((value) => <option key={value} value={value}>{value} min</option>)}
          </select>
          <button type="button" onClick={() => setShowProfileSetup(true)} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-black"><Settings size={16} /></button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-4 p-3 pb-20 sm:p-5">
        {showProfileSetup ? (
          <ChildProfileManager
            onComplete={(updated) => { setProfile(updated); setAgeGroup(updated.ageGroup ?? ageGroup); setShowProfileSetup(false); }}
            onCancel={profile.childName ? () => setShowProfileSetup(false) : undefined}
            isEditing={!!profile.childName}
          />
        ) : complete ? (
          <section className="mx-auto mt-10 max-w-2xl rounded-[2rem] border-4 border-white/80 bg-white p-7 text-center text-slate-900 shadow-2xl">
            <Award className="mx-auto text-amber-500" size={60} />
            <h2 className="mt-3 text-3xl font-black">Lesson complete!</h2>
            <p className="mt-3 font-bold">{score.attempted ? `${score.correct} of ${score.attempted} completed knowledge checks were correct on the first try.` : 'You completed the teaching and activity stages.'}</p>
            <p className="mt-2 text-sm font-semibold text-slate-600">{saveStatus}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => navigate('/lessons')} className="rounded-2xl bg-sky-600 p-4 font-black text-white">Choose another lesson</button>
              <button type="button" onClick={() => { setDay((value) => value >= 365 ? 1 : value + 1); }} className="rounded-2xl bg-emerald-600 p-4 font-black text-white">Next learning day</button>
            </div>
          </section>
        ) : (
          <>
            <ClassroomScene
              subject={subject}
              day={day}
              childName={childName}
              teacher={teacher}
              speaking={speaking}
              demonstrating={stage.kind === 'example' || stage.kind === 'activity'}
              progressPercent={progress}
              stageLabel={stage.label}
              secondsRemaining={secondsRemaining}
            />

            <section className="grid gap-3 rounded-[2rem] border-2 border-white/30 bg-white/10 p-4 lg:grid-cols-[1fr_auto]">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-black">
                  <span className="rounded-full bg-cyan-200 px-3 py-1 text-cyan-950">Stage {stageIndex + 1} of {stages.length}: {stage.label}</span>
                  <span className="rounded-full bg-white/15 px-3 py-1">Planned: {stage.minutes} min</span>
                  {cloudLoading ? <span className="flex items-center gap-1"><Cloud size={14} /> Checking cloud library…</span> : cloud?.available ? <span className="flex items-center gap-1 text-emerald-200"><Cloud size={14} /> Existing cloud lesson · {cloud.verifiedInventoryCount} verified matches</span> : <span className="flex items-center gap-1 text-amber-200"><CloudOff size={14} /> Local curriculum plan {cloud?.reason ? `· ${cloud.reason}` : ''}</span>}
                </div>
                <p className="font-semibold text-slate-100">{stageText}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => setPaused((value) => !value)} className="flex items-center gap-1 rounded-xl bg-purple-200 px-3 py-2 text-xs font-black text-purple-950">{paused ? <Play size={15} /> : <Pause size={15} />}{paused ? 'Resume' : 'Pause'}</button>
                <button type="button" onClick={() => speak(currentQuestion ? `${stageText} Question: ${currentQuestion.question}` : stageText)} className="flex items-center gap-1 rounded-xl bg-yellow-200 px-3 py-2 text-xs font-black text-amber-950"><Volume2 size={15} /> Read</button>
                <button type="button" onClick={requestHelp} className="flex items-center gap-1 rounded-xl bg-amber-200 px-3 py-2 text-xs font-black text-amber-950"><Lightbulb size={15} /> Help</button>
                <button type="button" onClick={toggleMic} className={`flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-black ${micEnabled ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-900'}`}>{micEnabled ? <Mic size={15} /> : <MicOff size={15} />}{micEnabled ? (listening ? 'Listening…' : 'Mic on') : 'Mic off'}</button>
              </div>
              <p className="text-xs font-bold text-slate-300 lg:col-span-2" aria-live="polite">{voiceStatus}. Voice is processed by browser speech recognition; this lesson code does not save raw microphone recordings.</p>
            </section>

            {helpPaused && (
              <section className="rounded-2xl border-4 border-amber-300 bg-amber-50 p-4 text-amber-950 shadow-xl">
                <h3 className="font-black">Lesson paused for help</h3>
                <p className="mt-1 font-semibold">{currentQuestion?.simplerExplanation ?? lesson.simplerExplanation}</p>
                <button type="button" onClick={() => { setHelpPaused(false); setHint(false); setSimpler(false); speak('Ready. We will continue from the same place.'); }} className="mt-3 rounded-xl bg-amber-500 px-4 py-2 font-black text-white">I’m ready — continue</button>
              </section>
            )}

            <Blackboard
              subject={subject}
              topicTitle={lesson.title}
              mode={currentQuestion ? 'question' : 'explain'}
              explanationText={stageText}
              exampleText={lesson.examples[Math.min(stageIndex, Math.max(0, lesson.examples.length - 1))]}
              questionText={currentQuestion?.question}
              options={currentQuestion?.options}
              selectedOption={selectedOption}
              typedInput={typedInput}
              onTypedInputChange={setTypedInput}
              onOptionSelect={(option) => { setSelectedOption(option); submitAnswer(option); }}
              onSubmitAnswer={() => submitAnswer(typedInput)}
              hintText={hint ? currentQuestion?.hint : null}
              simplerText={simpler ? (currentQuestion?.simplerExplanation ?? lesson.simplerExplanation) : null}
              feedback={feedback}
              progressPercent={progress}
              isLocalMode={true}
            />

            {stage.kind === 'activity' && (
              <section className="rounded-[2rem] border-4 border-cyan-200 bg-white p-5 text-slate-900 shadow-xl">
                <h3 className="font-black">Try it your way</h3>
                <p className="mt-1 text-sm font-semibold text-slate-600">This is not multiple choice. Speak your response with the mic, type a short answer, or complete the PE movement safely and mark it done.</p>
                {subject !== 'PE' && (
                  <textarea value={typedInput} onChange={(event) => setTypedInput(event.target.value)} rows={3} placeholder="Type your response here…" className="mt-3 w-full rounded-xl border-2 border-sky-300 p-3 font-semibold" />
                )}
                <button type="button" onClick={() => { setActivityDone(true); setFeedback({ isCorrect: true, message: subject === 'PE' ? 'Activity marked complete. Sodafom is not claiming to have observed your physical performance.' : 'Activity response saved for this lesson step.' }); }} className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-black text-white"><CheckCircle2 size={18} /> {subject === 'PE' ? 'I completed this safely' : 'Save activity response'}</button>
              </section>
            )}

            <nav className="rounded-[2rem] border border-white/20 bg-white/10 p-4" aria-label="Lesson stages">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
                {stages.map((item, index) => (
                  <div key={`${item.kind}-${index}`} className={`rounded-xl p-2 text-center text-[11px] font-black ${index === stageIndex ? 'bg-yellow-300 text-amber-950' : index < stageIndex ? 'bg-emerald-500/80 text-white' : 'bg-white/10 text-slate-200'}`}>
                    {item.label}<span className="block text-[10px] opacity-75">{item.minutes} min</span>
                  </div>
                ))}
              </div>
            </nav>

            <div className="flex justify-end">
              <button type="button" onClick={nextStage} disabled={stage.kind === 'activity' && !activityDone} className="flex min-h-14 items-center gap-2 rounded-2xl bg-yellow-400 px-6 font-black text-amber-950 shadow-xl disabled:cursor-not-allowed disabled:opacity-50">
                {stageIndex + 1 >= stages.length ? 'Finish lesson' : stage.kind === 'assessment' && currentQuestion && questionIndex + 1 < lesson.questions.length ? 'Next quiz question' : 'Next stage'} <ChevronRight size={20} />
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

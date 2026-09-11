import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { ArrowLeft, Volume2, Mic, MicOff, Lightbulb, RotateCcw, Pause, Play, Settings, Award, Clock3 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ArchieCharacter } from '@/components/ArchieCharacter';
import { Blackboard } from '@/components/Blackboard';
import { ChildProfileManager } from '@/components/ChildProfileManager';
import { loadTutorMemory, ChildTutorProfile, recordQuestionAnswer } from '@/lib/tutor/memory';
import { CURRICULUM_LESSONS, TopicLesson, LessonQuestion } from '@/lib/tutor/curriculum';
import { parseTutorVoiceCommand } from '@/lib/tutor/voice-commands';
import { buildMathsPracticeLesson } from '@/lib/tutor/maths-practice';
import { ttsSpeak, stopTts } from '@/lib/voice-context';
import {
  buildDailyCurriculumLesson,
  CURRICULUM_SUBJECTS,
  type CurriculumAgeGroup,
  type CurriculumSubject,
} from '@/lib/tutor/curriculum-year-plan';

export default function TeacherModePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ChildTutorProfile>(() => loadTutorMemory());
  const [showProfileSetup, setShowProfileSetup] = useState<boolean>(!profile.childName);

  const [selectedSubject, setSelectedSubject] = useState<string>('Any Subject');
  const [lessonMinutes, setLessonMinutes] = useState<15 | 20 | 30 | 60>(30);
  const [requestedAgeGroup, setRequestedAgeGroup] = useState<CurriculumAgeGroup | null>(null);
  const [lessonDay, setLessonDay] = useState(1);
  const ageGroup: CurriculumAgeGroup = requestedAgeGroup ?? profile.ageGroup ?? '8-10';
  const normalisedSubject = selectedSubject === 'Writing' ? 'English' : selectedSubject === 'Technology' ? 'Computing' : selectedSubject;
  const curriculumSubject = CURRICULUM_SUBJECTS.includes(normalisedSubject as CurriculumSubject)
    ? normalisedSubject as CurriculumSubject
    : null;
  const lessonSubject = ['Reading', 'Writing', 'Spelling'].includes(selectedSubject) ? 'English' : selectedSubject;
  const ageLessons = CURRICULUM_LESSONS.filter((lesson) => lesson.ageGroup === ageGroup);
  const lessonPool = lessonSubject === 'Any Subject'
    ? ageLessons
    : ageLessons.filter((lesson) => lesson.subject.toLowerCase() === lessonSubject.toLowerCase());
  const dailyLesson = curriculumSubject
    ? buildDailyCurriculumLesson({ subject: curriculumSubject, ageGroup, day: lessonDay, durationMinutes: lessonMinutes })
    : null;
  const lessons = dailyLesson
    ? [dailyLesson]
    : lessonSubject === 'Maths'
      ? [...lessonPool, buildMathsPracticeLesson(ageGroup)]
      : (lessonPool.length ? lessonPool : ageLessons.length ? ageLessons : CURRICULUM_LESSONS);
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => lessonMinutes * 60);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [typedInput, setTypedInput] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSimpler, setShowSimpler] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('Microphone ready');
  const [answerSource, setAnswerSource] = useState<'Local AI' | 'OpenAI'>('Local AI');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const storedSubject = localStorage.getItem('sodafom_lesson_subject');
    if (storedSubject) setSelectedSubject(storedSubject);

    const storedMinutes = Number(localStorage.getItem('sodafom_lesson_minutes') || '30');
    if (([15, 20, 30, 60] as const).includes(storedMinutes as 15 | 20 | 30 | 60)) {
      const validMinutes = storedMinutes as 15 | 20 | 30 | 60;
      setLessonMinutes(validMinutes);
      setSecondsRemaining(validMinutes * 60);
    }

    const storedAgeGroup = localStorage.getItem('sodafom_lesson_age');
    if (storedAgeGroup === '5-7' || storedAgeGroup === '8-10' || storedAgeGroup === '11-13') {
      setRequestedAgeGroup(storedAgeGroup);
    }

    const storedLessonDay = Number(localStorage.getItem('sodafom_lesson_day') || '1');
    if (Number.isInteger(storedLessonDay)) {
      setLessonDay(Math.min(365, Math.max(1, storedLessonDay)));
    }
  }, []);

  const currentLesson: TopicLesson = lessons[currentLessonIndex] ?? lessons[0] ?? CURRICULUM_LESSONS[0];
  const currentQuestion: LessonQuestion | undefined = currentLesson.questions[currentQuestionIndex];

  const speakText = useCallback((text: string, onDone?: () => void) => {
    if (profile.readAloudPreference === false) return;
    stopTts();
    setIsSpeaking(true);
    ttsSpeak(text, () => {
      setIsSpeaking(false);
      onDone?.();
    });
  }, [profile.readAloudPreference]);

  const handleProfileComplete = (updated: ChildTutorProfile) => {
    setProfile(updated);
    setShowProfileSetup(false);
  };

  const handleNextQuestion = () => {
    setFeedback(null);
    setSelectedOption('');
    setTypedInput('');
    setShowHint(false);
    setShowSimpler(false);
    setAnswerSource('Local AI');

    if (currentQuestionIndex + 1 < currentLesson.questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      const nextQ = currentLesson.questions[currentQuestionIndex + 1];
      if (nextQ) speakText(`Next question: ${nextQ.question}`);
    } else if (currentLessonIndex + 1 < lessons.length) {
      setCurrentLessonIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
    } else {
      // Never repeat questions in the same lesson session.
      setLessonComplete(true);
      setIsPaused(true);
      speakText(`Brilliant work${profile.childName ? ` ${profile.childName}` : ''}! You answered every available question without repeats.`);
    }
  };

  const handleAnswerSubmit = (givenAnswer: string) => {
    if (!currentQuestion) return;
    const expected = currentQuestion.answer.toLowerCase();
    const isCorrect = givenAnswer.trim().toLowerCase() === expected ||
      (currentQuestion.alternateAnswers?.some(a => a.toLowerCase() === givenAnswer.trim().toLowerCase()) ?? false);

    // Save progress locally
    recordQuestionAnswer(currentLesson.subject, currentLesson.topic, isCorrect);

    if (isCorrect) {
      const msg = `Well done${profile.childName ? ' ' + profile.childName : ''}! ${currentQuestion.explanation}`;
      setFeedback({ isCorrect: true, message: msg });
      speakText(msg);
      setTimeout(handleNextQuestion, 2500);
    } else {
      const msg = `Good try! Here is a hint: ${currentQuestion.hint}`;
      setFeedback({ isCorrect: false, message: msg });
      setShowHint(true);
      speakText(msg);
    }
  };

  const handleVoiceCommandToggle = () => {
    if (isListening) {
      try { recognitionRef.current?.stop?.(); } catch { /* ignore */ }
      recognitionRef.current = null;
      setIsListening(false);
      return;
    }
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setVoiceStatus('Speech recognition is not supported here. Type or tap an answer instead.');
      return;
    }

    setIsListening(true);
    setVoiceStatus('Listening…');
    const rec = new SpeechRec();
    recognitionRef.current = rec;
    rec.lang = 'en-GB';
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const phrase = e.results[0]?.[0]?.transcript ?? '';
      setIsListening(false);

      const durationMatch = phrase.match(/\b(15|20|30|60)\s*(?:minute|min)\b/i);
      if (durationMatch) {
        const nextMinutes = Number(durationMatch[1]) as 15 | 20 | 30 | 60;
        setLessonMinutes(nextMinutes);
        setSecondsRemaining(nextMinutes * 60);
        localStorage.setItem('sodafom_lesson_minutes', String(nextMinutes));
        setVoiceStatus(`Lesson time changed to ${nextMinutes} minutes.`);
        speakText(`Okay. This is now a ${nextMinutes} minute lesson.`);
        return;
      }

      const subjectMatch = phrase.match(/\b(maths|math|english|reading|writing|spelling|science|history|geography|computing|technology|design and technology|art and design|music|physical education|p\.?e\.?|religious education|r\.?e\.?|p\.?s\.?h\.?e\.?|french|german)\b/i);
      if (subjectMatch && /\b(?:switch|change|learn|teach|do|start)\b/i.test(phrase)) {
        const spoken = subjectMatch[1].toLowerCase();
        const subjectAliases: Record<string, string> = {
          math: 'Maths',
          maths: 'Maths',
          technology: 'Computing',
          'design and technology': 'Design & Technology',
          'art and design': 'Art & Design',
          'physical education': 'PE',
          'religious education': 'RE',
        };
        const nextSubject = subjectAliases[spoken]
          ?? (/^p\.?e\.?$/.test(spoken) ? 'PE' : null)
          ?? (/^r\.?e\.?$/.test(spoken) ? 'RE' : null)
          ?? (/^p\.?s\.?h\.?e\.?$/.test(spoken) ? 'PSHE' : null)
          ?? spoken.charAt(0).toUpperCase() + spoken.slice(1);
        setSelectedSubject(nextSubject);
        localStorage.setItem('sodafom_lesson_subject', nextSubject);
        setCurrentLessonIndex(0);
        setCurrentQuestionIndex(0);
        setLessonComplete(false);
        setVoiceStatus(`Switched to ${nextSubject}.`);
        speakText(`Great choice. Let's switch to ${nextSubject}.`);
        return;
      }
      const action = parseTutorVoiceCommand(phrase);

      if (action === 'read_question' && currentQuestion) {
        speakText(`The question is: ${currentQuestion.question}`);
      } else if (action === 'read_explanation') {
        speakText(currentLesson.explanation);
      } else if (action === 'read_options' && currentQuestion?.options) {
        speakText(`The choices are: ${currentQuestion.options.join(', ')}`);
      } else if (action === 'hint' && currentQuestion) {
        setShowHint(true);
        speakText(`Hint: ${currentQuestion.hint}`);
      } else if (action === 'explain_another_way') {
        setShowSimpler(true);
        speakText(`Here is a simpler explanation: ${currentLesson.simplerExplanation}`);
      } else if (action === 'stop') {
        stopTts();
        setIsSpeaking(false);
      } else if (action === 'continue') {
        handleNextQuestion();
      } else if (action === 'repeat' && currentQuestion) {
        speakText(currentQuestion.question);
      } else if (phrase) {
        // Evaluate phrase as direct answer
        handleAnswerSubmit(phrase);
      }
    };
    rec.onerror = (event: any) => {
      recognitionRef.current = null;
      setIsListening(false);
      setVoiceStatus(event?.error === 'not-allowed' ? 'Microphone permission was blocked. Allow it in browser settings, or type the answer.' : 'I could not hear that. Try again or type the answer.');
    };
    rec.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
      setVoiceStatus((current) => current === 'Listening…' ? 'Microphone ready' : current);
    };
    rec.start();
  };

  // Archie reads each new, unique question and then opens the microphone.
  useEffect(() => {
    if (showProfileSetup || isPaused || lessonComplete || !currentLesson || !currentQuestion) return;
    const greeting = currentLessonIndex === 0 && currentQuestionIndex === 0 && profile.childName ? `Hi ${profile.childName}! ` : '';
    const lessonIntro = currentQuestionIndex === 0 ? `${currentLesson.title}. ${currentLesson.explanation} ` : '';
    speakText(`${greeting}${lessonIntro}Question: ${currentQuestion.question}`, () => {
      if (document.visibilityState === 'visible') handleVoiceCommandToggle();
    });
    // Question indexes are the session sequence; stopping at the end prevents repeats.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLessonIndex, currentQuestionIndex, showProfileSetup, lessonComplete]);

  useEffect(() => () => {
    try { recognitionRef.current?.abort?.(); } catch { /* ignore */ }
    recognitionRef.current = null;
    stopTts();
  }, []);

  useEffect(() => {
    if (showProfileSetup || isPaused || secondsRemaining <= 0) return;
    const timer = window.setInterval(() => setSecondsRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [showProfileSetup, isPaused, secondsRemaining]);

  useEffect(() => {
    if (secondsRemaining !== 0) return;
    setLessonComplete(true);
    setIsPaused(true);
    speakText(`Brilliant work${profile.childName ? ` ${profile.childName}` : ''}! Your ${lessonMinutes} minute lesson is complete.`);
  }, [lessonMinutes, profile.childName, secondsRemaining, speakText]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const progressPercent = ((currentQuestionIndex + 1) / Math.max(1, currentLesson.questions.length)) * 100;

  return (
    <div className="relative min-h-screen overflow-hidden bg-sky-800 flex flex-col font-sans">
      <Helmet>
        <title>Sodafom One-to-One Tutor Mode</title>
      </Helmet>
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/assets/cartoon/home-landscape-v2.png')" }} aria-hidden="true" />
      <div className="fixed inset-0 bg-gradient-to-b from-blue-500/55 via-indigo-800/75 to-blue-950/95" aria-hidden="true" />

      {/* Header */}
      <header className="relative z-20 m-3 flex flex-col gap-3 rounded-[1.75rem] border-4 border-white/80 bg-gradient-to-r from-sky-500 via-blue-600 to-purple-700 p-3 text-white shadow-2xl sm:m-4 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <button
            onClick={() => { stopTts(); navigate('/'); }}
            className="w-11 h-11 rounded-full border-2 border-white/80 bg-white text-sky-900 flex items-center justify-center shadow active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-base font-black text-white leading-tight flex items-center gap-2 sm:text-xl">
              1-to-1 Tutor <Award size={16} className="text-yellow-500" />
            </h1>
            <p className="text-[11px] font-extrabold text-yellow-200 sm:text-sm">
              {profile.childName ? `Learning with ${profile.childName}` : 'Child Profile Ready'} · {answerSource}
            </p>
          </div>
        </div>

        <div className="grid w-full grid-cols-2 items-center gap-2 sm:flex sm:w-auto">
          <button
            onClick={() => setShowProfileSetup(true)}
            className="px-3 py-2 bg-white/95 text-purple-900 font-extrabold text-xs rounded-full border-2 border-white flex items-center gap-1.5 shadow"
          >
            <Settings size={14} /> Profile
          </button>
          <button
            onClick={() => navigate('/parent-dashboard')}
            className="px-3 py-2 bg-yellow-400 text-indigo-950 font-extrabold text-xs rounded-full border-2 border-yellow-200 shadow flex items-center gap-1.5"
          >
            Parent Report
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto p-4 pt-1 flex flex-col gap-4 pb-24">
        {showProfileSetup ? (
          <ChildProfileManager
            onComplete={handleProfileComplete}
            onCancel={profile.childName ? () => setShowProfileSetup(false) : undefined}
            isEditing={!!profile.childName}
          />
        ) : (
          <>
            {/* Top Classroom Row: Mascot + Control Toolbar */}
            <div className="flex flex-col gap-4 overflow-hidden bg-gradient-to-br from-white via-sky-50 to-yellow-100 p-4 rounded-[2rem] border-4 border-white/90 shadow-2xl sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex items-center gap-3">
                <ArchieCharacter
                  size={90}
                  speaking={isSpeaking}
                  character={profile.preferredTutor ?? 'archie'}
                />
                <div>
                  <h2 className="font-extrabold text-sm text-gray-900">
                    Tutor: {profile.preferredTutor === 'soda' ? 'Soda' : profile.preferredTutor === 'bella' ? 'Bella' : profile.preferredTutor === 'rocky' ? 'Rocky' : 'Archie'}
                  </h2>
                  <p className="text-xs font-bold text-amber-600">
                    {currentLesson.subject} • Ages {ageGroup.replace('-', '–')}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs font-black text-purple-700">
                    <Clock3 size={14} /> {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')} · {selectedSubject}
                  </p>
                  <p className="mt-1 text-[11px] font-bold text-blue-700">{voiceStatus}</p>
                </div>
              </div>

              {/* Toolbar Controls */}
              <div className="flex flex-wrap gap-2 justify-end">
                <select value={lessonMinutes} onChange={(event) => {
                  const next = Number(event.target.value) as 15 | 20 | 30 | 60;
                  setLessonMinutes(next); setSecondsRemaining(next * 60); setLessonComplete(false); setIsPaused(false); localStorage.setItem('sodafom_lesson_minutes', String(next));
                }} aria-label="Lesson length" className="rounded-2xl border border-blue-300 bg-blue-50 p-2 text-xs font-black text-blue-900">
                  {[15, 20, 30, 60].map((value) => <option key={value} value={value}>{value} min</option>)}
                </select>
                <button
                  onClick={() => setIsPaused((value) => !value)}
                  className="p-2.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-2xl border border-purple-300 font-bold text-xs flex items-center gap-1"
                  title={isPaused ? 'Resume lesson' : 'Pause lesson'}
                >
                  {isPaused ? <Play size={16} /> : <Pause size={16} />} {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  onClick={() => speakText(`${currentLesson.explanation}. Question: ${currentQuestion?.question ?? ''}`)}
                  className="p-2.5 bg-yellow-100 hover:bg-yellow-200 text-amber-900 rounded-2xl border border-yellow-300 font-bold text-xs flex items-center gap-1"
                  title="Read Aloud"
                >
                  <Volume2 size={16} /> Read
                </button>
                <button
                  onClick={() => {
                    setShowHint(true);
                    if (currentQuestion) speakText(`Hint: ${currentQuestion.hint}`);
                  }}
                  className="p-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-2xl border border-amber-300 font-bold text-xs flex items-center gap-1"
                >
                  <Lightbulb size={16} /> Hint
                </button>
                <button
                  onClick={() => {
                    setShowSimpler(true);
                    speakText(`Here is a simpler explanation: ${currentLesson.simplerExplanation}`);
                  }}
                  className="p-2.5 bg-green-100 hover:bg-green-200 text-green-900 rounded-2xl border border-green-300 font-bold text-xs flex items-center gap-1"
                >
                  <RotateCcw size={16} /> Simpler
                </button>
                <button
                  onClick={handleVoiceCommandToggle}
                  className={`p-2.5 rounded-2xl font-bold text-xs flex items-center gap-1 text-white shadow ${
                    isListening ? 'bg-red-500 animate-pulse' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />} Voice
                </button>
              </div>
            </div>

            {/* Interactive Classroom Blackboard */}
            <Blackboard
              subject={currentLesson.subject}
              topicTitle={currentLesson.title}
              mode={currentQuestion ? 'question' : 'explain'}
              explanationText={currentLesson.explanation}
              exampleText={currentLesson.examples[0]}
              questionText={currentQuestion?.question}
              options={currentQuestion?.options}
              selectedOption={selectedOption}
              typedInput={typedInput}
              onTypedInputChange={setTypedInput}
              onOptionSelect={(opt) => {
                setSelectedOption(opt);
                handleAnswerSubmit(opt);
              }}
              onSubmitAnswer={() => handleAnswerSubmit(typedInput)}
              hintText={showHint ? currentQuestion?.hint : null}
              simplerText={showSimpler ? currentLesson.simplerExplanation : null}
              feedback={feedback}
              progressPercent={progressPercent}
              isLocalMode={true}
            />
          </>
        )}
      </main>
    </div>
  );
}

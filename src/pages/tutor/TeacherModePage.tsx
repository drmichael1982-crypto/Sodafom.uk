import { useArchieContext } from '@/contexts/ArchieContext';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { ArrowLeft, Volume2, Mic, MicOff, Lightbulb, RotateCcw, Settings, Award, ChevronRight, BookOpen } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { Capacitor } from '@capacitor/core';
import { ArchieCharacter } from '@/components/ArchieCharacter';
import { Blackboard } from '@/components/Blackboard';
import { ChildProfileManager } from '@/components/ChildProfileManager';
import { loadTutorMemory, ChildTutorProfile, recordQuestionAnswer } from '@/lib/tutor/memory';
import { tutorLessonsFor, TopicLesson, LessonQuestion } from '@/lib/tutor/curriculum';
import { parseTutorVoiceCommand } from '@/lib/tutor/voice-commands';
import { ttsSpeak, stopTts } from '@/lib/voice-context';

function speechOutputAvailable() {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window || Capacitor.isNativePlatform();
}

export default function TeacherModePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ChildTutorProfile>(() => loadTutorMemory());
  // A name is optional: existing named profiles and completed/skipped setups go straight to lessons.
  const [showProfileSetup, setShowProfileSetup] = useState<boolean>(!profile.childName && !profile.profileSetupComplete);

  const { lessons, matched: ageMatched } = tutorLessonsFor(profile.ageGroup);
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [typedInput, setTypedInput] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSimpler, setShowSimpler] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');
  const recognitionRef = useRef<any>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const completeHeadingRef = useRef<HTMLHeadingElement>(null);

  const currentLesson: TopicLesson = lessons[currentLessonIndex] ?? lessons[0];
  const currentQuestion: LessonQuestion | undefined = currentLesson.questions[currentQuestionIndex];
  const answeredCorrectly = feedback?.isCorrect === true;
  const isLastQuestion = currentQuestionIndex + 1 >= currentLesson.questions.length;
  const isLastLesson = currentLessonIndex + 1 >= lessons.length;
  const { setGameContext, clearGameContext } = useArchieContext();
  useEffect(() => {
    if (completed) {
      setGameContext('1-to-1 Tutor', currentLesson.subject, undefined, undefined, { phase: 'complete', phaseLabel: 'All lessons complete', subject: currentLesson.subject.toLowerCase(), nextLessonTitle: null });
      return clearGameContext;
    }
    setGameContext(currentLesson.title, currentLesson.subject, currentQuestion?.question, currentQuestion?.options, {
      phase: 'practice',
      phaseLabel: 'Practice',
      subject: currentLesson.subject.toLowerCase(),
      objective: currentLesson.title,
      keyPoint: currentLesson.explanation,
      workedExample: currentLesson.examples[0] ? { prompt: currentLesson.examples[0], explanation: currentLesson.simplerExplanation } : undefined,
      hint: currentQuestion?.hint,
      correctOption: currentQuestion?.answer,
      answeredCorrectly,
      wrongAttempts,
      ...(answeredCorrectly ? { explanation: currentQuestion?.explanation } : {}),
    });
    return clearGameContext;
  }, [completed, currentLesson, currentQuestion, answeredCorrectly, wrongAttempts, setGameContext, clearGameContext]);

  const speakText = useCallback((text: string) => {
    if (profile.readAloudPreference === false) return;
    if (!speechOutputAvailable()) {
      setStatus('Reading aloud is not available on this device. Everything Archie says is shown on the board.');
      return;
    }
    stopTts();
    setIsSpeaking(true);
    ttsSpeak(text, () => {
      setIsSpeaking(false);
    });
  }, [profile.readAloudPreference]);

  // Initial welcome speech on lesson load
  useEffect(() => {
    if (showProfileSetup || completed || !currentLesson) return;
    const greeting = profile.childName ? `Hi ${profile.childName}! ` : '';
    const introText = `${greeting}Welcome to ${currentLesson.title}! ${currentLesson.explanation}`;
    speakText(introText);
  }, [currentLessonIndex, showProfileSetup, completed]);

  useEffect(() => {
    if (answeredCorrectly) nextButtonRef.current?.focus();
  }, [answeredCorrectly]);
  useEffect(() => {
    if (completed) completeHeadingRef.current?.focus();
  }, [completed]);

  const resetQuestionState = () => {
    setFeedback(null);
    setSelectedOption('');
    setTypedInput('');
    setShowHint(false);
    setShowSimpler(false);
    setWrongAttempts(0);
  };

  const restartLessons = (lessonIndex = 0) => {
    stopTts();
    setIsSpeaking(false);
    resetQuestionState();
    setCompleted(false);
    setCurrentLessonIndex(lessonIndex);
    setCurrentQuestionIndex(0);
  };

  const handleProfileComplete = (updated: ChildTutorProfile) => {
    const ageChanged = updated.ageGroup !== profile.ageGroup;
    setProfile(updated);
    setShowProfileSetup(false);
    if (ageChanged) restartLessons(0);
  };

  /** Explicit, child-controlled step forward after a correct answer. */
  const handleNextQuestion = () => {
    resetQuestionState();
    setStatus('');
    if (!isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1);
      const nextQ = currentLesson.questions[currentQuestionIndex + 1];
      if (nextQ) speakText(`Next question: ${nextQ.question}`);
    } else if (!isLastLesson) {
      setCurrentLessonIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
    } else {
      setCompleted(true);
      speakText('Well done! You have finished every lesson here. You can review a lesson or start again.');
    }
  };

  const handleAnswerSubmit = (givenAnswer: string) => {
    if (!currentQuestion || answeredCorrectly) return;
    if (!givenAnswer.trim()) {
      setStatus('Type or choose an answer first.');
      return;
    }
    setStatus('');
    const expected = currentQuestion.answer.toLowerCase();
    const isCorrect = givenAnswer.trim().toLowerCase() === expected ||
      (currentQuestion.alternateAnswers?.some(a => a.toLowerCase() === givenAnswer.trim().toLowerCase()) ?? false);

    // Save progress locally
    recordQuestionAnswer(currentLesson.subject, currentLesson.topic, isCorrect);

    if (isCorrect) {
      const msg = `Well done${profile.childName ? ' ' + profile.childName : ''}! ${currentQuestion.explanation}`;
      setFeedback({ isCorrect: true, message: msg });
      speakText(msg);
    } else {
      const attempts = wrongAttempts + 1;
      setWrongAttempts(attempts);
      const nudge = attempts >= 2 ? ` Here is another way to think about it: ${currentLesson.simplerExplanation}` : '';
      const msg = `Not quite yet, and that is okay. Here is a hint: ${currentQuestion.hint}${nudge}`;
      setFeedback({ isCorrect: false, message: msg });
      setShowHint(true);
      if (attempts >= 2) setShowSimpler(true);
      speakText(msg);
    }
  };

  const stopListening = () => {
    const active = recognitionRef.current;
    recognitionRef.current = null;
    if (active) { try { if (active.abort) active.abort(); else active.stop?.(); } catch { /* already ended */ } }
    setIsListening(false);
  };

  const handleVoiceCommandToggle = () => {
    if (isListening) {
      stopListening();
      setStatus('Microphone stopped.');
      return;
    }
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setStatus('Voice commands are not supported in this browser. You can tap the buttons or type your answer instead.');
      return;
    }

    stopTts();
    setIsSpeaking(false);
    const rec = new SpeechRec();
    recognitionRef.current = rec;
    rec.lang = 'en-GB';
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      if (recognitionRef.current !== rec) return;
      const phrase = e.results[0]?.[0]?.transcript ?? '';
      recognitionRef.current = null;
      setIsListening(false);
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
      } else if (phrase) {
        // Evaluate phrase as direct answer
        handleAnswerSubmit(phrase);
      }
    };
    rec.onerror = (event: any) => {
      if (recognitionRef.current !== rec) return;
      recognitionRef.current = null;
      setIsListening(false);
      setStatus(['not-allowed', 'service-not-allowed', 'audio-capture'].includes(event?.error)
        ? 'The microphone is not available. Ask a grown-up to check permission, or type your answer.'
        : 'I could not hear that. You can try again or type your answer.');
    };
    rec.onend = () => {
      if (recognitionRef.current !== rec) return;
      recognitionRef.current = null;
      setIsListening(false);
    };
    try {
      rec.start();
      setIsListening(true);
      setStatus('Listening… say a command like "give me a hint" or your answer.');
    } catch {
      recognitionRef.current = null;
      setIsListening(false);
      setStatus('The microphone could not start. You can type your answer instead.');
    }
  };

  useEffect(() => () => {
    const active = recognitionRef.current;
    recognitionRef.current = null;
    try { active?.abort?.(); } catch { /* ignore */ }
    stopTts();
  }, []);

  const progressPercent = ((currentQuestionIndex + 1) / Math.max(1, currentLesson.questions.length)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-amber-50 to-green-50 flex flex-col font-sans">
      <Helmet>
        <title>Sodafom One-to-One Tutor Mode</title>
      </Helmet>

      {/* Header */}
      <header className="p-4 bg-white/90 backdrop-blur border-b border-yellow-200 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { stopTts(); navigate('/'); }}
            aria-label="Back to home"
            className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center shadow active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-base font-black text-gray-900 leading-tight flex items-center gap-2">
              1-to-1 Tutor <Award size={16} className="text-yellow-500" />
            </h1>
            <p className="text-[11px] font-extrabold text-amber-700">
              {profile.childName ? `Learning with ${profile.childName}` : 'Ready to learn'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowProfileSetup(true)}
            className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-xs rounded-full border border-amber-300 flex items-center gap-1.5"
          >
            <Settings size={14} /> Profile
          </button>
          <button
            onClick={() => navigate('/parent-dashboard')}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs rounded-full shadow flex items-center gap-1.5"
          >
            Parent Report
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col gap-4">
        <p className="text-xs font-bold text-amber-900 bg-white/80 border border-yellow-200 rounded-2xl p-3 flex flex-wrap items-center gap-2">
          <BookOpen size={16} aria-hidden="true" />
          This tutor has a few short practice lessons. The full curriculum, Years 1–9 in maths, English, history and science, is in the lesson library.
          <Link to="/courses" className="underline font-black text-green-800">Open the full lesson library</Link>
        </p>
        {status && <p role="status" className="text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 rounded-2xl p-3">{status}</p>}
        {showProfileSetup ? (
          <ChildProfileManager
            onComplete={handleProfileComplete}
            onCancel={profile.childName || profile.profileSetupComplete ? () => setShowProfileSetup(false) : undefined}
            isEditing={!!(profile.childName || profile.profileSetupComplete)}
          />
        ) : completed ? (
          <section className="bg-white/90 p-6 rounded-3xl border-2 border-yellow-200 shadow-sm flex flex-col gap-4" aria-label="All lessons complete">
            <h2 ref={completeHeadingRef} tabIndex={-1} className="text-xl font-black text-gray-900">
              You finished all {lessons.length} tutor lessons!
            </h2>
            <p className="text-sm font-bold text-gray-700">
              Brilliant effort. You can review a lesson, start again from the beginning, or find many more lessons in the full library.
            </p>
            <div>
              <h3 className="text-sm font-black text-gray-900 mb-2">Review a lesson</h3>
              <ul className="flex flex-col gap-2">
                {lessons.map((lesson, index) => (
                  <li key={lesson.id}>
                    <button
                      onClick={() => restartLessons(index)}
                      className="w-full text-left px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-2xl text-xs font-bold text-amber-900"
                    >
                      Review {lesson.title} ({lesson.subject})
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => restartLessons(0)}
                className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-amber-950 font-black text-xs rounded-2xl border-2 border-yellow-500"
              >
                Start again from the first lesson
              </button>
              <Link to="/courses" className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-black text-xs rounded-2xl">
                Go to the full lesson library
              </Link>
            </div>
          </section>
        ) : (
          <>
            {!ageMatched && (
              <p className="text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 rounded-2xl p-3">
                There are no tutor lessons set for ages {profile.ageGroup} yet, so you are seeing all of them. The lesson library has lessons up to Year 9.
              </p>
            )}
            {/* Top Classroom Row: Mascot + Control Toolbar */}
            <div className="flex items-center justify-between bg-white/80 p-4 rounded-3xl border-2 border-yellow-200 shadow-sm">
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
                    {currentLesson.subject} • Level {profile.ageGroup ?? '8-10'} • Lesson {currentLessonIndex + 1} of {lessons.length}
                  </p>
                </div>
              </div>

              {/* Toolbar Controls */}
              <div className="flex flex-wrap gap-2 justify-end">
                <button
                  onClick={() => speakText(`${currentLesson.explanation}. Question: ${currentQuestion?.question ?? ''}`)}
                  className="p-2.5 bg-yellow-100 hover:bg-yellow-200 text-amber-900 rounded-2xl border border-yellow-300 font-bold text-xs flex items-center gap-1"
                  title="Read Aloud"
                >
                  <Volume2 size={16} /> Read
                </button>
                {isSpeaking && (
                  <button
                    onClick={() => { stopTts(); setIsSpeaking(false); }}
                    className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-2xl border border-gray-300 font-bold text-xs"
                  >
                    Stop
                  </button>
                )}
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
                  aria-pressed={isListening}
                  className={`p-2.5 rounded-2xl font-bold text-xs flex items-center gap-1 text-white shadow ${
                    isListening ? 'bg-red-500 animate-pulse' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />} {isListening ? 'Stop voice' : 'Voice'}
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
                if (answeredCorrectly) return;
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
            {answeredCorrectly && (
              <div className="flex justify-end">
                <button
                  ref={nextButtonRef}
                  onClick={handleNextQuestion}
                  className="px-5 py-3 bg-yellow-400 hover:bg-yellow-500 text-amber-950 font-black text-sm rounded-2xl border-2 border-yellow-500 shadow flex items-center gap-2"
                >
                  {!isLastQuestion ? 'Next question' : !isLastLesson ? 'Next lesson' : 'Finish my lessons'} <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

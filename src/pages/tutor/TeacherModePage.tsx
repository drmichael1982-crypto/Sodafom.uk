import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Volume2, Mic, MicOff, Lightbulb, RotateCcw, HelpCircle, Pause, Play, Settings, Sparkles, Award, Clock3 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ArchieCharacter } from '@/components/ArchieCharacter';
import { Blackboard } from '@/components/Blackboard';
import { ChildProfileManager } from '@/components/ChildProfileManager';
import { loadTutorMemory, ChildTutorProfile, recordQuestionAnswer, saveTutorMemory } from '@/lib/tutor/memory';
import { CURRICULUM_LESSONS, TopicLesson, LessonQuestion } from '@/lib/tutor/curriculum';
import { parseTutorVoiceCommand } from '@/lib/tutor/voice-commands';
import { buildMathsPracticeLesson } from '@/lib/tutor/maths-practice';
import { ttsSpeak, stopTts } from '@/lib/voice-context';

export default function TeacherModePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ChildTutorProfile>(() => loadTutorMemory());
  const [showProfileSetup, setShowProfileSetup] = useState<boolean>(!profile.childName);

  const [selectedSubject] = useState<string>(() => localStorage.getItem('sodafom_lesson_subject') || 'Any Subject');
  const lessonSubject = ['Reading', 'Writing', 'Spelling'].includes(selectedSubject) ? 'English' : selectedSubject;
  const lessonPool = lessonSubject === 'Any Subject'
    ? CURRICULUM_LESSONS
    : CURRICULUM_LESSONS.filter((lesson) => lesson.subject.toLowerCase() === lessonSubject.toLowerCase());
  const ageGroup = profile.ageGroup ?? '8-10';
  const lessons = lessonSubject === 'Maths'
    ? [...lessonPool, buildMathsPracticeLesson(ageGroup)]
    : (lessonPool.length ? lessonPool : CURRICULUM_LESSONS);
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);
  const lessonDurationMinutes = Number(localStorage.getItem('sodafom_lesson_minutes') || '30');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => lessonDurationMinutes * 60);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [typedInput, setTypedInput] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSimpler, setShowSimpler] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  const currentLesson: TopicLesson = lessons[currentLessonIndex] ?? lessons[0] ?? CURRICULUM_LESSONS[0];
  const currentQuestion: LessonQuestion | undefined = currentLesson.questions[currentQuestionIndex];

  const speakText = useCallback((text: string) => {
    if (profile.readAloudPreference === false) return;
    stopTts();
    setIsSpeaking(true);
    ttsSpeak(text, () => {
      setIsSpeaking(false);
    });
  }, [profile.readAloudPreference]);

  // Initial welcome speech on lesson load
  useEffect(() => {
    if (showProfileSetup || !currentLesson) return;
    const greeting = profile.childName ? `Hi ${profile.childName}! ` : '';
    const introText = `${greeting}Welcome to ${currentLesson.title}! ${currentLesson.explanation}`;
    speakText(introText);
  }, [currentLessonIndex, showProfileSetup]);

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

    if (currentQuestionIndex + 1 < currentLesson.questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      const nextQ = currentLesson.questions[currentQuestionIndex + 1];
      if (nextQ) speakText(`Next question: ${nextQ.question}`);
    } else if (currentLessonIndex + 1 < lessons.length) {
      setCurrentLessonIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
    } else {
      // Continue revising the selected subject for the full lesson.
      setCurrentLessonIndex(0);
      setCurrentQuestionIndex(0);
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
      alert('Voice command recognition is not supported on this browser. Use the buttons provided.');
      return;
    }

    setIsListening(true);
    const rec = new SpeechRec();
    recognitionRef.current = rec;
    rec.lang = 'en-GB';
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const phrase = e.results[0]?.[0]?.transcript ?? '';
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
    rec.onerror = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };
    rec.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };
    rec.start();
  };

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
    speakText(`Brilliant work${profile.childName ? ` ${profile.childName}` : ''}! Your ${lessonDurationMinutes} minute lesson is complete.`);
  }, [secondsRemaining]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
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
            className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center shadow active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-base font-black text-gray-900 leading-tight flex items-center gap-2">
              1-to-1 Tutor <Award size={16} className="text-yellow-500" />
            </h1>
            <p className="text-[11px] font-extrabold text-amber-700">
              {profile.childName ? `Learning with ${profile.childName}` : 'Child Profile Ready'}
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
        {showProfileSetup ? (
          <ChildProfileManager
            onComplete={handleProfileComplete}
            onCancel={profile.childName ? () => setShowProfileSetup(false) : undefined}
            isEditing={!!profile.childName}
          />
        ) : (
          <>
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
                    {currentLesson.subject} • Level {profile.ageGroup ?? '8-10'}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs font-black text-purple-700">
                    <Clock3 size={14} /> {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')} · {selectedSubject}
                  </p>
                </div>
              </div>

              {/* Toolbar Controls */}
              <div className="flex flex-wrap gap-2 justify-end">
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

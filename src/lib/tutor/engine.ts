/**
 * Offline-First Tutoring Engine
 * Matches curriculum topics, evaluates practice answers, adapts difficulty, and tracks mastery (RED/AMBER/GREEN).
 */

import { LocalArchieResult } from '../archie-local';
import { CURRICULUM_LESSONS, TopicLesson, LessonQuestion } from './curriculum';
import { loadTutorMemory, recordQuestionAnswer, getRecentLessonSummary } from './memory';

let activePendingQuestion: {
  subject: string;
  topic: string;
  question: LessonQuestion;
} | null = null;

export function setActivePendingQuestion(subject: string, topic: string, question: LessonQuestion) {
  activePendingQuestion = { subject, topic, question };
}

export function getActivePendingQuestion() {
  return activePendingQuestion;
}

export function clearActivePendingQuestion() {
  activePendingQuestion = null;
}

export function tryLocalTutor(input: string): LocalArchieResult | null {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();
  const memory = loadTutorMemory();
  const childName = memory.childName ? memory.childName : '';

  const isNewLessonRequest = /\b(?:teach|quiz|practice|explain|learn)\b/i.test(lower);
  if (isNewLessonRequest) {
    activePendingQuestion = null;
  }

  // 1. Recent lesson prompt e.g. "continue my lesson" / "what was I doing"
  if (/\b(?:continue|recent|previous)\s+lesson\b|\bwhat\s+was\s+i\s+(?:doing|learning)\b/i.test(lower)) {
    const summary = getRecentLessonSummary();
    if (summary) {
      return {
        text: summary,
        intent: 'app-help'
      };
    }
  }

  // 2. Explain again / simpler explanation
  if (/\b(?:explain\s+again|explain\s+it\s+another\s+way|simpler|simpler\s+explanation|i\s+don't\s+understand)\b/i.test(lower)) {
    if (activePendingQuestion) {
      const lesson = CURRICULUM_LESSONS.find(
        l => l.subject.toLowerCase() === activePendingQuestion?.subject.toLowerCase() &&
             l.topic.toLowerCase() === activePendingQuestion?.topic.toLowerCase()
      );
      if (lesson) {
        return {
          text: `No problem${childName ? ' ' + childName : ''}! Here is a simpler explanation: ${lesson.simplerExplanation}`,
          intent: 'app-help'
        };
      }
    }
  }

  // 3. Evaluate active pending question answer if one is waiting
  if (activePendingQuestion) {
    const q = activePendingQuestion.question;
    const expected = q.answer.toLowerCase();
    const alternates = q.alternateAnswers?.map(a => a.toLowerCase()) ?? [];

    const isCorrect = lower === expected || alternates.includes(lower) || lower.includes(expected);

    // Update child memory & adaptive difficulty
    const result = recordQuestionAnswer(
      activePendingQuestion.subject,
      activePendingQuestion.topic,
      isCorrect
    );

    const pendingSubject = activePendingQuestion.subject;
    const pendingTopic = activePendingQuestion.topic;
    activePendingQuestion = null; // reset pending question

    if (isCorrect) {
      const statusText = result.status === 'GREEN' ? ' You are now confident (GREEN level) in this topic!' : '';
      return {
        text: `Spot on${childName ? ' ' + childName : ''}! ${q.explanation}${statusText} Great job!`,
        intent: 'app-help'
      };
    } else {
      const hintText = q.hint ? ` Hint: ${q.hint}` : '';
      return {
        text: `Not quite, but nice try! ${q.simplerExplanation}${hintText} Let's keep practicing ${pendingTopic}!`,
        intent: 'app-help'
      };
    }
  }

  // 4. Match topic / subject lesson query
  // Subjects: Maths, English, Science, Geography, RE, Technology, Computing, General Knowledge
  let matchedLesson: TopicLesson | null = null;

  for (const lesson of CURRICULUM_LESSONS) {
    const topicPattern = new RegExp(`\\b${lesson.topic}\\b`, 'i');
    const subjectPattern = new RegExp(`\\b${lesson.subject}\\b`, 'i');
    if (topicPattern.test(lower) || (subjectPattern.test(lower) && /\b(?:teach|quiz|practice|explain|learn)\b/i.test(lower))) {
      matchedLesson = lesson;
      break;
    }
  }

  if (matchedLesson) {
    const isQuizMode = /\b(?:quiz|practice|test)\b/i.test(lower);
    const greeting = childName ? `Hi ${childName}! ` : '';

    if (isQuizMode && matchedLesson.questions.length > 0) {
      const q = matchedLesson.questions[0];
      setActivePendingQuestion(matchedLesson.subject, matchedLesson.topic, q);
      const optsText = q.options ? ` Options: ${q.options.join(', ')}` : '';
      return {
        text: `${greeting}Let's practice ${matchedLesson.title}! ${q.question}${optsText}`,
        intent: 'app-help'
      };
    } else {
      // Teach mode
      const firstQ = matchedLesson.questions[0];
      if (firstQ) {
        setActivePendingQuestion(matchedLesson.subject, matchedLesson.topic, firstQ);
      }
      const exampleText = matchedLesson.examples.length > 0 ? ` Example: ${matchedLesson.examples[0]}.` : '';
      const qText = firstQ ? ` Ready for a question? ${firstQ.question}` : '';

      return {
        text: `${greeting}Let's learn about ${matchedLesson.title}! ${matchedLesson.explanation}${exampleText}${qText}`,
        intent: 'app-help'
      };
    }
  }

  return null;
}

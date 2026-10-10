/**
 * Offline-First Tutoring Engine
 * Matches curriculum topics, evaluates practice answers, adapts difficulty, and tracks mastery (RED/AMBER/GREEN).
 */

import { LocalArchieResult } from '../archie-local';
import { CURRICULUM_LESSONS, TopicLesson, LessonQuestion } from './curriculum';
import { loadTutorMemory, recordQuestionAnswer, getRecentLessonSummary } from './memory';


function getActiveAgeGroup(): TopicLesson['ageGroup'] {
  if (typeof window === 'undefined') return '8-10';
  try {
    const app = JSON.parse(localStorage.getItem('sodafom_archie_design_v1') || '{}');
    const year = Number(app.settings?.year);
    if (year >= 1 && year <= 3) return '5-7';
    if (year >= 4 && year <= 6) return '8-10';
    if (year >= 7 && year <= 9) return '11-13';
  } catch { /* fall back to the saved tutor profile */ }
  const group = loadTutorMemory().ageGroup;
  return group === '5-7' || group === '11-13' ? group : '8-10';
}

let activePendingQuestion: {
  subject: string;
  topic: string;
  question: LessonQuestion;
  ageGroup: TopicLesson['ageGroup'];
} | null = null;

export function setActivePendingQuestion(subject: string, topic: string, question: LessonQuestion, ageGroup = getActiveAgeGroup()) {
  activePendingQuestion = { subject, topic, question, ageGroup };
}

export function getActivePendingQuestion() {
  return activePendingQuestion;
}

export function clearActivePendingQuestion() {
  activePendingQuestion = null;
}

function normalizedAnswer(value: string): string {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('en-GB')
    .replace(/[‘’']/g, '')
    .replace(/[^a-z0-9£%+./-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[.!]+$/g, '')
    .trim();
}

const answerPrefixes = [
  'i think the answer is ', 'i think it is ', 'i think its ',
  'i believe the answer is ', 'i believe it is ', 'i believe its ',
  'the answer is ', 'my answer is ', 'my choice is ', 'the word is ',
  'it is ', 'its ', 'is it ', 'i choose ', 'i pick ',
];
const negatedAnswer = /\b(?:no|not|never|dont|doesnt|didnt|isnt|arent|wasnt|werent|cant|cannot|wont|wouldnt|shouldnt|couldnt|except|wrong|incorrect)\b/;

export function matchesTutorAnswer(input: string, question: LessonQuestion): boolean {
  let reply = normalizedAnswer(input);
  if (!reply || negatedAnswer.test(reply)) return false;
  const prefix = answerPrefixes.find(value => reply.startsWith(value));
  if (prefix) reply = reply.slice(prefix.length);
  reply = reply.replace(/ please$/, '');
  const accepted = [question.answer, ...(question.alternateAnswers ?? [])].map(normalizedAnswer);
  return accepted.includes(reply);
}

export function tryLocalTutor(input: string): LocalArchieResult | null {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();
  const memory = loadTutorMemory();
  const childName = memory.childName ? memory.childName : '';
  const activeAgeGroup = getActiveAgeGroup();

  // A question prepared for a different learner band must never be graded
  // after a grown-up changes the saved school year.
  if (activePendingQuestion && activePendingQuestion.ageGroup !== activeAgeGroup) {
    activePendingQuestion = null;
  }

  const isNewLessonRequest = /\b(?:teach|quiz|practice|practise|explain|learn|test)\b/i.test(lower);
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
    const isCorrect = matchesTutorAnswer(trimmed, q);

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
  const ageOrder: TopicLesson['ageGroup'][] = ['5-7', '8-10', '11-13'];
  // Prefer the child's current band, but keep earlier foundations available for
  // review. For example, an older child asking for grammar can still learn nouns
  // and verbs. Never promote a younger child to a lesson from an older band.
  const eligibleLessons = CURRICULUM_LESSONS.filter(lesson =>
    ageOrder.indexOf(lesson.ageGroup) <= ageOrder.indexOf(activeAgeGroup)
  ).sort((a, b) => ageOrder.indexOf(b.ageGroup) - ageOrder.indexOf(a.ageGroup));
  const matchesTopic = (lesson: TopicLesson) => {
    const topicPattern = new RegExp(`\\b${lesson.topic}\\b`, 'i');
    return topicPattern.test(lower);
  };
  // A named topic is more specific than a subject: "teach English phonics"
  // should not stop at the first English lesson in the catalogue.
  const matchedLesson = eligibleLessons.find(matchesTopic) ??
    (isNewLessonRequest ? eligibleLessons.find(lesson =>
      new RegExp(`\\b${lesson.subject}\\b`, 'i').test(lower)
    ) : undefined);

  if (matchedLesson) {
    const isQuizMode = /\b(?:quiz|practice|practise|test)\b/i.test(lower);
    const greeting = childName ? `Hi ${childName}! ` : '';

    if (isQuizMode && matchedLesson.questions.length > 0) {
      const q = matchedLesson.questions[0];
      setActivePendingQuestion(matchedLesson.subject, matchedLesson.topic, q, activeAgeGroup);
      const optsText = q.options ? ` Options: ${q.options.join(', ')}` : '';
      return {
        text: `${greeting}Let's practice ${matchedLesson.title}! ${q.question}${optsText}`,
        intent: 'app-help'
      };
    } else {
      // Teach mode
      const firstQ = matchedLesson.questions[0];
      if (firstQ) {
        setActivePendingQuestion(matchedLesson.subject, matchedLesson.topic, firstQ, activeAgeGroup);
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

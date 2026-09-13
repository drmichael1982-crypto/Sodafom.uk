/**
 * Offline-First Child Learning Memory
 * Manages local progress, mastery status (RED/AMBER/GREEN), adaptive difficulty, and lesson history.
 * No secret keys or cloud DB required; stored strictly on device in localStorage.
 */

export type MasteryStatus = 'RED' | 'AMBER' | 'GREEN';

export interface TopicProgress {
  topic: string;
  subject: string;
  status: MasteryStatus;
  difficultyLevel: 1 | 2 | 3;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  totalAttempted: number;
  totalCorrect: number;
  lastPractisedAt: string;
}

export interface ChildTutorProfile {
  childName?: string;
  ageGroup?: '5-7' | '8-10' | '11-13';
  schoolYear?: string;
  preferredTutor?: 'archie' | 'soda' | 'bella' | 'rocky';
  readAloudPreference?: boolean;
  parentPin?: string;
  topics: Record<string, TopicProgress>;
  recentSubject?: string;
  recentTopic?: string;
  recentLessonTime?: string;
}

export interface TutorLessonResult {
  id: string;
  lessonId: string;
  subject: string;
  topic: string;
  ageGroup: '5-7' | '8-10' | '11-13';
  lessonDay: number;
  durationMinutes: 15 | 20 | 30 | 60;
  attemptedQuestions: number;
  correctAnswers: number;
  completionReason: 'time' | 'all-questions';
  completedAt: string;
}

const MEMORY_KEY = 'sodafom_tutor_memory';
const LESSON_RESULTS_KEY = 'sodafom_tutor_lesson_results';

export function loadTutorMemory(): ChildTutorProfile {
  if (typeof window === 'undefined') {
    return { topics: {} };
  }
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        childName: parsed.childName ?? localStorage.getItem('sodafom_child_name') ?? undefined,
        ageGroup: parsed.ageGroup ?? '8-10',
        schoolYear: parsed.schoolYear ?? 'Year 4',
        preferredTutor: parsed.preferredTutor ?? 'archie',
        readAloudPreference: parsed.readAloudPreference ?? true,
        parentPin: parsed.parentPin,
        topics: parsed.topics ?? {},
        recentSubject: parsed.recentSubject,
        recentTopic: parsed.recentTopic,
        recentLessonTime: parsed.recentLessonTime
      };
    }
  } catch { /* ignore */ }

  const storedName = localStorage.getItem('sodafom_child_name');
  return {
    childName: storedName ? storedName : undefined,
    ageGroup: '8-10',
    schoolYear: 'Year 4',
    preferredTutor: 'archie',
    readAloudPreference: true,
    topics: {}
  };
}

export function saveTutorMemory(profile: ChildTutorProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(profile));
    if (profile.childName) {
      localStorage.setItem('sodafom_child_name', profile.childName);
    }
  } catch { /* ignore */ }
}

export function recordQuestionAnswer(
  subject: string,
  topic: string,
  isCorrect: boolean
): { status: MasteryStatus; difficultyLevel: 1 | 2 | 3 } {
  const profile = loadTutorMemory();
  const key = `${subject.toLowerCase()}:${topic.toLowerCase()}`;

  const existing: TopicProgress = profile.topics[key] ?? {
    topic,
    subject,
    status: 'AMBER',
    difficultyLevel: 1,
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    totalAttempted: 0,
    totalCorrect: 0,
    lastPractisedAt: new Date().toISOString()
  };

  existing.totalAttempted += 1;
  existing.lastPractisedAt = new Date().toISOString();

  if (isCorrect) {
    existing.totalCorrect += 1;
    existing.consecutiveCorrect += 1;
    existing.consecutiveIncorrect = 0;

    // Upgrade difficulty and status on repeated success
    if (existing.consecutiveCorrect >= 2) {
      existing.status = 'GREEN';
      if (existing.difficultyLevel < 3) {
        existing.difficultyLevel = (existing.difficultyLevel + 1) as 1 | 2 | 3;
      }
    } else if (existing.status === 'RED') {
      existing.status = 'AMBER';
    }
  } else {
    existing.consecutiveIncorrect += 1;
    existing.consecutiveCorrect = 0;

    // Adapt difficulty down on repeated mistakes
    if (existing.consecutiveIncorrect >= 2) {
      existing.status = 'RED';
      if (existing.difficultyLevel > 1) {
        existing.difficultyLevel = (existing.difficultyLevel - 1) as 1 | 2 | 3;
      }
    }
  }

  profile.topics[key] = existing;
  profile.recentSubject = subject;
  profile.recentTopic = topic;
  profile.recentLessonTime = new Date().toISOString();

  saveTutorMemory(profile);

  return {
    status: existing.status,
    difficultyLevel: existing.difficultyLevel
  };
}

export function getRecentLessonSummary(): string | null {
  const profile = loadTutorMemory();
  if (!profile.recentTopic || !profile.recentSubject) return null;

  const name = profile.childName ? `, ${profile.childName}` : '';
  return `Recently${name}, you were practising ${profile.recentTopic} in ${profile.recentSubject}. Shall we continue?`;
}

export function getWeakAndStrongTopics(): { weak: string[]; strong: string[] } {
  const profile = loadTutorMemory();
  const weak: string[] = [];
  const strong: string[] = [];

  for (const item of Object.values(profile.topics)) {
    if (item.status === 'RED') weak.push(item.topic);
    if (item.status === 'GREEN') strong.push(item.topic);
  }

  return { weak, strong };
}

/** Keep a small, device-only completion history for the lesson results screen. */
export function recordTutorLessonResult(
  result: Omit<TutorLessonResult, 'id' | 'completedAt'>,
): TutorLessonResult {
  const saved: TutorLessonResult = {
    ...result,
    id: `lesson-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    completedAt: new Date().toISOString(),
  };

  if (typeof window === 'undefined') return saved;

  try {
    const raw = localStorage.getItem(LESSON_RESULTS_KEY);
    const prior: TutorLessonResult[] = raw ? JSON.parse(raw) : [];
    const history = Array.isArray(prior) ? prior : [];
    localStorage.setItem(LESSON_RESULTS_KEY, JSON.stringify([saved, ...history].slice(0, 50)));
  } catch {
    // The lesson result is still available in the current screen state.
  }

  return saved;
}

export function loadTutorLessonResults(): TutorLessonResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LESSON_RESULTS_KEY);
    const results = raw ? JSON.parse(raw) : [];
    return Array.isArray(results) ? results : [];
  } catch {
    return [];
  }
}

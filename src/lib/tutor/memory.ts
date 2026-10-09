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
  /** True once a grown-up has finished or skipped setup; a name is optional. */
  profileSetupComplete?: boolean;
}

const MEMORY_KEY = 'sodafom_tutor_memory';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function safeCount(value: unknown, maximum = Number.MAX_SAFE_INTEGER): number {
  return Number.isSafeInteger(value) && (value as number) >= 0
    ? Math.min(value as number, maximum)
    : 0;
}

function loadTopics(value: unknown): Record<string, TopicProgress> {
  if (!isRecord(value)) return {};
  const topics: Record<string, TopicProgress> = {};

  for (const [key, stored] of Object.entries(value)) {
    if (!isRecord(stored)) continue;
    const totalAttempted = safeCount(stored.totalAttempted);
    topics[key] = {
      topic: typeof stored.topic === 'string' && stored.topic.trim() ? stored.topic : key.split(':').slice(1).join(':') || key,
      subject: typeof stored.subject === 'string' && stored.subject.trim() ? stored.subject : key.split(':')[0] || 'Learning',
      status: stored.status === 'RED' || stored.status === 'GREEN' ? stored.status : 'AMBER',
      difficultyLevel: stored.difficultyLevel === 2 || stored.difficultyLevel === 3 ? stored.difficultyLevel : 1,
      consecutiveCorrect: safeCount(stored.consecutiveCorrect, totalAttempted),
      consecutiveIncorrect: safeCount(stored.consecutiveIncorrect, totalAttempted),
      totalAttempted,
      totalCorrect: safeCount(stored.totalCorrect, totalAttempted),
      lastPractisedAt: typeof stored.lastPractisedAt === 'string' ? stored.lastPractisedAt : '',
    };
  }
  return topics;
}

export function loadTutorMemory(): ChildTutorProfile {
  if (typeof window === 'undefined') {
    return { topics: {} };
  }
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!isRecord(parsed)) throw new Error('Invalid tutor memory');
      const setupComplete = parsed.profileSetupComplete === true;
      const storedName = typeof parsed.childName === 'string' && parsed.childName.trim() ? parsed.childName : undefined;
      const legacyName = localStorage.getItem('sodafom_child_name') ?? undefined;
      return {
        childName: storedName || (setupComplete ? undefined : legacyName),
        ageGroup: parsed.ageGroup === '5-7' || parsed.ageGroup === '11-13' ? parsed.ageGroup : '8-10',
        schoolYear: typeof parsed.schoolYear === 'string' ? parsed.schoolYear : 'Year 4',
        preferredTutor: parsed.preferredTutor === 'soda' || parsed.preferredTutor === 'bella' || parsed.preferredTutor === 'rocky'
          ? parsed.preferredTutor
          : 'archie',
        readAloudPreference: typeof parsed.readAloudPreference === 'boolean' ? parsed.readAloudPreference : true,
        parentPin: typeof parsed.parentPin === 'string' ? parsed.parentPin : undefined,
        topics: loadTopics(parsed.topics),
        recentSubject: typeof parsed.recentSubject === 'string' ? parsed.recentSubject : undefined,
        recentTopic: typeof parsed.recentTopic === 'string' ? parsed.recentTopic : undefined,
        recentLessonTime: typeof parsed.recentLessonTime === 'string' ? parsed.recentLessonTime : undefined,
        profileSetupComplete: setupComplete || undefined,
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

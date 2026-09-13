export type LessonDuration = 15 | 20 | 30 | 60;
export type ClassroomEnvironment = 'classroom' | 'football-field' | 'sports-hall' | 'athletics-track' | 'outdoor-field';
export type LessonStageKind = 'intro' | 'teach' | 'example' | 'guided' | 'activity' | 'practice' | 'assessment' | 'reflection';

export interface TeacherAssignment {
  id: string;
  name: string;
  image: string;
  role: string;
  verified: boolean;
}

export interface LessonStage {
  kind: LessonStageKind;
  label: string;
  minutes: number;
}

export interface PeFocus {
  key: string;
  label: string;
  environment: ClassroomEnvironment;
  equipment: string;
  demonstration: string;
  practice: string;
  challenge: string;
  safety: string;
}

const APPROVED_TEACHERS: Record<string, TeacherAssignment> = {
  archie: { id: 'archie', name: 'Archie', image: '/assets/images/archie-character-v2.png', role: 'Learning guide', verified: true },
  bella: { id: 'bella', name: 'Bella', image: '/assets/cartoon/friends/bella.png', role: 'Words, spelling and vocabulary', verified: true },
  thinkwell: { id: 'professor-thinkwell', name: 'Professor Thinkwell', image: '/assets/cartoon/friends/professor-thinkwell.png', role: 'Science, facts and clever thinking', verified: true },
  rocky: { id: 'rocky', name: 'Rocky', image: '/assets/cartoon/friends/rocky.png', role: 'Geography tutor', verified: true },
  penny: { id: 'penny', name: 'Penny', image: '/assets/cartoon/friends/penny.png', role: 'Patient reading practice', verified: true },
};

/**
 * The base branch explicitly documents Bella for words/language work,
 * Professor Thinkwell for science, Rocky for geography and Penny for reading.
 * It does not define dedicated Maths, History, French, German or PE teachers.
 * Archie remains the existing non-invented learning-guide fallback for those
 * subjects until a shared character-assignment change is merged by its owner.
 */
export const SUBJECT_TEACHERS: Record<string, TeacherAssignment> = {
  English: APPROVED_TEACHERS.bella,
  Spelling: APPROVED_TEACHERS.bella,
  Reading: APPROVED_TEACHERS.penny,
  Science: APPROVED_TEACHERS.thinkwell,
  Geography: APPROVED_TEACHERS.rocky,
  Maths: APPROVED_TEACHERS.archie,
  History: APPROVED_TEACHERS.archie,
  French: APPROVED_TEACHERS.archie,
  German: APPROVED_TEACHERS.archie,
  PE: APPROVED_TEACHERS.archie,
};

export function getTeacherForSubject(subject: string): TeacherAssignment {
  return SUBJECT_TEACHERS[subject] ?? APPROVED_TEACHERS.archie;
}

const PE_FOCUSES: PeFocus[] = [
  {
    key: 'football', label: 'Football', environment: 'football-field', equipment: 'A soft football and a clear space if available.',
    demonstration: 'Show ready position, gentle inside-foot passing and stopping the ball under control.',
    practice: 'Use short controlled touches or pass to a safe target. Work slowly before adding speed.',
    challenge: 'Complete a short dribble-and-pass sequence using control rather than power.',
    safety: 'Check the ground is clear, keep the ball low and stop if the space is crowded.'
  },
  {
    key: 'athletics', label: 'Athletics', environment: 'athletics-track', equipment: 'A clear route and two safe markers.',
    demonstration: 'Show tall running posture, relaxed arms and a balanced start and finish.',
    practice: 'Walk the route first, then use an age-appropriate steady run between markers.',
    challenge: 'Repeat the route with smooth pacing and notice one technique improvement.',
    safety: 'Use a clear route, keep sensible spacing and never sprint towards furniture, roads or people.'
  },
  {
    key: 'basketball', label: 'Basketball', environment: 'sports-hall', equipment: 'A soft or lightweight ball and a clear indoor space if available.',
    demonstration: 'Show balanced stance, two-hand chest pass and a controlled catch with soft hands.',
    practice: 'Pass to a safe wall target or partner at a comfortable distance.',
    challenge: 'Link three controlled passes or catches while maintaining balance.',
    safety: 'Use a soft ball indoors, move furniture out of the way and avoid hard throws.'
  },
  {
    key: 'gymnastics', label: 'Gymnastics', environment: 'sports-hall', equipment: 'A flat, non-slip floor with clear space. No raised equipment is required.',
    demonstration: 'Show stable balances, controlled travel and safe low-level shapes.',
    practice: 'Link two balances with a slow controlled travel movement.',
    challenge: 'Create a short floor sequence with a start shape, travel and finish balance.',
    safety: 'Stay on the floor, avoid flips, headstands and unsupported inversions, and stop if the surface is slippery.'
  },
  {
    key: 'fitness', label: 'Fitness', environment: 'sports-hall', equipment: 'Water and a clear space.',
    demonstration: 'Show gentle marching, controlled sit-to-stand or wall push movements with steady breathing.',
    practice: 'Work for a short interval at a pace where talking still feels comfortable.',
    challenge: 'Complete a small circuit with rest between each movement.',
    safety: 'Choose comfortable effort, rest whenever needed and stop for pain, dizziness or unusual breathlessness.'
  },
  {
    key: 'coordination', label: 'Coordination', environment: 'sports-hall', equipment: 'Two safe floor markers and an optional soft ball.',
    demonstration: 'Show controlled side steps, direction changes and hand-eye tracking.',
    practice: 'Move between markers slowly and accurately before increasing pace.',
    challenge: 'Combine a direction change with a gentle throw-and-catch or touch target.',
    safety: 'Keep movements controlled, leave space around obstacles and use a soft object.'
  },
  {
    key: 'throw-catch', label: 'Throwing and Catching', environment: 'outdoor-field', equipment: 'A soft ball or rolled-up pair of socks and a clear target area.',
    demonstration: 'Show eyes on the object, gentle underarm throw and soft hands when catching.',
    practice: 'Throw to a safe target from a short distance, then practise controlled catches.',
    challenge: 'Complete a small accuracy sequence, increasing distance only when control is secure.',
    safety: 'Throw away from faces, windows, roads and breakable objects; use a soft object.'
  },
];

export function getPeFocus(day: number): PeFocus {
  const safeDay = Number.isFinite(day) ? Math.max(1, Math.trunc(day)) : 1;
  return PE_FOCUSES[(safeDay - 1) % PE_FOCUSES.length];
}

export function getEnvironment(subject: string, day: number): ClassroomEnvironment {
  return subject === 'PE' ? getPeFocus(day).environment : 'classroom';
}

const ACADEMIC_WEIGHTS: Array<[LessonStageKind, string, number]> = [
  ['intro', 'Introduction & learning goal', 2],
  ['teach', 'Teacher explanation', 5],
  ['example', 'Worked examples', 3],
  ['activity', 'Interactive fun activity', 4],
  ['guided', 'Guided practice', 5],
  ['practice', 'Further practice', 4],
  ['assessment', 'End test / quiz', 5],
  ['reflection', 'Feedback & reflection', 2],
];

const PE_WEIGHTS: Array<[LessonStageKind, string, number]> = [
  ['intro', 'Introduction & safety check', 3],
  ['teach', 'Warm-up', 6],
  ['example', 'Teacher demonstration', 5],
  ['activity', 'Try the movement', 8],
  ['guided', 'Guided practice', 8],
  ['practice', 'Practice & rest', 8],
  ['assessment', 'Cool-down', 7],
  ['reflection', 'Feedback & reflection', 5],
];

export function buildLessonStagePlan(duration: LessonDuration, isPe: boolean): LessonStage[] {
  const source = isPe ? PE_WEIGHTS : ACADEMIC_WEIGHTS;
  const totalWeight = source.reduce((sum, [, , weight]) => sum + weight, 0);
  const raw = source.map(([kind, label, weight]) => ({ kind, label, exact: duration * weight / totalWeight }));
  const minutes = raw.map((item) => Math.max(1, Math.floor(item.exact)));
  let assigned = minutes.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((item, index) => ({ index, remainder: item.exact - Math.floor(item.exact) }))
    .sort((a, b) => b.remainder - a.remainder);
  let cursor = 0;
  while (assigned < duration) {
    minutes[order[cursor % order.length].index] += 1;
    assigned += 1;
    cursor += 1;
  }
  while (assigned > duration) {
    const candidate = order.slice().reverse().find(({ index }) => minutes[index] > 1);
    if (!candidate) break;
    minutes[candidate.index] -= 1;
    assigned -= 1;
  }
  return source.map(([kind, label], index) => ({ kind, label, minutes: minutes[index] }));
}

export function scalePhaseMinutes<T extends { minutes: number }>(phases: T[], duration: LessonDuration): Array<T & { minutes: number }> {
  if (!phases.length) return [];
  const sourceTotal = phases.reduce((sum, phase) => sum + Math.max(0, Number(phase.minutes) || 0), 0);
  if (sourceTotal <= 0) {
    const equal = Math.max(1, Math.floor(duration / phases.length));
    return phases.map((phase, index) => ({ ...phase, minutes: index === phases.length - 1 ? duration - equal * (phases.length - 1) : equal }));
  }
  const exact = phases.map((phase) => duration * Math.max(0, Number(phase.minutes) || 0) / sourceTotal);
  const scaled = exact.map((value) => Math.max(1, Math.floor(value)));
  let total = scaled.reduce((sum, value) => sum + value, 0);
  let index = 0;
  while (total < duration) {
    const target = index % scaled.length;
    scaled[target] += 1;
    total += 1;
    index += 1;
  }
  while (total > duration) {
    const target = scaled.findIndex((value) => value > 1);
    if (target < 0) break;
    scaled[target] -= 1;
    total -= 1;
  }
  return phases.map((phase, phaseIndex) => ({ ...phase, minutes: scaled[phaseIndex] }));
}

export function isHelpRequest(phrase: string): boolean {
  return /\b(help|hint|explain|simpler|don't understand|do not understand|stuck|what does|how do i|how do you)\b/i.test(phrase.trim());
}

export function isContinueRequest(phrase: string): boolean {
  return /\b(continue|carry on|resume|ready|i'm ready|i am ready|go on)\b/i.test(phrase.trim());
}

export function normaliseAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/[.,!?]/g, '').replace(/\s+/g, ' ');
}

export function answerMatches(given: string, expected: string, alternates: string[] = []): boolean {
  const normalised = normaliseAnswer(given);
  if (!normalised) return false;
  return [expected, ...alternates].some((answer) => normaliseAnswer(answer) === normalised);
}

export function lessonProgressPercent(totalSeconds: number, secondsRemaining: number): number {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return 0;
  const elapsed = totalSeconds - Math.max(0, secondsRemaining);
  return Math.min(100, Math.max(0, elapsed / totalSeconds * 100));
}

export function pickCloudLessonIndex(day: number, count: number): number {
  if (!Number.isFinite(count) || count <= 0) return -1;
  const safeDay = Number.isFinite(day) ? Math.max(1, Math.trunc(day)) : 1;
  return (safeDay - 1) % Math.trunc(count);
}

export function classroomMoment(day: number): string | null {
  const safeDay = Number.isFinite(day) ? Math.max(1, Math.trunc(day)) : 1;
  if (safeDay % 11 === 0) return 'Leo’s pencil starts to roll away, and he catches it just in time.';
  if (safeDay % 7 === 0) return 'Maya quietly gives the class a proud thumbs-up.';
  return null;
}

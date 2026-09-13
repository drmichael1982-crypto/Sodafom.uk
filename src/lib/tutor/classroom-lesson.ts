import type { TopicLesson } from './curriculum';

export const LESSON_DURATIONS = [15, 20, 30, 60] as const;
export type LessonDuration = typeof LESSON_DURATIONS[number];
export type ClassroomStageKind = 'intro' | 'teach' | 'example' | 'activity' | 'guided' | 'practice' | 'assessment' | 'reflection';

export interface ClassroomStage {
  kind: ClassroomStageKind;
  label: string;
  minutes: number;
}

export type PeEnvironment = 'football-field' | 'athletics-track' | 'sports-hall' | 'safe-practice-space';

export interface PeActivity {
  key: string;
  label: string;
  environment: PeEnvironment;
  equipment: string;
  demonstration: string;
  practice: string;
  challenge: string;
  safety: string;
}

const ACADEMIC_STAGE_WEIGHTS: ReadonlyArray<readonly [ClassroomStageKind, string, number]> = [
  ['intro', 'Learning goal', 2],
  ['teach', 'Teacher explanation', 5],
  ['example', 'Worked example', 3],
  ['activity', 'Try it your way', 4],
  ['guided', 'Guided practice', 5],
  ['practice', 'Further practice', 4],
  ['assessment', 'Knowledge check', 5],
  ['reflection', 'Feedback and reflection', 2],
];

const PE_STAGE_WEIGHTS: ReadonlyArray<readonly [ClassroomStageKind, string, number]> = [
  ['intro', 'Safety check', 3],
  ['teach', 'Gentle warm-up', 6],
  ['example', 'Movement demonstration', 5],
  ['activity', 'Try the movement', 8],
  ['guided', 'Guided practice', 8],
  ['practice', 'Practice and rest', 8],
  ['assessment', 'Cool-down', 7],
  ['reflection', 'Reflection', 5],
];

const PE_ACTIVITIES: readonly PeActivity[] = [
  {
    key: 'football',
    label: 'Football control',
    environment: 'football-field',
    equipment: 'A soft ball and a clear space if they are available.',
    demonstration: 'Use gentle inside-foot touches and stop the ball under control.',
    practice: 'Try short controlled touches or pass to a safe target. Start slowly before adding speed.',
    challenge: 'Link a short dribble and pass using control rather than power.',
    safety: 'Check the ground, keep the ball low, and stop if the space is crowded.',
  },
  {
    key: 'athletics',
    label: 'Athletics pacing',
    environment: 'athletics-track',
    equipment: 'A clear route and two safe markers.',
    demonstration: 'Stand tall, use relaxed arms, and start and finish in balance.',
    practice: 'Walk the route first, then use a comfortable steady pace between markers.',
    challenge: 'Repeat the route smoothly and notice one technique improvement.',
    safety: 'Keep sensible spacing and never run towards furniture, roads, or people.',
  },
  {
    key: 'basketball',
    label: 'Basketball passing',
    environment: 'sports-hall',
    equipment: 'A soft or lightweight ball and a clear indoor space if available.',
    demonstration: 'Use a balanced stance, a gentle two-hand pass, and soft hands for catching.',
    practice: 'Pass to a safe wall target or partner at a comfortable distance.',
    challenge: 'Link three controlled passes or catches while staying balanced.',
    safety: 'Use a soft ball indoors, clear obstacles, and avoid hard throws.',
  },
  {
    key: 'gymnastics',
    label: 'Floor balance',
    environment: 'sports-hall',
    equipment: 'A flat, non-slip floor with clear space. No raised equipment is needed.',
    demonstration: 'Show stable low-level balances and controlled travel on the floor.',
    practice: 'Link two balances with a slow, controlled travel movement.',
    challenge: 'Create a short floor sequence with a start shape, travel, and finish balance.',
    safety: 'Stay on the floor. Do not try flips, headstands, or unsupported inversions.',
  },
  {
    key: 'coordination',
    label: 'Coordination',
    environment: 'safe-practice-space',
    equipment: 'Two safe floor markers and an optional soft object.',
    demonstration: 'Show controlled side steps, direction changes, and careful hand-eye tracking.',
    practice: 'Move between markers slowly and accurately before increasing pace.',
    challenge: 'Add a gentle throw-and-catch or touch target only when control feels secure.',
    safety: 'Leave space around obstacles and choose a soft object.',
  },
  {
    key: 'throw-catch',
    label: 'Throwing and catching',
    environment: 'safe-practice-space',
    equipment: 'A soft ball or rolled-up socks and a clear target area.',
    demonstration: 'Keep eyes on the object, use a gentle underarm throw, and catch with soft hands.',
    practice: 'Throw to a safe target from a short distance, then practise controlled catches.',
    challenge: 'Try a small accuracy sequence, increasing distance only when control is secure.',
    safety: 'Throw away from faces, windows, roads, and breakable objects.',
  },
];

function safeDay(day: number): number {
  return Number.isFinite(day) ? Math.max(1, Math.trunc(day)) : 1;
}

export function isLessonDuration(value: number): value is LessonDuration {
  return (LESSON_DURATIONS as readonly number[]).includes(value);
}

export function buildClassroomStages(duration: LessonDuration, isPe: boolean): ClassroomStage[] {
  const source = isPe ? PE_STAGE_WEIGHTS : ACADEMIC_STAGE_WEIGHTS;
  const totalWeight = source.reduce((sum, [, , weight]) => sum + weight, 0);
  const exact = source.map(([, , weight]) => duration * weight / totalWeight);
  const minutes = exact.map(value => Math.max(1, Math.floor(value)));
  let assigned = minutes.reduce((sum, value) => sum + value, 0);
  const remainders = exact
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index);

  for (let cursor = 0; assigned < duration; cursor += 1) {
    minutes[remainders[cursor % remainders.length].index] += 1;
    assigned += 1;
  }
  for (let cursor = remainders.length - 1; assigned > duration && cursor >= 0; cursor -= 1) {
    const index = remainders[cursor].index;
    if (minutes[index] > 1) {
      minutes[index] -= 1;
      assigned -= 1;
      cursor = remainders.length;
    }
  }
  return source.map(([kind, label], index) => ({ kind, label, minutes: minutes[index] }));
}

export function getPeActivity(day: number): PeActivity {
  return PE_ACTIVITIES[(safeDay(day) - 1) % PE_ACTIVITIES.length];
}

export function createPeLesson(ageGroup: TopicLesson['ageGroup'], day: number): TopicLesson {
  const activity = getPeActivity(day);
  return {
    id: `pe-${activity.key}-${ageGroup}`,
    subject: 'PE',
    topic: activity.key,
    ageGroup,
    title: `${activity.label} lesson`,
    explanation: `Today we will practise ${activity.label.toLowerCase()} with control and care. ${activity.safety}`,
    simplerExplanation: 'Start slowly, use a safe space, and rest whenever you need to.',
    examples: [activity.demonstration, activity.practice],
    questions: [],
  };
}

export function selectClassroomLesson(
  lessons: readonly TopicLesson[],
  subject: string,
  ageGroup: TopicLesson['ageGroup'],
  day: number,
): TopicLesson | null {
  const sameSubject = lessons.filter(lesson => lesson.subject === subject);
  const ageMatches = sameSubject.filter(lesson => lesson.ageGroup === ageGroup);
  const candidates = ageMatches.length ? ageMatches : sameSubject;
  if (!candidates.length) return null;
  return candidates[(safeDay(day) - 1) % candidates.length];
}

export function classroomInstruction(
  stage: ClassroomStageKind,
  lesson: TopicLesson,
  peActivity?: PeActivity,
): string {
  if (peActivity) {
    if (stage === 'intro') return `Safety first: ${peActivity.equipment} ${peActivity.safety}`;
    if (stage === 'teach') return 'Warm up gently. Keep breathing comfortably and rest whenever you need to.';
    if (stage === 'example') return `Demonstration: ${peActivity.demonstration}`;
    if (stage === 'activity') return `Try it safely: ${peActivity.challenge}`;
    if (stage === 'guided') return `Guided practice: ${peActivity.practice}`;
    if (stage === 'practice') return `Practise at a comfortable pace. ${peActivity.safety}`;
    if (stage === 'assessment') return 'Cool down with slower movement and calm breathing. This is not a performance test.';
    return 'Think about one movement that felt comfortable and one thing you would like to practise next time.';
  }
  if (stage === 'intro') return `Learning goal: ${lesson.title}. ${lesson.explanation}`;
  if (stage === 'teach') return lesson.explanation;
  if (stage === 'example') return `Worked example: ${lesson.examples[0] ?? lesson.simplerExplanation}`;
  if (stage === 'activity') return 'Try it your way. Explain a fact, an example, or a question in your own words.';
  if (stage === 'guided') return 'Try a question with help available. You can tap, type, or use voice input if you choose.';
  if (stage === 'practice') return lesson.simplerExplanation;
  if (stage === 'assessment') return 'Try the knowledge check independently where you can. Asking for help pauses the lesson timer.';
  return 'Think about one thing you learned and one thing you would like to practise next time.';
}

export function normaliseClassroomAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/[.,!?]/g, '').replace(/\s+/g, ' ');
}

export function classroomAnswerMatches(given: string, expected: string, alternates: readonly string[] = []): boolean {
  const answer = normaliseClassroomAnswer(given);
  return Boolean(answer) && [expected, ...alternates].some(value => normaliseClassroomAnswer(value) === answer);
}

export function formatLessonTime(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, '0')}:${String(safeSeconds % 60).padStart(2, '0')}`;
}

export function teacherConnectionMessage(hasTeacherSession: boolean): string {
  return hasTeacherSession
    ? 'A Teacher Hub session is available. This lesson does not send answers, recordings, or marks.'
    : 'This lesson stays on this device. A parent or teacher can use the existing Teacher Hub separately.';
}

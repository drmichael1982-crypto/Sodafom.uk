export type CourseSubject = 'maths' | 'history' | 'english' | 'science';
export type CourseQuestion = {
  prompt: string;
  options: string[];
  answer: number;
  hint: string;
  explanation: string;
};
export type CourseLesson = {
  sensitive?: boolean;
  id: string;
  subject: CourseSubject;
  year: number;
  week: number;
  session: number;
  title: string;
  unit: string;
  objective: string;
  teaching: string[];
  vocabulary: { word: string; meaning: string }[];
  example: { prompt: string; explanation: string };
  questions: CourseQuestion[];
  mission: { title: string; instructions: string[] };
  reflection: string;
  source: string;
};
export const COURSE_PHASES = [
  { name: 'Discover', minutes: 5 },
  { name: 'Try together', minutes: 5 },
  { name: 'Play and practise', minutes: 10 },
  { name: 'Your mission', minutes: 7 },
  { name: 'Remember', minutes: 3 },
] as const;

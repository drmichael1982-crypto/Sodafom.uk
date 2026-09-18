export type LearningGameSubject = "maths" | "english";

export interface LearningGameAgeRange {
  min: number;
  max: number;
}

export interface LearningGameAccessibility {
  /** The game never requires a child to answer before a timer expires. */
  untimed: true;
  /** All essential instructions and feedback are available as text. */
  textEquivalent: true;
  /** Motion is decorative and can be removed without changing the activity. */
  supportsReducedMotion: true;
  /** A host-provided read-aloud control can speak every prompt and answer. */
  supportsReadAloud: true;
}

export interface LearningGameAnswer {
  id: string;
  label: string;
}

export interface LearningGameQuestion {
  id: string;
  prompt: string;
  answers: readonly LearningGameAnswer[];
  correctAnswerId: string;
  explanation: string;
  skill: string;
}

export interface LearningGameDefinition {
  id: string;
  title: string;
  summary: string;
  subject: LearningGameSubject;
  ageRange: LearningGameAgeRange;
  estimatedMinutes: number;
  skills: readonly string[];
  accessibility: LearningGameAccessibility;
  questions: readonly LearningGameQuestion[];
}

export interface LearningGameResult {
  questionId: string;
  answerId: string;
  correct: boolean;
}

export type LearningGamePhase =
  "ready" | "playing" | "feedback" | "paused" | "completed";

export interface LearningGameSession {
  phase: LearningGamePhase;
  questionIndex: number;
  score: number;
  results: readonly LearningGameResult[];
  selectedAnswerId: string | null;
  previousPhase: Exclude<LearningGamePhase, "paused"> | null;
}

export type LearningGameAction =
  | { type: "start" }
  | { type: "answer"; questionId: string; answerId: string; correct: boolean }
  | { type: "next"; questionCount: number }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "restart" };

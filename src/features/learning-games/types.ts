export type LearningGameSubject = "maths" | "english";
export type LearningAgeBand = "5-7" | "8-9" | "10-12";

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
  skillCode: string;
}

export interface LearningGameDefinition {
  id: string;
  version: number;
  title: string;
  summary: string;
  subject: LearningGameSubject;
  ageBands: readonly LearningAgeBand[];
  estimatedMinutes: number;
  learningObjectiveCodes: readonly string[];
  skillCodes: readonly string[];
  questionSource: {
    kind: "bundled-reviewed";
    contentVersion: number;
  };
  scoringRule: {
    kind: "count-correct";
    maximumScore: number;
  };
  accessibility: LearningGameAccessibility;
  assetBudget: {
    maximumInitialBytes: number;
    motion: "none" | "optional";
  };
  questions: readonly LearningGameQuestion[];
}

/**
 * Opaque, short-lived receipt issued by the trusted game-attempt service.
 * It contains no child, household, school, admin, or 797 identifiers.
 */
export interface GameAttemptReceipt {
  attemptId: string;
  gameId: string;
  gameVersion: number;
  contentVersion: number;
  expiresAt: string;
  mode: "online" | "offline-issued";
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

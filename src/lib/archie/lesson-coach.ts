/**
 * Offline lesson coaching for Ask Archie.
 * Uses only the supplied lesson content shared through ArchieContext. During
 * independent practice it explains the method and gives hints, but never names
 * the correct choice before the child has found it.
 */
export type LessonPhase =
  | "discover"
  | "example"
  | "practice"
  | "mission"
  | "reflection"
  | "complete";

export interface LessonCoachContext {
  phase: LessonPhase;
  phaseLabel?: string;
  /** Course subject key, e.g. maths, english, history, science. */
  subject: string;
  year?: number;
  objective?: string;
  keyPoint?: string;
  vocabulary?: string[];
  workedExample?: { prompt: string; explanation: string };
  /** Practice only: the hint for the current question. */
  hint?: string;
  /** Practice only: shared after the child answers correctly. */
  explanation?: string;
  /** Practice only: used to stop replies revealing the answer. Never shown before a correct answer. */
  correctOption?: string;
  answeredCorrectly?: boolean;
  wrongAttempts?: number;
  missionSteps?: string[];
  reflection?: string;
  nextLessonTitle?: string | null;
}

const ANSWER_REQUEST =
  /\b(what(?:'s| is) the (?:right |correct )?answer|tell me the answer|give me the answer|show me the answer|just tell me|answer please|which (?:one|answer|option|choice) is (?:it|right|correct)|is it\b|is the answer|the answer is what|reveal)/i;
const HELP_REQUEST =
  /\b(hint|help|stuck|clue|instructions|what do i do|how do i|don'?t (?:get|understand)|confused)\b/i;
const EXPLAIN_REQUEST = /\b(why|explain|how does|how do we know|what does|meaning|mean)\b/i;
const NEXT_REQUEST = /\b(what next|what now|next lesson|what should i do next)\b/i;

export function isAnswerRequest(text: string): boolean {
  return ANSWER_REQUEST.test(text);
}

function clean(text: string) {
  return text
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/** True when a reply states the given option (whole-token match for short or numeric options). */
export function revealsAnswer(reply: string, option: string | undefined): boolean {
  if (!option) return false;
  const target = clean(option).replace(/[.!?]+$/, "");
  if (!target) return false;
  const text = clean(reply);
  if (target.length <= 4 || /^[\d£$.,/-]/.test(target)) {
    const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`).test(text);
  }
  return text.includes(target);
}

/** Subject-appropriate method language: explanation and evidence, not quiz phrasing. */
export function subjectMethod(subject: string): string {
  switch (subject.toLowerCase()) {
    case "maths":
      return "Work it out one step at a time and check each step.";
    case "history":
      return "Think about the evidence: what does it tell us, and how do we know?";
    case "science":
      return "Think like a scientist: what would you observe, and what explains it?";
    case "english":
    case "reading":
      return "Look back at the words carefully and find the clue that explains your choice.";
    default:
      return "Read the question again and think about one small step.";
  }
}

/** A kind, method-only nudge for independent practice. Never contains the correct option. */
export function practiceNudge(
  context: LessonCoachContext,
  askedForAnswer = false,
): string {
  const safe = (part: string | undefined) =>
    part && !revealsAnswer(part, context.correctOption) ? part : "";
  const parts = [
    askedForAnswer
      ? "I will not tell you the answer yet, because working it out yourself is how you learn."
      : "Let's work on it together.",
    subjectMethod(context.subject),
    safe(context.hint ? "Hint: " + context.hint : undefined),
  ];
  if ((context.wrongAttempts ?? 0) >= 2 && context.workedExample) {
    parts.push(
      safe(
        "Look at how the worked example was explained: " +
          context.workedExample.prompt +
          " " +
          context.workedExample.explanation +
          " Use the same method on this question.",
      ),
    );
  }
  parts.push(
    askedForAnswer
      ? "When you are ready, tap or type just the choice you think is best."
      : "Then choose the answer you think is best.",
  );
  return parts.filter(Boolean).join(" ");
}

/**
 * Answers lesson-help requests from the shared lesson context. Returns null
 * when the request is not about the lesson so other helpers can answer.
 */
export function coachLessonReply(
  text: string,
  context: LessonCoachContext | null | undefined,
): string | null {
  if (!context) return null;
  const asksAnswer = isAnswerRequest(text);
  const asksHelp = HELP_REQUEST.test(text);
  const asksExplain = EXPLAIN_REQUEST.test(text);
  if (context.phase === "practice") {
    if (context.answeredCorrectly) {
      if (!asksAnswer && !asksHelp && !asksExplain) return null;
      return [
        "You found it.",
        context.explanation,
        "When you are ready, choose the next step.",
      ]
        .filter(Boolean)
        .join(" ");
    }
    if (asksAnswer || asksHelp || asksExplain)
      return practiceNudge(context, asksAnswer);
    return null;
  }
  if (!asksAnswer && !asksHelp && !asksExplain && !NEXT_REQUEST.test(text))
    return null;
  switch (context.phase) {
    case "discover":
      return [
        context.objective ? "Today's goal: " + context.objective + "." : "",
        context.keyPoint,
        context.vocabulary?.length
          ? "Key words: " + context.vocabulary.join(", ") + "."
          : "",
        "Read or listen, then press Let's try together.",
      ]
        .filter(Boolean)
        .join(" ");
    case "example":
      return context.workedExample
        ? "Here is the worked example: " +
            context.workedExample.prompt +
            " " +
            context.workedExample.explanation +
            " Try explaining each step back in your own words."
        : "Read the worked example and explain each step in your own words.";
    case "mission":
      return context.missionSteps?.length
        ? "Try one step at a time: " +
            context.missionSteps
              .map((step, i) => i + 1 + ". " + step)
              .join(" ") +
            " Tick each step when you have tried it."
        : "Try one step of your mission at a time.";
    case "reflection":
      return (
        (context.reflection ? "Think about this: " + context.reflection + " " : "") +
        "There is no wrong answer. Choose how the lesson felt, then finish."
      );
    case "complete":
      return [
        context.objective
          ? "Well done. Today's goal was: " + context.objective.replace(/\.$/, "") + "."
          : "Well done.",
        context.nextLessonTitle
          ? "Your next lesson is " + context.nextLessonTitle + ". Press Next lesson when you are ready."
          : "You have reached the end of this path. You can review lessons or choose another subject.",
      ].join(" ");
    default:
      return null;
  }
}

/**
 * Replaces any helper reply that would give away the correct choice during
 * independent practice with a method nudge.
 */
export function guardPracticeReply(
  reply: string,
  context: LessonCoachContext | null | undefined,
): string {
  if (
    context?.phase === "practice" &&
    !context.answeredCorrectly &&
    revealsAnswer(reply, context.correctOption)
  )
    return practiceNudge(context, true);
  return reply;
}

/** Text for the online helper. Never includes the correct option. */
export function lessonContextForService(
  context: LessonCoachContext | null | undefined,
): string {
  if (!context) return "";
  const lines = [
    `Lesson phase: ${context.phaseLabel || context.phase}.`,
    context.objective ? `Objective: ${context.objective}.` : "",
    context.workedExample
      ? `Worked example: ${context.workedExample.prompt} ${context.workedExample.explanation}`
      : "",
    context.hint ? `Hint: ${context.hint}` : "",
  ];
  if (context.phase === "practice" && !context.answeredCorrectly)
    lines.push(
      "Independent practice in progress: the child has not answered correctly yet. Explain the method or give a hint only; never state or confirm which choice is correct.",
    );
  return lines.filter(Boolean).join(" ");
}

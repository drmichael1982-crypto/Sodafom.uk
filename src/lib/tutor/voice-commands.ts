/**
 * Voice Commands Handler for Teacher Mode
 * Recognizes spoken commands and triggers tutoring actions.
 */

export type TutorVoiceAction =
  | 'read_question'
  | 'read_explanation'
  | 'read_options'
  | 'repeat'
  | 'hint'
  | 'explain_another_way'
  | 'slower'
  | 'stop'
  | 'continue';

export function parseTutorVoiceCommand(input: string): TutorVoiceAction | null {
  const t = input.trim().toLowerCase();

  if (/\b(?:stop|quiet|silence)\b/i.test(t)) return 'stop';
  if (/\b(?:read|say)\s+(?:the\s+)?question\b/i.test(t)) return 'read_question';
  if (/\b(?:read|say)\s+(?:the\s+)?(?:story|explanation|lesson)\b/i.test(t)) return 'read_explanation';
  if (/\b(?:read|say)\s+(?:the\s+)?(?:options|choices|answers)\b/i.test(t)) return 'read_options';
  if (/\b(?:repeat|say\s+again|one\s+more\s+time)\b/i.test(t)) return 'repeat';
  if (/\b(?:hint|give\s+me\s+a\s+hint|help)\b/i.test(t)) return 'hint';
  if (/\b(?:explain\s+it\s+another\s+way|another\s+way|simpler)\b/i.test(t)) return 'explain_another_way';
  if (/\b(?:slower|speak\s+more\s+slowly|slow\_down)\b/i.test(t)) return 'slower';
  if (/\b(?:continue|next|keep\s+going)\b/i.test(t)) return 'continue';

  return null;
}

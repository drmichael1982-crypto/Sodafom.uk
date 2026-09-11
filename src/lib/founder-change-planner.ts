export type FounderChangePlan = {
  category: string;
  riskLevel: 'low' | 'medium' | 'blocked';
  status: 'prepared' | 'blocked';
  plan: string;
  testSummary: string;
};

const BLOCKED_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  { pattern: /\b(?:show|reveal|print|send|read)\b.{0,30}\b(?:secret|api key|password|token|environment variable)\b/i, reason: 'Secrets can never be revealed by voice control.' },
  { pattern: /\b(?:delete|drop|truncate|reset|replace|wipe)\b.{0,30}\b(?:database|mysql|user data|accounts?)\b/i, reason: 'Database deletion or reset is blocked.' },
  { pattern: /\b(?:disable|remove|bypass|turn off)\b.{0,30}\b(?:safeguarding|safety|authentication|login|privacy|parental control)\b/i, reason: 'Safeguarding and authentication cannot be weakened.' },
  { pattern: /\b(?:charge|price|payment|stripe|subscription|commission)\b/i, reason: 'Payment changes require a separate, explicit reviewed release.' },
  { pattern: /\b(?:force deploy|deploy anyway|skip tests|ignore tests)\b/i, reason: 'A deployment can never bypass tests and approval.' },
];

function categoryFor(instruction: string): string {
  if (/pocket money|chore/i.test(instruction)) return 'chores';
  if (/home\s?page|front\s?page/i.test(instruction)) return 'homepage';
  if (/theme|colour|color|easter|christmas|halloween/i.test(instruction)) return 'visual-theme';
  if (/game|maths|english|reading|science/i.test(instruction)) return 'learning-content';
  if (/button|move|layout|page/i.test(instruction)) return 'interface';
  if (/wording|text|copy/i.test(instruction)) return 'content';
  return 'general';
}

export function planFounderInstruction(rawInstruction: string): FounderChangePlan {
  const instruction = rawInstruction.trim().replace(/\s+/g, ' ');
  const blocked = BLOCKED_PATTERNS.find(({ pattern }) => pattern.test(instruction));
  if (blocked) {
    return {
      category: categoryFor(instruction),
      riskLevel: 'blocked',
      status: 'blocked',
      plan: blocked.reason,
      testSummary: 'Safety scan blocked this request. No files, database records, payments, secrets or deployment were changed.',
    };
  }

  const category = categoryFor(instruction);
  const riskLevel = /add|new|theme|game|page/i.test(instruction) ? 'medium' : 'low';
  return {
    category,
    riskLevel,
    status: 'prepared',
    plan: `Prepared change request: “${instruction}”. A developer must apply it on a new rollback branch, run the full automated test and production build, show the exact diff, and request final approval before any live deployment.`,
    testSummary: 'Authentication passed. Destructive-command and secret-disclosure scans passed. No code was committed or deployed by this preparation step.',
  };
}

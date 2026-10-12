// A conservative local guard for obvious abuse/contact details. This supplements
// provider safeguards; it cannot certify arbitrary generated content as safe.
const RUDE =
  /\b(?:fuck(?:ing)?|shit(?:ting)?|cunt|bitch|bastard|porn(?:ography)?|nigger|faggot)\b/i;
const ABUSE =
  /\b(?:help me (?:bully|hurt)|how (?:can|do) i (?:bully|hurt)|you(?:'re| are) (?:stupid|worthless|an idiot)|keep (?:this|it) secret from (?:your|a) (?:parent|teacher))\b/i;
const CONTACT =
  /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|\b(?:\+?44|0)\s?7(?:[\s()-]*\d){9}\b/i;
export function blockedLearningText(text: string) {
  return RUDE.test(text) || ABUSE.test(text) || CONTACT.test(text);
}
export const FRIENDLY_REDIRECT =
  "Let’s keep our learning kind and private. Ask me a school question, or tell a trusted grown-up if something is worrying you. You do not need to share contact details.";
export function safeLearningReply(text: string) {
  return blockedLearningText(text) ? FRIENDLY_REDIRECT : text;
}

/**
 * Safe client-side wording for when Ask Archie cannot reach its online
 * learning service. It must never claim that a question was answered.
 */
export function getArchieConnectionFallback(error: unknown): string {
  const message = error instanceof Error ? error.message.toLowerCase() : '';

  if (message.includes('paid_ai_billing_pending') || message.includes('voucher-billing-pending')) {
    return "Archie's online helper is having a rest while it is being set up. I can still help with free maths, spelling, reading, science, and Ancient Egypt questions right here.";
  }

  if (message.includes('timed out') || message.includes('connection failed') || message.includes('failed to fetch')) {
    return "I can't reach the learning service just now. You can still ask me a free maths, spelling, reading, science, or Ancient Egypt question, or try again in a moment.";
  }

  return "I'm having trouble reaching the learning service right now. You can still ask me a free maths, spelling, reading, science, or Ancient Egypt question, or try again in a moment.";
}

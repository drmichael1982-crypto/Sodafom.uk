type AnswerRequest = { activity: string; text: string; reply?: string };
const EVENT = "archie-game-answer";
export function normaliseVoiceAnswer(text: string) {
  const cleaned = text
    .toLowerCase()
    .trim()
    .replace(/^(?:my answer is|the answer is|i think it is|it is)\s+/, "")
    .replace(/[.!?]$/, "")
    .trim();
  const numbers = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
    "twenty",
  ];
  const number = numbers.indexOf(cleaned);
  return number >= 0
    ? String(number)
    : cleaned
        .replace(/\bone half\b/g, "1/2")
        .replace(/\bone quarter\b/g, "1/4")
        .replace(/\bthree quarters\b/g, "3/4");
}
export function listenForGameAnswer(
  activity: string,
  handler: (text: string) => string | undefined,
) {
  const listener = (event: Event) => {
    const request = (event as CustomEvent<AnswerRequest>).detail;
    if (request?.activity === activity && !request.reply)
      request.reply = handler(request.text);
  };
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
export function submitGameVoiceAnswer(activity: string, text: string) {
  const request: AnswerRequest = { activity, text };
  window.dispatchEvent(new CustomEvent(EVENT, { detail: request }));
  return request.reply;
}

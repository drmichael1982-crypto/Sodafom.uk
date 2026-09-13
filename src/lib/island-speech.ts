/** Optional voice answers. No automatic restart, recording files, or paid AI requests. */
import { startSpeechInput, supportsSpeechInput, type SpeechHost } from './speech-input';
export type { SpeechHost } from './speech-input';
export type ListeningStatus = 'idle' | 'listening' | 'error';
function normalise(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}
const NUMBER_WORDS: Record<string, string> = {
  zero: '0', one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: '10',
  eleven: '11', twelve: '12', thirteen: '13', fourteen: '14', fifteen: '15', sixteen: '16', seventeen: '17', eighteen: '18', nineteen: '19', twenty: '20',
};
export function choiceFromTranscript(transcript: string, choices: readonly string[]): string | null {
  const text = normalise(transcript).replace(/^(?:the answer is|my answer is|i choose)\s+/, '');
  const direct = choices.find(choice => normalise(choice) === text || normalise(choice) === NUMBER_WORDS[text]);
  if (direct) return direct;
  const option = text.match(/^(?:(?:option|answer|number)\s+)(a|b|c|d|one|two|three|four|1|2|3|4)$/)
    ?? text.match(/^(a|b|c|d)$/);
  if (!option) return null;
  const positions: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, one: 0, two: 1, three: 2, four: 3, '1': 0, '2': 1, '3': 2, '4': 3 };
  return choices[positions[option[1]]] ?? null;
}
export function supportsIslandSpeech(host: SpeechHost): boolean { return supportsSpeechInput(host); }
export function startChoiceListening(
  choices: readonly string[], onChoice: (choice: string) => void,
  onStatus: (status: ListeningStatus, message: string) => void,
  host: SpeechHost, timeoutMs = 12000,
): () => void {
  return startSpeechInput({
    timeoutMs,
    // Keep the existing UI API. Pending permission is visibly cancellable, not "off".
    onState: (state, message) => onStatus(state === 'off' ? 'idle' : state === 'error' ? 'error' : 'listening', message),
    onTranscript: transcript => {
      const choice = choiceFromTranscript(transcript, choices);
      if (choice !== null) onChoice(choice);
      else onStatus('idle', 'I could not match that answer. Try the microphone again or tap an answer.');
    },
  }, host);
}

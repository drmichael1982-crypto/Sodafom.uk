/** Optional browser speech input. Never starts without a button click, records files, or calls OpenAI. */
export type ListeningStatus = 'idle' | 'listening' | 'error';
interface RecognitionResult { isFinal?: boolean; 0: { transcript: string } }
interface RecognitionEvent { resultIndex?: number; results: ArrayLike<RecognitionResult> }
interface Recognition {
  lang: string; continuous: boolean; interimResults: boolean; maxAlternatives: number;
  onstart: (() => void) | null; onend: (() => void) | null;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start(): void; abort(): void;
}
export interface SpeechHost {
  isSecureContext?: boolean;
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
}
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
  // Match values before option numbers: saying "three" must select the value 3, not option C.
  const direct = choices.find(choice => normalise(choice) === text || normalise(choice) === NUMBER_WORDS[text]);
  if (direct) return direct;
  const option = text.match(/^(?:(?:option|answer|number)\s+)(a|b|c|d|one|two|three|four|1|2|3|4)$/)
    ?? text.match(/^(a|b|c|d)$/);
  if (!option) return null;
  const positions: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, one: 0, two: 1, three: 2, four: 3, '1': 0, '2': 1, '3': 2, '4': 3 };
  return choices[positions[option[1]]] ?? null;
}
export function supportsIslandSpeech(host: SpeechHost): boolean {
  return host.isSecureContext !== false && !!(host.SpeechRecognition || host.webkitSpeechRecognition);
}
export function startChoiceListening(
  choices: readonly string[], onChoice: (choice: string) => void,
  onStatus: (status: ListeningStatus, message: string) => void,
  host: SpeechHost, timeoutMs = 12000,
): () => void {
  const RecognitionClass = host.SpeechRecognition || host.webkitSpeechRecognition;
  if (!RecognitionClass || host.isSecureContext === false) {
    onStatus('error', 'Voice answers are unavailable in this browser. You can still tap every answer.');
    return () => {};
  }
  let recognition: Recognition;
  try { recognition = new RecognitionClass(); } catch {
    onStatus('error', 'The microphone could not start. Please tap an answer instead.');
    return () => {};
  }
  let finished = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const finish = (status: ListeningStatus = 'idle', message = '') => {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    recognition.onstart = recognition.onend = recognition.onresult = recognition.onerror = null;
    try { recognition.abort(); } catch { /* Already stopped. */ }
    onStatus(status, message);
  };
  recognition.lang = 'en-GB';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onstart = () => { if (!finished) onStatus('listening', 'Listening… Say the answer, or say option A, B or C.'); };
  recognition.onresult = event => {
    if (finished) return;
    for (let i = event.resultIndex ?? 0; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal === false) continue;
      const choice = choiceFromTranscript(result[0]?.transcript ?? '', choices);
      if (choice !== null) { finish(); onChoice(choice); return; }
    }
    finish('idle', 'I could not match that answer. Try the microphone again or tap an answer.');
  };
  recognition.onerror = event => {
    const message = event.error === 'not-allowed' || event.error === 'service-not-allowed'
      ? 'Microphone access was not allowed. You can enable it in your browser settings or tap an answer.'
      : event.error === 'audio-capture'
        ? 'No working microphone was found. Please tap an answer.'
        : event.error === 'no-speech'
          ? 'I did not hear an answer. Try again or tap an answer.'
          : 'Voice recognition stopped. You can try again or tap an answer.';
    finish('error', message);
  };
  recognition.onend = () => finish('idle', 'The microphone has stopped. Tap it to try again, or choose an answer.');
  timer = setTimeout(() => finish('idle', 'Listening has stopped. Tap the microphone to try again.'), timeoutMs);
  try { recognition.start(); } catch { finish('error', 'The microphone could not start. Please tap an answer.'); }
  return () => finish();
}

/** Scanner-only helpers. Photos and transcripts are never persisted here. */
export type ScannerMode = 'homework' | 'reading';
export const MAX_PHOTO_BYTES = 6 * 1024 * 1024;
export const PHOTO_TYPES = 'image/jpeg,image/png,image/webp';

export function validatePhoto(file: Pick<File, 'size' | 'type'>): string | null {
  if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) return 'Please choose a JPG, PNG or WebP photograph.';
  if (file.size <= 0) return 'That photograph is empty. Please take another one.';
  if (file.size > MAX_PHOTO_BYTES) return 'Please choose a photograph smaller than 6 MB.';
  return null;
}

export function readingWords(text: string) {
  return Array.from(text.matchAll(/\S+/gu), match => ({
    text: match[0], start: match.index!, end: match.index! + match[0].length,
  }));
}

export function wordAtOffset(text: string, offset: number) {
  return readingWords(text).find(word => offset >= word.start && offset < word.end) ?? null;
}

/** Keep utterances short without changing offsets used by boundary events. */
export function speechChunks(text: string, limit = 220) {
  if (!Number.isInteger(limit) || limit < 1) throw new RangeError('Speech chunk size must be positive.');
  const chunks: Array<{ text: string; start: number }> = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + limit, text.length);
    if (end < text.length) {
      const space = text.lastIndexOf(' ', end);
      if (space > start) end = space + 1;
    }
    chunks.push({ text: text.slice(start, end), start });
    start = end;
  }
  return chunks;
}

export function scannerError(status: number): string {
  if (status === 401) return 'Please ask a parent to sign in before using the photo helper.';
  if (status === 402 || status === 403) return 'Please ask a parent to check permission and available AI vouchers for photo help.';
  if (status === 413) return 'This photo is too large. Please choose a smaller photograph.';
  if (status === 429) return 'The photo helper is busy. Please wait a moment before trying again.';
  if (status === 400 || status === 422) return 'Please photograph one smaller, clearer section of the page and try again.';
  return 'The photo helper could not finish this request. Please try again. Your page has not been read.';
}

export interface ScanRequest {
  image: string;
  age: number;
  mode: ScannerMode;
  task: 'transcribe' | 'help';
  question: string;
  previousExplanation?: string;
}

export async function requestScan(endpoint: string, request: ScanRequest, signal: AbortSignal): Promise<string> {
  const response = await fetch(endpoint, {
    method: 'POST', credentials: 'include', signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...request, scannerRequest: true }),
  });
  if (!response.ok) throw new Error(scannerError(response.status));
  const text = (await response.text()).trim();
  if (!text || /text\/html/i.test(response.headers.get('content-type') ?? '') || /^<!doctype|^<html/i.test(text)) {
    throw new Error('No readable text came back. Please try one clear section of the page.');
  }
  return text;
}

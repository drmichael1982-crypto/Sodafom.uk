/** Sticker books only. No rewards, account, AI, payment or network writes. */
export const MAX_PAGES = 20;
export const MAX_STICKERS = 40;
export const MAX_TITLE = 48;
export const MIN_SIZE = 12;
export const MAX_SIZE = 32;
export const MAX_SAVED_BYTES = 300_000;
export type Category = 'friends' | 'animals' | 'objects';
export interface Sticker { id: string; name: string; src: string; category: Category }

// These are existing assets from ArchieCharacter / ArchieFriendsPage at master.
// Never load a URL, HTML, or image path supplied by saved page data.
export const STICKERS: readonly Sticker[] = [
  { id: 'archie', name: 'Archie', src: '/assets/images/archie-character-v2.png', category: 'friends' },
  { id: 'bella', name: 'Bella', src: '/assets/cartoon/friends/bella.png', category: 'friends' },
  { id: 'mia', name: 'Mia', src: '/assets/cartoon/friends/mia.png', category: 'friends' },
  { id: 'toby', name: 'Toby', src: '/assets/cartoon/friends/toby.png', category: 'friends' },
  { id: 'rocky', name: 'Rocky', src: '/assets/cartoon/friends/rocky.png', category: 'friends' },
  { id: 'daisy', name: 'Daisy', src: '/assets/cartoon/friends/daisy.png', category: 'friends' },
  { id: 'sunny', name: 'Sunny', src: '/assets/cartoon/friends/sunny.png', category: 'friends' },
  { id: 'penny', name: 'Penny', src: '/assets/cartoon/friends/penny.png', category: 'friends' },
  { id: 'captain-spark', name: 'Captain Spark', src: '/assets/cartoon/friends/captain-spark.png', category: 'friends' },
  { id: 'thinkwell', name: 'Professor Thinkwell', src: '/assets/cartoon/friends/professor-thinkwell.png', category: 'friends' },
  { id: 'ziggy', name: 'Ziggy the dinosaur', src: '/assets/cartoon/friends/ziggy.png', category: 'animals' },
  { id: 'soda-bot', name: 'Soda Bot', src: '/assets/cartoon/friends/soda-bot.png', category: 'objects' },
];
export const THEMES = [
  { id: 'park', name: 'Friends in the park', young: 'Put two friends together. Who is next to Archie?', older: 'Create a park adventure. Tell a story with a beginning, middle and end.' },
  { id: 'story', name: 'Story time', young: 'Choose a friend to tell a story about.', older: 'Arrange a scene and describe each character using three interesting words.' },
  { id: 'animals', name: 'Dinosaur adventure', young: 'Can Archie and Ziggy play together?', older: 'Make a make-believe dinosaur scene. What happens next?' },
  { id: 'workshop', name: 'Robot workshop', young: 'Help Soda Bot find a friend.', older: 'Invent a job for Soda Bot. Explain the steps your robot would follow.' },
] as const;
export type ThemeId = typeof THEMES[number]['id'];
export interface PlacedSticker { id: string; stickerId: string; x: number; y: number; size: number }
export interface StickerPage { id: string; title: string; theme: ThemeId; stickers: PlacedSticker[] }
export interface StickerBook { version: 1; owner: string; activePageId: string; pages: StickerPage[] }
export type Store = Pick<Storage, 'getItem' | 'setItem'>;
export type LoadResult = { kind: 'ok' | 'empty'; book: StickerBook; raw: string | null }
  | { kind: 'invalid' | 'unavailable'; book: StickerBook; raw: string | null };
export type SaveResult = { ok: true; raw: string } | { ok: false; reason: 'conflict' | 'unavailable' | 'invalid' };

export function storageKey(accountId: string, childId: string | number): string {
  if (!accountId.trim() || !String(childId).trim()) throw new Error('An account and child are required.');
  return `sodafom.sticker-books.v1:${encodeURIComponent(accountId)}:${encodeURIComponent(String(childId))}`;
}
export function newId(): string {
  return typeof globalThis.crypto?.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `sticker-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
export function createPage(theme: ThemeId = 'park', title = 'My sticker story'): StickerPage {
  return { id: newId(), title: title.trim().slice(0, MAX_TITLE) || 'My sticker story', theme, stickers: [] };
}
export function createBook(owner: string): StickerBook {
  const page = createPage();
  return { version: 1, owner, activePageId: page.id, pages: [page] };
}
export function cloneBook(book: StickerBook): StickerBook {
  return { ...book, pages: book.pages.map(page => ({ ...page, stickers: page.stickers.map(sticker => ({ ...sticker })) })) };
}
export function activePage(book: StickerBook): StickerPage {
  return book.pages.find(page => page.id === book.activePageId) ?? book.pages[0];
}
export function getSticker(id: string): Sticker | undefined { return STICKERS.find(sticker => sticker.id === id); }
export function clamp(value: number, min: number, max: number): number { return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min)); }
export function position(x: number, y: number, size: number): Pick<PlacedSticker, 'x' | 'y' | 'size'> {
  const boundedSize = clamp(size, MIN_SIZE, MAX_SIZE);
  return { x: clamp(x, 0, 100 - boundedSize), y: clamp(y, 0, 100 - boundedSize), size: boundedSize };
}
export function addSticker(page: StickerPage, stickerId: string, x = 40, y = 40): string | null {
  if (!getSticker(stickerId) || page.stickers.length >= MAX_STICKERS) return null;
  const id = newId();
  page.stickers.push({ id, stickerId, ...position(x, y, 20) });
  return id;
}
export function moveSticker(page: StickerPage, id: string, x: number, y: number): boolean {
  const sticker = page.stickers.find(item => item.id === id);
  if (!sticker) return false;
  Object.assign(sticker, position(x, y, sticker.size));
  return true;
}
export function resizeSticker(page: StickerPage, id: string, size: number): boolean {
  const sticker = page.stickers.find(item => item.id === id);
  if (!sticker) return false;
  Object.assign(sticker, position(sticker.x, sticker.y, size));
  return true;
}
export function removeSticker(page: StickerPage, id: string): boolean {
  const index = page.stickers.findIndex(item => item.id === id);
  if (index < 0) return false;
  page.stickers.splice(index, 1);
  return true;
}
export function addPage(book: StickerBook, theme: ThemeId): boolean {
  if (book.pages.length >= MAX_PAGES) return false;
  const page = createPage(theme, `My sticker story ${book.pages.length + 1}`);
  book.pages.push(page); book.activePageId = page.id;
  return true;
}
export function deletePage(book: StickerBook): void {
  book.pages = book.pages.filter(page => page.id !== book.activePageId);
  if (!book.pages.length) book.pages = [createPage()];
  book.activePageId = book.pages[0].id;
}
export function promptFor(theme: ThemeId, ageGroup: string): string {
  const option = THEMES.find(item => item.id === theme) ?? THEMES[0];
  // Only use an explicitly parsed age; unknown groups get the simple prompt.
  const age = Number(ageGroup.match(/\d+/)?.[0]);
  return Number.isFinite(age) && age >= 8 ? option.older : option.young;
}
function record(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function validId(value: unknown): value is string { return typeof value === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value); }
function finite(value: unknown): value is number { return typeof value === 'number' && Number.isFinite(value); }

/** Reject malformed/foreign/newer data without destroying the saved original. */
export function parseBook(raw: string, owner: string): StickerBook | null {
  if (raw.length > MAX_SAVED_BYTES) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!record(value) || value.version !== 1 || value.owner !== owner || !Array.isArray(value.pages)
      || !value.pages.length || value.pages.length > MAX_PAGES || !validId(value.activePageId)) return null;
    const pages: StickerPage[] = [];
    const ids = new Set<string>();
    for (const page of value.pages) {
      if (!record(page) || !validId(page.id) || ids.has(page.id) || typeof page.title !== 'string'
        || page.title.length > MAX_TITLE || !page.title.trim() || !THEMES.some(theme => theme.id === page.theme)
        || !Array.isArray(page.stickers) || page.stickers.length > MAX_STICKERS) return null;
      ids.add(page.id);
      const stickers: PlacedSticker[] = [];
      const stickerIds = new Set<string>();
      for (const item of page.stickers) {
        if (!record(item) || !validId(item.id) || stickerIds.has(item.id) || typeof item.stickerId !== 'string'
          || !getSticker(item.stickerId) || !finite(item.x) || !finite(item.y) || !finite(item.size)) return null;
        stickerIds.add(item.id);
        stickers.push({ id: item.id, stickerId: item.stickerId, ...position(item.x, item.y, item.size) });
      }
      pages.push({ id: page.id, title: page.title, theme: page.theme as ThemeId, stickers });
    }
    if (!pages.some(page => page.id === value.activePageId)) return null;
    return { version: 1, owner, activePageId: value.activePageId, pages };
  } catch { return null; }
}
export function loadBook(store: Store | null, owner: string): LoadResult {
  const blank = createBook(owner);
  if (!store) return { kind: 'unavailable', book: blank, raw: null };
  try {
    const raw = store.getItem(owner);
    if (raw === null) return { kind: 'empty', book: blank, raw };
    const book = parseBook(raw, owner);
    return book ? { kind: 'ok', book, raw } : { kind: 'invalid', book: blank, raw };
  } catch { return { kind: 'unavailable', book: blank, raw: null }; }
}
/** Best-effort stale-tab check. localStorage is not an atomic multi-tab database. */
export function saveBook(store: Store | null, owner: string, book: StickerBook, expectedRaw: string | null): SaveResult {
  if (!store) return { ok: false, reason: 'unavailable' };
  try {
    const raw = JSON.stringify(book);
    if (!parseBook(raw, owner)) return { ok: false, reason: 'invalid' };
    if (store.getItem(owner) !== expectedRaw) return { ok: false, reason: 'conflict' };
    store.setItem(owner, raw);
    return { ok: true, raw };
  } catch { return { ok: false, reason: 'unavailable' }; }
}

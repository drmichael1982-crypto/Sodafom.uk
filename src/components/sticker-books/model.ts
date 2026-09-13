import { pageTheme, stickerAsset, type StickerId, type ThemeId } from './catalog.js';

export const STORAGE_KEY = 'sodafom_sticker_books_v1';
export const MAX_PAGES = 12;
export const MAX_STICKERS = 60;
export const PAGE_RATIO = 4 / 3;
export type PlacedSticker = { id: string; assetId: StickerId; x: number; y: number; size: number };
export type StickerPage = { id: string; title: string; themeId: ThemeId; stickers: PlacedSticker[] };
export type StickerBook = { version: 1; activePageId: string; pages: StickerPage[] };
export type BookStorage = Pick<Storage, 'getItem' | 'setItem'>;

export function newId(): string {
  if (typeof globalThis.crypto.randomUUID === 'function') return globalThis.crypto.randomUUID();
  // randomUUID needs a secure context; older/local webviews still support getRandomValues.
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}
export function newPage(number = 1): StickerPage {
  return { id: newId(), title: `My sticker page ${number}`, themeId: 'blank', stickers: [] };
}
export function newBook(): StickerBook {
  const page = newPage();
  return { version: 1, activePageId: page.id, pages: [page] };
}
export function copyBook(book: StickerBook): StickerBook { return JSON.parse(JSON.stringify(book)) as StickerBook; }
export function currentPage(book: StickerBook): StickerPage {
  return book.pages.find(page => page.id === book.activePageId) ?? book.pages[0];
}
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const finite = (n: unknown, fallback: number) => typeof n === 'number' && Number.isFinite(n) ? n : fallback;
export function fitSticker(sticker: PlacedSticker): PlacedSticker {
  const size = clamp(finite(sticker.size, 0.24), 0.18, 0.36);
  return { ...sticker, size,
    x: clamp(finite(sticker.x, 0.5), size / 2, 1 - size / 2),
    y: clamp(finite(sticker.y, 0.5), size * PAGE_RATIO / 2, 1 - size * PAGE_RATIO / 2) };
}
export function addSticker(page: StickerPage, assetId: string, x = 0.5, y = 0.5): PlacedSticker | null {
  const asset = stickerAsset(assetId);
  if (!asset || page.stickers.length >= MAX_STICKERS) return null;
  const sticker = fitSticker({ id: newId(), assetId: asset.id, x, y, size: 0.24 });
  page.stickers.push(sticker);
  return sticker;
}
export function moveSticker(page: StickerPage, id: string, x: number, y: number): void {
  page.stickers = page.stickers.map(sticker => sticker.id === id ? fitSticker({ ...sticker, x, y }) : sticker);
}
export function resizeSticker(page: StickerPage, id: string, delta: number): void {
  page.stickers = page.stickers.map(sticker => sticker.id === id ? fitSticker({ ...sticker, size: sticker.size + delta }) : sticker);
}
export function removeSticker(page: StickerPage, id: string): void {
  page.stickers = page.stickers.filter(sticker => sticker.id !== id);
}
export function bringForward(page: StickerPage, id: string): void {
  const sticker = page.stickers.find(item => item.id === id);
  if (sticker) { removeSticker(page, id); page.stickers.push(sticker); }
}
export function addPage(book: StickerBook): StickerPage | null {
  if (book.pages.length >= MAX_PAGES) return null;
  const page = newPage(book.pages.length + 1);
  book.pages.push(page); book.activePageId = page.id;
  return page;
}
export function deletePage(book: StickerBook, id: string): boolean {
  if (book.pages.length <= 1 || !book.pages.some(page => page.id === id)) return false;
  book.pages = book.pages.filter(page => page.id !== id);
  if (book.activePageId === id) book.activePageId = book.pages[0].id;
  return true;
}

const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const validId = (value: unknown): value is string => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(value);
/** Reject malformed saves instead of silently deleting content. Unknown fields are never restored. */
export function decodeBook(raw: string): StickerBook {
  if (raw.length > 500_000) throw new Error('The saved sticker book is too large.');
  const value: unknown = JSON.parse(raw);
  if (!record(value) || value.version !== 1 || !Array.isArray(value.pages) || !value.pages.length || value.pages.length > MAX_PAGES) {
    throw new Error('The saved sticker book has an unsupported format.');
  }
  const ids = new Set<string>();
  const pages: StickerPage[] = value.pages.map((p: unknown) => {
    if (!record(p) || !validId(p.id) || ids.has(p.id) || typeof p.title !== 'string' || p.title.length > 60
      || typeof p.themeId !== 'string' || !pageTheme(p.themeId) || !Array.isArray(p.stickers) || p.stickers.length > MAX_STICKERS) {
      throw new Error('A saved sticker page is damaged.');
    }
    ids.add(p.id);
    const theme = pageTheme(p.themeId)!;
    const stickers: PlacedSticker[] = p.stickers.map((s: unknown) => {
      if (!record(s) || !validId(s.id) || ids.has(s.id) || typeof s.assetId !== 'string' || !stickerAsset(s.assetId)
        || ![s.x, s.y, s.size].every(n => typeof n === 'number' && Number.isFinite(n))) {
        throw new Error('A saved sticker is damaged.');
      }
      ids.add(s.id);
      return fitSticker({ id: s.id, assetId: stickerAsset(s.assetId)!.id, x: s.x as number, y: s.y as number, size: s.size as number });
    });
    return { id: p.id, title: p.title, themeId: theme.id, stickers };
  });
  return { version: 1, pages, activePageId: typeof value.activePageId === 'string' && pages.some(p => p.id === value.activePageId) ? value.activePageId : pages[0].id };
}
export function readBook(storage: BookStorage): { book: StickerBook; raw: string | null } {
  const raw = storage.getItem(STORAGE_KEY);
  return { book: raw === null ? newBook() : decodeBook(raw), raw };
}
/** Detect sequential cross-tab edits; localStorage is not a transactional cloud store. */
export function saveBook(storage: BookStorage, book: StickerBook, expectedRaw: string | null): string {
  if (storage.getItem(STORAGE_KEY) !== expectedRaw) throw new Error('Another tab saved different pages. Reload saved pages before saving here.');
  const raw = JSON.stringify(decodeBook(JSON.stringify(book)));
  storage.setItem(STORAGE_KEY, raw);
  return raw;
}

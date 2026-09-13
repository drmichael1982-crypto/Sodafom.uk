import { describe, expect, it } from 'vitest';
import {
  activePage,
  addSticker,
  cloneBook,
  createBook,
  loadBook,
  parseBook,
  saveBook,
  storageKey,
  type Store,
} from './model';

function memoryStore(): Store {
  const values = new Map<string, string>();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

describe('child-scoped sticker-book storage', () => {
  it('keeps saved books separate for each authorised child namespace', () => {
    const store = memoryStore();
    const firstOwner = storageKey('account-one', 101);
    const secondOwner = storageKey('account-one', 202);
    const first = createBook(firstOwner);
    const second = createBook(secondOwner);

    activePage(first).title = 'Archie in the park';
    addSticker(activePage(first), 'archie');
    activePage(second).title = 'Ziggy story';
    addSticker(activePage(second), 'ziggy');

    expect(saveBook(store, firstOwner, first, null).ok).toBe(true);
    expect(saveBook(store, secondOwner, second, null).ok).toBe(true);
    expect(loadBook(store, firstOwner).book.pages[0].title).toBe('Archie in the park');
    expect(loadBook(store, secondOwner).book.pages[0].title).toBe('Ziggy story');
  });

  it('rejects foreign owners and unapproved saved sticker identifiers', () => {
    const owner = storageKey('account-one', 101);
    const book = createBook(owner);
    addSticker(activePage(book), 'archie');
    const foreign = cloneBook(book);
    foreign.owner = storageKey('account-two', 101);
    expect(parseBook(JSON.stringify(foreign), owner)).toBeNull();

    const unsafe = cloneBook(book);
    unsafe.pages[0].stickers[0].stickerId = 'https://untrusted.example/sticker.png';
    expect(parseBook(JSON.stringify(unsafe), owner)).toBeNull();
  });

  it('does not silently overwrite a newer save from another tab', () => {
    const store = memoryStore();
    const owner = storageKey('account-one', 101);
    const saved = createBook(owner);
    const initial = saveBook(store, owner, saved, null);
    if (!initial.ok) throw new Error('Initial sticker book did not save.');

    const staleCopy = cloneBook(saved);
    activePage(saved).title = 'Newest saved story';
    const latest = saveBook(store, owner, saved, initial.raw);
    if (!latest.ok) throw new Error('Updated sticker book did not save.');

    expect(saveBook(store, owner, staleCopy, initial.raw)).toEqual({ ok: false, reason: 'conflict' });
    expect(loadBook(store, owner).book.pages[0].title).toBe('Newest saved story');
  });
});

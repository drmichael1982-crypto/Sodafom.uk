import { fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { mountStickerBook } from './editor';
import { loadBook, storageKey, type Store } from './model';

function memoryStore(): Store {
  const values = new Map<string, string>();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

describe('sticker-book editor', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('adds an allowlisted sticker and saves it only in the selected child namespace', () => {
    const store = memoryStore();
    const owner = storageKey('account-one', 101);
    const host = document.createElement('div');
    document.body.append(host);
    const editor = mountStickerBook(host, { owner, ageGroup: '8-10', store });

    const addArchie = host.querySelector<HTMLButtonElement>('button[aria-label="Add Archie sticker"]');
    expect(addArchie).not.toBeNull();
    fireEvent.click(addArchie!);

    expect(host.querySelector('[aria-label="Archie sticker on page"]')).not.toBeNull();
    const saved = loadBook(store, owner).book;
    expect(saved.pages[0].stickers.map(sticker => sticker.stickerId)).toEqual(['archie']);
    expect(store.getItem(storageKey('account-one', 202))).toBeNull();

    editor.destroy();
    expect(host.childElementCount).toBe(0);
  });
});

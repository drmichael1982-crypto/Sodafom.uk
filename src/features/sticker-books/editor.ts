import { STICKERS, THEMES, MAX_PAGES, MAX_STICKERS, MAX_TITLE, MIN_SIZE, MAX_SIZE,
  activePage, addPage, addSticker, cloneBook, createBook, deletePage, getSticker, loadBook,
  moveSticker, position, promptFor, removeSticker, resizeSticker, saveBook,
  type StickerBook, type Sticker, type Store, type ThemeId } from './model.js';

export interface EditorOptions { owner: string; ageGroup?: string; store: Store | null }
export interface EditorHandle { destroy(): void; canLeave(): boolean; hasUnsavedChanges(): boolean }
function el<K extends keyof HTMLElementTagNameMap>(tag: K, text?: string, className?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function button(text: string, action: () => void): HTMLButtonElement {
  const node = el('button', text); node.type = 'button'; node.addEventListener('click', action); return node;
}
function picture(sticker: Sticker): HTMLImageElement {
  const img = el('img'); img.src = sticker.src; img.alt = ''; img.draggable = false; img.decoding = 'async';
  img.addEventListener('error', () => {
    img.hidden = true;
    const note = el('span', `${sticker.name} picture unavailable`, 'sb-image-error');
    img.after(note);
  }, { once: true });
  return img;
}

/** Imperative island: React owns only the host; this owns and cleans up its DOM. */
export function mountStickerBook(host: HTMLElement, options: EditorOptions): EditorHandle {
  const loaded = loadBook(options.store, options.owner);
  let book: StickerBook = loaded.book;
  let lastRaw = loaded.raw;
  let blocked = loaded.kind === 'invalid';
  let dirty = false;
  let selected: string | null = null;
  let destroyed = false;
  const undo: StickerBook[] = [];
  const events = new AbortController();
  const signal = events.signal;
  const root = el('section', undefined, 'sb-editor');
  root.setAttribute('aria-label', 'Interactive sticker book');
  const status = el('p', '', 'sb-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
  const announcement = el('p', '', 'sb-sr-only'); announcement.setAttribute('aria-live', 'polite');
  const tools = el('div', undefined, 'sb-toolbar');
  const pageSelect = el('select'); pageSelect.setAttribute('aria-label', 'Choose saved sticker page');
  const title = el('input'); title.type = 'text'; title.maxLength = MAX_TITLE; title.setAttribute('aria-label', 'Sticker page name');
  const themeSelect = el('select'); themeSelect.setAttribute('aria-label', 'Page theme');
  for (const theme of THEMES) { const option = el('option', theme.name); option.value = theme.id; themeSelect.append(option); }
  const prompt = el('p', '', 'sb-prompt');
  const board = el('div', undefined, 'sb-board');
  board.setAttribute('role', 'group'); board.setAttribute('aria-label', 'Sticker page canvas');
  const boardHint = el('p', 'Choose a sticker below, or drag it onto your page.', 'sb-board-hint');
  const layout = el('div', undefined, 'sb-layout');
  const canvasColumn = el('div', undefined, 'sb-canvas-column');
  const palette = el('aside', undefined, 'sb-palette'); palette.setAttribute('aria-label', 'Choose stickers');
  const paletteGrid = el('div', undefined, 'sb-palette-grid');
  const category = el('select'); category.setAttribute('aria-label', 'Sticker category');
  for (const [value, label] of [['all', 'All stickers'], ['friends', 'Archie and friends'], ['animals', 'Animals'], ['objects', 'Objects and robots']]) {
    const option = el('option', label); option.value = value; category.append(option);
  }
  const selectedText = el('p', 'Select a sticker on your page to move or remove it.', 'sb-selection');
  const stickerTools = el('div', undefined, 'sb-toolbar');
  const count = el('p', '', 'sb-count');
  const help = el('p', 'Tap a sticker to add it. Drag it to move it. You can also use the move buttons or arrow keys. Press Delete to remove the focused sticker.', 'sb-help');
  const privacy = el('p', 'Saved only in this browser for this account and child. Pages are not uploaded or shared. Clearing browser data removes them. This is creative play and does not spend or award stars.', 'sb-privacy');

  function message(text: string, warning = false): void { status.textContent = text; status.dataset.warning = String(warning); }
  function persist(): void {
    if (blocked) { message('Saved pages could not be read. They have been kept safe; new changes are not saved. Use Start again only to replace them.', true); return; }
    const result = saveBook(options.store, options.owner, book, lastRaw);
    if (result.ok) { lastRaw = result.raw; dirty = false; message('Saved on this device.'); }
    else message(result.reason === 'conflict'
      ? 'Another tab changed these pages. Your changes are not saved. Reload saved pages before continuing.'
      : 'Not saved: browser storage is unavailable or full. Keep this page open and try Save again.', true);
  }
  function change(edit: (draft: StickerBook) => void | boolean, say?: string, focusId?: string): void {
    const draft = cloneBook(book);
    if (edit(draft) === false) return;
    undo.push(cloneBook(book)); if (undo.length > 25) undo.shift();
    book = draft; dirty = true; render(); persist();
    if (say) announcement.textContent = say;
    if (focusId) focusSticker(focusId);
  }
  function focusSticker(id: string): void {
    for (const node of board.querySelectorAll<HTMLButtonElement>('[data-placed]')) {
      if (node.dataset.placed === id) node.focus({ preventScroll: true });
    }
  }
  const save = button('Save page', persist);
  const newPage = button('New page', () => {
    if (book.pages.length >= MAX_PAGES) { message(`Your book can hold ${MAX_PAGES} pages. Remove a page to make space.`, true); return; }
    selected = null;
    change(draft => addPage(draft, activePage(draft).theme), 'New sticker page ready.');
  });
  const undoButton = button('Undo', () => {
    const previous = undo.pop(); if (!previous) return;
    book = previous; selected = null; dirty = true; render(); persist(); announcement.textContent = 'Last change undone.';
  });
  const deleteButton = button('Delete page', () => {
    if (!window.confirm('Delete this sticker page? You can use Undo straight away.')) return;
    selected = null; change(deletePage, 'Page deleted.');
  });
  const reload = button('Reload saved pages', () => {
    if (dirty && !window.confirm('Reload the last saved pages and discard changes that were not saved?')) return;
    const result = loadBook(options.store, options.owner);
    if (result.kind === 'unavailable') { message('Cannot reload: browser storage is unavailable. Your current page is still here.', true); return; }
    if (result.kind === 'invalid') { blocked = true; reset.hidden = false; message('Saved pages could not be read. Your current page is still here. Start again will replace the saved data.', true); return; }
    book = result.book; lastRaw = result.raw; blocked = false; dirty = false; selected = null; undo.length = 0; render();
    message('Saved pages reloaded.');
  });
  const reset = button('Start again', () => {
    if (!window.confirm('Replace the unreadable saved sticker book for this child? This cannot restore its old pages.')) return;
    // Read the current bytes, not stale bytes from before the confirmation.
    try { lastRaw = options.store?.getItem(options.owner) ?? null; } catch { message('Storage is unavailable. Nothing was replaced.', true); return; }
    book = createBook(options.owner); blocked = false; dirty = true; selected = null; undo.length = 0; render(); persist();
  });
  reset.hidden = !blocked;
  const actions: HTMLButtonElement[] = [];
  function selectedAction(text: string, edit: (draft: StickerBook, id: string) => void): void {
    const node = button(text, () => { if (selected) change(draft => edit(draft, selected!), text); });
    actions.push(node); stickerTools.append(node);
  }
  for (const [text, dx, dy] of [['Move left', -3, 0], ['Move right', 3, 0], ['Move up', 0, -3], ['Move down', 0, 3]] as const) {
    selectedAction(text, (draft, id) => {
      const page = activePage(draft); const item = page.stickers.find(sticker => sticker.id === id);
      if (item) moveSticker(page, id, item.x + dx, item.y + dy);
    });
  }
  selectedAction('Smaller', (draft, id) => { const page = activePage(draft); const item = page.stickers.find(sticker => sticker.id === id); if (item) resizeSticker(page, id, item.size - 3); });
  selectedAction('Bigger', (draft, id) => { const page = activePage(draft); const item = page.stickers.find(sticker => sticker.id === id); if (item) resizeSticker(page, id, item.size + 3); });
  selectedAction('Remove sticker', (draft, id) => { removeSticker(activePage(draft), id); selected = null; });
  const clear = button('Clear page', () => {
    if (!activePage(book).stickers.length || !window.confirm('Remove all stickers from this page? You can use Undo straight away.')) return;
    selected = null; change(draft => { activePage(draft).stickers = []; }, 'Page cleared.');
  });
  stickerTools.append(clear);
  for (const [text, node] of [['Saved pages', pageSelect], ['Page name', title], ['Theme', themeSelect]] as const) {
    const label = el('label', text); label.append(node); tools.append(label);
  }
  tools.append(newPage, save, undoButton, deleteButton, reload, reset);
  palette.append(el('h3', 'Your stickers'), category, paletteGrid);
  canvasColumn.append(prompt, board, count, selectedText, stickerTools);
  layout.append(canvasColumn, palette);
  root.append(tools, status, help, layout, privacy, announcement);
  host.replaceChildren(root);

  let drag: { pointerId: number; mode: 'palette' | 'placed'; id: string; startX: number; startY: number; offsetX: number; offsetY: number; moved: boolean; x: number; y: number } | null = null;
  let ghost: HTMLElement | null = null;
  let suppressClickUntil = 0;
  function startDrag(event: PointerEvent, mode: 'palette' | 'placed', id: string, target: HTMLElement): void {
    if (drag || !event.isPrimary || event.button !== 0) return;
    const rect = board.getBoundingClientRect();
    const item = mode === 'placed' ? activePage(book).stickers.find(sticker => sticker.id === id) : undefined;
    drag = { pointerId: event.pointerId, mode, id, startX: event.clientX, startY: event.clientY,
      offsetX: item ? (event.clientX - rect.left) / rect.width * 100 - item.x : 10,
      offsetY: item ? (event.clientY - rect.top) / rect.height * 100 - item.y : 10,
      moved: false, x: item?.x ?? 40, y: item?.y ?? 40 };
    if (mode === 'placed') { selected = id; showSelection(); }
    try { target.setPointerCapture(event.pointerId); } catch { /* Window listeners still finish the drag. */ }
  }
  function onMove(event: PointerEvent): void {
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 6) return;
    drag.moved = true; event.preventDefault();
    const rect = board.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const item = drag.mode === 'placed' ? activePage(book).stickers.find(sticker => sticker.id === drag!.id) : undefined;
    const point = position((event.clientX - rect.left) / rect.width * 100 - drag.offsetX,
      (event.clientY - rect.top) / rect.height * 100 - drag.offsetY, item?.size ?? 20);
    drag.x = point.x; drag.y = point.y;
    if (drag.mode === 'placed') {
      for (const node of board.querySelectorAll<HTMLElement>('[data-placed]')) if (node.dataset.placed === drag.id) {
        node.style.left = `${point.x}%`; node.style.top = `${point.y}%`;
      }
    } else {
      if (!ghost) { ghost = el('div', undefined, 'sb-drag-ghost'); ghost.setAttribute('aria-hidden', 'true'); ghost.append(picture(getSticker(drag.id)!)); root.append(ghost); }
      ghost.style.left = `${event.clientX - 44}px`; ghost.style.top = `${event.clientY - 44}px`;
    }
  }
  function finishDrag(event: PointerEvent, cancelled = false): void {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const finished = drag; drag = null; ghost?.remove(); ghost = null;
    if (finished.moved) suppressClickUntil = performance.now() + 300;
    if (cancelled) { renderBoard(); return; }
    if (!finished.moved) return;
    if (finished.mode === 'placed') {
      change(draft => moveSticker(activePage(draft), finished.id, finished.x, finished.y), 'Sticker moved.');
    } else {
      const rect = board.getBoundingClientRect();
      if (event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom) {
        place(finished.id, finished.x, finished.y);
      }
    }
  }
  function place(id: string, x?: number, y?: number): void {
    if (activePage(book).stickers.length >= MAX_STICKERS) { message(`This page holds ${MAX_STICKERS} stickers. Start a new page or remove a sticker.`, true); return; }
    change(draft => { selected = addSticker(activePage(draft), id, x, y); return selected !== null; }, `${getSticker(id)?.name ?? 'Sticker'} added.`);
  }
  function renderPalette(): void {
    paletteGrid.replaceChildren();
    for (const sticker of STICKERS.filter(item => category.value === 'all' || item.category === category.value)) {
      const node = button('', () => { if (performance.now() >= suppressClickUntil) place(sticker.id); });
      node.className = 'sb-choice'; node.dataset.catalogue = sticker.id; node.setAttribute('aria-label', `Add ${sticker.name} sticker`);
      node.append(picture(sticker), el('span', sticker.name));
      node.addEventListener('pointerdown', event => startDrag(event, 'palette', sticker.id, node));
      paletteGrid.append(node);
    }
  }
  function showSelection(): void {
    const item = activePage(book).stickers.find(sticker => sticker.id === selected);
    if (!item) selected = null;
    selectedText.textContent = item ? `${getSticker(item.stickerId)!.name} selected. Use the controls below.` : 'Select a sticker on your page to move or remove it.';
    for (const node of actions) node.disabled = !item;
    // Boundary sizes also have clear disabled states.
    actions.find(node => node.textContent === 'Smaller')!.disabled = !item || item.size <= MIN_SIZE;
    actions.find(node => node.textContent === 'Bigger')!.disabled = !item || item.size >= MAX_SIZE;
    for (const node of board.querySelectorAll<HTMLButtonElement>('[data-placed]')) node.setAttribute('aria-pressed', String(node.dataset.placed === selected));
  }
  function renderBoard(): void {
    const page = activePage(book); board.dataset.theme = page.theme; board.replaceChildren();
    if (!page.stickers.length) board.append(boardHint);
    for (const item of page.stickers) {
      const sticker = getSticker(item.stickerId)!;
      const node = button('', () => { selected = item.id; showSelection(); });
      node.className = 'sb-placed'; node.dataset.placed = item.id; node.dataset.stickerId = item.stickerId;
      node.setAttribute('aria-label', `${sticker.name} sticker on page`);
      node.style.left = `${item.x}%`; node.style.top = `${item.y}%`; node.style.width = `${item.size}%`; node.style.height = `${item.size}%`;
      node.append(picture(sticker));
      node.addEventListener('pointerdown', event => startDrag(event, 'placed', item.id, node));
      node.addEventListener('focus', () => { selected = item.id; showSelection(); });
      node.addEventListener('keydown', event => {
        const directions: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
        if (event.key === 'Escape') { selected = null; showSelection(); return; }
        if (event.key === 'Delete' || event.key === 'Backspace') {
          event.preventDefault(); selected = null; change(draft => removeSticker(activePage(draft), item.id), 'Sticker removed.');
          paletteGrid.querySelector<HTMLButtonElement>('button')?.focus(); return;
        }
        const delta = directions[event.key]; if (!delta) return;
        event.preventDefault(); const step = event.shiftKey ? 5 : 1;
        change(draft => moveSticker(activePage(draft), item.id, item.x + delta[0] * step, item.y + delta[1] * step), 'Sticker moved.', item.id);
      });
      board.append(node);
    }
    showSelection();
    clear.disabled = !page.stickers.length;
  }
  function render(): void {
    const page = activePage(book);
    pageSelect.replaceChildren();
    for (const saved of book.pages) { const option = el('option', saved.title); option.value = saved.id; pageSelect.append(option); }
    pageSelect.value = page.id; title.value = page.title; themeSelect.value = page.theme;
    prompt.textContent = promptFor(page.theme, options.ageGroup ?? '');
    count.textContent = `${page.stickers.length} of ${MAX_STICKERS} stickers · ${book.pages.length} of ${MAX_PAGES} pages`;
    undoButton.disabled = !undo.length; newPage.disabled = book.pages.length >= MAX_PAGES; reset.hidden = !blocked;
    renderBoard();
  }
  pageSelect.addEventListener('change', () => { const id = pageSelect.value; selected = null; change(draft => { draft.activePageId = id; }); });
  // Save while typing without rebuilding the input or moving its caret. One undo
  // snapshot per focus session prevents every letter consuming the undo history.
  let editingTitle = false;
  title.addEventListener('input', () => {
    const text = title.value.trim().slice(0, MAX_TITLE) || 'My sticker story';
    if (activePage(book).title === text) return;
    if (!editingTitle) { undo.push(cloneBook(book)); if (undo.length > 25) undo.shift(); editingTitle = true; }
    activePage(book).title = text; dirty = true; undoButton.disabled = false;
    const option = pageSelect.selectedOptions[0]; if (option) option.textContent = text;
    persist();
  });
  title.addEventListener('blur', () => { editingTitle = false; title.value = activePage(book).title; });
  themeSelect.addEventListener('change', () => { const theme = themeSelect.value as ThemeId; change(draft => { activePage(draft).theme = theme; }, 'Page theme changed.'); });
  category.addEventListener('change', renderPalette);
  window.addEventListener('pointermove', onMove, { signal, passive: false });
  window.addEventListener('pointerup', event => finishDrag(event), { signal });
  window.addEventListener('pointercancel', event => finishDrag(event, true), { signal });
  root.addEventListener('lostpointercapture', event => finishDrag(event, true), { signal });
  window.addEventListener('blur', () => { if (drag) { drag = null; ghost?.remove(); ghost = null; renderBoard(); } }, { signal });
  window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } }, { signal });
  window.addEventListener('storage', event => {
    if ((event.key === options.owner || event.key === null) && event.newValue !== lastRaw) message('Saved pages changed in another tab. Reload saved pages before making more changes.', true);
  }, { signal });
  render(); renderPalette();
  if (blocked) message('Saved pages could not be read. They have not been overwritten. Use Start again only to replace them.', true);
  else if (loaded.kind === 'unavailable') message('Browser storage is unavailable. You can play, but changes cannot be saved yet.', true);
  else message(loaded.kind === 'ok' ? 'Your saved sticker pages are ready.' : 'Choose a sticker to start. Your changes will save on this device.');
  return {
    hasUnsavedChanges: () => dirty,
    canLeave: () => !dirty || window.confirm('Some sticker changes have not been saved. Leave this sticker book anyway?'),
    destroy: () => {
      if (destroyed) return; destroyed = true; events.abort(); drag = null; ghost?.remove(); host.replaceChildren();
    },
  };
}

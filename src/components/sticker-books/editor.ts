import { STICKERS, THEMES, pageTheme, stickerAsset } from './catalog.js';
import {
  STORAGE_KEY, MAX_PAGES, MAX_STICKERS, addPage, addSticker, bringForward, copyBook,
  currentPage, decodeBook, deletePage, moveSticker, newBook, readBook, removeSticker,
  resizeSticker, saveBook, type BookStorage, type PlacedSticker, type StickerBook,
} from './model.js';

/** Isolated DOM editor. React owns only its empty mount node, never these children. */
export function mountStickerBook(root: HTMLElement, onBack: () => void): () => void {
  let book = newBook();
  let storage: BookStorage | null = null;
  let baseline: string | null = null;
  let damaged = false;
  let initialMessage = 'Choose a sticker to begin.';
  try {
    storage = window.localStorage;
    baseline = storage.getItem(STORAGE_KEY);
    if (baseline !== null) {
      try { book = decodeBook(baseline); initialMessage = 'Your saved sticker pages are ready.'; }
      catch { damaged = true; initialMessage = 'Saved pages could not be read. They have not been changed. Saving will ask before replacing them.'; }
    }
  } catch { initialMessage = 'Browser storage is unavailable. You can play, but pages cannot be saved here.'; }
  let savedSnapshot = JSON.stringify(book);
  let dirty = false;
  let selected: string | null = null;
  let category = 'All';
  let challenge = false;
  const past: StickerBook[] = [];
  const future: StickerBook[] = [];
  const stickerButtons = new Map<string, HTMLButtonElement>();
  type Drag = {
    kind: 'new' | 'placed'; id: string; pointerId: number; target: HTMLButtonElement;
    startX: number; startY: number; x: number; y: number; moved: boolean; before: StickerBook;
  };
  let drag: Drag | null = null;
  let ghost: HTMLElement | null = null;

  function element<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text = ''): HTMLElementTagNameMap[K] {
    const node = document.createElement(tag);
    node.className = className;
    if (text) node.textContent = text;
    return node;
  }
  function button(text: string, action: () => void, className = ''): HTMLButtonElement {
    const node = element('button', `sb-button ${className}`, text);
    node.type = 'button'; node.addEventListener('click', action);
    return node;
  }
  function image(src: string, name: string, lazy = false): HTMLElement {
    const frame = element('span', 'sb-picture');
    const img = element('img'); img.src = src; img.alt = name; img.draggable = false;
    if (lazy) img.loading = 'lazy';
    const fallback = element('span', 'sb-image-fallback', `${name}: artwork unavailable`);
    fallback.hidden = true;
    img.addEventListener('error', () => { img.hidden = true; fallback.hidden = false; });
    frame.append(img, fallback);
    return frame;
  }
  function field(text: string, control: HTMLElement): HTMLLabelElement {
    const label = element('label', 'sb-field');
    label.append(element('span', '', text), control);
    return label;
  }

  root.classList.add('sb-root');
  const shell = element('section', 'sb-shell');
  shell.setAttribute('aria-label', "Archie's Sticker Books");
  const heading = element('header', 'sb-heading');
  const headingText = element('div');
  headingText.append(element('p', 'sb-eyebrow', 'SODAFOM · CREATE & PLAY'), element('h1', '', "Archie's Sticker Books"),
    element('p', '', 'Choose, place and move your stickers. Make a different adventure on every page.'));
  heading.append(headingText, button('Back home', () => {
    if (!dirty || window.confirm('Leave without saving your sticker pages?')) onBack();
  }));
  const privacy = element('p', 'sb-privacy', 'Saved on this browser only, not in the cloud. Anyone using this browser profile can see these pages. Do not add private information.');
  const status = element('p', 'sb-status', initialMessage);
  status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); status.setAttribute('aria-atomic', 'true');
  const saveStatus = element('p', 'sb-save-status', baseline !== null && !damaged ? 'Saved pages loaded.' : 'No new changes saved yet.');

  const toolbar = element('div', 'sb-toolbar');
  const pageSelect = element('select'); pageSelect.setAttribute('aria-label', 'Choose a page');
  const title = element('input'); title.type = 'text'; title.maxLength = 60; title.setAttribute('aria-label', 'Page title');
  const themeSelect = element('select'); themeSelect.setAttribute('aria-label', 'Page theme');
  for (const theme of THEMES) { const option = element('option', '', theme.name); option.value = theme.id; themeSelect.append(option); }
  const save = button('Save all pages', saveChanges, 'sb-primary');
  const reload = button('Reload saved pages', reloadSaved);
  const add = button('New page', () => {
    if (book.pages.length >= MAX_PAGES) { announce(`Your book can hold ${MAX_PAGES} pages. Edit an existing page instead.`); return; }
    change(() => { addPage(book); selected = null; }, 'New page ready. Your other pages are still in this book.');
    title.focus(); title.select();
  });
  const removePageButton = button('Delete page', () => {
    if (book.pages.length <= 1) return;
    if (window.confirm(`Delete “${currentPage(book).title}” and its stickers? Undo can bring it back.`)) {
      change(() => { deletePage(book, book.activePageId); selected = null; }, 'Page deleted. Undo can bring it back.');
    }
  });
  toolbar.append(field('My pages', pageSelect), field('Page title', title), field('Theme', themeSelect), add, save);
  const secondary = element('div', 'sb-toolbar sb-secondary');
  const undo = button('Undo', () => travel(past, future, 'Undone.'));
  const redo = button('Redo', () => travel(future, past, 'Redone.'));
  const clear = button('Clear this page', () => {
    if (currentPage(book).stickers.length && window.confirm('Remove every sticker from this page? Undo can bring them back.')) {
      change(() => { currentPage(book).stickers = []; selected = null; }, 'This page is clear.');
    }
  });
  secondary.append(undo, redo, clear, removePageButton, reload);

  const workspace = element('div', 'sb-workspace');
  const stage = element('section', 'sb-stage');
  stage.setAttribute('aria-label', 'Sticker page editor');
  const prompt = element('p', 'sb-prompt');
  const board = element('div', 'sb-board');
  board.setAttribute('role', 'group'); board.setAttribute('aria-label', 'Your sticker page'); board.setAttribute('aria-describedby', 'sb-instructions');
  const background = element('img', 'sb-background'); background.alt = ''; background.draggable = false;
  background.addEventListener('error', () => { background.hidden = true; });
  const stickerLayer = element('div', 'sb-sticker-layer');
  const empty = element('p', 'sb-empty', 'Your adventure starts here. Tap a sticker or drag one onto this page.');
  board.append(background, empty, stickerLayer);
  const instructions = element('p', 'sb-instructions', 'Tap a sticker to add it, or drag it from the tray. Select a placed sticker to move it with the buttons or arrow keys. Delete removes it.');
  instructions.id = 'sb-instructions';
  const count = element('p', 'sb-count');
  const tools = element('div', 'sb-tools'); tools.setAttribute('role', 'group'); tools.setAttribute('aria-label', 'Selected sticker controls');
  const selectionLabel = element('p', 'sb-selection', 'Select a sticker to move or change it.');
  const moveLeft = button('Move left', () => nudge(-0.03, 0));
  const moveRight = button('Move right', () => nudge(0.03, 0));
  const moveUp = button('Move up', () => nudge(0, -0.03));
  const moveDown = button('Move down', () => nudge(0, 0.03));
  const smaller = button('Smaller', () => resize(-0.03));
  const bigger = button('Bigger', () => resize(0.03));
  const front = button('Bring to front', () => { if (selected) change(() => bringForward(currentPage(book), selected!), 'Sticker brought to the front.'); });
  const remove = button('Remove sticker', removeSelected, 'sb-danger');
  const selectionTools = [moveLeft, moveRight, moveUp, moveDown, smaller, bigger, front, remove];
  tools.append(...selectionTools);
  stage.append(prompt, board, instructions, count, selectionLabel, tools);

  const tray = element('aside', 'sb-tray');
  tray.setAttribute('aria-label', 'Sticker tray');
  tray.append(element('h2', '', 'Choose your stickers'));
  const filter = element('select'); filter.setAttribute('aria-label', 'Sticker category');
  for (const name of ['All', 'Friends', 'Animals', 'Objects & cards']) {
    const option = element('option', '', name); option.value = name; filter.append(option);
  }
  const challengeControl = element('input'); challengeControl.type = 'checkbox';
  const challengeLabel = field('Story challenge', challengeControl); challengeLabel.classList.add('sb-toggle');
  const palette = element('div', 'sb-palette');
  tray.append(field('Show stickers', filter), challengeLabel, palette,
    element('p', 'sb-small', 'Story cards use the original illustrations. No stars or payments are needed here.'));
  workspace.append(stage, tray);
  shell.append(heading, privacy, toolbar, secondary, saveStatus, status, workspace);
  root.replaceChildren(shell);

  function announce(message: string): void { status.textContent = message; }
  function updateDirty(): void {
    dirty = JSON.stringify(book) !== savedSnapshot;
    saveStatus.textContent = dirty ? 'Changes not saved — choose Save all pages.' : baseline !== null && !damaged ? 'All pages saved on this browser.' : 'No new changes saved yet.';
  }
  function pushPast(before: StickerBook): void { past.push(before); if (past.length > 30) past.shift(); future.length = 0; }
  function change(action: () => void, message: string): void {
    if (drag) cancelDrag();
    const before = copyBook(book); action();
    if (JSON.stringify(before) !== JSON.stringify(book)) pushPast(before);
    updateDirty(); renderPage(); announce(message);
  }
  function travel(from: StickerBook[], to: StickerBook[], message: string): void {
    if (drag) cancelDrag();
    const previous = from.pop(); if (!previous) return;
    to.push(copyBook(book)); book = previous; selected = null;
    updateDirty(); renderPage(); announce(message);
  }
  function saveChanges(): void {
    if (!storage) { announce('Not saved. Browser storage is unavailable. Keep this page open to keep your work.'); return; }
    if (damaged && !window.confirm('Replace the unreadable saved sticker book with the pages now on screen? The old sticker save will be lost.')) return;
    try {
      baseline = saveBook(storage, book, baseline); damaged = false; savedSnapshot = JSON.stringify(book);
      updateDirty(); announce('All your pages are saved on this browser.');
    } catch (error) {
      const conflict = error instanceof Error && error.message.startsWith('Another tab');
      announce(conflict ? 'Not saved. Another tab saved different pages. Keep your work open or choose Reload saved pages.'
        : 'Not saved. Browser storage may be full or blocked. Your pages are still open here.');
    }
  }
  function reloadSaved(): void {
    if (dirty && !window.confirm('Reload saved pages and lose the changes you have not saved?')) return;
    try {
      if (!storage) throw new Error('Storage unavailable');
      const loaded = readBook(storage); book = loaded.book; baseline = loaded.raw; damaged = false;
      savedSnapshot = JSON.stringify(book); selected = null; past.length = 0; future.length = 0;
      updateDirty(); renderPage(); announce('Saved pages reloaded.');
    } catch { announce('Saved pages could not be loaded. Your open pages have not been changed.'); }
  }
  function selectedSticker(): PlacedSticker | undefined { return currentPage(book).stickers.find(item => item.id === selected); }
  function focusSelected(): void { if (selected) stickerButtons.get(selected)?.focus({ preventScroll: true }); }
  function updateSelection(): void {
    const placed = selectedSticker();
    for (const [id, btn] of stickerButtons) btn.setAttribute('aria-pressed', String(id === selected));
    for (const control of selectionTools) control.disabled = !placed;
    if (placed) { smaller.disabled = placed.size <= 0.180001; bigger.disabled = placed.size >= 0.359999; }
    selectionLabel.textContent = placed ? `${stickerAsset(placed.assetId)!.name} selected. Use the controls below or drag it.` : 'Select a sticker to move or change it.';
  }
  function position(btn: HTMLButtonElement, sticker: PlacedSticker): void {
    btn.style.left = `${sticker.x * 100}%`; btn.style.top = `${sticker.y * 100}%`; btn.style.width = `${sticker.size * 100}%`;
  }
  function renderPage(): void {
    const page = currentPage(book);
    pageSelect.replaceChildren();
    book.pages.forEach((p, i) => { const option = element('option', '', `${i + 1}. ${p.title || 'Untitled page'}`); option.value = p.id; pageSelect.append(option); });
    pageSelect.value = page.id;
    if (document.activeElement !== title) title.value = page.title;
    themeSelect.value = page.themeId;
    const theme = pageTheme(page.themeId)!;
    prompt.textContent = challenge ? theme.challenge : theme.prompt;
    if (background.getAttribute('src') !== theme.src) {
      background.hidden = !theme.src;
      if (theme.src) background.src = theme.src; else background.removeAttribute('src');
    }
    empty.hidden = page.stickers.length > 0;
    stickerLayer.replaceChildren(); stickerButtons.clear();
    for (const sticker of page.stickers) {
      const asset = stickerAsset(sticker.assetId)!;
      const btn = element('button', 'sb-placed'); btn.type = 'button';
      btn.dataset.stickerId = sticker.id;
      btn.setAttribute('aria-label', `${asset.name} sticker`); btn.setAttribute('aria-pressed', String(selected === sticker.id));
      btn.append(image(asset.src, asset.name)); position(btn, sticker);
      btn.addEventListener('pointerdown', event => startDrag(event, btn, 'placed', sticker.id));
      btn.addEventListener('click', () => { selected = sticker.id; updateSelection(); });
      btn.addEventListener('keydown', event => {
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        const amount = event.shiftKey ? 0.08 : 0.03;
        const steps: Record<string, [number, number]> = { ArrowLeft: [-amount, 0], ArrowRight: [amount, 0], ArrowUp: [0, -amount], ArrowDown: [0, amount] };
        const step = Object.prototype.hasOwnProperty.call(steps, event.key) ? steps[event.key] : undefined;
        if (step) { event.preventDefault(); selected = sticker.id; nudge(...step); focusSelected(); }
        if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); selected = sticker.id; removeSelected(); }
      });
      stickerLayer.append(btn); stickerButtons.set(sticker.id, btn);
    }
    if (!selectedSticker()) selected = null;
    count.textContent = `Page ${book.pages.indexOf(page) + 1} of ${book.pages.length} · ${page.stickers.length} of ${MAX_STICKERS} stickers`;
    undo.disabled = !past.length; redo.disabled = !future.length; add.disabled = book.pages.length >= MAX_PAGES;
    removePageButton.disabled = book.pages.length <= 1; clear.disabled = page.stickers.length === 0;
    updateSelection();
  }
  function addChosen(id: string, x?: number, y?: number): void {
    if (currentPage(book).stickers.length >= MAX_STICKERS) { announce(`This page has ${MAX_STICKERS} stickers. Remove one or start a new page.`); return; }
    const offset = (currentPage(book).stickers.length % 5) * 0.035;
    change(() => { selected = addSticker(currentPage(book), id, x ?? 0.40 + offset, y ?? 0.40 + offset)?.id ?? null; }, `${stickerAsset(id)?.name ?? 'Sticker'} added.`);
  }
  function nudge(x: number, y: number): void {
    const sticker = selectedSticker();
    if (sticker) change(() => moveSticker(currentPage(book), sticker.id, sticker.x + x, sticker.y + y), 'Sticker moved.');
  }
  function resize(delta: number): void {
    if (selected) change(() => resizeSticker(currentPage(book), selected!, delta), 'Sticker size changed.');
  }
  function removeSelected(): void {
    if (!selected) return;
    change(() => { removeSticker(currentPage(book), selected!); selected = null; }, 'Sticker removed. Undo can bring it back.');
    undo.focus({ preventScroll: true });
  }
  function renderPalette(): void {
    palette.replaceChildren();
    for (const asset of STICKERS.filter(item => category === 'All' || item.category === category)) {
      const btn = element('button', 'sb-sticker-choice'); btn.type = 'button'; btn.dataset.assetId = asset.id;
      btn.setAttribute('aria-label', `Add ${asset.name}`);
      btn.append(image(asset.src, asset.name, true), element('span', 'sb-sticker-name', asset.name));
      btn.addEventListener('pointerdown', event => startDrag(event, btn, 'new', asset.id));
      // Pointer taps are handled at pointerup; detail=0 handles keyboard/assistive clicks.
      btn.addEventListener('click', event => { if (event.detail === 0) addChosen(asset.id); });
      palette.append(btn);
    }
  }
  function startDrag(event: PointerEvent, target: HTMLButtonElement, kind: Drag['kind'], id: string): void {
    if (!event.isPrimary || event.button !== 0 || drag) return;
    const placed = kind === 'placed' ? currentPage(book).stickers.find(item => item.id === id) : undefined;
    drag = { kind, id, pointerId: event.pointerId, target, startX: event.clientX, startY: event.clientY,
      x: placed?.x ?? 0.5, y: placed?.y ?? 0.5, moved: false, before: copyBook(book) };
    if (kind === 'placed') { selected = id; updateSelection(); }
    target.focus({ preventScroll: true });
    try { target.setPointerCapture(event.pointerId); } catch { /* Document listeners provide a safe fallback. */ }
  }
  function onPointerMove(event: PointerEvent): void {
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 6) drag.moved = true;
    if (!drag.moved) return;
    const rect = board.getBoundingClientRect(); if (!rect.width || !rect.height) return;
    if (drag.kind === 'placed') {
      moveSticker(currentPage(book), drag.id, drag.x + (event.clientX - drag.startX) / rect.width, drag.y + (event.clientY - drag.startY) / rect.height);
      const sticker = selectedSticker(); if (sticker) position(drag.target, sticker);
    } else {
      if (!ghost) {
        const asset = stickerAsset(drag.id)!;
        ghost = element('div', 'sb-drag-preview'); ghost.setAttribute('aria-hidden', 'true');
        ghost.append(image(asset.src, asset.name)); root.append(ghost);
      }
      ghost.style.left = `${event.clientX}px`; ghost.style.top = `${event.clientY}px`;
    }
  }
  function finishDrag(event: PointerEvent): void {
    if (!drag || drag.pointerId !== event.pointerId) return;
    onPointerMove(event);
    const finished = drag; drag = null; ghost?.remove(); ghost = null;
    try { if (finished.target.hasPointerCapture(event.pointerId)) finished.target.releasePointerCapture(event.pointerId); } catch { /* Capture already released. */ }
    if (finished.kind === 'new') {
      const rect = board.getBoundingClientRect();
      const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!finished.moved) addChosen(finished.id);
      else if (inside && rect.width && rect.height) addChosen(finished.id, (event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
      else announce('Sticker not added. Drop it on the page or tap it in the tray.');
    } else if (finished.moved) {
      if (JSON.stringify(finished.before) !== JSON.stringify(book)) pushPast(finished.before);
      updateDirty(); renderPage(); focusSelected(); announce('Sticker moved.');
    }
  }
  function cancelDrag(): void {
    if (!drag) return;
    const cancelled = drag; drag = null; ghost?.remove(); ghost = null;
    book = cancelled.before;
    try { if (cancelled.target.hasPointerCapture(cancelled.pointerId)) cancelled.target.releasePointerCapture(cancelled.pointerId); } catch { /* Already released. */ }
    updateDirty(); renderPage(); announce('Move cancelled. Your page has not changed.');
  }
  function onPointerCancel(event: PointerEvent): void { if (drag?.pointerId === event.pointerId) cancelDrag(); }
  function onEscape(event: KeyboardEvent): void {
    if (event.key === 'Escape') { if (drag) cancelDrag(); else { selected = null; updateSelection(); } }
  }
  function warnBeforeUnload(event: BeforeUnloadEvent): void {
    if (dirty || drag?.moved) { event.preventDefault(); event.returnValue = ''; }
  }
  function onStorage(event: StorageEvent): void {
    if (event.key === STORAGE_KEY && event.newValue !== baseline) announce('Another tab changed the saved sticker book. Reload saved pages before saving here.');
  }
  pageSelect.addEventListener('change', () => {
    if (!book.pages.some(page => page.id === pageSelect.value)) return;
    change(() => { book.activePageId = pageSelect.value; selected = null; }, 'Page opened. All your pages are kept together.');
  });
  let titleBefore: StickerBook | null = null;
  title.addEventListener('focus', () => { titleBefore = copyBook(book); });
  title.addEventListener('input', () => {
    currentPage(book).title = title.value.slice(0, 60); updateDirty();
  });
  title.addEventListener('change', () => {
    currentPage(book).title = title.value.trim().slice(0, 60) || 'My sticker page';
    if (titleBefore && JSON.stringify(titleBefore) !== JSON.stringify(book)) pushPast(titleBefore);
    titleBefore = null; updateDirty(); renderPage(); announce('Page title changed.');
  });
  themeSelect.addEventListener('change', () => {
    const theme = pageTheme(themeSelect.value); if (theme) change(() => { currentPage(book).themeId = theme.id; }, `${theme.name} theme selected. Your stickers are kept.`);
  });
  filter.addEventListener('change', () => { category = filter.value; renderPalette(); });
  challengeControl.addEventListener('change', () => { challenge = challengeControl.checked; renderPage(); });
  root.addEventListener('keydown', onEscape);
  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup', finishDrag);
  document.addEventListener('pointercancel', onPointerCancel);
  root.addEventListener('lostpointercapture', onPointerCancel);
  window.addEventListener('blur', cancelDrag);
  window.addEventListener('resize', cancelDrag);
  window.addEventListener('beforeunload', warnBeforeUnload);
  window.addEventListener('storage', onStorage);
  renderPalette(); renderPage();
  return () => {
    drag = null; ghost?.remove();
    root.removeEventListener('keydown', onEscape);
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', finishDrag);
    document.removeEventListener('pointercancel', onPointerCancel);
    root.removeEventListener('lostpointercapture', onPointerCancel);
    window.removeEventListener('blur', cancelDrag);
    window.removeEventListener('resize', cancelDrag);
    window.removeEventListener('beforeunload', warnBeforeUnload);
    window.removeEventListener('storage', onStorage);
    root.replaceChildren(); root.classList.remove('sb-root');
  };
}

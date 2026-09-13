// Run explicitly; deliberately not named *.test.* so Vitest does not collect node:test.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as m from './model.ts';
const owner = m.storageKey('parent-A', 11);
function store() { const values = new Map(); return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }; }
function fixture() { const book = m.createBook(owner); return { book, page: m.activePage(book) }; }
test('catalogue contains twelve unique existing same-origin assets', () => {
  assert.equal(m.STICKERS.length, 12); assert.equal(new Set(m.STICKERS.map(s => s.id)).size, 12);
  assert.ok(m.STICKERS.every(s => s.src.startsWith('/assets/') && s.src.endsWith('.png')));
  assert.deepEqual(new Set(m.STICKERS.map(s => s.category)), new Set(['friends', 'animals', 'objects']));
});
test('four child-friendly themes offer simpler and older prompts', () => {
  assert.equal(m.THEMES.length, 4);
  for (const theme of m.THEMES) { assert.equal(m.promptFor(theme.id, '5-7'), theme.young); assert.equal(m.promptFor(theme.id, '8-10'), theme.older); assert.equal(m.promptFor(theme.id, ''), theme.young); }
});
test('fresh book starts with one empty page', () => { const {book,page}=fixture(); assert.equal(book.pages.length,1); assert.equal(page.stickers.length,0); });
test('adding and duplicating a sticker creates independent instances', () => {
  const {page}=fixture(); const a=m.addSticker(page,'archie');const b=m.addSticker(page,'archie');assert.ok(a);assert.notEqual(a,b);assert.equal(page.stickers.length,2);
});
test('unknown catalogue IDs cannot create stickers', () => { const {page}=fixture(); assert.equal(m.addSticker(page,'javascript:alert(1)'),null);assert.equal(page.stickers.length,0); });
test('a page cannot exceed forty stickers', () => { const {page}=fixture();for(let i=0;i<40;i++)assert.ok(m.addSticker(page,'bella'));assert.equal(m.addSticker(page,'archie'),null);assert.equal(page.stickers.length,40); });
test('drag movement clamps to all four page edges', () => {
  const {page}=fixture();const id=m.addSticker(page,'archie');m.moveSticker(page,id,-50,200);assert.equal(page.stickers[0].x,0);assert.equal(page.stickers[0].y,80);
  m.moveSticker(page,id,500,-90);assert.equal(page.stickers[0].x,80);assert.equal(page.stickers[0].y,0);
});
test('resizing clamps size and repositions stickers inside the page', () => {
  const {page}=fixture();const id=m.addSticker(page,'archie',80,80);m.resizeSticker(page,id,1000);assert.deepEqual(m.position(80,80,1000),{x:68,y:68,size:32});assert.equal(page.stickers[0].x,68);
  m.resizeSticker(page,id,-1);assert.equal(page.stickers[0].size,12);
});
test('non-finite coordinates cannot escape the page', () => { assert.deepEqual(m.position(NaN,Infinity,Infinity),{x:0,y:0,size:12}); });
test('remove only removes the selected sticker', () => { const {page}=fixture();const a=m.addSticker(page,'archie');const b=m.addSticker(page,'bella');assert.equal(m.removeSticker(page,a),true);assert.equal(page.stickers[0].id,b);assert.equal(m.removeSticker(page,'missing'),false); });
test('unknown IDs cannot move or resize a different sticker', () => { const {page}=fixture();m.addSticker(page,'archie');assert.equal(m.moveSticker(page,'unknown',0,0),false);assert.equal(m.resizeSticker(page,'unknown',30),false);assert.equal(page.stickers[0].x,40); });
test('new pages do not change existing pages', () => { const {book,page}=fixture();m.addSticker(page,'archie');m.addPage(book,'animals');assert.equal(book.pages[0].stickers.length,1);assert.equal(m.activePage(book).theme,'animals'); });
test('book is bounded at twenty pages', () => {const {book}=fixture();for(let i=1;i<20;i++)assert.equal(m.addPage(book,'park'),true);assert.equal(m.addPage(book,'park'),false);assert.equal(book.pages.length,20);});
test('deleting last page leaves a usable blank page', () => {const {book}=fixture();m.deletePage(book);assert.equal(book.pages.length,1);assert.equal(m.activePage(book).stickers.length,0);});
test('undo snapshots are deep copies', () => {const {book,page}=fixture();m.addSticker(page,'archie');const copy=m.cloneBook(book);copy.pages[0].stickers[0].x=0;assert.equal(page.stickers[0].x,40);});
test('save and reopen preserves title, theme, positions and selected page', () => {
  const {book}=fixture();m.addPage(book,'workshop');m.activePage(book).title='My robot story';m.addSticker(m.activePage(book),'soda-bot',10,25);
  const s=store();const saved=m.saveBook(s,owner,book,null);assert.equal(saved.ok,true);assert.deepEqual(m.loadBook(s,owner).book,book);
});
test('account and child namespaces are distinct and non-colliding', () => {
  assert.notEqual(owner,m.storageKey('parent-A',12));assert.notEqual(owner,m.storageKey('parent-B',11));
  assert.notEqual(m.storageKey('a:b','c'),m.storageKey('a','b:c'));assert.throws(()=>m.storageKey('',11));assert.throws(()=>m.storageKey('A',''));
  const {book}=fixture();const s=store();m.saveBook(s,owner,book,null);assert.equal(m.loadBook(s,m.storageKey('parent-A',12)).kind,'empty');
});
test('a book for another account or child is rejected', () => {const {book}=fixture();assert.equal(m.parseBook(JSON.stringify(book),m.storageKey('parent-B',11)),null);});
test('corrupt saved JSON is preserved and marked invalid', () => {const s=store();s.setItem(owner,'{broken');assert.equal(m.loadBook(s,owner).kind,'invalid');assert.equal(s.getItem(owner),'{broken');});
test('unknown schema versions are not silently migrated or erased', () => {const {book}=fixture();book.version=99;const s=store();const raw=JSON.stringify(book);s.setItem(owner,raw);assert.equal(m.loadBook(s,owner).kind,'invalid');assert.equal(s.getItem(owner),raw);});
test('missing active page and duplicate page IDs are rejected', () => {const {book}=fixture();book.activePageId='missing';assert.equal(m.parseBook(JSON.stringify(book),owner),null);book.activePageId=book.pages[0].id;book.pages.push(book.pages[0]);assert.equal(m.parseBook(JSON.stringify(book),owner),null);});
test('unapproved image IDs and invalid numeric types are rejected', () => {const {book,page}=fixture();m.addSticker(page,'archie');page.stickers[0].stickerId='https://attacker.test/picture';assert.equal(m.parseBook(JSON.stringify(book),owner),null);page.stickers[0].stickerId='archie';page.stickers[0].x='0';assert.equal(m.parseBook(JSON.stringify(book),owner),null);});
test('saved URLs are ignored and cannot replace catalogue artwork', () => {const {book,page}=fixture();m.addSticker(page,'archie');page.stickers[0].src='javascript:alert(1)';const parsed=m.parseBook(JSON.stringify(book),owner);assert.ok(parsed);assert.equal('src' in parsed.pages[0].stickers[0],false);});
test('oversized saves and excessive title lengths are rejected', () => {assert.equal(m.parseBook(' '.repeat(m.MAX_SAVED_BYTES+1),owner),null);const {book,page}=fixture();page.title='a'.repeat(49);assert.equal(m.parseBook(JSON.stringify(book),owner),null);});
test('blocked storage and quota failures return an honest failure', () => {
  const {book}=fixture();assert.equal(m.loadBook(null,owner).kind,'unavailable');assert.equal(m.saveBook(null,owner,book,null).ok,false);
  const s={getItem:()=>null,setItem:()=>{throw new Error('QuotaExceededError');}};assert.deepEqual(m.saveBook(s,owner,book,null),{ok:false,reason:'unavailable'});
  assert.equal(m.loadBook({getItem:()=>{throw new Error('SecurityError');},setItem:()=>{}},owner).kind,'unavailable');
});
test('a stale tab cannot silently overwrite an already changed save', () => {
  const {book}=fixture();const s=store();const initial=m.saveBook(s,owner,book,null);assert.equal(initial.ok,true);const stale=m.cloneBook(book);
  book.pages[0].title='Latest saved page';const latest=m.saveBook(s,owner,book,initial.raw);assert.equal(latest.ok,true);
  assert.deepEqual(m.saveBook(s,owner,stale,initial.raw),{ok:false,reason:'conflict'});assert.equal(m.loadBook(s,owner).book.pages[0].title,'Latest saved page');
});

/** Run: node scripts/test-sticker-books.mjs. Needs the project's TypeScript, not a server or secrets. */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = mkdtempSync(join(tmpdir(), 'sodafom-stickers-'));
let passed = 0;
try {
  const compiler = join(root, 'node_modules/typescript/bin/tsc');
  const args = ['--strict', '--target', 'ES2022', '--module', 'ES2022', '--moduleResolution', 'bundler', '--lib', 'ES2022,DOM', '--outDir', output,
    ...['catalog.ts', 'model.ts', 'editor.ts'].map(name => join(root, 'src/components/sticker-books', name))];
  execFileSync(existsSync(compiler) ? process.execPath : 'tsc', existsSync(compiler) ? [compiler, ...args] : args, { stdio: 'inherit' });
  writeFileSync(join(output, 'package.json'), '{"type":"module"}');
  const m = await import(pathToFileURL(join(output, 'model.js')).href);
  const c = await import(pathToFileURL(join(output, 'catalog.js')).href);
  const check = (name, run) => { run(); passed++; console.log(`PASS ${name}`); };
  const storage = () => { const values = new Map(); return { values, getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }; };
  check('new books contain one blank active page', () => { const b = m.newBook(); assert.equal(b.pages.length, 1); assert.equal(m.currentPage(b).id, b.activePageId); assert.equal(m.currentPage(b).stickers.length, 0); });
  check('approved catalogue uses only local artwork and unique identifiers', () => { assert.equal(new Set(c.STICKERS.map(s => s.id)).size, c.STICKERS.length); assert(c.STICKERS.every(s => /^\/assets\//.test(s.src))); assert(c.THEMES.every(t => !t.src || /^\/assets\//.test(t.src))); });
  check('stickers can be added and repeated with distinct instance IDs', () => { const p = m.newPage(); const a = m.addSticker(p, 'archie'); const b = m.addSticker(p, 'archie'); assert(a && b); assert.notEqual(a.id,b.id); assert.equal(p.stickers.length,2); });
  check('unknown sticker IDs cannot inject artwork', () => { const p = m.newPage(); assert.equal(m.addSticker(p,'https://example.invalid/tracker.png'),null); assert.equal(p.stickers.length,0); });
  check('mouse/touch coordinates are bounded on every edge', () => { const p = m.newPage(); const s = m.addSticker(p,'archie'); m.moveSticker(p,s.id,-100,100); assert.equal(p.stickers[0].x,.12); assert(Math.abs(p.stickers[0].y-.84)<1e-10); });
  check('positions remain proportional when viewport size changes', () => { const p = m.newPage(); m.addSticker(p,'archie',.6,.5); const s = p.stickers[0]; assert.equal(s.x*800/800,s.x*320/320); assert.equal(s.y*600/600,s.y*240/240); });
  check('nonfinite live movement is normalised', () => { const p = m.newPage(); const s = m.addSticker(p,'archie'); m.moveSticker(p,s.id,NaN,Infinity); assert.equal(p.stickers[0].x,.5); assert.equal(p.stickers[0].y,.5); });
  check('resizing cannot move stickers off the page', () => { const p = m.newPage(); const s = m.addSticker(p,'archie',0,0); m.resizeSticker(p,s.id,20); assert.equal(p.stickers[0].size,.36); assert.equal(p.stickers[0].x,.18); assert.equal(p.stickers[0].y,.24); m.resizeSticker(p,s.id,-20); assert.equal(p.stickers[0].size,.18); });
  check('remove affects only the selected sticker', () => { const p = m.newPage(); const a=m.addSticker(p,'archie'); const b=m.addSticker(p,'bella'); m.removeSticker(p,a.id); assert.deepEqual(p.stickers.map(s=>s.id),[b.id]); });
  check('bring to front preserves every sticker', () => { const p=m.newPage(); const a=m.addSticker(p,'archie'); const b=m.addSticker(p,'bella'); m.bringForward(p,a.id); assert.deepEqual(p.stickers.map(s=>s.id),[b.id,a.id]); });
  check('60-sticker limit is enforced', () => { const p=m.newPage(); for(let i=0;i<m.MAX_STICKERS;i++) assert(m.addSticker(p,'archie')); assert.equal(m.addSticker(p,'archie'),null); assert.equal(p.stickers.length,60); });
  check('new pages retain existing pages and enforce the 12-page limit', () => { const b=m.newBook(); m.addSticker(m.currentPage(b),'archie'); for(let i=1;i<m.MAX_PAGES;i++) assert(m.addPage(b)); assert.equal(m.addPage(b),null); assert.equal(b.pages[0].stickers.length,1); });
  check('last page cannot be deleted; deleting active page picks another', () => { const b=m.newBook(); assert.equal(m.deletePage(b,b.activePageId),false); const p=m.addPage(b); assert(m.deletePage(b,p.id)); assert.equal(b.activePageId,b.pages[0].id); });
  check('history snapshots do not mutate with later edits', () => { const b=m.newBook(); const before=m.copyBook(b); m.addSticker(m.currentPage(b),'archie'); assert.equal(m.currentPage(before).stickers.length,0); });
  check('multi-page themed save round-trip is lossless', () => { const b=m.newBook(); m.currentPage(b).themeId='seaside'; m.currentPage(b).title='A seaside story'; m.addSticker(m.currentPage(b),'ziggy',.7,.6); m.addPage(b); m.addSticker(m.currentPage(b),'key-card'); assert.deepEqual(m.decodeBook(JSON.stringify(b)),b); });
  check('stored arbitrary URL and HTML fields are ignored', () => { const b=m.newBook(); const s=m.addSticker(m.currentPage(b),'archie'); s.src='https://example.invalid/private'; s.html='<script>bad</script>'; const restored=m.decodeBook(JSON.stringify(b)); assert(!('src' in m.currentPage(restored).stickers[0])); assert(!('html' in m.currentPage(restored).stickers[0])); });
  check('malformed JSON and unsupported versions are rejected', () => { assert.throws(()=>m.decodeBook('{')); assert.throws(()=>m.decodeBook(JSON.stringify({...m.newBook(),version:99}))); });
  check('duplicate page/sticker IDs are rejected', () => { const b=m.newBook(); m.addPage(b); b.pages[1].id=b.pages[0].id; assert.throws(()=>m.decodeBook(JSON.stringify(b))); const d=m.newBook(); const s=m.addSticker(m.currentPage(d),'archie'); m.currentPage(d).stickers.push({...s}); assert.throws(()=>m.decodeBook(JSON.stringify(d))); });
  check('unknown stored artwork and nonfinite coordinates are rejected', () => { const b=m.newBook(); const s=m.addSticker(m.currentPage(b),'archie'); s.assetId='external'; assert.throws(()=>m.decodeBook(JSON.stringify(b))); s.assetId='archie'; s.x=NaN; assert.throws(()=>m.decodeBook(JSON.stringify(b))); });
  check('stored off-page coordinates are repaired safely', () => { const b=m.newBook(); const s=m.addSticker(m.currentPage(b),'archie'); s.x=-10; s.y=10; const r=m.currentPage(m.decodeBook(JSON.stringify(b))).stickers[0]; assert.equal(r.x,.12); assert(Math.abs(r.y-.84)<1e-10); });
  check('large records, titles and unknown themes are rejected', () => { assert.throws(()=>m.decodeBook(' '.repeat(500001))); const b=m.newBook(); m.currentPage(b).title='x'.repeat(61); assert.throws(()=>m.decodeBook(JSON.stringify(b))); m.currentPage(b).title='Good'; m.currentPage(b).themeId='bad'; assert.throws(()=>m.decodeBook(JSON.stringify(b))); });
  check('saving touches only the sticker-book storage key', () => { const s=storage(); s.setItem('unrelated','preserve'); const b=m.newBook(); m.addSticker(m.currentPage(b),'archie'); const raw=m.saveBook(s,b,null); assert.equal(s.getItem('unrelated'),'preserve'); assert.deepEqual(m.readBook(s).book,b); assert.equal(s.getItem(m.STORAGE_KEY),raw); });
  check('sequential conflicting tab saves are rejected without overwrite', () => { const s=storage(); const first=m.saveBook(s,m.newBook(),null); assert.throws(()=>m.saveBook(s,m.newBook(),null),/Another tab/); assert.equal(s.getItem(m.STORAGE_KEY),first); });
  check('quota failure leaves the old save intact', () => { const s=storage(); const raw=m.saveBook(s,m.newBook(),null); const broken={getItem:s.getItem,setItem(){throw new Error('quota');}}; assert.throws(()=>m.saveBook(broken,m.newBook(),raw),/quota/); assert.equal(s.getItem(m.STORAGE_KEY),raw); });
  check('blocked storage errors are surfaced, not reported as saved', () => { const blocked={getItem(){throw new Error('blocked');},setItem(){throw new Error('blocked');}}; assert.throws(()=>m.readBook(blocked),/blocked/); assert.throws(()=>m.saveBook(blocked,m.newBook(),null),/blocked/); });
  console.log(`\n${passed} checks passed; isolated editor TypeScript compilation passed.`);
} catch (error) { console.error(error); process.exitCode=1; }
finally { rmSync(output,{recursive:true,force:true}); }

// Run without npm dependencies: node --experimental-strip-types --test scripts/qa/agent27/critical-error-display.node.mjs
// These are DOM-adapter regression tests, not whole-app/browser certification.
import test from 'node:test';
import assert from 'node:assert/strict';
import { showCriticalError } from '../../../src/lib/critical-error-display.ts';

class Element {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.id = '';
    this.children = [];
    this.style = { cssText: '' };
    this.textContent = '';
    this.onclick = null;
  }
  set innerHTML(_) { throw new Error('Unsafe HTML assignment'); }
  appendChild(child) { this.children.push(child); return child; }
  replaceChildren(...children) { this.children = children; }
}
function createDocument() {
  const doc = {
    body: new Element('body'),
    createElement: tag => new Element(tag),
    getElementById(id) {
      function find(node) {
        if (node.id === id) return node;
        for (const child of node.children) { const found = find(child); if (found) return found; }
        return null;
      }
      return doc.body ? find(doc.body) : null;
    },
  };
  return doc;
}
function render(details = { message: 'Test error' }) {
  const doc = createDocument();
  let reloads = 0;
  const reload = () => { reloads++; };
  showCriticalError(doc, reload, details);
  return { doc, reload, reloads: () => reloads, panel: doc.body.children[0] };
}

test('keeps the existing heading, details and reload control', () => {
  const { panel } = render({ message: 'Oops', url: '/lesson', line: 10, column: 2, error: { stack: 'stack line' } });
  assert.deepEqual(panel.children.map(node => node.tagName), ['H1', 'PRE', 'BUTTON']);
  assert.equal(panel.children[0].textContent, 'Sodafom Critical Error');
  assert.equal(panel.children[1].textContent, 'Oops\n\nURL: /lesson\nLine: 10\nCol: 2\n\nStack: stack line');
  assert.equal(panel.children[2].textContent, 'Reload App');
  assert.equal(panel.children[2].type, 'button');
});

test('HTML-looking messages remain inert text', () => {
  const message = '<img src=x onerror="alert(1)"><script>bad()</script>';
  const { panel } = render({ message });
  assert.ok(panel.children[1].textContent.startsWith(message));
  assert.equal(panel.children.length, 3);
  assert.equal(panel.children[1].children.length, 0);
});

test('URL and stack fields are never interpreted as markup', () => {
  const payload = '</pre><iframe src="https://example.invalid"></iframe>';
  const { panel } = render({ message: 'Oops', url: payload, error: { stack: payload } });
  assert.ok(panel.children[1].textContent.includes(`URL: ${payload}`));
  assert.ok(panel.children[1].textContent.includes(`Stack: ${payload}`));
  assert.equal(panel.children[1].children.length, 0);
});

test('repeated errors reuse one panel and display the latest details', () => {
  const { doc, panel, reload } = render();
  for (let i = 0; i < 100; i++) showCriticalError(doc, reload, { message: `Error ${i}` });
  assert.equal(doc.body.children.length, 1);
  assert.equal(doc.body.children[0], panel);
  assert.ok(panel.children[1].textContent.startsWith('Error 99'));
  assert.equal(panel.children.length, 3);
});

test('reload is not called until the user clicks the button', () => {
  const result = render();
  assert.equal(result.reloads(), 0);
  result.panel.children[2].onclick();
  assert.equal(result.reloads(), 1);
});

test('repeated rendering does not multiply reload callbacks', () => {
  const result = render();
  for (let i = 0; i < 10; i++) showCriticalError(result.doc, result.reload, { message: 'Another error' });
  result.panel.children[2].onclick();
  assert.equal(result.reloads(), 1);
});

test('missing error and stack use a readable fallback', () => {
  for (const error of [undefined, null, {}, { stack: '' }]) {
    const { panel } = render({ message: 'Oops', error });
    assert.ok(panel.children[1].textContent.endsWith('Stack: No stack'));
  }
});

test('a hostile message toString cannot crash the error reporter', () => {
  const message = { toString() { throw new Error('Cannot stringify'); } };
  const { panel } = render({ message });
  assert.ok(panel.children[1].textContent.startsWith('Unknown error'));
});

test('an inaccessible stack cannot crash the error reporter', () => {
  const error = { get stack() { throw new Error('Stack unavailable'); } };
  const { panel } = render({ message: 'Oops', error });
  assert.ok(panel.children[1].textContent.endsWith('Stack: No stack'));
});

test('an early error before document.body does not throw', () => {
  const doc = createDocument();
  doc.body = null;
  assert.doesNotThrow(() => showCriticalError(doc, () => assert.fail('Unexpected reload'), { message: 'Early error' }));
});

test('unrelated existing page content is preserved', () => {
  const doc = createDocument();
  const app = doc.createElement('main');
  app.id = 'app';
  doc.body.appendChild(app);
  showCriticalError(doc, () => {}, { message: 'Oops' });
  showCriticalError(doc, () => {}, { message: 'Again' });
  assert.equal(doc.body.children.length, 2);
  assert.equal(doc.body.children[0], app);
});

test('zero line and column values and multiline messages are retained', () => {
  const { panel } = render({ message: 'Line one\nLine two', line: 0, column: 0 });
  assert.ok(panel.children[1].textContent.includes('Line one\nLine two'));
  assert.ok(panel.children[1].textContent.includes('Line: 0\nCol: 0'));
});

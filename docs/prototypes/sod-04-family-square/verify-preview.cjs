'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const file = path.join(__dirname, 'Sodafom-Moving-Family-Square.html');
const bytes = fs.readFileSync(file);
const html = bytes.toString('utf8');
let scripts = 0;
for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
  if (/\bsrc\s*=/.test(match[1])) continue;
  new vm.Script(match[2], { filename: 'inline-' + (++scripts) + '.js' });
}
const images = [...html.matchAll(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/g)];
assert.equal(images.length, 6, 'All six embedded scene/sprite images survive the handoff');
for (const [index, match] of images.entries()) {
  const image = Buffer.from(match[1], 'base64');
  assert.equal(image.toString('ascii', 0, 4), 'RIFF', 'Image ' + index);
  assert.equal(image.toString('ascii', 8, 12), 'WEBP', 'Image ' + index);
  assert.equal(image.readUInt32LE(4) + 8, image.length, 'Complete WebP ' + index);
}
assert(scripts > 0);
console.log(JSON.stringify({
  result: 'PASS', inlineScriptsCompiled: scripts, embeddedWebPContainers: images.length,
  bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
  limit: 'Syntax/container integrity only; no browser, audio or app acceptance.'
}, null, 2));


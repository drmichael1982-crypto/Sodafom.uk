#!/usr/bin/env node
// Read-only check of the exact private image files recorded by SOD-VIS-01.
import { createHash } from 'node:crypto';
import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const manifestPath = fileURLToPath(new URL('../docs/artwork/SOD-VIS-01-REFERENCE-REVIEW.json', import.meta.url));

async function main() {
  if (process.argv.length !== 3) {
    console.error('Usage: node scripts/verify-artwork-reference-pack.mjs <extracted-review-pack-directory>');
    return 2;
  }
  const root = await realpath(process.argv[2]);
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (new Set(manifest.assets.map(asset => asset.path)).size !== manifest.assets.length) {
    throw new Error('duplicate image paths in the trusted manifest');
  }
  let failures = 0;
  for (const asset of manifest.assets) {
    try {
      if (path.isAbsolute(asset.path)) throw new Error('absolute manifest path');
      const candidate = await realpath(path.resolve(root, asset.path));
      const relative = path.relative(root, candidate);
      if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
        throw new Error('path leaves the selected review pack');
      }
      const info = await stat(candidate);
      if (!info.isFile() || info.size !== asset.bytes) throw new Error('file type or byte length differs');
      const digest = createHash('sha256').update(await readFile(candidate)).digest('hex');
      if (digest !== asset.sha256) throw new Error('SHA-256 differs');
      console.log(`PASS ${asset.path}`);
    } catch (error) {
      failures += 1;
      console.error(`FAIL ${asset.path}: ${error.code === 'ENOENT' ? 'missing file' : error.message}`);
    }
  }
  console.log(`${manifest.assets.length - failures}/${manifest.assets.length} exact image files verified.`);
  console.log('This checks file identity, not facial likeness, user approval, motion, voices, app integration or phone playback.');
  return failures ? 1 : 0;
}

main().then(code => { process.exitCode = code; }).catch(error => {
  console.error(`Cannot verify the artwork pack: ${error.message}`);
  process.exitCode = 2;
});

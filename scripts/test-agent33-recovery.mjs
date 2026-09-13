import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  REQUIRED_CHECKS,
  assertOfflineEnvironment,
  openDrillArtifact,
  releaseEvidenceProblems,
  restoreArtifactForDrill,
  runSyntheticDrill,
  sealDrillArtifact,
  sha256,
} from './agent33-recovery.mjs';

const SCRIPT = fileURLToPath(new URL('./agent33-recovery.mjs', import.meta.url));
const EXAMPLE = fileURLToPath(new URL('../docs/operations/agent33-release-evidence.example.json', import.meta.url));
const NOW = Date.UTC(2026, 8, 13, 12);
const payload = Buffer.from('-- synthetic only\nINSERT INTO drill_scores VALUES (1, 7);\n');
const key = randomBytes(32);
const sealed = sealDrillArtifact(payload, key);
const cleanEnv = { PATH: process.env.PATH ?? '', NODE_ENV: 'test' };

function cli(...args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { env: cleanEnv, encoding: 'utf8' });
}

function goodEvidence(now = NOW) {
  return {
    schemaVersion: 1,
    target: 'opaque-service-id',
    targetBranch: 'release/test',
    candidateSha: 'a'.repeat(40),
    rollbackSha: 'b'.repeat(40),
    backupSha256: 'c'.repeat(64),
    restoredBackupSha256: 'c'.repeat(64),
    backupSourceSha: 'b'.repeat(40),
    testedCandidateSha: 'a'.repeat(40),
    testedRollbackSha: 'b'.repeat(40),
    approvedCandidateSha: 'a'.repeat(40),
    schemaCompatibility: 'backward-compatible',
    expectedMysqlMajor: 9,
    restoredMysqlMajor: 9,
    backupCompletedAt: new Date(now - 120_000).toISOString(),
    restoreCompletedAt: new Date(now - 60_000).toISOString(),
    ...Object.fromEntries(REQUIRED_CHECKS.map((field) => [field, true])),
  };
}

function tempTest(callback) {
  const root = mkdtempSync(join(tmpdir(), 'agent33-unit-'));
  try {
    return callback(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('authenticated artifact round trip preserves bytes', () => {
  assert.deepEqual(openDrillArtifact(sealed, key), payload);
});

test('fresh nonce gives distinct ciphertext', () => {
  assert.notDeepEqual(sealDrillArtifact(payload, key), sealed);
});

test('archive does not contain fixture plaintext', () => {
  assert.equal(sealed.includes(payload), false);
});

test('wrong key is rejected without printing values', () => {
  assert.throws(() => openDrillArtifact(sealed, randomBytes(32)), /^Error: E_ARCHIVE_AUTHENTICATION$/);
});

test('invalid key sizes and types are rejected', () => {
  for (const invalid of [null, 'secret', Buffer.alloc(0), Buffer.alloc(31), Buffer.alloc(33)]) {
    assert.throws(() => sealDrillArtifact(payload, invalid), /E_KEY_INVALID/);
    assert.throws(() => openDrillArtifact(sealed, invalid), /E_KEY_INVALID/);
  }
});

test('empty, oversized and non-buffer payloads are rejected', () => {
  for (const invalid of [null, 'sql', Buffer.alloc(0), Buffer.alloc(8 * 1024 * 1024 + 1)]) {
    assert.throws(() => sealDrillArtifact(invalid, key), /E_PAYLOAD_INVALID/);
  }
});

test('header, nonce, authentication tag and ciphertext tampering are rejected', () => {
  for (const index of [0, 17, 30, sealed.length - 1]) {
    const damaged = Buffer.from(sealed);
    damaged[index] ^= 1;
    assert.throws(() => openDrillArtifact(damaged, key), /E_ARCHIVE_(INVALID|AUTHENTICATION)/);
  }
});

test('truncated, oversized and malformed archives are rejected', () => {
  for (const invalid of [null, 'archive', sealed.subarray(0, 0), sealed.subarray(0, 15), sealed.subarray(0, 44), sealed.subarray(0, -1), Buffer.alloc(8 * 1024 * 1024 + 100)]) {
    assert.throws(() => openDrillArtifact(invalid, key), /E_ARCHIVE_(INVALID|AUTHENTICATION)/);
  }
});

test('independent expected checksum is required and enforced', () => {
  for (const invalid of [null, '', '../outside', 'A'.repeat(64)]) {
    assert.throws(() => restoreArtifactForDrill(sealed, key, invalid), /E_EXPECTED_HASH_INVALID/);
  }
  assert.throws(() => restoreArtifactForDrill(sealed, key, '0'.repeat(64)), /E_CHECKSUM_MISMATCH/);
});

test('actual new-file drill restore verifies hash, private permissions and cleanup', () => {
  const proof = restoreArtifactForDrill(sealed, key, sha256(payload));
  assert.equal(proof.bytes, payload.length);
  assert.equal(proof.sha256, sha256(payload));
  assert.equal(proof.cleanupVerified, true);
  if (process.platform !== 'win32') {
    assert.equal(proof.fileMode, 0o600);
    assert.equal(proof.directoryMode, 0o700);
  }
});

test('drill restore leaves caller buffers and an unrelated sentinel unchanged', () => tempTest((root) => {
  const sentinel = join(root, 'unrelated-data.txt');
  writeFileSync(sentinel, 'do not change');
  const archiveBefore = Buffer.from(sealed);
  const keyBefore = Buffer.from(key);
  restoreArtifactForDrill(sealed, key, sha256(payload));
  assert.deepEqual(sealed, archiveBefore);
  assert.deepEqual(key, keyBefore);
  assert.equal(readFileSync(sentinel, 'utf8'), 'do not change');
}));

test('payload resembling traversal is restored only as bytes', () => {
  const text = Buffer.from('../../production.sql\n/tmp/outside\n');
  assert.equal(restoreArtifactForDrill(sealDrillArtifact(text, key), key, sha256(text)).bytes, text.length);
});

test('synthetic drill accurately labels its limited coverage', () => {
  const result = runSyntheticDrill();
  assert.equal(result.status, 'passed');
  assert.equal(result.mysqlRestoreTested, false);
  assert.equal(result.appRollbackTested, false);
  assert.equal(result.deploymentAttempted, false);
  assert.equal(result.cleanupVerified, true);
});

test('offline guard refuses production, provider and credential-bearing environments', () => {
  for (const env of [
    { NODE_ENV: ' production ' },
    { NODE_ENV: 'PRODUCTION' },
    { RAILWAY_ENVIRONMENT_NAME: 'staging' },
    { RAILWAY_PROJECT_ID: '' },
    { DB_HOST: 'localhost' },
    { DATABASE_URL: 'sentinel' },
    { database_url: 'sentinel' },
    { MYSQLHOST: 'localhost' },
    { OPENAI_API_KEY: 'sentinel' },
    { BETTER_AUTH_SECRET: 'sentinel' },
    { STRIPE_SECRET_KEY: 'sentinel' },
    { AWS_ACCESS_KEY_ID: 'sentinel' },
    { S3_BUCKET: 'sentinel' },
  ]) {
    assert.throws(() => assertOfflineEnvironment(env), /^Error: E_OFFLINE_ONLY$/);
  }
  assert.doesNotThrow(() => assertOfflineEnvironment({ NODE_ENV: 'test', PATH: '/bin' }));
});

test('complete release assertions pass validation without performing a release', () => {
  assert.deepEqual(releaseEvidenceProblems(goodEvidence(), NOW), []);
});

test('every required boolean fails closed when absent, false or a string', () => {
  for (const field of REQUIRED_CHECKS) {
    for (const invalid of [undefined, false, 'true', 1, null]) {
      assert.ok(releaseEvidenceProblems({ ...goodEvidence(), [field]: invalid }, NOW).includes(`E_REQUIRED_${field}`));
    }
  }
});

test('missing object, array and invalid clock fail closed', () => {
  for (const invalid of [null, true, 'text', []]) {
    assert.deepEqual(releaseEvidenceProblems(invalid, NOW), ['E_EVIDENCE_OBJECT']);
  }
  assert.deepEqual(releaseEvidenceProblems({}, NaN), ['E_CLOCK_INVALID']);
  assert.ok(releaseEvidenceProblems({}, NOW).length > 20);
});

test('wrong evidence version, opaque target, branch, schema and engine are blocked', () => {
  for (const [field, value, code] of [
    ['schemaVersion', 2, 'E_EVIDENCE_VERSION'],
    ['target', '', 'E_TARGET'],
    ['targetBranch', '../outside', 'E_TARGET_BRANCH'],
    ['schemaCompatibility', 'destructive', 'E_SCHEMA_COMPATIBILITY'],
    ['schemaCompatibility', 'unknown', 'E_SCHEMA_COMPATIBILITY'],
    ['restoredMysqlMajor', 8, 'E_MYSQL_VERSION'],
    ['expectedMysqlMajor', 4, 'E_MYSQL_VERSION'],
  ]) {
    assert.ok(releaseEvidenceProblems({ ...goodEvidence(), [field]: value }, NOW).includes(code));
  }
});

test('invalid commit identifiers and identical candidate/rollback commits are blocked', () => {
  for (const field of ['candidateSha', 'rollbackSha']) {
    for (const invalid of ['branch-name', 'abcd123', '../main', null]) {
      assert.ok(releaseEvidenceProblems({ ...goodEvidence(), [field]: invalid }, NOW).length);
    }
  }
  const evidence = goodEvidence();
  evidence.rollbackSha = evidence.candidateSha;
  assert.ok(releaseEvidenceProblems(evidence, NOW).includes('E_IDENTICAL_RELEASES'));
});

test('backup, build, rollback and approval evidence must match exact artifacts', () => {
  for (const [field, code] of [
    ['restoredBackupSha256', 'E_RESTORED_BACKUP_MISMATCH'],
    ['backupSourceSha', 'E_BACKUP_SOURCE'],
    ['testedCandidateSha', 'E_TESTED_CANDIDATE'],
    ['testedRollbackSha', 'E_TESTED_ROLLBACK'],
    ['approvedCandidateSha', 'E_APPROVED_CANDIDATE'],
  ]) {
    assert.ok(releaseEvidenceProblems({ ...goodEvidence(), [field]: 'd'.repeat(64) }, NOW).includes(code));
  }
});

test('backup hash cannot be missing, malformed or coercible', () => {
  for (const invalid of [undefined, null, 123, 'c'.repeat(63), 'C'.repeat(64)]) {
    assert.ok(releaseEvidenceProblems({ ...goodEvidence(), backupSha256: invalid }, NOW).includes('E_BACKUP_SHA'));
  }
});

test('stale, future, impossible and non-UTC backup timestamps are blocked', () => {
  for (const invalid of [
    new Date(NOW - 86_400_001).toISOString(),
    new Date(NOW + 1).toISOString(),
    '2026-02-30T12:00:00.000Z',
    '2026-09-13',
    '2026-09-13T12:00:00+01:00',
    null,
  ]) {
    assert.ok(releaseEvidenceProblems({ ...goodEvidence(), backupCompletedAt: invalid }, NOW).includes('E_BACKUP_FRESHNESS'));
  }
});

test('restore cannot precede its backup or be in the future', () => {
  for (const invalid of [new Date(NOW - 180_000).toISOString(), new Date(NOW + 1).toISOString(), null]) {
    assert.ok(releaseEvidenceProblems({ ...goodEvidence(), restoreCompletedAt: invalid }, NOW).includes('E_RESTORE_FRESHNESS'));
  }
});

test('CLI rehearsal passes and reports no MySQL or app rollback claim', () => {
  const result = cli('rehearse');
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.mysqlRestoreTested, false);
  assert.equal(output.appRollbackTested, false);
  assert.equal(output.deploymentAttempted, false);
});

test('CLI rejects production environment and never echoes credentials', () => {
  const result = spawnSync(process.execPath, [SCRIPT, 'rehearse'], {
    env: { ...cleanEnv, DB_PASSWORD: 'DO_NOT_ECHO_SENTINEL' },
    encoding: 'utf8',
  });
  assert.equal(result.status, 1);
  assert.equal(result.stderr.trim(), 'E_OFFLINE_ONLY');
  assert.equal((result.stdout + result.stderr).includes('DO_NOT_ECHO_SENTINEL'), false);
});

test('committed example remains blocked instead of pretending evidence exists', () => {
  const result = cli('check-release', EXAMPLE);
  assert.equal(result.status, 2, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.status, 'blocked');
  assert.equal(output.authorizesDeployment, false);
  assert.equal(output.deploymentAttempted, false);
});

test('complete CLI evidence still does not authorize deployment or echo extra data', () => tempTest((root) => {
  const input = join(root, 'evidence.json');
  writeFileSync(input, JSON.stringify({ ...goodEvidence(Date.now()), privateValue: 'DO_NOT_ECHO_SENTINEL' }));
  const result = cli('check-release', input);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).authorizesDeployment, false);
  assert.equal((result.stdout + result.stderr).includes('DO_NOT_ECHO_SENTINEL'), false);
}));

test('CLI sanitizes malformed, empty, large and missing evidence errors', () => tempTest((root) => {
  const input = join(root, 'DO_NOT_ECHO_PATH');
  for (const body of ['{"private":"DO_NOT_ECHO_SENTINEL', '', 'x'.repeat(64 * 1024 + 1)]) {
    writeFileSync(input, body);
    const result = cli('check-release', input);
    assert.equal(result.status, 1);
    assert.equal(result.stderr.trim(), 'E_EVIDENCE_INPUT');
    assert.equal((result.stdout + result.stderr).includes('DO_NOT_ECHO'), false);
  }
  assert.equal(cli('check-release', join(root, 'missing')).stderr.trim(), 'E_EVIDENCE_INPUT');
  assert.equal(cli('check-release', root).stderr.trim(), 'E_EVIDENCE_INPUT');
}));

test('CLI refuses symlink evidence on platforms with O_NOFOLLOW', { skip: process.platform === 'win32' }, () => tempTest((root) => {
  const actual = join(root, 'actual.json');
  const link = join(root, 'link.json');
  writeFileSync(actual, JSON.stringify(goodEvidence()));
  symlinkSync(actual, link);
  assert.equal(cli('check-release', link).stderr.trim(), 'E_EVIDENCE_INPUT');
}));

test('CLI has no deploy, merge, output-target or real-database command', () => {
  for (const args of [[], ['deploy'], ['rollback'], ['rehearse', '/production'], ['check-release']]) {
    const result = cli(...args);
    assert.equal(result.status, 1);
    assert.equal(result.stderr.trim(), 'E_USAGE');
  }
});

test('recovery module imports only local computation and filesystem built-ins', () => {
  const source = readFileSync(SCRIPT, 'utf8');
  const imports = [...source.matchAll(/from '([^']+)'/g)].map((match) => match[1]);
  assert.deepEqual(imports, ['node:crypto', 'node:fs', 'node:os', 'node:path', 'node:url']);
  assert.equal(/\b(?:fetch|execSync|spawn|eval)\s*\(/.test(source), false);
});

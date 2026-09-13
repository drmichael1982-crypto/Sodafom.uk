/**
 * Offline recovery-drill mechanics and manual release-evidence checks.
 *
 * There is intentionally no deployment, database client, backup provider,
 * network API, application import, or production restore command in here.
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import {
  chmodSync,
  closeSync,
  constants,
  existsSync,
  fstatSync,
  fsyncSync,
  mkdtempSync,
  openSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const MAGIC = Buffer.from('SODAFOM-DRILL-V1\n');
const MAX_BYTES = 8 * 1024 * 1024;
const MAX_EVIDENCE_BYTES = 64 * 1024;
const DAY_MS = 24 * 60 * 60 * 1000;
const HEX40 = /^[a-f0-9]{40}$/;
const HEX64 = /^[a-f0-9]{64}$/;
const OPAQUE_IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9._/-]{0,127}$/;

export const REQUIRED_CHECKS = Object.freeze([
  'backupEncrypted',
  'backupOffsiteCopyVerified',
  'backupKeyRecoveryVerified',
  'restoreUsedIsolatedMysql',
  'restoreSchemaAndCountsVerified',
  'restoreRelationshipsVerified',
  'restoreRolesVerified',
  'restoreAppReadWriteVerified',
  'rollbackArtifactAvailable',
  'rollbackTestedOnCandidateSchema',
  'rollbackPreservesNewWrites',
  'rollbackSecretsReviewed',
  'rollbackSecurityReviewed',
  'readinessChecksDatabase',
  'candidateBuildAndTestsPassed',
  'ownerApproved',
]);

function fail(code) {
  throw new Error(code);
}

/** Refuse environments likely to contain production access or service credentials. */
export function assertOfflineEnvironment(env = process.env) {
  const forbidden = /^(RAILWAY_|DB_|DATABASE_URL$|MYSQL|OPENAI_API_KEY$|BETTER_AUTH_SECRET$|STRIPE_SECRET_KEY$|AWS_|S3_|GOOGLE_APPLICATION_CREDENTIALS$)/;
  if (String(env.NODE_ENV ?? '').trim().toLowerCase() === 'production' || Object.keys(env).some((key) => forbidden.test(key.toUpperCase()))) {
    fail('E_OFFLINE_ONLY');
  }
}

function checkKey(key) {
  if (!Buffer.isBuffer(key) || key.length !== 32) fail('E_KEY_INVALID');
}

export function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

/** Small, bounded, authenticated artifacts for offline drills only; never a DB backup job. */
export function sealDrillArtifact(payload, key) {
  checkKey(key);
  if (!Buffer.isBuffer(payload) || payload.length === 0 || payload.length > MAX_BYTES) fail('E_PAYLOAD_INVALID');

  const nonce = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, nonce);
  cipher.setAAD(MAGIC);
  const encrypted = Buffer.concat([cipher.update(payload), cipher.final()]);
  return Buffer.concat([MAGIC, nonce, cipher.getAuthTag(), encrypted]);
}

export function openDrillArtifact(archive, key) {
  checkKey(key);
  const offset = MAGIC.length;
  if (!Buffer.isBuffer(archive) || archive.length <= offset + 28 || archive.length > MAX_BYTES + offset + 28
    || !archive.subarray(0, offset).equals(MAGIC)) {
    fail('E_ARCHIVE_INVALID');
  }
  try {
    const decipher = createDecipheriv('aes-256-gcm', key, archive.subarray(offset, offset + 12));
    decipher.setAAD(MAGIC);
    decipher.setAuthTag(archive.subarray(offset + 12, offset + 28));
    return Buffer.concat([decipher.update(archive.subarray(offset + 28)), decipher.final()]);
  } catch {
    fail('E_ARCHIVE_AUTHENTICATION');
  }
}

/**
 * Restores only a synthetic artifact into a newly allocated private temporary
 * directory, then removes that one directory. No caller-controlled output
 * path, archive filename, database client, SQL execution, or real restore.
 */
export function restoreArtifactForDrill(archive, key, expectedSha256) {
  assertOfflineEnvironment();
  if (typeof expectedSha256 !== 'string' || !HEX64.test(expectedSha256)) fail('E_EXPECTED_HASH_INVALID');

  const payload = openDrillArtifact(archive, key);
  if (sha256(payload) !== expectedSha256) fail('E_CHECKSUM_MISMATCH');

  let directory;
  let result;
  try {
    directory = mkdtempSync(join(tmpdir(), 'sodafom-agent33-drill-'));
    chmodSync(directory, 0o700);
    const output = join(directory, 'restored-artifact.bin');
    const file = openSync(output, 'wx', 0o600);
    try {
      writeFileSync(file, payload);
      fsyncSync(file);
    } finally {
      closeSync(file);
    }
    if (sha256(readFileSync(output)) !== expectedSha256) fail('E_RESTORE_VERIFY');
    result = {
      bytes: payload.length,
      sha256: expectedSha256,
      fileMode: statSync(output).mode & 0o777,
      directoryMode: statSync(directory).mode & 0o777,
    };
  } catch {
    fail('E_RESTORE_IO');
  } finally {
    payload.fill(0);
    if (directory) {
      try {
        rmSync(directory, { recursive: true, force: false });
      } catch {
        fail('E_TEMP_CLEANUP');
      }
    }
  }
  return { ...result, cleanupVerified: !existsSync(directory) };
}

export function runSyntheticDrill() {
  assertOfflineEnvironment();
  const key = randomBytes(32);
  // Synthetic bytes only. This string is never loaded from the app or run as SQL.
  const fixture = Buffer.from('-- SYNTHETIC ONLY\nCREATE TABLE drill_scores (child_id INT, score INT);\nINSERT INTO drill_scores VALUES (1, 7), (2, 9);\n');
  try {
    const proof = restoreArtifactForDrill(sealDrillArtifact(fixture, key), key, sha256(fixture));
    return {
      status: 'passed',
      scope: 'synthetic-artifact-file-restore-only',
      mysqlRestoreTested: false,
      appRollbackTested: false,
      deploymentAttempted: false,
      ...proof,
    };
  } finally {
    key.fill(0);
    fixture.fill(0);
  }
}

function timestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return NaN;
  const milliseconds = Date.parse(value);
  return Number.isFinite(milliseconds) && new Date(milliseconds).toISOString() === value ? milliseconds : NaN;
}

/**
 * Checks supplied assertions, not their truth. Targets are opaque identifiers
 * because this offline tool intentionally knows nothing about live services.
 * A clear result cannot authorize, enforce, or execute a release.
 */
export function releaseEvidenceProblems(evidence, now = Date.now()) {
  if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence)) return ['E_EVIDENCE_OBJECT'];
  if (typeof now !== 'number' || !Number.isFinite(now)) return ['E_CLOCK_INVALID'];

  const item = evidence;
  const problems = [];
  const require = (condition, code) => {
    if (!condition) problems.push(code);
  };

  require(item.schemaVersion === 1, 'E_EVIDENCE_VERSION');
  require(typeof item.target === 'string' && OPAQUE_IDENTIFIER.test(item.target), 'E_TARGET');
  require(typeof item.targetBranch === 'string' && OPAQUE_IDENTIFIER.test(item.targetBranch), 'E_TARGET_BRANCH');
  require(typeof item.candidateSha === 'string' && HEX40.test(item.candidateSha), 'E_CANDIDATE_SHA');
  require(typeof item.rollbackSha === 'string' && HEX40.test(item.rollbackSha), 'E_ROLLBACK_SHA');
  require(item.candidateSha !== item.rollbackSha, 'E_IDENTICAL_RELEASES');
  require(typeof item.backupSha256 === 'string' && HEX64.test(item.backupSha256), 'E_BACKUP_SHA');
  require(typeof item.restoredBackupSha256 === 'string' && item.restoredBackupSha256 === item.backupSha256, 'E_RESTORED_BACKUP_MISMATCH');
  require(typeof item.backupSourceSha === 'string' && item.backupSourceSha === item.rollbackSha, 'E_BACKUP_SOURCE');
  require(typeof item.testedCandidateSha === 'string' && item.testedCandidateSha === item.candidateSha, 'E_TESTED_CANDIDATE');
  require(typeof item.testedRollbackSha === 'string' && item.testedRollbackSha === item.rollbackSha, 'E_TESTED_ROLLBACK');
  require(typeof item.approvedCandidateSha === 'string' && item.approvedCandidateSha === item.candidateSha, 'E_APPROVED_CANDIDATE');
  require(item.schemaCompatibility === 'backward-compatible', 'E_SCHEMA_COMPATIBILITY');
  require(Number.isInteger(item.expectedMysqlMajor) && item.expectedMysqlMajor >= 5 && item.expectedMysqlMajor <= 99
    && item.restoredMysqlMajor === item.expectedMysqlMajor, 'E_MYSQL_VERSION');

  const backupAt = timestamp(item.backupCompletedAt);
  const restoreAt = timestamp(item.restoreCompletedAt);
  require(Number.isFinite(backupAt) && backupAt <= now && now - backupAt <= DAY_MS, 'E_BACKUP_FRESHNESS');
  require(Number.isFinite(restoreAt) && restoreAt >= backupAt && restoreAt <= now && now - restoreAt <= DAY_MS, 'E_RESTORE_FRESHNESS');
  for (const field of REQUIRED_CHECKS) require(item[field] === true, `E_REQUIRED_${field}`);
  return problems;
}

function readEvidence(path) {
  let file;
  try {
    file = openSync(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
    const info = fstatSync(file);
    if (!info.isFile() || info.size === 0 || info.size > MAX_EVIDENCE_BYTES) fail('E_EVIDENCE_INPUT');
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    fail('E_EVIDENCE_INPUT');
  } finally {
    if (file !== undefined) closeSync(file);
  }
}

function main(args) {
  assertOfflineEnvironment();
  if (args.length === 1 && args[0] === 'rehearse') {
    console.log(JSON.stringify(runSyntheticDrill(), null, 2));
    return;
  }
  if (args.length === 2 && args[0] === 'check-release') {
    const problems = releaseEvidenceProblems(readEvidence(args[1]));
    console.log(JSON.stringify({
      status: problems.length ? 'blocked' : 'assertions-complete-needs-manual-verification',
      problems,
      deploymentAttempted: false,
      authorizesDeployment: false,
    }, null, 2));
    process.exitCode = problems.length ? 2 : 0;
    return;
  }
  fail('E_USAGE');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    // Never echo paths, environment values, parser context, bytes, keys, or stacks.
    const code = error instanceof Error && /^E_[A-Z0-9_]+$/.test(error.message) ? error.message : 'E_RECOVERY_FAILED';
    console.error(code);
    process.exitCode = 1;
  }
}

/** Offline recovery mechanics and manual release-evidence checks. No deploy/DB API. */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { chmodSync, closeSync, constants, existsSync, fstatSync, fsyncSync, mkdtempSync, openSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const MAGIC = Buffer.from('SODAFOM-DRILL-V1\n');
const MAX_BYTES = 8 * 1024 * 1024;
const MAX_EVIDENCE_BYTES = 64 * 1024;
const DAY_MS = 24 * 60 * 60 * 1000;
const HEX40 = /^[a-f0-9]{40}$/;
const HEX64 = /^[a-f0-9]{64}$/;
export const REQUIRED_CHECKS = Object.freeze([
  'backupEncrypted', 'backupOffsiteCopyVerified', 'backupKeyRecoveryVerified',
  'restoreUsedIsolatedMysql', 'restoreSchemaAndCountsVerified',
  'restoreRelationshipsVerified', 'restoreRolesVerified', 'restoreAppReadWriteVerified',
  'rollbackArtifactAvailable', 'rollbackTestedOnCandidateSchema',
  'rollbackPreservesNewWrites', 'rollbackSecretsReviewed', 'rollbackSecurityReviewed',
  'readinessChecksDatabase', 'candidateBuildAndTestsPassed', 'ownerApproved',
]);

function fail(code) { throw new Error(code); }
export function assertOfflineEnvironment(env = process.env) {
  if (String(env.NODE_ENV ?? '').trim().toLowerCase() === 'production' ||
      Object.keys(env).some((k) => /^(RAILWAY_|DB_|DATABASE_URL$|MYSQL|OPENAI_API_KEY$|BETTER_AUTH_SECRET$|STRIPE_SECRET_KEY$)/.test(k))) {
    fail('E_OFFLINE_ONLY');
  }
}
function checkKey(key) {
  if (!Buffer.isBuffer(key) || key.length !== 32) fail('E_KEY_INVALID');
}
export function sha256(bytes) { return createHash('sha256').update(bytes).digest('hex'); }

// Small, bounded, authenticated artifacts for offline drills only; not a DB backup job.
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
  if (!Buffer.isBuffer(archive) || archive.length <= offset + 28 || archive.length > MAX_BYTES + offset + 28 ||
      !archive.subarray(0, offset).equals(MAGIC)) fail('E_ARCHIVE_INVALID');
  try {
    const decipher = createDecipheriv('aes-256-gcm', key, archive.subarray(offset, offset + 12));
    decipher.setAAD(MAGIC);
    decipher.setAuthTag(archive.subarray(offset + 12, offset + 28));
    return Buffer.concat([decipher.update(archive.subarray(offset + 28)), decipher.final()]);
  } catch { fail('E_ARCHIVE_AUTHENTICATION'); }
}

/** Restore only into a newly allocated private temp directory, then remove that directory.
 * No caller-supplied output path, archive filenames, database client, or SQL execution.
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
    const fd = openSync(output, 'wx', 0o600);
    try { writeFileSync(fd, payload); fsyncSync(fd); } finally { closeSync(fd); }
    if (sha256(readFileSync(output)) !== expectedSha256) fail('E_RESTORE_VERIFY');
    result = { bytes: payload.length, sha256: expectedSha256,
      fileMode: statSync(output).mode & 0o777, directoryMode: statSync(directory).mode & 0o777 };
  } catch { fail('E_RESTORE_IO'); }
  finally {
    payload.fill(0);
    if (directory) {
      try { rmSync(directory, { recursive: true, force: false }); }
      catch { fail('E_TEMP_CLEANUP'); }
    }
  }
  return { ...result, cleanupVerified: !existsSync(directory) };
}

export function runSyntheticDrill() {
  assertOfflineEnvironment();
  const key = randomBytes(32);
  // Deliberately synthetic, never loaded from the app or a user database. Not executed as SQL.
  const fixture = Buffer.from("-- SYNTHETIC ONLY\nCREATE TABLE drill_scores (child_id INT, score INT);\nINSERT INTO drill_scores VALUES (1, 7), (2, 9);\n");
  try {
    const proof = restoreArtifactForDrill(sealDrillArtifact(fixture, key), key, sha256(fixture));
    return { status: 'passed', scope: 'synthetic-artifact-file-restore-only',
      mysqlRestoreTested: false, appRollbackTested: false, deploymentAttempted: false, ...proof };
  } finally { key.fill(0); fixture.fill(0); }
}

function timestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return NaN;
  const millis = Date.parse(value);
  return Number.isFinite(millis) && new Date(millis).toISOString() === value ? millis : NaN;
}
/** Checks assertions, not their truth. This cannot authorize, enforce, or execute a release. */
export function releaseEvidenceProblems(evidence, now = Date.now()) {
  if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence)) return ['E_EVIDENCE_OBJECT'];
  if (typeof now !== 'number' || !Number.isFinite(now)) return ['E_CLOCK_INVALID'];
  const e = evidence;
  const problems = [];
  const require = (ok, code) => { if (!ok) problems.push(code); };
  require(e.schemaVersion === 1, 'E_EVIDENCE_VERSION');
  require(e.target === 'sodafom-production' && e.targetBranch === 'master', 'E_TARGET');
  require(typeof e.candidateSha === 'string' && HEX40.test(e.candidateSha), 'E_CANDIDATE_SHA');
  require(typeof e.rollbackSha === 'string' && HEX40.test(e.rollbackSha), 'E_ROLLBACK_SHA');
  require(e.candidateSha !== e.rollbackSha, 'E_IDENTICAL_RELEASES');
  require(typeof e.backupSha256 === 'string' && HEX64.test(e.backupSha256), 'E_BACKUP_SHA');
  require(typeof e.restoredBackupSha256 === 'string' && e.restoredBackupSha256 === e.backupSha256, 'E_RESTORED_BACKUP_MISMATCH');
  require(typeof e.backupSourceSha === 'string' && e.backupSourceSha === e.rollbackSha, 'E_BACKUP_SOURCE');
  require(typeof e.testedCandidateSha === 'string' && e.testedCandidateSha === e.candidateSha, 'E_TESTED_CANDIDATE');
  require(typeof e.testedRollbackSha === 'string' && e.testedRollbackSha === e.rollbackSha, 'E_TESTED_ROLLBACK');
  require(typeof e.approvedCandidateSha === 'string' && e.approvedCandidateSha === e.candidateSha, 'E_APPROVED_CANDIDATE');
  require(e.schemaCompatibility === 'backward-compatible', 'E_SCHEMA_COMPATIBILITY');
  require(e.restoredMysqlMajor === 9, 'E_MYSQL_VERSION');
  const backupAt = timestamp(e.backupCompletedAt);
  const restoreAt = timestamp(e.restoreCompletedAt);
  require(Number.isFinite(backupAt) && backupAt <= now && now - backupAt <= DAY_MS, 'E_BACKUP_FRESHNESS');
  require(Number.isFinite(restoreAt) && restoreAt >= backupAt && restoreAt <= now && now - restoreAt <= DAY_MS, 'E_RESTORE_FRESHNESS');
  for (const field of REQUIRED_CHECKS) require(e[field] === true, `E_REQUIRED_${field}`);
  return problems;
}

function readEvidence(path) {
  let fd;
  try {
    fd = openSync(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
    const info = fstatSync(fd);
    if (!info.isFile() || info.size === 0 || info.size > MAX_EVIDENCE_BYTES) fail('E_EVIDENCE_INPUT');
    return JSON.parse(readFileSync(fd, 'utf8'));
  } catch { fail('E_EVIDENCE_INPUT'); }
  finally { if (fd !== undefined) closeSync(fd); }
}

function main(args) {
  assertOfflineEnvironment();
  if (args.length === 1 && args[0] === 'rehearse') {
    console.log(JSON.stringify(runSyntheticDrill(), null, 2));
    return;
  }
  if (args.length === 2 && args[0] === 'check-release') {
    const problems = releaseEvidenceProblems(readEvidence(args[1]));
    console.log(JSON.stringify({ status: problems.length ? 'blocked' : 'assertions-complete-needs-manual-verification',
      problems, deploymentAttempted: false, authorizesDeployment: false }, null, 2));
    process.exitCode = problems.length ? 2 : 0;
    return;
  }
  fail('E_USAGE');
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { main(process.argv.slice(2)); }
  catch (error) {
    // Never echo input paths, environment values, parser context, SQL, keys, or stacks.
    const code = error instanceof Error && /^E_[A-Z0-9_]+$/.test(error.message) ? error.message : 'E_RECOVERY_FAILED';
    console.error(code);
    process.exitCode = 1;
  }
}

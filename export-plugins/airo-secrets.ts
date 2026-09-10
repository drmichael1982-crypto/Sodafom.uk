/**
 * Standalone stub for #airo/secrets in exported AAB projects.
 *
 * In production AAB containers, getSecret reads from the Nomad task-local
 * config.json injected by dev-supervisor (defaults to /local/config.json,
 * overridable via NOMAD_TASK_DIR). Outside AAB (downloaded projects,
 * GitHub CI), or when a secret is not present in config.json, secrets are
 * resolved from environment variables so skills (stripe, auth, hubspot,
 * zoom, etc.) can be configured via a .env file.
 *
 * This mirrors the pattern used by getDatabaseCredentials() in
 * src/server/db/config.ts.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { env } from 'node:process';

let cachedConfig: Record<string, unknown> | null | undefined;

function loadConfigFile(): Record<string, unknown> | null {
  if (cachedConfig !== undefined) {
    return cachedConfig;
  }

  const configPath = join(env.NOMAD_TASK_DIR || '/local', 'config.json');

  if (existsSync(configPath)) {
    try {
      cachedConfig = JSON.parse(readFileSync(configPath, 'utf-8'));
      return cachedConfig;
    } catch (err) {
      console.warn(
        '[secrets] Failed to parse config.json, falling back to environment:',
        err instanceof Error ? err.message : String(err),
      );
    }
  }

  cachedConfig = null;
  return cachedConfig;
}

function readFromConfig(secretName: string): string | object | null {
  const config = loadConfigFile();

  if (!config) {
    return null;
  }

  const entry = config[secretName] as { VALUE?: unknown } | undefined;

  if (entry && typeof entry === 'object' && 'VALUE' in entry && entry.VALUE != null) {
    return entry.VALUE as string | object;
  }

  return null;
}

export function getSecret(secretName: string): string | object | null {
  const fromConfig = readFromConfig(secretName);

  if (fromConfig != null) {
    console.log(`[secrets] getSecret loaded ${secretName} from config.json`);
    return fromConfig;
  }

  const fromEnv = process.env[secretName];

  if (fromEnv != null) {
    return fromEnv;
  }

  return null;
}

export function listSecretNames(): string[] {
  const names = new Set<string>();

  const config = loadConfigFile();
  if (config) {
    for (const key of Object.keys(config)) {
      names.add(key);
    }
  }

  for (const key of Object.keys(process.env)) {
    if (!key.startsWith('npm_') && !key.startsWith('NODE_') && !key.startsWith('PATH')) {
      names.add(key);
    }
  }

  return Array.from(names);
}

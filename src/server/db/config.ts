/** TREAT AS IMMUTABLE - This file is protected by the file-edit tool
 *
 * Database configuration loader
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { env } from 'node:process';

/**
 * Database credentials interface
 */
export interface DatabaseCredentials {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

/**
 * Load database configuration from the task-local config file.
 * Reads from $NOMAD_TASK_DIR/config.json (defaults to /local/config.json).
 *
 * @returns Database connection credentials
 * @throws Error if config file not found or invalid
 */
export function getDatabaseCredentials(): DatabaseCredentials {
  const configPath = join(env.NOMAD_TASK_DIR || '/local', 'config.json');

  if (existsSync(configPath)) {
    try {
      const config = JSON.parse(readFileSync(configPath, 'utf-8'));
      const db = config.DATABASE?.VALUE;

      if (db && db.HOST && db.PORT && db.USERNAME && db.PASSWORD && db.NAME) {
        console.log('[db] Using credentials from config.json');
        return {
          host: db.HOST,
          port: parseInt(String(db.PORT), 10),
          user: db.USERNAME,
          password: db.PASSWORD,
          database: db.NAME,
        };
      }
    } catch (err) {
      console.warn('[db] Failed to parse config.json, falling back to environment:', err instanceof Error ? err.message : String(err));
    }
  }

  // Fallback to environment variables (Standard for local dev and some cloud envs)
  const host = env.DB_HOST || env.MYSQL_HOST || '127.0.0.1';
  const user = env.DB_USER || env.MYSQL_USER || 'root';
  const password = env.DB_PASSWORD || env.MYSQL_PASSWORD || '';
  const database = env.DB_NAME || env.MYSQL_DATABASE || 'sodafom';
  const port = parseInt(env.DB_PORT || env.MYSQL_PORT || '3306', 10);

  console.log(`[db] Using credentials for ${user}@${host}:${port}/${database}`);

  return { host, port, user, password, database };
}


/** TREAT AS IMMUTABLE - This file is protected by the file-edit tool
 *
 * Database connection setup using Drizzle ORM with MySQL2
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { getDatabaseCredentials } from './config';
import * as schema from './schema';

// Lazy pool and db initialization
let _pool: mysql.Pool | null = null;
let _db: any = null;

export const db = new Proxy({} as any, {
  get(_, prop) {
    if (!_db) {
      try {
        const dbConfig = getDatabaseCredentials();
        _pool = mysql.createPool({
          host: dbConfig.host,
          port: dbConfig.port,
          user: dbConfig.user,
          password: dbConfig.password,
          database: dbConfig.database,
          ssl: dbConfig.host.includes('localhost') ? undefined : {
            rejectUnauthorized: false,
          },
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
        });
        _db = drizzle(_pool, { schema, mode: 'default' });
      } catch (err) {
        console.warn('[db] Initialization failed, using fallback mock:', err instanceof Error ? err.message : String(err));
        // Fallback to a mock that doesn't throw but returns empty results
        _db = {
          select: () => ({ from: () => ({ where: () => ({ limit: () => [] }), limit: () => [] }) }),
          insert: () => ({ values: () => ({ onDuplicateKeyUpdate: () => Promise.resolve() }) }),
          execute: () => Promise.resolve([]),
        };
      }
    }
    const value = _db[prop];
    return typeof value === 'function' ? value.bind(_db) : value;
  },
});




/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    // Trigger lazy initialization by accessing a property on the proxy
    void (db as any).query;
    if (!_pool) return false;
    const connection = await _pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch {
    return false;
  }
}

/**
 * Close database connection pool
 */
export async function closeConnection(): Promise<void> {
  if (_pool) {
    await _pool.end();
  }
}


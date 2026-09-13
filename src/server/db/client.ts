/**
 * Database connection setup using the existing Drizzle ORM / MySQL2 pool.
 * Never replace a failed database with a mock: callers must not acknowledge
 * a save which has not reached the real database.
 */
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { getDatabaseCredentials } from './config';
import * as schema from './schema';

let _pool: mysql.Pool | null = null;
let _db: any = null;

export const db = new Proxy({} as any, {
  get(_, prop) {
    if (!_db) {
      let candidatePool: mysql.Pool | null = null;
      try {
        const dbConfig = getDatabaseCredentials();
        candidatePool = mysql.createPool({
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
        const candidateDb = drizzle(candidatePool, { schema, mode: 'default' });
        _pool = candidatePool;
        _db = candidateDb;
      } catch {
        // A later request may retry initialization after configuration recovers.
        // Do not log connection strings, credentials or driver error contents.
        if (candidatePool) void candidatePool.end().catch(() => undefined);
        throw new Error('Database unavailable');
      }
    }
    const value = _db[prop];
    return typeof value === 'function' ? value.bind(_db) : value;
  },
});

export async function testConnection(): Promise<boolean> {
  let connection: mysql.PoolConnection | undefined;
  try {
    void (db as any).query;
    if (!_pool) return false;
    connection = await _pool.getConnection();
    await connection.ping();
    return true;
  } catch {
    return false;
  } finally {
    connection?.release();
  }
}

export async function closeConnection(): Promise<void> {
  const pool = _pool;
  _pool = null;
  _db = null;
  if (pool) await pool.end();
}

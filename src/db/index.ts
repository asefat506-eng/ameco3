import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.ts';

const { Pool } = pg;

declare global {
  var _postgresPool: pg.Pool | undefined;
}

import dotenv from 'dotenv';
dotenv.config();

export function isPostgresDbConfigured(): boolean {
  return Boolean(
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    (process.env.SQL_HOST && process.env.SQL_DB_NAME)
  );
}

export const isDbConfigured = isPostgresDbConfigured();

export const createPool = (): pg.Pool | null => {
  if (!isPostgresDbConfigured()) {
    return null;
  }
  if (!global._postgresPool) {
    try {
      const connStr = process.env.DATABASE_URL || process.env.POSTGRES_URL;
      if (connStr) {
        global._postgresPool = new Pool({
          connectionString: connStr,
          ssl: connStr.includes('localhost') || connStr.includes('127.0.0.1') ? false : { rejectUnauthorized: false },
          max: 10,
          connectionTimeoutMillis: 5000,
        });
      } else {
        global._postgresPool = new Pool({
          host: process.env.SQL_HOST,
          user: process.env.SQL_USER,
          password: process.env.SQL_PASSWORD,
          database: process.env.SQL_DB_NAME,
          max: 10,
          connectionTimeoutMillis: 3000,
        });
      }

      global._postgresPool.on('error', (err) => {
        console.warn('Unexpected error on idle SQL pool client:', err.message);
      });
    } catch (e: any) {
      console.warn('Could not initialize PostgreSQL connection pool:', e.message);
      return null;
    }
  }
  return global._postgresPool;
};

const pool = createPool();

export const db = pool ? drizzle(pool, { schema }) : null;


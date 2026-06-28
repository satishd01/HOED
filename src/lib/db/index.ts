import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * Singleton database connection pool.
 * Uses connection pooling to efficiently manage PostgreSQL connections
 * across serverless function invocations.
 */

const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10, // Maximum number of connections in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

/**
 * Drizzle ORM instance with full schema inference.
 * All queries through this instance are type-safe.
 */
export const db = drizzle(pool, { schema });

export type Database = typeof db;

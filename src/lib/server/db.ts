// src/lib/server/db.ts
import { drizzle } from 'drizzle-orm/bun-sql';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

// Bun SQL supplies the PostgreSQL client and connection pool natively.
export const db = drizzle(env.DATABASE_URL ?? '', { schema });

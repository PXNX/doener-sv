// src/lib/server/db.ts
import { drizzle } from 'drizzle-orm/bun-sql';
import { DATABASE_URL } from '$env/static/private';
import * as schema from './schema';

// Bun SQL supplies the PostgreSQL client and connection pool natively.
export const db = drizzle(DATABASE_URL, { schema });

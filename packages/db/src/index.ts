import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// `prepare: false` is required when connecting through a transaction-mode
// pooler (Neon's `-pooler` endpoint / PgBouncer), which doesn't support the
// prepared statements postgres.js uses by default. It's harmless on direct
// connections, so we set it unconditionally.
const client = postgres(process.env.DATABASE_URL!, { prepare: false });

export const db = drizzle(client, { schema });

import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __neonPool: Pool | undefined;
}

export function getDbPool(): Pool {
  if (globalThis.__neonPool) return globalThis.__neonPool;

  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL is missing.");
  }

  globalThis.__neonPool = new Pool({
    connectionString,
    // Neon requires SSL; using the Node TLS stack. (rejectUnauthorized=false is common for Neon.)
    ssl: { rejectUnauthorized: false },
  });

  return globalThis.__neonPool;
}


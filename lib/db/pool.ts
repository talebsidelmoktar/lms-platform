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

  const rejectUnauthorized = resolvePgRejectUnauthorized();
  globalThis.__neonPool = new Pool({
    connectionString,
    // Prefer verifying TLS in production. Override via PG_SSL_REJECT_UNAUTHORIZED=false if needed.
    ssl: { rejectUnauthorized },
  });

  return globalThis.__neonPool;
}

function resolvePgRejectUnauthorized(): boolean {
  const raw = (process.env.PG_SSL_REJECT_UNAUTHORIZED ?? "").trim().toLowerCase();
  if (raw === "true") return true;
  if (raw === "false") return false;
  return process.env.NODE_ENV === "production";
}

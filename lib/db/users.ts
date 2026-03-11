import type { Tier } from "@/lib/constants";
import { getDbPool } from "@/lib/db/pool";

function normalizeTier(value: unknown): Tier {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "pro" || normalized === "ultra") return normalized;
  }
  return "free";
}

export async function getUserTierById(userId: string): Promise<Tier> {
  const pool = getDbPool();
  try {
    const result = await pool.query<{ tier: string | null }>(
      'select tier from "user" where id = $1 limit 1',
      [userId],
    );
    return normalizeTier(result.rows[0]?.tier ?? null);
  } catch (error) {
    // If the column doesn't exist yet, default to free without crashing the app.
    // 42703 = undefined_column
    if (
      typeof error === "object" &&
      error &&
      "code" in error &&
      (error as { code?: string }).code === "42703"
    ) {
      return "free";
    }
    throw error;
  }
}

export async function setUserTierById(
  userId: string,
  tier: Tier,
): Promise<void> {
  const pool = getDbPool();
  await pool.query('update "user" set tier = $2 where id = $1', [userId, tier]);
}


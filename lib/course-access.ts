import type { Tier } from "@/lib/constants";
import { getCurrentUserTier } from "@/lib/auth/server";
import { hasTierAccess } from "@/lib/user-tier";

/**
 * Check if the current user has access to content at the specified tier.
 * Prefers metadata tier and falls back to legacy Clerk plan checks.
 *
 * - Free content (or no tier specified): accessible to everyone
 * - Pro content: requires pro or ultra plan
 * - Ultra content: requires ultra plan
 */
export async function hasAccessToTier(
  requiredTier: Tier | null | undefined,
): Promise<boolean> {
  const userTier = await getCurrentUserTier();
  return hasTierAccess(userTier, requiredTier);
}

/**
 * Get the user's current subscription tier.
 */
export async function getUserTier(): Promise<Tier> {
  return getCurrentUserTier();
}

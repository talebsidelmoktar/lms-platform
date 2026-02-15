import { auth } from "@clerk/nextjs/server";
import type { Tier } from "@/lib/constants";
import { hasTierAccess, resolveTierFromSessionClaims } from "@/lib/user-tier";

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
  const { has, sessionClaims } = await auth();
  const metadataTier = resolveTierFromSessionClaims(sessionClaims);
  const userTier =
    metadataTier ??
    (has({ plan: "ultra" }) ? "ultra" : has({ plan: "pro" }) ? "pro" : "free");

  return hasTierAccess(userTier, requiredTier);
}

/**
 * Get the user's current subscription tier.
 */
export async function getUserTier(): Promise<Tier> {
  const { has, sessionClaims } = await auth();
  const metadataTier = resolveTierFromSessionClaims(sessionClaims);
  if (metadataTier) return metadataTier;

  if (has({ plan: "ultra" })) return "ultra";
  if (has({ plan: "pro" })) return "pro";
  return "free";
}

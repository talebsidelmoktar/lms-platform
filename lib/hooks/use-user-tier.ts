"use client";

import type { Tier } from "@/lib/constants";
import { useSupabaseUserTier } from "@/lib/auth/client";
import {
  hasTierAccess as checkTierAccess,
} from "@/lib/user-tier";

export function useUserTier(): Tier {
  return useSupabaseUserTier();
}

/**
 * Check if a user tier has access to content at the specified tier.
 *
 * - Free content (or no tier specified): accessible to everyone
 * - Pro content: requires pro or ultra plan
 * - Ultra content: requires ultra plan
 */
export function hasTierAccess(
  userTier: Tier,
  contentTier: Tier | null | undefined,
): boolean {
  return checkTierAccess(userTier, contentTier);
}

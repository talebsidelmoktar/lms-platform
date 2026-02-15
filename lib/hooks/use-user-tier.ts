"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import type { Tier } from "@/lib/constants";
import {
  hasTierAccess as checkTierAccess,
  resolveTierFromMetadata,
} from "@/lib/user-tier";

/**
 * Client-side hook to get the current user's subscription tier.
 * Prefers Clerk metadata tier and falls back to legacy plan checks.
 */
export function useUserTier(): Tier {
  const { isLoaded, user } = useUser();
  const { has } = useAuth();

  if (!isLoaded) return "free";

  const metadataTier = resolveTierFromMetadata(user?.publicMetadata);
  if (metadataTier) return metadataTier;

  // Backward-compatible fallback for existing Clerk billing plans.
  if (has?.({ plan: "ultra" })) return "ultra";
  if (has?.({ plan: "pro" })) return "pro";
  return "free";
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

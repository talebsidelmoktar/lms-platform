import type { Tier } from "@/lib/constants";

const VALID_TIERS: Tier[] = ["free", "pro", "ultra"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseTier(value: unknown): Tier | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.toLowerCase();
  return VALID_TIERS.includes(normalized as Tier) ? (normalized as Tier) : null;
}

export function resolveTierFromMetadata(metadata: unknown): Tier | null {
  if (!isRecord(metadata)) {
    return null;
  }

  return parseTier(metadata.tier);
}

export function resolveTierFromSessionClaims(
  sessionClaims: unknown,
): Tier | null {
  if (!isRecord(sessionClaims)) {
    return null;
  }

  const publicTier = resolveTierFromMetadata(sessionClaims.publicMetadata);
  if (publicTier) {
    return publicTier;
  }

  const privateTier = resolveTierFromMetadata(sessionClaims.metadata);
  if (privateTier) {
    return privateTier;
  }

  return parseTier(sessionClaims.tier);
}

export function resolveRoleFromSessionClaims(
  sessionClaims: unknown,
): string | null {
  if (!isRecord(sessionClaims)) {
    return null;
  }

  const publicMetadata = isRecord(sessionClaims.publicMetadata)
    ? sessionClaims.publicMetadata
    : null;
  const privateMetadata = isRecord(sessionClaims.metadata)
    ? sessionClaims.metadata
    : null;

  const rawRole =
    publicMetadata?.role ?? privateMetadata?.role ?? sessionClaims.role;
  return typeof rawRole === "string" ? rawRole : null;
}

export function hasTierAccess(
  userTier: Tier,
  contentTier: Tier | null | undefined,
): boolean {
  if (!contentTier || contentTier === "free") {
    return true;
  }

  if (contentTier === "ultra") {
    return userTier === "ultra";
  }

  if (contentTier === "pro") {
    return userTier === "pro" || userTier === "ultra";
  }

  return false;
}

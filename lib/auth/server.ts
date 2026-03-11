import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Tier } from "@/lib/constants";
import type { AppUser } from "./types";

function normalizeTier(value: string | null | undefined): Tier {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "pro" || normalized === "ultra") {
      return normalized;
    }
  }
  return "free";
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user ?? null;

  if (!user) return null;

  // This repo previously used Supabase `profiles` to store tier/role/avatar.
  // With Better Auth + Neon, keep a minimal mapping for now.
  return {
    id: user.id,
    email: (user as { email?: string | null }).email ?? null,
    phone: (user as { phoneNumber?: string | null }).phoneNumber ?? null,
    fullName: (user as { name?: string | null }).name ?? null,
    username: null,
    avatarUrl: (user as { image?: string | null }).image ?? null,
    tier: normalizeTier(null),
    role: null,
  };
}

export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

export async function getCurrentUserTier(): Promise<Tier> {
  const user = await getCurrentUser();
  return user?.tier ?? "free";
}

export async function getCurrentUserRole(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.role ?? null;
}

export async function requireCurrentUser(redirectTo = "/"): Promise<AppUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(redirectTo);
  }
  return user;
}

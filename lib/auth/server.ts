import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Tier } from "@/lib/constants";
import { getUserTierById } from "@/lib/db/users";
import type { AppUser } from "./types";

function parseCsvEnv(name: string): string[] {
  const raw = process.env[name];
  if (!raw) return [];
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function resolveAdminRole(user: { id?: string | null; email?: string | null }): string | null {
  const adminIds = new Set(parseCsvEnv("ADMIN_USER_IDS"));
  const adminEmails = new Set(parseCsvEnv("ADMIN_EMAILS").map((e) => e.toLowerCase()));

  const id = user.id ?? null;
  const email = (user.email ?? null)?.toLowerCase() ?? null;

  if (id && adminIds.has(id)) return "admin";
  if (email && adminEmails.has(email)) return "admin";
  return null;
}

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

  const tier = await getUserTierById(user.id).catch(() => "free" as Tier);

  return {
    id: user.id,
    email: (user as { email?: string | null }).email ?? null,
    phone: (user as { phoneNumber?: string | null }).phoneNumber ?? null,
    fullName: (user as { name?: string | null }).name ?? null,
    username: null,
    avatarUrl: (user as { image?: string | null }).image ?? null,
    tier,
    role: resolveAdminRole({
      id: user.id,
      email: (user as { email?: string | null }).email ?? null,
    }),
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

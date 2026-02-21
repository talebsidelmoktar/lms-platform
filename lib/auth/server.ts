import { redirect } from "next/navigation";
import type { Tier } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppUser } from "./types";

function normalizeTier(value: string | null | undefined): Tier {
  if (value === "pro" || value === "ultra") {
    return value;
  }
  return "free";
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  let { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username, avatar_url, tier, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email ?? null,
        phone: user.phone ?? null,
        full_name:
          (user.user_metadata?.full_name as string | undefined) ?? null,
        avatar_url:
          (user.user_metadata?.avatar_url as string | undefined) ?? null,
      },
      { onConflict: "id" },
    );

    const result = await supabase
      .from("profiles")
      .select("full_name, username, avatar_url, tier, role")
      .eq("id", user.id)
      .maybeSingle();
    profile = result.data;
  }

  return {
    id: user.id,
    email: user.email ?? null,
    phone: user.phone ?? null,
    fullName: (profile?.full_name as string | null | undefined) ?? null,
    username: (profile?.username as string | null | undefined) ?? null,
    avatarUrl: (profile?.avatar_url as string | null | undefined) ?? null,
    tier: normalizeTier((profile?.tier as string | null | undefined) ?? null),
    role: (profile?.role as string | null | undefined) ?? null,
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

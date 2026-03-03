"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import type { Tier } from "@/lib/constants";
import { supabaseBrowser } from "@/lib/supabase/client";

function normalizeTier(value: unknown): Tier {
  if (value === "pro" || value === "ultra") {
    return value;
  }
  return "free";
}

interface ProfileRow {
  tier: string | null;
  role: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export interface SupabaseProfile {
  tier: Tier;
  role: string | null;
  fullName: string | null;
  avatarUrl: string | null;
}

function mapProfileRow(row: ProfileRow | null | undefined): SupabaseProfile {
  return {
    tier: normalizeTier(row?.tier ?? null),
    role: row?.role ?? null,
    fullName: row?.full_name ?? null,
    avatarUrl: row?.avatar_url ?? null,
  };
}

export function useSupabaseSessionUser() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function syncUserFromAuth() {
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      const { data: userData } = await supabaseBrowser.auth.getUser();
      const resolvedUser = userData.user ?? sessionData.session?.user ?? null;

      if (!isMounted) return;
      setUser(resolvedUser);
      setIsLoaded(true);
    }

    syncUserFromAuth();

    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        if (!isMounted) return;
        setUser(null);
        setIsLoaded(true);
        return;
      }

      const { data: userData } = await supabaseBrowser.auth.getUser();
      const resolvedUser = userData.user ?? session?.user ?? null;

      if (!isMounted) return;
      setUser(resolvedUser);
      setIsLoaded(true);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { isLoaded, user };
}

export function useSupabaseProfile(
  user: User | null,
  isSessionLoaded: boolean,
) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [profile, setProfile] = useState<SupabaseProfile>(mapProfileRow(null));

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      if (!isSessionLoaded || !user) {
        if (isMounted) {
          setProfile(mapProfileRow(null));
          setIsLoaded(true);
        }
        return;
      }

      let { data } = await supabaseBrowser
        .from("profiles")
        .select("tier, role, full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle<ProfileRow>();

      if (!data) {
        await supabaseBrowser.from("profiles").upsert(
          {
            id: user.id,
            email: user.email ?? null,
            phone:
              user.phone ??
              (user.user_metadata?.phone as string | undefined) ??
              null,
            full_name:
              (user.user_metadata?.full_name as string | undefined) ?? null,
            avatar_url:
              (user.user_metadata?.avatar_url as string | undefined) ?? null,
          },
          { onConflict: "id" },
        );

        const result = await supabaseBrowser
          .from("profiles")
          .select("tier, role, full_name, avatar_url")
          .eq("id", user.id)
          .maybeSingle<ProfileRow>();
        data = result.data;
      }

      if (!isMounted) return;
      setProfile(mapProfileRow(data));
      setIsLoaded(true);
    }

    loadProfile();

    if (!user) {
      return () => {
        isMounted = false;
      };
    }

    const channel = supabaseBrowser
      .channel(`profile-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const next = (payload.new ?? null) as ProfileRow | null;
          if (!isMounted || !next) return;
          setProfile(mapProfileRow(next));
        },
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabaseBrowser.removeChannel(channel);
    };
  }, [isSessionLoaded, user]);

  return { isLoaded, profile };
}

export function useSupabaseUserTier(): Tier {
  const { isLoaded, user } = useSupabaseSessionUser();
  const { profile } = useSupabaseProfile(user, isLoaded);
  return profile.tier;
}

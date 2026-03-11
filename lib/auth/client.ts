"use client";

import { useEffect, useState } from "react";
import type { Tier } from "@/lib/constants";
import { getAuthClient } from "@/lib/better-auth/client";

export interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  phoneNumber?: string | null;
}

export interface SupabaseProfile {
  tier: Tier;
  role: string | null;
  fullName: string | null;
  avatarUrl: string | null;
}

function normalizeTier(value: unknown): Tier {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "pro" || normalized === "ultra") return normalized;
  }
  return "free";
}

function mapProfileFromUser(user: SessionUser | null): SupabaseProfile {
  return {
    tier: normalizeTier(null),
    role: null,
    fullName: user?.name ?? null,
    avatarUrl: user?.image ?? null,
  };
}

// Kept for compatibility with existing components.
export function useSupabaseSessionUser() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const authClient = getAuthClient();
        const result = await authClient.getSession();
        if (result.error) {
          throw new Error(result.error.message);
        }
        const nextUser = (result.data?.user ?? null) as SessionUser | null;
        if (!isMounted) return;
        setUser(nextUser);
      } catch {
        if (!isMounted) return;
        setUser(null);
      } finally {
        if (!isMounted) return;
        setIsLoaded(true);
      }
    }

    loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  return { isLoaded, user };
}

// Kept for compatibility with existing components.
export function useSupabaseProfile(user: SessionUser | null, isSessionLoaded: boolean) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [profile, setProfile] = useState<SupabaseProfile>(mapProfileFromUser(null));

  useEffect(() => {
    if (!isSessionLoaded) return;
    setProfile(mapProfileFromUser(user));
    setIsLoaded(true);
  }, [isSessionLoaded, user]);

  return { isLoaded, profile };
}

export function useSupabaseUserTier(): Tier {
  const { isLoaded, user } = useSupabaseSessionUser();
  const { profile } = useSupabaseProfile(user, isLoaded);
  return profile.tier;
}

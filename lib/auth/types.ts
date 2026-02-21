import type { Tier } from "@/lib/constants";

export interface AppUser {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  username: string | null;
  avatarUrl: string | null;
  tier: Tier;
  role: string | null;
}


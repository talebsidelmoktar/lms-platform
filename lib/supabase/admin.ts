import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "./env";

export function createSupabaseAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey || serviceRoleKey.trim().length === 0) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY for privileged Supabase operations.",
    );
  }

  return createClient(getSupabaseUrl(), serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}


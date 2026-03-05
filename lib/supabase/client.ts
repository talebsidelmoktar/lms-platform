"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? undefined;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? undefined;

  if (!url || !anon) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY for browser Supabase client.",
    );
  }

  return createBrowserClient(url, anon, {
    auth: {
      flowType: "pkce",
      detectSessionInUrl: true,
    },
  });
}

export const supabaseBrowser = createSupabaseBrowserClient();

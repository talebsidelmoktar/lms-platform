function assertValue(value: string | undefined, message: string): string {
  if (!value || value.trim().length === 0) {
    throw new Error(message);
  }
  return value;
}

export function getSupabaseUrl(): string {
  return assertValue(
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
    "Missing environment variable: SUPABASE_URL (server) or NEXT_PUBLIC_SUPABASE_URL (browser)",
  );
}

export function getSupabaseAnonKey(): string {
  return assertValue(
    process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "Missing environment variable: SUPABASE_ANON_KEY (server) or NEXT_PUBLIC_SUPABASE_ANON_KEY (browser)",
  );
}


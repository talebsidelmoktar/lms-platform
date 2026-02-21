import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

export function createSupabaseMiddlewareClient(req: NextRequest) {
  let res = NextResponse.next();

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (cookiesToSet: { name: string; value: string; options?: object }[]) => {
        for (const { name, value, options } of cookiesToSet) {
          res.cookies.set(name, value, options);
        }
      },
    },
  });

  return { supabase, getResponse: () => res, setResponse: (r: NextResponse) => (res = r) };
}

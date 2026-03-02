import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getSafeNextPath(rawNext: string | null): string {
  if (!rawNext) return "/dashboard";
  if (!rawNext.startsWith("/")) return "/dashboard";
  if (rawNext.startsWith("//")) return "/dashboard";
  return rawNext;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeNextPath(requestUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServerClient({ canSetCookies: true });
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}

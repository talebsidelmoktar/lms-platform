import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getSafeNextPath(rawNext: string | null): string {
  if (!rawNext) return "/";
  if (!rawNext.startsWith("/")) return "/";
  if (rawNext.startsWith("//")) return "/";
  return rawNext;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const next = getSafeNextPath(requestUrl.searchParams.get("next"));

  const supabase = await createSupabaseServerClient({ canSetCookies: true });
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}

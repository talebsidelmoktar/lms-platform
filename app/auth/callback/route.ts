import type { EmailOtpType } from "@supabase/supabase-js";
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

  // Better Auth OAuth callback endpoint is `/api/auth/callback/:provider`.
  // If Google (or any IdP) is redirecting here, forward it so Better Auth can
  // validate the state, create the user/session in Neon, and then redirect to
  // the original `callbackURL`.
  const state = requestUrl.searchParams.get("state");
  const oauthCode = requestUrl.searchParams.get("code");
  // Better Auth OAuth callback always includes a `state` parameter.
  // Supabase callbacks do not, so this is a safe discriminator.
  if (state && oauthCode) {
    console.info("[auth/callback] Forwarding OAuth callback to Better Auth");
    const forward = new URL("/api/auth/callback/google", requestUrl.origin);
    forward.search = requestUrl.search; // preserve state/code/etc
    return NextResponse.redirect(forward);
  }

  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const next = getSafeNextPath(requestUrl.searchParams.get("next"));

  const supabase = await createSupabaseServerClient({ canSetCookies: true });

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  } else if (tokenHash && type) {
    await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}

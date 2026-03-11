import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/auth";

function getSafeNextPath(rawNext: string | null): string {
  if (!rawNext) return "/";
  if (!rawNext.startsWith("/")) return "/";
  if (rawNext.startsWith("//")) return "/";
  return rawNext;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const next = getSafeNextPath(requestUrl.searchParams.get("next"));
  
  await auth.api.signOut({ headers: await headers() });

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}

import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import type { NextRequest } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";

const LOCALE_PATTERN = /^\/(en|fr|ar)(?=\/|$)/;

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const localeMatch = pathname.match(LOCALE_PATTERN);
  const locale = localeMatch?.[1] ?? null;
  const pathWithoutLocale = pathname.replace(LOCALE_PATTERN, "") || "/";
  const isProtectedRoute = /^(\/dashboard|\/lessons|\/admin)(\/|$)/.test(
    pathWithoutLocale,
  );
  const isAuthRoute = /^(\/login)(\/|$)/.test(pathWithoutLocale);

  const { supabase, getResponse } = createSupabaseMiddlewareClient(req);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtectedRoute && !user) {
    const homeUrl = req.nextUrl.clone();
    homeUrl.pathname = locale ? `/${locale}` : "/";
    return NextResponse.redirect(homeUrl);
  }

  if (isAuthRoute && user) {
    const dashboardUrl = req.nextUrl.clone();
    dashboardUrl.pathname = locale ? `/${locale}/dashboard` : "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  if (localeMatch) {
    const rewriteUrl = req.nextUrl.clone();
    rewriteUrl.pathname = pathWithoutLocale;

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-locale", locale);

    const response = NextResponse.rewrite(rewriteUrl, {
      request: { headers: requestHeaders },
    });
    response.cookies.set("academy-language", locale, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
    const supabaseResponse = getResponse();
    for (const cookie of supabaseResponse.cookies.getAll()) {
      response.cookies.set(cookie.name, cookie.value, cookie);
    }
    return response;
  }

  const cookieLocale = req.cookies.get("academy-language")?.value;
  const effectiveLocale = routing.locales.includes(
    cookieLocale as (typeof routing.locales)[number],
  )
    ? (cookieLocale as (typeof routing.locales)[number])
    : routing.defaultLocale;

  if (effectiveLocale !== routing.defaultLocale && pathname !== "/") {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = `/${effectiveLocale}${pathname}`;
    return NextResponse.redirect(redirectUrl);
  }

  return getResponse();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

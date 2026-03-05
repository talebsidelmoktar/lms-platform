import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";

const LOCALE_PATTERN = /^\/(en|fr|ar)(?=\/|$)/;

export default async function proxy(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;
    const localeMatch = pathname.match(LOCALE_PATTERN);
    const locale = localeMatch?.[1] ?? null;
    const pathWithoutLocale = pathname.replace(LOCALE_PATTERN, "") || "/";
    const isStudioRoute = /^(\/studio)(\/|$)/.test(pathWithoutLocale);
    const isProtectedRoute = /^(\/dashboard|\/lessons|\/admin)(\/|$)/.test(
      pathWithoutLocale,
    );
    const isAuthRoute = /^(\/login)(\/|$)/.test(pathWithoutLocale);

    let getResponse = () => NextResponse.next();
    let user: unknown = null;
    const withSupabaseCookies = (response: NextResponse) => {
      const supabaseResponse = getResponse();
      for (const cookie of supabaseResponse.cookies.getAll()) {
        const { name, value, ...options } = cookie;
        response.cookies.set(name, value, options);
      }
      return response;
    };

    // Keep Sanity Studio isolated from app auth middleware to avoid 500s
    // when Studio is accessed on deployments with different auth env/config.
    if (!isStudioRoute) {
      const middleware = createSupabaseMiddlewareClient(req);
      getResponse = middleware.getResponse;
      const result = await middleware.supabase.auth.getUser();
      user = result.data.user;
    }

    if (isProtectedRoute && !user) {
      const homeUrl = req.nextUrl.clone();
      homeUrl.pathname = locale ? `/${locale}` : "/";
      return withSupabaseCookies(NextResponse.redirect(homeUrl));
    }

    if (isAuthRoute && user) {
      const dashboardUrl = req.nextUrl.clone();
      dashboardUrl.pathname = locale ? `/${locale}/dashboard` : "/dashboard";
      return withSupabaseCookies(NextResponse.redirect(dashboardUrl));
    }

    if (localeMatch) {
      const localeStr = localeMatch[1];
      const rewriteUrl = req.nextUrl.clone();
      rewriteUrl.pathname = pathWithoutLocale;

      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-locale", localeStr);

      const response = NextResponse.rewrite(rewriteUrl, {
        request: { headers: requestHeaders },
      });
      response.cookies.set("academy-language", localeStr, {
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
      });
      return withSupabaseCookies(response);
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
      return withSupabaseCookies(NextResponse.redirect(redirectUrl));
    }

    return getResponse();
  } catch (error) {
    console.error("[proxy] Error:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Internal Server Error",
        message:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

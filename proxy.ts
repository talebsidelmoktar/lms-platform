import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

const LOCALE_PATTERN = /^\/(en|fr|ar)(?=\/|$)/;

export default async function proxy(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;
    const hasOAuthCode = req.nextUrl.searchParams.has("code");
    const hasOtpToken =
      req.nextUrl.searchParams.has("token_hash") &&
      req.nextUrl.searchParams.has("type");
    const localeMatch = pathname.match(LOCALE_PATTERN);
    const locale = localeMatch?.[1] ?? null;
    const pathWithoutLocale = pathname.replace(LOCALE_PATTERN, "") || "/";
    const isStudioRoute = /^(\/studio)(\/|$)/.test(pathWithoutLocale);
    const isApiRoute = /^(\/api)(\/|$)/.test(pathWithoutLocale);
    const isBetterAuthRoute = /^(\/api\/auth)(\/|$)/.test(pathWithoutLocale);

    // Some OAuth providers can bounce back to "/" with code params.
    // Ensure those requests always hit the dedicated callback handler.
    if (
      pathWithoutLocale !== "/auth/callback" &&
      (hasOAuthCode || hasOtpToken) &&
      // Never rewrite/redirect Better Auth API routes, especially the OAuth callback.
      // Otherwise we create an infinite loop:
      // /api/auth/callback/google -> /auth/callback -> /api/auth/callback/google -> ...
      !isBetterAuthRoute &&
      // Keep API routes stable; only redirect browser/page navigations.
      !isApiRoute
    ) {
      const callbackUrl = req.nextUrl.clone();
      callbackUrl.pathname = locale
        ? `/${locale}/auth/callback`
        : "/auth/callback";
      if (!callbackUrl.searchParams.has("next")) {
        callbackUrl.searchParams.set(
          "next",
          locale ? `/${locale}/dashboard` : "/dashboard",
        );
      }
      return NextResponse.redirect(callbackUrl);
    }

    // Supabase middleware protection was previously used here. This project now
    // uses Better Auth (Node.js runtime) which can't be checked from Edge middleware.
    // Route protection is enforced by server components (e.g. requireCurrentUser()).
    const withSupabaseCookies = (response: NextResponse) => response;
    if (isStudioRoute) return NextResponse.next();

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

    return NextResponse.next();
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

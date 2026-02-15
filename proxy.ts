import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

const LOCALE_PATTERN = /^\/(en|fr|ar)(?=\/|$)/;

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  const localeMatch = pathname.match(LOCALE_PATTERN);
  const pathWithoutLocale = pathname.replace(LOCALE_PATTERN, "") || "/";
  const isProtectedRoute = /^(\/dashboard|\/lessons|\/admin)(\/|$)/.test(
    pathWithoutLocale,
  );

  if (isProtectedRoute) {
    await auth.protect();
  }

  if (localeMatch) {
    const locale = localeMatch[1];
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

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

import { authHandler } from "@/auth";

export const runtime = "nodejs";

const AUTH_DEBUG =
  process.env.NODE_ENV === "development" ||
  (process.env.BETTER_AUTH_DEBUG ?? "").toLowerCase() === "true";

async function logAuthResponse(req: Request, res: Response) {
  if (!AUTH_DEBUG) return;
  try {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path.includes("/api/auth/sign-in/social")) {
      const location = res.headers.get("location") ?? undefined;
      let providerAuthUrl: string | undefined = location;
      if (!providerAuthUrl) {
        try {
          // When `disableRedirect: true`, Better Auth may return the provider URL in the body.
          const contentType = res.headers.get("content-type") ?? "";
          if (contentType.includes("application/json")) {
            const body = (await res
              .clone()
              .json()
              .catch(() => null)) as unknown;
            if (body && typeof body === "object") {
              const candidate =
                ("url" in body && typeof (body as { url?: unknown }).url === "string"
                  ? (body as { url: string }).url
                  : undefined) ??
                ("location" in body &&
                typeof (body as { location?: unknown }).location === "string"
                  ? (body as { location: string }).location
                  : undefined) ??
                ("redirectUrl" in body &&
                typeof (body as { redirectUrl?: unknown }).redirectUrl === "string"
                  ? (body as { redirectUrl: string }).redirectUrl
                  : undefined);
              providerAuthUrl = candidate;
            }
          }
        } catch {
          // ignore
        }
      }

      let redirectUri: string | undefined;
      if (providerAuthUrl) {
        try {
          const providerUrl = new URL(providerAuthUrl);
          redirectUri = providerUrl.searchParams.get("redirect_uri") ?? undefined;
        } catch {
          // ignore
        }
      }
      console.info("[better-auth] sign-in/social ->", {
        status: res.status,
        location,
        providerAuthUrl,
        redirectUri,
      });
    }

    if (path.includes("/api/auth/callback/")) {
      console.info("[better-auth] oauth callback ->", {
        path,
        status: res.status,
        location: res.headers.get("location") ?? undefined,
        hasCookieHeader: Boolean(req.headers.get("cookie")),
      });
    }
  } catch {
    // ignore
  }
}

export async function GET(req: Request) {
  const res = await authHandler.GET(req);
  await logAuthResponse(req, res);
  return res;
}

export async function POST(req: Request) {
  // Log non-sensitive bits of the request body for debugging.
  if (AUTH_DEBUG) {
    try {
      const url = new URL(req.url);
      if (url.pathname.includes("/api/auth/sign-in/social")) {
        const cloned = req.clone();
        const body = await cloned.json().catch(() => null);
        if (body && typeof body === "object") {
          console.info("[better-auth] sign-in/social request", {
            provider: body.provider,
            callbackURL: body.callbackURL,
            disableRedirect: body.disableRedirect,
          });
        }
      }
    } catch {
      // ignore
    }
  }

  const res = await authHandler.POST(req);
  await logAuthResponse(req, res);
  return res;
}

import { authHandler } from "@/auth";

export const runtime = "nodejs";

async function logAuthResponse(req: Request, res: Response) {
  try {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path.includes("/api/auth/sign-in/social")) {
      console.info("[better-auth] sign-in/social ->", {
        status: res.status,
        location: res.headers.get("location") ?? undefined,
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

  const res = await authHandler.POST(req);
  await logAuthResponse(req, res);
  return res;
}

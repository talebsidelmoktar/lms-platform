import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserTierById } from "@/lib/db/users";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  const user = session?.user ?? null;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tier = await getUserTierById(user.id);
  return NextResponse.json({ tier });
}


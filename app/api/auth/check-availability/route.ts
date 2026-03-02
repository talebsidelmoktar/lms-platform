import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

interface AvailabilityBody {
  email?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AvailabilityBody;
    const email = body.email?.trim().toLowerCase() ?? "";

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }

    const supabaseAdmin = createSupabaseAdminClient();
    const { count, error } = await supabaseAdmin
      .from("profiles")
      .select("id", { head: true, count: "exact" })
      .ilike("email", email);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      emailExists: (count ?? 0) > 0,
      phoneExists: false,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to check availability.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

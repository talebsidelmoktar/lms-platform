import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

interface AvailabilityBody {
  email?: string;
  phone?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AvailabilityBody;
    const email = body.email?.trim().toLowerCase() ?? "";
    const phone = body.phone?.trim() ?? "";

    if (!email && !phone) {
      return NextResponse.json(
        { error: "At least one of email or phone is required." },
        { status: 400 },
      );
    }

    const supabaseAdmin = createSupabaseAdminClient();

    const emailQuery = email
      ? supabaseAdmin
          .from("profiles")
          .select("id", { head: true, count: "exact" })
          .ilike("email", email)
      : Promise.resolve({ count: 0, error: null });

    const phoneQuery = phone
      ? supabaseAdmin
          .from("profiles")
          .select("id", { head: true, count: "exact" })
          .eq("phone", phone)
      : Promise.resolve({ count: 0, error: null });

    const [emailResult, phoneResult] = await Promise.all([emailQuery, phoneQuery]);

    if (emailResult.error) {
      return NextResponse.json({ error: emailResult.error.message }, { status: 500 });
    }

    if (phoneResult.error) {
      return NextResponse.json({ error: phoneResult.error.message }, { status: 500 });
    }

    return NextResponse.json({
      emailExists: (emailResult.count ?? 0) > 0,
      phoneExists: (phoneResult.count ?? 0) > 0,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to check availability.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


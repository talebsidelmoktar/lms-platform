"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, getCurrentUserId, getCurrentUserRole } from "@/lib/auth/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { writeClient } from "@/sanity/lib/client";

type RequestTier = "pro" | "ultra";
type ReviewStatus = "approved" | "rejected";

interface ActionResult {
  success: boolean;
  error?: string;
}

const VALID_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

function isRequestedTier(value: string): value is RequestTier {
  return value === "pro" || value === "ultra";
}

function assertSanityWriteToken(): string | null {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  return token && token.trim().length > 0 ? token : null;
}

export async function submitPaymentRequest(
  formData: FormData,
): Promise<ActionResult> {
  if (!assertSanityWriteToken()) {
    return {
      success: false,
      error:
        "Server configuration error: SANITY_API_WRITE_TOKEN is missing. Ask admin to configure a write token.",
    };
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return {
      success: false,
      error: "You must be signed in to submit a request.",
    };
  }

  const requestedTierRaw =
    `${formData.get("requestedTier") ?? ""}`.toLowerCase();
  if (!isRequestedTier(requestedTierRaw)) {
    return { success: false, error: "Please select Pro or Ultra." };
  }

  const file = formData.get("proofImage") as File | null;
  if (!file) {
    return {
      success: false,
      error: "Please upload a payment proof screenshot.",
    };
  }

  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    return {
      success: false,
      error: "Invalid image type. Use PNG, JPG, GIF, or WebP.",
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      success: false,
      error: "Image is too large. Maximum allowed size is 10MB.",
    };
  }

  try {
    const pendingCount = await writeClient.fetch<number>(
      `count(*[_type == "paymentRequest" && clerkUserId == $userId && status == "pending"])`,
      { userId },
    );

    if (pendingCount > 0) {
      return {
        success: false,
        error: "You already have a pending request. Wait for admin review.",
      };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadedAsset = await writeClient.assets.upload("image", buffer, {
      filename: file.name,
      contentType: file.type,
    });

    const user = await getCurrentUser();
    const paymentMethod = `${formData.get("paymentMethod") ?? ""}`.trim();
    const referenceId = `${formData.get("referenceId") ?? ""}`.trim();
    const notes = `${formData.get("notes") ?? ""}`.trim();

    await writeClient.create({
      _type: "paymentRequest",
      clerkUserId: userId,
      userEmail: user?.email ?? null,
      userName: user?.fullName ?? user?.username ?? null,
      requestedTier: requestedTierRaw,
      paymentMethod: paymentMethod || null,
      referenceId: referenceId || null,
      notes: notes || null,
      proofImage: {
        _type: "image",
        asset: { _type: "reference", _ref: uploadedAsset._id },
      },
      status: "pending",
      submittedAt: new Date().toISOString(),
    });

    revalidatePath("/pricing");
    revalidatePath("/admin/payment-requests");

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to submit payment request.";
    console.error("submitPaymentRequest error:", error);
    return { success: false, error: message };
  }
}

export async function reviewPaymentRequest(
  requestId: string,
  status: ReviewStatus,
  reviewNotes?: string,
): Promise<ActionResult> {
  if (!assertSanityWriteToken()) {
    return {
      success: false,
      error:
        "Server configuration error: SANITY_API_WRITE_TOKEN is missing. Ask admin to configure a write token.",
    };
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    return { success: false, error: "Unauthorized." };
  }

  const role = await getCurrentUserRole();
  if (role !== "admin") {
    return { success: false, error: "Only admins can review requests." };
  }

  try {
    const request = await writeClient.fetch<{
      _id: string;
      clerkUserId: string;
      requestedTier: RequestTier;
      status: "pending" | "approved" | "rejected";
    } | null>(
      `*[_type == "paymentRequest" && _id == $requestId][0]{
        _id,
        clerkUserId,
        requestedTier,
        status
      }`,
      { requestId },
    );

    if (!request) {
      return { success: false, error: "Payment request not found." };
    }

    if (request.status !== "pending") {
      return {
        success: false,
        error: "This request has already been reviewed.",
      };
    }

    if (status === "approved") {
      const adminSupabase = createSupabaseAdminClient();
      const { error: profileUpdateError } = await adminSupabase
        .from("profiles")
        .update({ tier: request.requestedTier })
        .eq("id", request.clerkUserId);
      if (profileUpdateError) {
        throw profileUpdateError;
      }
    }

    await writeClient
      .patch(requestId)
      .set({
        status,
        reviewNotes: reviewNotes?.trim() || null,
        reviewedAt: new Date().toISOString(),
        reviewedBy: userId,
      })
      .commit();

    revalidatePath("/admin/payment-requests");
    revalidatePath("/pricing");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to review payment request.";
    console.error("reviewPaymentRequest error:", error);
    return { success: false, error: message };
  }
}

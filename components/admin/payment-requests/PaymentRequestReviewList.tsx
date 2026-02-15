"use client";

import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { reviewPaymentRequest } from "@/lib/actions/payment-requests";

type PaymentRequestStatus = "pending" | "approved" | "rejected";

export interface PaymentRequestItem {
  _id: string;
  clerkUserId: string;
  userEmail?: string | null;
  userName?: string | null;
  requestedTier: "pro" | "ultra";
  paymentMethod?: string | null;
  referenceId?: string | null;
  notes?: string | null;
  status: PaymentRequestStatus;
  reviewNotes?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  submittedAt: string;
  proofImage?: {
    asset?: {
      url?: string;
    };
  };
}

const STATUS_STYLES: Record<PaymentRequestStatus, string> = {
  pending: "text-amber-300 bg-amber-500/10 border-amber-500/30",
  approved: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
  rejected: "text-red-300 bg-red-500/10 border-red-500/30",
};

export function PaymentRequestReviewList({
  initialRequests,
}: {
  initialRequests: PaymentRequestItem[];
}) {
  const t = useTranslations("dashboard.admin.paymentRequests");
  const locale = useLocale();
  const [requests, setRequests] = useState(initialRequests);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const updateStatus = (requestId: string, status: PaymentRequestStatus) => {
    setRequests((prev) =>
      prev.map((request) =>
        request._id === requestId
          ? {
              ...request,
              status,
              reviewNotes: reviewNotes[requestId] || null,
              reviewedAt: new Date().toISOString(),
            }
          : request,
      ),
    );
  };

  const review = (requestId: string, status: "approved" | "rejected") => {
    const notes = reviewNotes[requestId] ?? "";
    setResult(null);

    startTransition(async () => {
      const response = await reviewPaymentRequest(requestId, status, notes);

      if (!response.success) {
        setResult(response.error ?? t("failedToReview"));
        return;
      }

      updateStatus(requestId, status);
    });
  };

  return (
    <div className="space-y-4">
      {result && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-300 text-sm">
          {result}
        </div>
      )}

      {requests.length === 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-8 text-center text-zinc-400">
          {t("empty")}
        </div>
      )}

      {requests.map((request) => {
        const imageUrl = request.proofImage?.asset?.url;
        return (
          <div
            key={request._id}
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[request.status]}`}
              >
                {request.status === "pending" && (
                  <Clock3 className="w-3 h-3 mr-1" />
                )}
                {request.status === "approved" && (
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                )}
                {request.status === "rejected" && (
                  <XCircle className="w-3 h-3 mr-1" />
                )}
                {t(`status.${request.status}`)}
              </span>
              <span className="text-xs text-zinc-500">
                {t("submittedAt", {
                  value: new Date(request.submittedAt).toLocaleString(locale),
                })}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 text-sm">
                <p className="text-zinc-300">
                  <span className="text-zinc-500">{t("user")}:</span>{" "}
                  {request.userName || t("unknown")} (
                  {request.userEmail || t("noEmail")})
                </p>
                <p className="text-zinc-300">
                  <span className="text-zinc-500">{t("clerkId")}:</span>{" "}
                  {request.clerkUserId}
                </p>
                <p className="text-zinc-300 capitalize">
                  <span className="text-zinc-500">{t("requestedTier")}:</span>{" "}
                  {request.requestedTier}
                </p>
                {request.paymentMethod && (
                  <p className="text-zinc-300">
                    <span className="text-zinc-500">{t("method")}:</span>{" "}
                    {request.paymentMethod}
                  </p>
                )}
                {request.referenceId && (
                  <p className="text-zinc-300">
                    <span className="text-zinc-500">{t("reference")}:</span>{" "}
                    {request.referenceId}
                  </p>
                )}
                {request.notes && (
                  <p className="text-zinc-300">
                    <span className="text-zinc-500">{t("notes")}:</span>{" "}
                    {request.notes}
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-zinc-700 bg-zinc-950 p-2 min-h-[180px] relative">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={t("proofAlt")}
                    fill
                    className="object-contain rounded"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-zinc-500">
                    {t("noScreenshot")}
                  </div>
                )}
              </div>
            </div>

            {request.status === "pending" && (
              <div className="space-y-3">
                <Textarea
                  rows={2}
                  value={reviewNotes[request._id] ?? ""}
                  onChange={(event) =>
                    setReviewNotes((prev) => ({
                      ...prev,
                      [request._id]: event.target.value,
                    }))
                  }
                  placeholder={t("reviewNotePlaceholder")}
                  className="bg-zinc-900 border-zinc-700 text-white"
                />
                <div className="flex items-center gap-2">
                  <Button
                    disabled={isPending}
                    onClick={() => review(request._id, "approved")}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    {t("approve")}
                  </Button>
                  <Button
                    disabled={isPending}
                    variant="outline"
                    onClick={() => review(request._id, "rejected")}
                    className="border-red-500/50 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                  >
                    {t("reject")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { AlertCircle, CheckCircle2, Upload, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { getPathname } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitPaymentRequest } from "@/lib/actions/payment-requests";

type RequestTier = "pro" | "ultra";

export function ManualUpgradeRequest() {
  const locale = useLocale();
  const t = useTranslations("common.pricing.manualRequest");
  const tiersT = useTranslations("common.tiers");
  const [isOpen, setIsOpen] = useState(false);
  const [requestedTier, setRequestedTier] = useState<RequestTier>("pro");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [notes, setNotes] = useState("");
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();
  const tierPriceLabel = useMemo(
    () => ({
      pro: "400 MRU",
      ultra: "600 MRU",
    }),
    [],
  );

  const fileName = useMemo(() => proofImage?.name ?? "", [proofImage]);

  const resetForm = () => {
    setPaymentMethod("");
    setReferenceId("");
    setNotes("");
    setProofImage(null);
  };

  const onSubmit = () => {
    setResult(null);

    if (!proofImage) {
      setResult({
        ok: false,
        message: t("errors.uploadProofFirst"),
      });
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("requestedTier", requestedTier);
      formData.append("paymentMethod", paymentMethod);
      formData.append("referenceId", referenceId);
      formData.append("notes", notes);
      formData.append("proofImage", proofImage);

      const response = await submitPaymentRequest(formData);

      if (!response.success) {
        setResult({
          ok: false,
          message: response.error ?? t("errors.submitFailed"),
        });
        return;
      }

      setResult({
        ok: true,
        message: t("success"),
      });
      resetForm();
      setIsOpen(false);
      window.location.href = getPathname({
        href: "/pricing/submitted",
        locale,
      });
    });
  };

  return (
    <>
      <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-6 md:p-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            {t("title")}
          </h2>
          <p className="text-zinc-400 mb-6">{t("description")}</p>
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white border-0"
          >
            {t("openButton")}
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-label={t("closeModal")}
          />
          <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-700 bg-zinc-950 p-6 md:p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 rounded-md p-1 text-zinc-400 hover:text-white hover:bg-zinc-800"
              aria-label={t("close")}
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-semibold text-white mb-6">
              {t("modalTitle")}
            </h3>

            <div className="space-y-4">
              <div>
                <Label className="text-zinc-300">{t("requestedTier")}</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={requestedTier === "pro" ? "default" : "outline"}
                    onClick={() => setRequestedTier("pro")}
                    className={
                      requestedTier === "pro"
                        ? "bg-sky-600 hover:bg-sky-500"
                        : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                    }
                  >
                    {tiersT("pro")} · {tierPriceLabel.pro}
                  </Button>
                  <Button
                    type="button"
                    variant={requestedTier === "ultra" ? "default" : "outline"}
                    onClick={() => setRequestedTier("ultra")}
                    className={
                      requestedTier === "ultra"
                        ? "bg-blue-600 hover:bg-blue-500"
                        : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                    }
                  >
                    {tiersT("ultra")} · {tierPriceLabel.ultra}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="paymentMethod" className="text-zinc-300">
                  {t("paymentMethod")}
                </Label>
                <Input
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  placeholder={t("paymentMethodPlaceholder")}
                  className="mt-2 bg-zinc-900 border-zinc-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="referenceId" className="text-zinc-300">
                  {t("referenceId")}
                </Label>
                <Input
                  id="referenceId"
                  value={referenceId}
                  onChange={(event) => setReferenceId(event.target.value)}
                  placeholder={t("referenceIdPlaceholder")}
                  className="mt-2 bg-zinc-900 border-zinc-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="notes" className="text-zinc-300">
                  {t("notes")}
                </Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder={t("notesPlaceholder")}
                  className="mt-2 bg-zinc-900 border-zinc-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="proofImage" className="text-zinc-300">
                  {t("proofImage")}
                </Label>
                <label
                  htmlFor="proofImage"
                  className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-600 bg-zinc-900/70 p-4 text-zinc-300 cursor-pointer hover:border-sky-500/50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{fileName || t("chooseImage")}</span>
                </label>
                <input
                  id="proofImage"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(event) =>
                    setProofImage(event.target.files?.[0] ?? null)
                  }
                />
              </div>

              {result && (
                <div
                  className={`rounded-lg border p-3 text-sm ${
                    result.ok
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-red-500/30 bg-red-500/10 text-red-300"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {result.ok ? (
                      <CheckCircle2 className="w-4 h-4 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mt-0.5" />
                    )}
                    <span>{result.message}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                >
                  {t("close")}
                </Button>
                <Button
                  type="button"
                  disabled={isPending}
                  onClick={onSubmit}
                  className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white"
                >
                  {isPending ? t("submitting") : t("submit")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

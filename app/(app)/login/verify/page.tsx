"use client";

import { ArrowLeft, MailCheck, ShieldCheck, Smartphone } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPathname } from "@/i18n/navigation";
import { getAuthClient } from "@/lib/better-auth/client";

export default function VerifyPage() {
  const locale = useLocale();
  const t = useTranslations("auth.login");
  const params = useSearchParams();
  const method = params.get("method");
  const email = params.get("email")?.trim() ?? "";
  const phone = params.get("phone")?.trim() ?? "";

  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function redirectToDashboard() {
    const dashboardPath = getPathname({ href: "/dashboard", locale });
    window.location.href = dashboardPath;
  }

  function normalizeMrPhone(raw: string): string {
    const digits = raw.replace(/[^\d]/g, "");
    if (digits.startsWith("222") && digits.length === 11) return digits.slice(3);
    return digits;
  }

  async function onVerifyPhoneOtp(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);
    setError(null);
    setIsSubmitting(true);

    try {
      const token = otp.trim();
      const normalizedPhone = normalizeMrPhone(phone);
      if (!normalizedPhone) throw new Error(t("errors.phoneRequiredForOtp"));
      if (!token) throw new Error(t("phone.otpPlaceholder"));

      const authClient = getAuthClient();
      const result = await authClient.phoneNumber.verify({
        phoneNumber: normalizedPhone,
        code: token,
      });

      if (result.error) throw new Error(result.error.message);
      redirectToDashboard();
    } catch (err) {
      const message = err instanceof Error ? err.message : t("errors.generic");
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onResendEmail() {
    setNotice(null);
    setError(null);
    setIsSubmitting(true);

    try {
      if (!email) throw new Error(t("errors.emailRequiredForPasswordAuth"));
      throw new Error(
        "Email verification is not configured for Better Auth in this project.",
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : t("errors.generic");
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isPhoneVerification = method === "phone";

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-hidden">
      <main className="relative z-10 px-6 lg:px-12 py-16 max-w-7xl mx-auto">
        <div className="max-w-md mx-auto rounded-2xl bg-zinc-900/40 border border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-600/30">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                {isPhoneVerification
                  ? t("verify.phoneTitle")
                  : t("verify.emailTitle")}
              </h1>
              <p className="text-sm text-zinc-400">{t("verify.subtitle")}</p>
            </div>
          </div>

          {isPhoneVerification ? (
            <form onSubmit={onVerifyPhoneOtp} className="space-y-4">
              <div className="rounded-lg border border-sky-500/20 bg-sky-500/10 p-3 text-sm text-sky-200 flex items-start gap-2">
                <Smartphone className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{t("verify.phoneHint", { phone })}</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp">{t("phone.otpLabel")}</Label>
                <Input
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder={t("phone.otpPlaceholder")}
                  inputMode="numeric"
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white border-0 shadow-lg shadow-sky-600/25"
              >
                {isSubmitting ? t("phone.verifying") : t("phone.verify")}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-sky-500/20 bg-sky-500/10 p-3 text-sm text-sky-200 flex items-start gap-2">
                <MailCheck className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{t("verify.emailHint", { email })}</span>
              </div>
              <Button
                type="button"
                disabled={isSubmitting || !email}
                onClick={onResendEmail}
                className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white border-0 shadow-lg shadow-sky-600/25"
              >
                {isSubmitting ? t("email.submitting") : t("verify.resendEmail")}
              </Button>
            </div>
          )}

          {notice && (
            <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              {notice}
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="mt-6">
            <Link
              href={getPathname({ href: "/login", locale })}
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("verify.backToLogin")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

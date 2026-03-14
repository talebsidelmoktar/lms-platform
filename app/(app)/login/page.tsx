"use client";

import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPathname, Link } from "@/i18n/navigation";
import { getAuthClient } from "@/lib/better-auth/client";

export default function LoginPage() {
  const locale = useLocale();
  const t = useTranslations("auth.login");
  const isArabic = locale === "ar";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function normalizeMrPhone(raw: string): string {
    const digits = raw.replace(/[^\d]/g, "");
    if (digits.startsWith("222") && digits.length === 11)
      return digits.slice(3);
    return digits;
  }

  function redirectToDashboard() {
    const dashboardPath = getPathname({ href: "/dashboard", locale });
    window.location.href = dashboardPath;
  }

  function _redirectToVerify(options: {
    method: "email" | "phone";
    phone?: string;
  }) {
    const params = new URLSearchParams({ method: options.method });
    if (options.phone) params.set("phone", options.phone);
    const verifyPath = getPathname({
      href: `/login/verify?${params.toString()}`,
      locale,
    });
    window.location.href = verifyPath;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setIsSubmitting(true);

    try {
      const normalizedIdentifier = identifier.trim();
      const normalizedEmail = normalizedIdentifier;
      const normalizedPassword = password.trim();
      const normalizedPhone = normalizeMrPhone(normalizedIdentifier);
      const isMrPhone = /^[234]\d{7}$/.test(normalizedPhone);

      if (!normalizedIdentifier) {
        throw new Error(t("errors.enterEmailOrPhone"));
      }

      // Phone sign-in: use password + phone number (no OTP on login).
      if (isMrPhone) {
        if (!normalizedPassword) {
          throw new Error(t("errors.passwordRequiredForEmail"));
        }

        const authClient = getAuthClient();
        const result = await authClient.signIn.phoneNumber({
          phoneNumber: normalizedPhone,
          password: normalizedPassword,
        });
        if (result.error) throw new Error(result.error.message);
        redirectToDashboard();
        return;
      }

      if (!normalizedEmail.includes("@")) {
        throw new Error(t("errors.emailRequiredForPasswordAuth"));
      }

      if (!normalizedPassword) {
        throw new Error(t("errors.passwordRequiredForEmail"));
      }

      const authClient = getAuthClient();
      const result = await authClient.signIn.email({
        email: normalizedEmail,
        password: normalizedPassword,
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

  async function onGoogleSignIn() {
    setError(null);
    setNotice(null);
    setIsSubmitting(true);

    try {
      const dashboardPath = getPathname({ href: "/dashboard", locale });
      const callbackURL = new URL(
        dashboardPath,
        window.location.origin,
      ).toString();
      const authClient = getAuthClient();
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL,
        disableRedirect: true,
      });

      if (result.error) throw new Error(result.error.message);
      const url = result.data?.url;
      if (!url) throw new Error("No redirect URL returned from Better Auth.");
      window.location.href = url;
    } catch (err) {
      const message = err instanceof Error ? err.message : t("errors.generic");
      setError(message);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <main className="min-h-screen px-4 sm:px-6 py-10 sm:py-14 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-2xl shadow-black/40">
            <div className="flex justify-center mb-6">
              <Link href="/" aria-label="Go to home page">
                <Image
                  src="/mauri-logo.png"
                  alt="Mauri Academy"
                  width={240}
                  height={80}
                  className="h-12 sm:h-14 w-auto object-contain"
                  priority
                />
              </Link>
            </div>

            <div className="space-y-5">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white">
                  {t("title.signIn")}
                </h1>
                <p className="mt-1 text-sm text-zinc-400">{t("subtitle")}</p>
              </div>

              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={onGoogleSignIn}
                className="h-11 w-full rounded-md border-zinc-700 bg-zinc-950/40 text-white hover:bg-zinc-900 hover:text-white"
              >
                <FcGoogle className="h-5 w-5" />
                {t("ui.continueWithGoogle")}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-zinc-900/60 text-zinc-400">
                    {t("ui.or")}
                  </span>
                </div>
              </div>

              {notice && (
                <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                  {notice}
                </div>
              )}
              {error && (
                <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="identifier"
                    className="block text-sm font-medium text-zinc-200"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {`${t("email.emailLabel")} / ${t("phone.phoneLabel")}`}
                    </span>
                  </Label>
                  <Input
                    id="identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={`${t("email.emailPlaceholder")} / ${t("phone.phonePlaceholder")}`}
                    autoComplete="email"
                    className="h-11 rounded-md border-zinc-700 bg-zinc-950/40 text-white placeholder:text-zinc-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="block text-sm font-medium text-zinc-200"
                  >
                    {t("email.passwordLabel")}
                  </Label>
                  <PasswordInput
                    id="password"
                    value={password}
                    onChange={setPassword}
                    autoComplete="current-password"
                    placeholder={t("email.passwordLabel")}
                    className="h-11 rounded-md border-zinc-700 bg-zinc-950/40 text-white placeholder:text-zinc-500"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 w-full rounded-md bg-sky-600 hover:bg-sky-500 text-white font-medium shadow-lg shadow-sky-600/25"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>{t("email.submitting")}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>{t("email.submitSignIn")}</span>
                      {isArabic ? (
                        <ArrowLeft className="h-4 w-4" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </Button>
              </form>

              <div className="text-center pt-2">
                <p className="text-sm text-zinc-400">
                  {t("ui.noAccount")}{" "}
                  <Link
                    href="/signup"
                    className="font-medium text-sky-300 hover:text-sky-200"
                  >
                    {t("ui.createAccount")}
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs text-zinc-500 text-center">{t("tos")}</p>
        </div>
      </main>
    </div>
  );
}

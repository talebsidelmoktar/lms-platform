"use client";

import Image from "next/image";
import { Mail, Phone, ShieldCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getPathname, Link } from "@/i18n/navigation";
import { getAuthClient } from "@/lib/better-auth/client";

type EmailMode = "signin" | "signup";
type PhoneStep = "send" | "verify";
const SIGNUP_EMAIL_COOLDOWN_MS = 60_000;

export default function LoginPage() {
  const locale = useLocale();
  const t = useTranslations("auth.login");
  const [emailMode, setEmailMode] = useState<EmailMode>("signin");
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("send");

  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signupRetryAt, setSignupRetryAt] = useState(0);

  const title = useMemo(
    () => (emailMode === "signup" ? t("title.signUp") : t("title.signIn")),
    [emailMode, t],
  );

  function normalizeMrPhone(raw: string): string {
    const digits = raw.replace(/[^\d]/g, "");
    if (digits.startsWith("222") && digits.length === 11) return digits.slice(3);
    return digits;
  }

  function redirectToDashboard() {
    const dashboardPath = getPathname({ href: "/dashboard", locale });
    window.location.href = dashboardPath;
  }

  function redirectToVerify(options: {
    method: "email" | "phone";
    email?: string;
    phone?: string;
  }) {
    const params = new URLSearchParams({ method: options.method });
    if (options.email) params.set("email", options.email);
    if (options.phone) params.set("phone", options.phone);
    const verifyPath = getPathname({
      href: `/login/verify?${params.toString()}`,
      locale,
    });
    window.location.href = verifyPath;
  }

  async function onEmailSubmit(e: React.FormEvent) {
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

      // UX: single field. If user typed a phone number, treat this submit as "send OTP"
      // and redirect to the OTP page, rather than requiring email/password.
      if (isMrPhone) {
        const authClient = getAuthClient();
        const result = await authClient.phoneNumber.sendOtp({
          phoneNumber: normalizedPhone,
        });
        if (result.error) throw new Error(result.error.message);

        setNotice(t("phone.codeSent"));
        redirectToVerify({ method: "phone", phone: normalizedPhone });
        return;
      }

      if (!normalizedEmail || !normalizedEmail.includes("@")) {
        throw new Error(t("errors.emailRequiredForPasswordAuth"));
      }

      if (!normalizedPassword) {
        throw new Error(t("errors.passwordRequiredForEmail"));
      }

      if (emailMode === "signin") {
        const authClient = getAuthClient();
        const result = await authClient.signIn.email({
          email: normalizedEmail,
          password: normalizedPassword,
        });
        if (result.error) throw new Error(result.error.message);
        redirectToDashboard();
        return;
      }

      if (Date.now() < signupRetryAt) {
        const waitSeconds = Math.ceil((signupRetryAt - Date.now()) / 1000);
        throw new Error(`Please wait ${waitSeconds}s before trying again.`);
      }

      const authClient = getAuthClient();
      const signupResult = await authClient.signUp.email({
        email: normalizedEmail,
        password: normalizedPassword,
        name: fullName.trim() || normalizedEmail.split("@")[0] || "User",
      });
      if (signupResult.error) throw new Error(signupResult.error.message);
      setSignupRetryAt(0);

      setNotice(t("notice.signupSuccess"));
      redirectToDashboard();
    } catch (err) {
      let message = err instanceof Error ? err.message : t("errors.generic");
      if (
        err instanceof Error &&
        err.message.toLowerCase().includes("rate limit")
      ) {
        setSignupRetryAt(Date.now() + SIGNUP_EMAIL_COOLDOWN_MS);
        message =
          "Email rate limit exceeded. Please wait 60 seconds and try again.";
      }
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setIsSubmitting(true);

    try {
      if (!identifier.trim()) {
        throw new Error(t("errors.enterEmailOrPhone"));
      }

      const normalizedPhone = normalizeMrPhone(identifier.trim());
      if (!/^[234]\d{7}$/.test(normalizedPhone)) {
        throw new Error(t("errors.phoneRequiredForOtp"));
      }

      const authClient = getAuthClient();
      const result = await authClient.phoneNumber.sendOtp({
        phoneNumber: normalizedPhone,
      });
      if (result.error) throw new Error(result.error.message);

      setNotice(t("phone.codeSent"));
      redirectToVerify({ method: "phone", phone: normalizedPhone });
    } catch (err) {
      const message = err instanceof Error ? err.message : t("errors.generic");
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setIsSubmitting(true);

    try {
      const normalizedPhone = normalizeMrPhone(identifier.trim());
      const token = otp.trim();

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

  async function onGoogleSignIn() {
    setError(null);
    setNotice(null);
    setIsSubmitting(true);

    try {
      const dashboardPath = getPathname({ href: "/dashboard", locale });
      const callbackURL = new URL(dashboardPath, window.location.origin).toString();
      const authClient = getAuthClient();
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL,
        disableRedirect: true,
      });

      if (result.error) throw new Error(result.error.message);
      // Some client setups return the provider URL rather than hard-redirecting.
      // Always follow the returned URL to ensure we complete the OAuth flow.
      const url = result.data?.url;
      if (!url) throw new Error("No redirect URL returned from Better Auth.");
      try {
        const u = new URL(url);
        console.info("[auth] google auth url", {
          redirect_uri: u.searchParams.get("redirect_uri"),
        });
      } catch {
        // ignore parse failures
      }
      window.location.href = url;
    } catch (err) {
      const message = err instanceof Error ? err.message : t("errors.generic");
      setError(message);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-sky-600/15 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-[40%] right-[20%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[80px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <main className="relative z-10 min-h-screen px-4 sm:px-6 py-2 sm:py-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/55 backdrop-blur-xl p-4 sm:p-5 shadow-2xl shadow-black/40">
            <div className="flex justify-center mb-3">
              <Link href="/" aria-label="Go to home page">
                <Image
                  src="/mauri-logo.png"
                  alt="Mauri Academy"
                  width={170}
                  height={56}
                  className="h-9 w-auto object-contain"
                  priority
                />
              </Link>
            </div>

            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-600/30">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-center">
                {title}
              </h1>
            </div>
            <p className="text-xs text-zinc-400 text-center mb-4">
              {t("subtitle")}
            </p>

            <div className="flex items-center justify-between gap-3 mb-4 rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-zinc-200">
                  {emailMode === "signup"
                    ? t("email.modeLabelSignUp")
                    : t("email.modeLabelSignIn")}
                </p>
                <p className="text-xs text-zinc-500">{t("email.modeHelp")}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">
                  {t("email.switchLabel")}
                </span>
                <Switch
                  checked={emailMode === "signup"}
                  onCheckedChange={(checked) =>
                    setEmailMode(checked ? "signup" : "signin")
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              {emailMode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t("email.fullNameLabel")}</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t("email.fullNamePlaceholder")}
                    autoComplete="name"
                    className="h-10 rounded-xl border-zinc-700 bg-zinc-950/60"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {`${t("email.emailLabel")} / ${t("phone.phoneLabel")}`}
                </Label>
                <Input
                  id="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={`${t("email.emailPlaceholder")} / ${t("phone.phonePlaceholder")}`}
                  autoComplete="email"
                  className="h-10 rounded-xl border-zinc-700 bg-zinc-950/60"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("email.passwordLabel")}</Label>
                <Input
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  autoComplete={
                    emailMode === "signup" ? "new-password" : "current-password"
                  }
                  className="h-10 rounded-xl border-zinc-700 bg-zinc-950/60"
                />
              </div>

              {notice && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                  {notice}
                </div>
              )}
              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={onEmailSubmit} className="space-y-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 w-full rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white border-0 shadow-lg shadow-sky-600/25"
                >
                  {isSubmitting
                    ? t("email.submitting")
                    : emailMode === "signup"
                      ? t("email.submitSignUp")
                      : t("email.submitSignIn")}
                </Button>
              </form>

              <div className="pt-1">
                <p className="text-center text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-2">
                  Or continue with
                </p>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={onGoogleSignIn}
                  className="h-10 w-full rounded-xl border-emerald-500/40 bg-emerald-600/20 text-emerald-100 hover:bg-emerald-600/30 hover:text-white"
                >
                  <span className="mr-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-zinc-900">
                    G
                  </span>
                  Continue with Google
                </Button>
              </div>

              <details className="pt-3 border-t border-zinc-800/80">
                <summary className="cursor-pointer text-sm text-zinc-400 hover:text-zinc-200">
                  {t("phone.phoneLabel")}
                </summary>
                <div className="mt-3 space-y-3">
                  <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 px-3 py-2 text-xs text-zinc-400 flex items-start gap-2">
                    <Phone className="w-4 h-4 mt-0.5 shrink-0 text-zinc-300" />
                    <div className="leading-relaxed">
                      <div className="text-zinc-200">{t("phone.phoneLabel")}</div>
                      <div className="text-zinc-500">{t("phone.phoneHelp")}</div>
                    </div>
                  </div>

                  {phoneStep === "verify" && (
                    <div className="space-y-2">
                      <Label htmlFor="otp">{t("phone.otpLabel")}</Label>
                      <Input
                        id="otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder={t("phone.otpPlaceholder")}
                        inputMode="numeric"
                        className="h-10 rounded-xl border-zinc-700 bg-zinc-950/60"
                      />
                    </div>
                  )}

                  {phoneStep === "send" ? (
                    <form onSubmit={onSendOtp} className="space-y-3">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-10 w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0 shadow-lg shadow-cyan-600/25"
                      >
                        {isSubmitting ? t("phone.sending") : t("phone.sendCode")}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={onVerifyOtp} className="space-y-4">
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 flex-1 border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
                          onClick={() => {
                            setPhoneStep("send");
                            setOtp("");
                            setNotice(null);
                            setError(null);
                          }}
                        >
                          {t("phone.back")}
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="h-10 flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0 shadow-lg shadow-cyan-600/25"
                        >
                          {isSubmitting ? t("phone.verifying") : t("phone.verify")}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </details>
            </div>
          </div>

          <p className="mt-3 text-[10px] text-zinc-500 text-center">{t("tos")}</p>
        </div>
      </main>
    </div>
  );
}

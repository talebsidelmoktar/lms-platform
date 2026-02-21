"use client";

import { useMemo, useState } from "react";
import { Mail, Phone, ShieldCheck } from "lucide-react";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { getPathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabaseBrowser } from "@/lib/supabase/client";

type EmailMode = "signin" | "signup";
type PhoneStep = "send" | "verify";

export default function LoginPage() {
  const locale = useLocale();
  const t = useTranslations("auth.login");
  const [emailMode, setEmailMode] = useState<EmailMode>("signin");
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("send");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(
    () => (emailMode === "signup" ? t("title.signUp") : t("title.signIn")),
    [emailMode, t],
  );

  function redirectToDashboard() {
    const dashboardPath = getPathname({ href: "/dashboard", locale });
    window.location.href = dashboardPath;
  }

  async function onEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setIsSubmitting(true);

    try {
      const normalizedEmail = email.trim();
      const normalizedPassword = password.trim();

      if (!normalizedEmail && !phone.trim()) {
        throw new Error(t("errors.enterEmailOrPhone"));
      }

      if (!normalizedEmail) {
        throw new Error(t("errors.emailRequiredForPasswordAuth"));
      }

      if (!normalizedPassword) {
        throw new Error(t("errors.passwordRequiredForEmail"));
      }

      if (emailMode === "signin") {
        const { error: signInError } = await supabaseBrowser.auth.signInWithPassword(
          { email: normalizedEmail, password: normalizedPassword },
        );
        if (signInError) throw signInError;
        redirectToDashboard();
        return;
      }

      const { error: signUpError } = await supabaseBrowser.auth.signUp({
        email: normalizedEmail,
        password: normalizedPassword,
        options: {
          data: {
            full_name: fullName.trim() || null,
          },
        },
      });

      if (signUpError) throw signUpError;

      setNotice(t("notice.signupSuccess"));
      redirectToDashboard();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("errors.generic");
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
      if (!phone.trim() && !email.trim()) {
        throw new Error(t("errors.enterEmailOrPhone"));
      }

      const normalizedPhone = phone.trim();
      if (!normalizedPhone) {
        throw new Error(t("errors.phoneRequiredForOtp"));
      }

      const { error: otpError } = await supabaseBrowser.auth.signInWithOtp({
        phone: normalizedPhone,
      });
      if (otpError) throw otpError;

      setNotice(t("phone.codeSent"));
      setPhoneStep("verify");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("errors.generic");
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
      const normalizedPhone = phone.trim();
      const token = otp.trim();

      const { error: verifyError } = await supabaseBrowser.auth.verifyOtp({
        phone: normalizedPhone,
        token,
        type: "sms",
      });
      if (verifyError) throw verifyError;

      redirectToDashboard();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("errors.generic");
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-600/15 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[100px] animate-pulse"
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

      <main className="relative z-10 px-6 lg:px-12 py-16 max-w-7xl mx-auto">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-600/30">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">{title}</h1>
              <p className="text-sm text-zinc-400">
                {t("subtitle")}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-zinc-900/40 border border-zinc-800 p-6">
            <div className="mt-1">
              <div className="flex items-center justify-between gap-3 mb-4">
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

              <div className="space-y-4">
                {emailMode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t("email.fullNameLabel")}</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t("email.fullNamePlaceholder")}
                      autoComplete="name"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {t("email.emailLabel")}
                  </Label>
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("email.emailPlaceholder")}
                    type="email"
                    autoComplete="email"
                  />
                  <p className="text-xs text-zinc-500">{t("email.optionalHelp")}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t("email.passwordLabel")}</Label>
                  <Input
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    autoComplete={
                      emailMode === "signup"
                        ? "new-password"
                        : "current-password"
                    }
                  />
                  <p className="text-xs text-zinc-500">{t("email.passwordHelp")}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {t("phone.phoneLabel")}
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("phone.phonePlaceholder")}
                    autoComplete="tel"
                  />
                  <p className="text-xs text-zinc-500">{t("phone.phoneHelp")}</p>
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
                    />
                  </div>
                )}

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
                    className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-lg shadow-violet-600/25"
                  >
                    {isSubmitting
                      ? t("email.submitting")
                      : emailMode === "signup"
                        ? t("email.submitSignUp")
                        : t("email.submitSignIn")}
                  </Button>
                </form>

                {phoneStep === "send" ? (
                  <form onSubmit={onSendOtp} className="space-y-3">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0 shadow-lg shadow-cyan-600/25"
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
                        className="flex-1 border-zinc-700 bg-white/5 text-white hover:bg-white/10 hover:text-white"
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
                        className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0 shadow-lg shadow-cyan-600/25"
                      >
                        {isSubmitting ? t("phone.verifying") : t("phone.verify")}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          <p className="mt-6 text-xs text-zinc-500 text-center">
            {t("tos")}
          </p>
        </div>
      </main>
    </div>
  );
}

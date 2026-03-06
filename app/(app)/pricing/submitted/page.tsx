import { CheckCircle2, Clock3 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/server";

export default async function PricingSubmittedPage() {
  const t = await getTranslations("common.pricing.paymentSubmitted");
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-emerald-600/15 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-sky-600/10 blur-[100px]" />
        <div className="absolute top-[40%] right-[20%] h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[80px]" />
      </div>

      <Header
        initialUser={
          user
            ? {
                email: user.email,
                phone: user.phone,
                fullName: user.fullName,
                avatarUrl: user.avatarUrl,
                tier: user.tier,
              }
            : undefined
        }
      />

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] max-w-4xl items-center px-6 py-12 lg:px-12">
        <div className="w-full rounded-3xl border border-emerald-500/20 bg-zinc-900/60 p-8 shadow-2xl shadow-black/40 md:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h1 className="mb-4 text-3xl font-black tracking-tight md:text-5xl">
              {t("title")}
            </h1>
            <p className="mb-8 text-base text-zinc-300 md:text-lg">
              {t("description")}
            </p>

            <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 text-left">
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />
                <p className="text-sm text-zinc-300">{t("note")}</p>
              </div>
            </div>

            <Button
              asChild
              className="bg-gradient-to-r from-sky-600 to-blue-600 text-white hover:from-sky-500 hover:to-blue-500"
            >
              <Link href="/dashboard">{t("backToDashboard")}</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

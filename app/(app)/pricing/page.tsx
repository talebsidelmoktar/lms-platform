import { CheckCircle2, Code2, Sparkles } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/Header";
import { ManualUpgradeRequest } from "@/components/pricing/ManualUpgradeRequest";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/server";
import { getTierColorClasses } from "@/lib/constants";

export default async function PricingPage() {
  const t = await getTranslations("common.pricing");
  const headerT = await getTranslations("common.header");
  const tiersT = await getTranslations("common.tiers");
  const user = await getCurrentUser();
  const tierFeatures = [
    {
      tierLabel: tiersT("free"),
      color: "sky" as const,
      features: t.raw("tiers.free.features") as string[],
    },
    {
      tierLabel: tiersT("pro"),
      color: "blue" as const,
      features: t.raw("tiers.pro.features") as string[],
    },
    {
      tierLabel: tiersT("ultra"),
      color: "indigo" as const,
      features: t.raw("tiers.ultra.features") as string[],
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-[40%] right-[20%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[80px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Navigation */}
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

      {/* Main Content */}
      <main className="relative z-10 px-6 lg:px-12 py-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">
              {t("simpleTransparent")}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              {t("choosePath")}
            </span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            {t("startFree")}
          </p>
        </div>

        {/* What's Included Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {tierFeatures.map((plan) => {
            const colorClasses = getTierColorClasses(plan.color);
            return (
              <div
                key={plan.tierLabel}
                className={`p-6 rounded-xl bg-zinc-900/50 border ${colorClasses.border}`}
              >
                <h3 className={`text-lg font-bold mb-4 ${colorClasses.text}`}>
                  {t("includes", { tier: plan.tierLabel })}
                </h3>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-zinc-300"
                    >
                      <CheckCircle2
                        className={`w-4 h-4 mt-0.5 shrink-0 ${colorClasses.text}`}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {user ? (
          <ManualUpgradeRequest />
        ) : (
          <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-6 md:p-10">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                {t("manualRequest.title")}
              </h2>
              <p className="text-zinc-400 mb-6">
                {t("manualRequest.description")}
              </p>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white border-0">
                  {headerT("signIn")}
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* FAQ or extra info */}
        <div className="mt-16 text-center">
          <p className="text-zinc-400">
            {t("questions")}{" "}
            <Link
              href="#"
              className="text-blue-400 hover:text-blue-300 underline underline-offset-4"
            >
              {t("contactUs")}
            </Link>{" "}
            {t("orCheckFaq")}{" "}
            <Link
              href="#"
              className="text-blue-400 hover:text-blue-300 underline underline-offset-4"
            >
              {t("faq")}
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-12 border-t border-zinc-800 max-w-7xl mx-auto mt-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">{t("brand")}</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-zinc-500">
            <Link href="#" className="hover:text-white transition-colors">
              {t("privacy")}
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              {t("terms")}
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              {t("contact")}
            </Link>
          </div>
          <p className="text-sm text-zinc-600">{t("copyright")}</p>
        </div>
      </footer>
    </div>
  );
}



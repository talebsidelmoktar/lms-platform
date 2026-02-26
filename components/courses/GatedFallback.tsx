"use client";

import { CheckCircle2, Lock, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { TIER_FEATURES, TIER_STYLES, type Tier } from "@/lib/constants";

// Muted gradient variants for background overlays
const TIER_GRADIENT_MUTED: Record<Tier, string> = {
  free: "from-emerald-500/20 to-teal-600/20",
  pro: "from-sky-500/20 to-blue-600/20",
  ultra: "from-cyan-400/20 to-blue-600/20",
};

interface GatedFallbackProps {
  requiredTier: Tier | null | undefined;
}

export function GatedFallback({ requiredTier }: GatedFallbackProps) {
  const t = useTranslations("common.gated");
  const displayTier = requiredTier ?? "pro";
  const styles = TIER_STYLES[displayTier];
  const gradientMuted = TIER_GRADIENT_MUTED[displayTier];

  // Get features for the required tier
  const tierFeatures = TIER_FEATURES.find(
    (t) => t.tier.toLowerCase() === displayTier,
  );

  return (
    <div
      className={`relative rounded-2xl bg-gradient-to-br ${gradientMuted} border ${styles.border} p-8 md:p-12 overflow-hidden`}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[#09090b]/80" />
      <div
        className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${gradientMuted} rounded-full blur-[100px] opacity-50`}
      />

      <div className="relative z-10 max-w-xl mx-auto text-center">
        {/* Lock icon */}
        <div
          className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-800/50 border ${styles.border} mb-6`}
        >
          <Lock className={`w-7 h-7 ${styles.text}`} />
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          {t("upgradeTo")}{" "}
          <span className={styles.text}>
            {displayTier.charAt(0).toUpperCase() + displayTier.slice(1)}
          </span>{" "}
          {t("unlockContent")}
        </h2>

        {/* Description */}
        <p className="text-zinc-400 mb-8 max-w-md mx-auto">
          {t("description", { tier: displayTier })}
        </p>

        {/* Features list */}
        {tierFeatures && (
          <div className="bg-zinc-900/50 rounded-xl p-6 mb-8 text-left">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className={`w-4 h-4 ${styles.text}`} />
              <span className={`text-sm font-semibold ${styles.text}`}>
                {tierFeatures.tier} {t("includes")}
              </span>
            </div>
            <ul className="space-y-3">
              {tierFeatures.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-sm text-zinc-300"
                >
                  <CheckCircle2
                    className={`w-4 h-4 mt-0.5 shrink-0 ${styles.text}`}
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA Button */}
        <Link href="/pricing">
          <Button
            size="lg"
            className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white border-0 shadow-xl shadow-sky-600/30 px-8"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {t("viewPricingPlans")}
          </Button>
        </Link>
      </div>
    </div>
  );
}


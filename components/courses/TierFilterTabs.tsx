"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { Tier } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type TierFilter = Tier | "all";

interface TierFilterTabsProps {
  activeFilter: TierFilter;
  onFilterChange: (filter: TierFilter) => void;
  className?: string;
}

const FILTER_OPTION_VALUES: TierFilter[] = ["all", "free", "pro", "ultra"];

export function TierFilterTabs({
  activeFilter,
  onFilterChange,
  className,
}: TierFilterTabsProps) {
  const t = useTranslations("common.tiers");
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 p-1 rounded-lg bg-zinc-900/50 border border-zinc-800",
        className,
      )}
    >
      {FILTER_OPTION_VALUES.map((value) => (
        <Button
          key={value}
          variant="ghost"
          size="sm"
          onClick={() => onFilterChange(value)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
            activeFilter === value
              ? "bg-sky-600 text-white shadow-lg shadow-sky-500/25 hover:bg-sky-500"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800",
          )}
        >
          {t(value)}
        </Button>
      ))}
    </div>
  );
}


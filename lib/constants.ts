export const TIER_OPTIONS = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "ultra", label: "Ultra" },
] as const;

export type Tier = (typeof TIER_OPTIONS)[number]["value"];

type TierColor = "sky" | "blue" | "indigo";

const TIER_COLOR_MAP: Record<TierColor, { border: string; text: string }> = {
  sky: {
    border: "border-sky-500/20",
    text: "text-sky-400",
  },
  blue: {
    border: "border-blue-500/30",
    text: "text-blue-400",
  },
  indigo: {
    border: "border-indigo-500/20",
    text: "text-indigo-400",
  },
};

export function getTierColorClasses(color: TierColor) {
  return TIER_COLOR_MAP[color];
}

// Tier styling constants for UI components
export const TIER_STYLES: Record<
  Tier,
  {
    gradient: string;
    border: string;
    text: string;
    badge: string;
  }
> = {
  free: {
    gradient: "from-sky-500 to-blue-600",
    border: "border-sky-500/30",
    text: "text-sky-400",
    badge: "bg-sky-500/90 text-white",
  },
  pro: {
    gradient: "from-blue-500 to-indigo-600",
    border: "border-blue-500/30",
    text: "text-blue-400",
    badge: "bg-blue-500/90 text-white",
  },
  ultra: {
    gradient: "from-cyan-400 to-sky-600",
    border: "border-cyan-500/30",
    text: "text-cyan-400",
    badge: "bg-cyan-500/90 text-white",
  },
};

export const TIER_FEATURES = [
  {
    tier: "Free",
    color: "sky",
    features: [
      "Access to foundational courses",
      "Community Discord access",
      "Basic projects & exercises",
      "Email support",
    ],
  },
  {
    tier: "Pro",
    color: "blue",
    features: [
      "Everything in Free",
      "All Pro-tier courses",
      "Advanced real-world projects",
      "Priority support",
      "Course completion certificates",
    ],
  },
  {
    tier: "Ultra",
    color: "indigo",
    features: [
      "Everything in Pro",
      "AI Learning Assistant",
      "Exclusive Ultra-only content",
      "Monthly 1-on-1 sessions",
      "Private Discord channel",
      "Early access to new courses",
      "Lifetime updates",
    ],
  },
] as const;

"use client";

import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPathname, Link, usePathname } from "@/i18n/navigation";
import { type AppLocale, routing } from "@/i18n/routing";
import { useSupabaseProfile, useSupabaseSessionUser } from "@/lib/auth/client";
import { useUserTier } from "@/lib/hooks/use-user-tier";
import { supabaseBrowser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface HeaderInitialUser {
  email: string | null;
  phone: string | null;
  fullName: string | null;
  avatarUrl: string | null;
}

export function Header({ initialUser }: { initialUser?: HeaderInitialUser }) {
  const pathname = usePathname();
  const locale = useLocale() as AppLocale;
  const t = useTranslations("common.header");
  const languageT = useTranslations("common.language");
  const authT = useTranslations("auth");
  const { isLoaded, user } = useSupabaseSessionUser();
  const { profile } = useSupabaseProfile(user, isLoaded);
  const userTier = useUserTier();
  const isSignedIn = Boolean(user ?? initialUser);
  const isUltra = userTier === "ultra";
  const effectiveEmail = user?.email ?? initialUser?.email ?? null;
  const effectivePhone = user?.phone ?? initialUser?.phone ?? null;
  const effectiveName = profile.fullName ?? initialUser?.fullName ?? null;
  const effectiveAvatarUrl =
    profile.avatarUrl ??
    user?.user_metadata?.avatar_url ??
    initialUser?.avatarUrl ??
    "";

  const loggedOutLinks = [
    { href: "/#courses", label: t("courses") },
    { href: "/pricing", label: t("pricing") },
    { href: "/#testimonials", label: t("reviews") },
  ];

  const loggedInLinks = [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/dashboard/courses", label: t("myCourses"), icon: BookOpen },
    ...(isUltra
      ? [{ href: "/pricing", label: t("account"), icon: Sparkles }]
      : [{ href: "/pricing", label: t("upgrade"), icon: Sparkles }]),
  ];

  const userInitial =
    effectiveName?.[0] ?? effectiveEmail?.[0] ?? effectivePhone?.[0] ?? "U";

  async function handleSignOut() {
    await supabaseBrowser.auth.signOut();
    const homePath = getPathname({ href: "/", locale });
    window.location.href = `/auth/signout?next=${encodeURIComponent(homePath)}`;
  }

  return (
    <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5 max-w-7xl mx-auto">
      <div>
        <Link
          href={isSignedIn ? "/dashboard" : "/"}
          className="flex items-center gap-3 group"
        >
          <Logo />
        </Link>
      </div>

      <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {!isSignedIn ? (
          <div className="flex items-center gap-8 text-sm text-zinc-400">
            {loggedOutLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-white transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-1">
            {loggedInLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href ||
                (link.href !== "/dashboard" && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-sky-500/10 text-sky-300"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <LanguageSwitcher
          value={locale}
          onChange={(nextLocale) => {
            const newPath = getPathname({ href: pathname, locale: nextLocale });
            window.location.href = newPath;
          }}
          options={{
            en: languageT("en"),
            fr: languageT("fr"),
            ar: languageT("ar"),
          }}
          label={languageT("label")}
        />

        {!isSignedIn ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-zinc-900 border-zinc-800"
              >
                {loggedOutLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link
                      href={link.href}
                      className="text-zinc-300 cursor-pointer"
                    >
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/login">
              <Button
                variant="ghost"
                className="text-zinc-400 hover:text-white hover:bg-white/5"
              >
                {t("signIn")}
              </Button>
            </Link>
            <Link href="/pricing" className="hidden sm:block">
              <Button className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white border-0 shadow-lg shadow-sky-600/25">
                {t("startLearning")}
              </Button>
            </Link>
          </>
        ) : (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-zinc-900 border-zinc-800"
              >
                {loggedInLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive =
                    pathname === link.href ||
                    (link.href !== "/dashboard" &&
                      pathname.startsWith(link.href));

                  return (
                    <DropdownMenuItem key={link.href} asChild>
                      <Link
                        href={link.href}
                        className={cn(
                          "flex items-center gap-2 cursor-pointer",
                          isActive ? "text-sky-300" : "text-zinc-300",
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuItem
                  className="text-zinc-300 cursor-pointer"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {authT("signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" aria-label="User menu">
                  <Avatar className="w-9 h-9 ring-2 ring-sky-500/20">
                    <AvatarImage
                      src={effectiveAvatarUrl}
                      alt={effectiveEmail ?? "User"}
                    />
                    <AvatarFallback className="bg-zinc-800 text-zinc-200">
                      {String(userInitial).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-zinc-900 border-zinc-800 w-72 p-2"
              >
                <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 mb-2">
                  <div className="text-sm font-semibold text-zinc-100">
                    {effectiveName ??
                      effectiveEmail ??
                      effectivePhone ??
                      "User"}
                  </div>
                  {effectiveEmail && (
                    <div className="text-xs text-zinc-400 mt-1">
                      {effectiveEmail}
                    </div>
                  )}
                  {effectivePhone && (
                    <div className="text-xs text-zinc-500">
                      {effectivePhone}
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] px-2 py-1 rounded bg-sky-500/15 text-sky-300 uppercase">
                      {profile.tier}
                    </span>
                    <span className="text-[10px] px-2 py-1 rounded bg-zinc-800 text-zinc-300 uppercase">
                      {profile.role ?? "student"}
                    </span>
                  </div>
                </div>
                <DropdownMenuItem
                  className="text-zinc-300 cursor-pointer"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {authT("signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </nav>
  );
}

function Logo() {
  return (
    <div className="relative h-14 w-[170px] overflow-visible -ml-5 md:-ml-3">
      <Image
        src="/mauri-logo.png"
        alt="Mauri Academy"
        width={100}
        height={80}
        className="h-14 w-auto object-contain origin-left scale-[1.45]"
        priority
      />
    </div>
  );
}

function LanguageSwitcher({
  value,
  onChange,
  options,
  label,
}: {
  value: AppLocale;
  onChange: (locale: AppLocale) => void;
  options: Record<AppLocale, string>;
  label: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as AppLocale)}>
      <SelectTrigger
        size="sm"
        className="min-w-[130px] bg-zinc-900/60 border-zinc-700 text-zinc-200"
        aria-label={label}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200">
        {routing.locales.map((lang) => (
          <SelectItem key={lang} value={lang}>
            {options[lang]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { BookOpen, LayoutDashboard, Menu, Sparkles } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
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
import { Link, usePathname, useRouter, getPathname } from "@/i18n/navigation";
import { type AppLocale, routing } from "@/i18n/routing";
import { useUserTier } from "@/lib/hooks/use-user-tier";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale() as AppLocale;
  const t = useTranslations("common.header");
  const languageT = useTranslations("common.language");
  const userTier = useUserTier();
  const isUltra = userTier === "ultra";

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

  return (
    <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5 max-w-7xl mx-auto">
      <div>
        <SignedIn>
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <Logo />
          </Link>
        </SignedIn>
        <SignedOut>
          <Link href="/" className="flex items-center gap-3 group">
            <Logo />
          </Link>
        </SignedOut>
      </div>

      <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <SignedOut>
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
        </SignedOut>

        <SignedIn>
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
                      ? "bg-violet-500/10 text-violet-300"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </SignedIn>
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

        <SignedOut>
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

          <SignInButton mode="modal">
            <Button
              variant="ghost"
              className="text-zinc-400 hover:text-white hover:bg-white/5"
            >
              {t("signIn")}
            </Button>
          </SignInButton>
          <Link href="/pricing" className="hidden sm:block">
            <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-lg shadow-violet-600/25">
              {t("startLearning")}
            </Button>
          </Link>
        </SignedOut>

        <SignedIn>
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
                        isActive ? "text-violet-300" : "text-zinc-300",
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-9 h-9 ring-2 ring-violet-500/20",
              },
            }}
          />
        </SignedIn>
      </div>
    </nav>
  );
}

function Logo() {
  return (
    <Image
      src="/logo-tight.png"
      alt="Mauri Academy"
      width={360}
      height={100}
      className="h-16 w-auto object-contain"
      priority
    />
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

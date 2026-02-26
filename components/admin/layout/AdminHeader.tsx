"use client";

import {
  BookOpen,
  ExternalLink,
  Layers,
  LayoutDashboard,
  Menu,
  PlayCircle,
  ReceiptText,
  Tag,
} from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { cn } from "@/lib/utils";
import AdminLogOutButton from "./AdminLogOutButton";

function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale() as AppLocale;
  const t = useTranslations("common.admin");
  const languageT = useTranslations("common.language");

  const navItems = [
    {
      href: "/admin",
      label: t("dashboard"),
      icon: LayoutDashboard,
      exact: true,
    },
    { href: "/admin/courses", label: t("courses"), icon: BookOpen },
    { href: "/admin/modules", label: t("modules"), icon: Layers },
    { href: "/admin/lessons", label: t("lessons"), icon: PlayCircle },
    { href: "/admin/categories", label: t("categories"), icon: Tag },
    {
      href: "/admin/payment-requests",
      label: t("paymentRequests"),
      icon: ReceiptText,
    },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-xl">
      <div className="flex h-14 items-center px-4 lg:px-6">
        <Link
          href="/admin"
          className="flex items-center gap-2.5 font-semibold lg:mr-8"
        >
          <div className="relative h-11 w-[155px] overflow-visible shrink-0 -ml-3 md:-ml-2">
            <Image
              src="/mauri-logo.png"
              alt="Mauri Academy"
              width={300}
              height={100}
              className="h-11 w-auto object-contain origin-left scale-[1.45]"
              priority
            />
          </div>
          <span className="text-lg text-white hidden sm:inline">
            {t("label")}
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  active
                    ? "bg-sky-500/20 text-sky-300"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        <div className="hidden lg:flex items-center gap-4">
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
          <Link
            href="/studio"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            {t("openStudio")}
          </Link>
          <AdminLogOutButton />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">{t("openMenu")}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-zinc-900 border-zinc-800"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.exact);
              return (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 cursor-pointer",
                      active
                        ? "text-sky-300 bg-sky-500/10"
                        : "text-zinc-300",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem asChild>
              <Link
                href="/studio"
                className="flex items-center gap-2 cursor-pointer text-zinc-300"
              >
                <ExternalLink className="h-4 w-4" />
                {t("openStudio")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <div className="p-2">
              <LanguageSwitcher
                value={locale}
                onChange={(nextLocale) => {
                  router.replace(pathname, { locale: nextLocale });
                }}
                options={{
                  en: languageT("en"),
                  fr: languageT("fr"),
                  ar: languageT("ar"),
                }}
                label={languageT("label")}
              />
            </div>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <div className="p-2">
              <AdminLogOutButton />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default AdminHeader;

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

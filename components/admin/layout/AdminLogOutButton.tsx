"use client";

import { useLogOut } from "@sanity/sdk-react";
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";

function AdminLogOutButton() {
  const logout = useLogOut();
  const t = useTranslations("common.admin");

  const handleLogout = () => {
    logout();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-600 rounded-md transition-colors"
    >
      <LogOut className="h-4 w-4" />
      {t("logout")}
    </button>
  );
}

export default AdminLogOutButton;

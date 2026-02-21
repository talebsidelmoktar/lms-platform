import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import AdminBreadcrumb from "@/components/admin/layout/AdminBreadcrumb";
import AdminHeader from "@/components/admin/layout/AdminHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Providers } from "@/components/Providers";
import { getCurrentUser } from "@/lib/auth/server";

async function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("dashboard.admin");
  const user = await getCurrentUser();
  const role = user?.role ?? null;

  if (!user) {
    redirect("/");
  }

  if (role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <Providers>
      <div className="dark min-h-screen bg-[#09090b] text-white">
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        <Suspense
          fallback={
            <LoadingSpinner text={t("loading")} isFullScreen size="lg" />
          }
        >
          <AdminHeader />
          <div className="relative z-10 px-6 py-4">
            <AdminBreadcrumb />
          </div>
          <main className="relative z-10 px-6 pb-8 container mx-auto">
            {children}
          </main>
        </Suspense>
      </div>
    </Providers>
  );
}

export default AdminLayout;

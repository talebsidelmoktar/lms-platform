import { getTranslations } from "next-intl/server";
import {
  type PaymentRequestItem,
  PaymentRequestReviewList,
} from "@/components/admin/payment-requests/PaymentRequestReviewList";
import { sanityFetch } from "@/sanity/lib/live";
import { ADMIN_PAYMENT_REQUESTS_QUERY } from "@/sanity/lib/queries";

export default async function AdminPaymentRequestsPage() {
  const t = await getTranslations("dashboard.admin.paymentRequests");
  const { data } = await sanityFetch({
    query: ADMIN_PAYMENT_REQUESTS_QUERY,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          {t("title")}
        </h1>
        <p className="text-zinc-400 mt-1">{t("description")}</p>
      </div>

      <PaymentRequestReviewList
        initialRequests={(data ?? []) as PaymentRequestItem[]}
      />
    </div>
  );
}

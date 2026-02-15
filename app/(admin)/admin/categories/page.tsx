"use client";

import { useTranslations } from "next-intl";
import { DocumentList } from "@/components/admin/documents/DocumentList";
import { dataset, projectId } from "@/sanity/env";

export default function CategoriesPage() {
  const t = useTranslations("dashboard.admin.categoryList");
  return (
    <DocumentList
      documentType="category"
      title={t("title")}
      description={t("description")}
      basePath="/admin/categories"
      projectId={projectId}
      dataset={dataset}
    />
  );
}

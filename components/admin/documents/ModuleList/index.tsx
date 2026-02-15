"use client";

import {
  createDocument,
  createDocumentHandle,
  useApplyDocumentActions,
} from "@sanity/sdk-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Suspense, useState, useTransition } from "react";
import { ListPageHeader, SearchInput } from "@/components/admin/shared";
import { ModuleListSkeleton } from "@/components/admin/shared/DocumentSkeleton";
import { ModuleListContent } from "./ModuleListContent";
import type { ModuleListProps } from "./types";

export function ModuleList({ projectId, dataset }: ModuleListProps) {
  const t = useTranslations("dashboard.admin.moduleList");
  const router = useRouter();
  const [isCreating, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const apply = useApplyDocumentActions();

  const handleCreateModule = () => {
    startTransition(async () => {
      const newDocHandle = createDocumentHandle({
        documentId: crypto.randomUUID(),
        documentType: "module",
      });

      await apply(createDocument(newDocHandle));
      router.push(`/admin/modules/${newDocHandle.documentId}`);
    });
  };

  return (
    <div className="space-y-6">
      <ListPageHeader
        title={t("title")}
        description={t("description")}
        actionLabel={t("new")}
        onAction={handleCreateModule}
        isLoading={isCreating}
      />

      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={t("search")}
      />

      <Suspense fallback={<ModuleListSkeleton />}>
        <ModuleListContent
          projectId={projectId}
          dataset={dataset}
          onCreateModule={handleCreateModule}
          isCreating={isCreating}
          searchQuery={searchQuery}
        />
      </Suspense>
    </div>
  );
}

export type { ModuleListProps } from "./types";

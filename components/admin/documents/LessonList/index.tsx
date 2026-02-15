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
import { HierarchicalListSkeleton } from "@/components/admin/shared/DocumentSkeleton";
import { LessonListContent } from "./LessonListContent";
import type { LessonListProps } from "./types";

export function LessonList({ projectId, dataset }: LessonListProps) {
  const t = useTranslations("dashboard.admin.lessonList");
  const router = useRouter();
  const [isCreating, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const apply = useApplyDocumentActions();

  const handleCreateLesson = () => {
    startTransition(async () => {
      const newDocHandle = createDocumentHandle({
        documentId: crypto.randomUUID(),
        documentType: "lesson",
      });

      await apply(createDocument(newDocHandle));
      router.push(`/admin/lessons/${newDocHandle.documentId}`);
    });
  };

  return (
    <div className="space-y-6">
      <ListPageHeader
        title={t("title")}
        description={t("description")}
        actionLabel={t("new")}
        onAction={handleCreateLesson}
        isLoading={isCreating}
      />

      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={t("search")}
      />

      <Suspense fallback={<HierarchicalListSkeleton />}>
        <LessonListContent
          projectId={projectId}
          dataset={dataset}
          onCreateLesson={handleCreateLesson}
          isCreating={isCreating}
          searchQuery={searchQuery}
        />
      </Suspense>
    </div>
  );
}

export type { LessonListProps } from "./types";

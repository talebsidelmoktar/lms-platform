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
import { DocumentGridSkeleton } from "@/components/admin/shared/DocumentSkeleton";
import { CourseGrid } from "./CourseGrid";
import type { CourseListProps } from "./types";

export function CourseList({ projectId, dataset }: CourseListProps) {
  const t = useTranslations("dashboard.admin.courseList");
  const router = useRouter();
  const [isCreating, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const apply = useApplyDocumentActions();

  const handleCreateCourse = () => {
    startTransition(async () => {
      const newDocHandle = createDocumentHandle({
        documentId: crypto.randomUUID(),
        documentType: "course",
      });

      await apply(createDocument(newDocHandle));
      router.push(`/admin/courses/${newDocHandle.documentId}`);
    });
  };

  return (
    <div className="space-y-6">
      <ListPageHeader
        title={t("title")}
        description={t("description")}
        actionLabel={t("new")}
        onAction={handleCreateCourse}
        isLoading={isCreating}
      />

      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={t("search")}
      />

      <Suspense fallback={<DocumentGridSkeleton count={4} />}>
        <CourseGrid
          projectId={projectId}
          dataset={dataset}
          onCreateCourse={handleCreateCourse}
          isCreating={isCreating}
          searchQuery={searchQuery}
        />
      </Suspense>
    </div>
  );
}

export type { CourseListProps } from "./types";

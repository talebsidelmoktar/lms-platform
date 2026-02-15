"use client";

import { useDocuments } from "@sanity/sdk-react";
import { useTranslations } from "next-intl";
import { Suspense } from "react";
import { EmptyState } from "@/components/admin/shared";
import { Accordion } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseWithModules } from "./CourseWithModules";
import { ModuleItem } from "./ModuleItem";
import { OrphanModules } from "./OrphanModules";

interface ModuleListContentProps {
  projectId: string;
  dataset: string;
  onCreateModule: () => void;
  isCreating: boolean;
  searchQuery: string;
}

export function ModuleListContent({
  projectId,
  dataset,
  onCreateModule,
  isCreating,
  searchQuery,
}: ModuleListContentProps) {
  const t = useTranslations("dashboard.admin.moduleList");
  const { data: modules } = useDocuments({
    documentType: "module",
    projectId,
    dataset,
    search: searchQuery || undefined,
  });

  const { data: courses } = useDocuments({
    documentType: "course",
    projectId,
    dataset,
  });

  const coursesWithModules = new Set<string>();

  if (!modules || modules.length === 0) {
    return (
      <EmptyState
        emoji="📦"
        message={t("empty")}
        actionLabel={t("createFirst")}
        onAction={onCreateModule}
        isLoading={isCreating}
      />
    );
  }

  if (searchQuery) {
    return (
      <div className="space-y-2">
        {modules.map((doc) => (
          <Suspense
            key={doc.documentId}
            fallback={<Skeleton className="h-16 w-full bg-zinc-800" />}
          >
            <div className="pb-1">
              <ModuleItem {...doc} />
            </div>
          </Suspense>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {courses && courses.length > 0 && (
        <Accordion
          type="multiple"
          defaultValue={courses.map((c) => c.documentId)}
          className="space-y-3"
        >
          {courses.map((course) => (
            <Suspense
              key={course.documentId}
              fallback={<Skeleton className="h-24 w-full bg-zinc-800" />}
            >
              <CourseWithModules {...course} />
            </Suspense>
          ))}
        </Accordion>
      )}

      <OrphanModules
        documents={modules}
        coursesWithModules={coursesWithModules}
      />
    </div>
  );
}

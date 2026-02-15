"use client";

import { useDocuments } from "@sanity/sdk-react";
import { FileText, Link2, Video } from "lucide-react";
import { useTranslations } from "next-intl";
import { Suspense } from "react";
import { EmptyState } from "@/components/admin/shared";
import { Accordion } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseWithModulesAndLessons } from "./CourseWithModulesAndLessons";
import { LessonItem } from "./LessonItem";
import { OrphanLessons } from "./OrphanLessons";

interface LessonListContentProps {
  projectId: string;
  dataset: string;
  onCreateLesson: () => void;
  isCreating: boolean;
  searchQuery: string;
}

export function LessonListContent({
  projectId,
  dataset,
  onCreateLesson,
  isCreating,
  searchQuery,
}: LessonListContentProps) {
  const t = useTranslations("dashboard.admin.lessonList");
  const { data: lessons } = useDocuments({
    documentType: "lesson",
    projectId,
    dataset,
    search: searchQuery || undefined,
  });

  const { data: courses } = useDocuments({
    documentType: "course",
    projectId,
    dataset,
  });

  if (!lessons || lessons.length === 0) {
    return (
      <EmptyState
        emoji="🎬"
        message={t("empty")}
        actionLabel={t("createFirst")}
        onAction={onCreateLesson}
        isLoading={isCreating}
      />
    );
  }

  if (searchQuery) {
    return (
      <div className="space-y-1.5">
        {lessons.map((doc) => (
          <Suspense
            key={doc.documentId}
            fallback={<Skeleton className="h-12 w-full bg-zinc-800" />}
          >
            <div className="pb-1">
              <LessonItem {...doc} />
            </div>
          </Suspense>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-xs text-zinc-500 pb-2 border-b border-zinc-800">
        <span className="flex items-center gap-1.5">
          <Badge
            variant="secondary"
            className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs px-1.5 py-0"
          >
            <Video className="h-3 w-3" />
          </Badge>
          {t("legend.video")}
        </span>
        <span className="flex items-center gap-1.5">
          <Badge
            variant="secondary"
            className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs px-1.5 py-0"
          >
            <FileText className="h-3 w-3" />
          </Badge>
          {t("legend.content")}
        </span>
        <span className="flex items-center gap-1.5">
          <Badge
            variant="secondary"
            className="bg-violet-500/10 text-violet-400 border-violet-500/30 text-xs px-1.5 py-0"
          >
            <Link2 className="h-3 w-3" />
          </Badge>
          {t("legend.slug")}
        </span>
      </div>

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
              <CourseWithModulesAndLessons {...course} />
            </Suspense>
          ))}
        </Accordion>
      )}

      {(!courses || courses.length === 0) && (
        <OrphanLessons documents={lessons} />
      )}
    </div>
  );
}

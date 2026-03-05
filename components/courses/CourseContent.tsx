"use client";

import { CourseHero } from "./CourseHero";
import { ModuleAccordion } from "./ModuleAccordion";
import { CourseCompleteButton } from "./CourseCompleteButton";
import { GatedFallback } from "./GatedFallback";
import { useSupabaseSessionUser } from "@/lib/auth/client";
import { useUserTier, hasTierAccess } from "@/lib/hooks/use-user-tier";
import type { Tier } from "@/lib/constants";
import type { COURSE_WITH_MODULES_QUERYResult } from "@/sanity.types";
import { Skeleton } from "../ui/skeleton";

interface CourseContentProps {
  course: NonNullable<COURSE_WITH_MODULES_QUERYResult>;
  userId: string | null;
  serverUserTier?: Tier;
}

export function CourseContent({
  course,
  userId,
  serverUserTier,
}: CourseContentProps) {
  const { isLoaded: isAuthLoaded } = useSupabaseSessionUser();
  const userTier = useUserTier();
  const effectiveUserTier = serverUserTier ?? userTier;

  // Check if user has access to this course
  const hasAccess = hasTierAccess(effectiveUserTier, course.tier);

  // Calculate completion stats from actual lesson data
  let totalLessons = 0;
  let completedLessons = 0;

  for (const m of course.modules ?? []) {
    for (const l of m.lessons ?? []) {
      totalLessons++;
      if (userId && l.completedBy?.includes(userId)) {
        completedLessons++;
      }
    }
  }

  const isCourseCompleted = userId
    ? (course.completedBy?.includes(userId) ?? false)
    : false;

  if (!isAuthLoaded && !serverUserTier) {
    return <Skeleton className="w-full h-full" />;
  }

  return (
    <>
      <CourseHero
        title={course.title}
        description={course.description ?? null}
        tier={course.tier}
        thumbnail={course.thumbnail}
        category={course.category}
        moduleCount={course.moduleCount}
        lessonCount={course.lessonCount}
      />

      {hasAccess ? (
        <div className="space-y-8">
          {/* Course completion progress */}
          {userId && (
            <CourseCompleteButton
              courseId={course._id}
              courseSlug={course.slug!.current!}
              isCompleted={isCourseCompleted}
              completedLessons={completedLessons}
              totalLessons={totalLessons}
            />
          )}

          <ModuleAccordion modules={course.modules ?? null} userId={userId} />
        </div>
      ) : (
        <GatedFallback requiredTier={course.tier} />
      )}
    </>
  );
}

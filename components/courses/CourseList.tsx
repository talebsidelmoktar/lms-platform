"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { hasTierAccess, useUserTier } from "@/lib/hooks/use-user-tier";
import type { Tier } from "@/lib/constants";
import type { DASHBOARD_COURSES_QUERYResult } from "@/sanity.types";
import { CourseCard } from "./CourseCard";
import { type TierFilter, TierFilterTabs } from "./TierFilterTabs";

// Infer course type from Sanity query result
export type CourseListCourse = DASHBOARD_COURSES_QUERYResult[number];

interface CourseListProps {
  courses: CourseListCourse[];
  serverUserTier?: Tier;
  showFilters?: boolean;
  showSearch?: boolean;
  emptyMessage?: string;
}

export function CourseList({
  courses,
  serverUserTier,
  showFilters = true,
  showSearch = true,
  emptyMessage = "No courses found",
}: CourseListProps) {
  const t = useTranslations("common.course");
  const userTier = useUserTier();
  const effectiveUserTier = serverUserTier ?? userTier;
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter courses based on tier and search query
  const filteredCourses = courses.filter((course) => {
    // Tier filter
    if (tierFilter !== "all" && course.tier !== tierFilter) {
      return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const title = course.title?.toLowerCase() ?? "";
      const description = course.description?.toLowerCase() ?? "";
      if (!title.includes(query) && !description.includes(query)) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      {(showFilters || showSearch) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {showFilters && (
            <TierFilterTabs
              activeFilter={tierFilter}
              onFilterChange={setTierFilter}
            />
          )}

          {showSearch && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-sky-500"
              />
            </div>
          )}
        </div>
      )}

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const isLocked = !hasTierAccess(effectiveUserTier, course.tier);
            const lockedTier = course.tier ?? "pro";

            return (
              <CourseCard
                key={course._id}
                href={
                  isLocked
                    ? `/pricing?upgrade=${lockedTier}&source=locked-course`
                  : undefined
              }
              slug={course.slug ? { current: course.slug.current ?? "" } : null}
              title={course.title}
              description={course.description}
              tier={course.tier}
              thumbnail={course.thumbnail}
              moduleCount={course.moduleCount}
                lessonCount={course.lessonCount}
                isLocked={isLocked}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
            <Search className="w-6 h-6 text-zinc-500" />
          </div>
          <p className="text-zinc-400">{emptyMessage}</p>
          {(tierFilter !== "all" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setTierFilter("all");
                setSearchQuery("");
              }}
              className="mt-2 text-sm text-sky-400 hover:text-sky-300 transition-colors"
            >
              {t("clearFilters")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}


"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useRef } from "react";
import type { Tier } from "@/lib/constants";
import { hasTierAccess } from "@/lib/user-tier";
import type { ALL_COURSES_QUERYResult } from "@/sanity.types";
import { Button } from "../ui/button";
import { CourseCard } from "./CourseCard";

type DragState = {
  pointerId: number | null;
  startX: number;
  startScrollLeft: number;
  dragging: boolean;
};

export function CoursesSlider({
  courses,
  userTier,
}: {
  courses: ALL_COURSES_QUERYResult;
  userTier: Tier;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState>({
    pointerId: null,
    startX: 0,
    startScrollLeft: 0,
    dragging: false,
  });

  const scrollByPage = useCallback(
    (direction: "prev" | "next") => {
      const el = scrollerRef.current;
      if (!el) return;
      const page = Math.max(240, Math.round(el.clientWidth * 0.9));
      const sign = direction === "next" ? 1 : -1;
      const rtlFactor = getComputedStyle(el).direction === "rtl" ? -1 : 1;
      el.scrollBy({ left: rtlFactor * sign * page, behavior: "smooth" });
    },
    [],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = scrollerRef.current;
      if (!el) return;

      dragRef.current.pointerId = e.pointerId;
      dragRef.current.startX = e.clientX;
      dragRef.current.startScrollLeft = el.scrollLeft;
      dragRef.current.dragging = false;

      el.setPointerCapture(e.pointerId);
    },
    [],
  );

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;
    if (dragRef.current.pointerId !== e.pointerId) return;

    const dx = e.clientX - dragRef.current.startX;
    if (!dragRef.current.dragging && Math.abs(dx) > 6) {
      dragRef.current.dragging = true;
    }

    if (!dragRef.current.dragging) return;
    e.preventDefault();

    const rtlFactor = getComputedStyle(el).direction === "rtl" ? -1 : 1;
    el.scrollLeft = dragRef.current.startScrollLeft - dx * rtlFactor;
  }, []);

  const endDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;
    if (dragRef.current.pointerId !== e.pointerId) return;

    try {
      el.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    dragRef.current.pointerId = null;
    // keep `dragging` true until next tick to suppress click
    if (dragRef.current.dragging) {
      setTimeout(() => {
        dragRef.current.dragging = false;
      }, 0);
    }
  }, []);

  return (
    <div>
      <div className="flex items-center justify-end gap-2 mb-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="border-zinc-800 bg-zinc-900/60 text-white hover:bg-zinc-800"
          onClick={() => scrollByPage("prev")}
          aria-label="Scroll courses left"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="border-zinc-800 bg-zinc-900/60 text-white hover:bg-zinc-800"
          onClick={() => scrollByPage("next")}
          aria-label="Scroll courses right"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div
          ref={scrollerRef}
          className="flex gap-6 py-2 overflow-x-auto scroll-smooth snap-x snap-mandatory select-none cursor-grab active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [touch-action:pan-x] [overscroll-behavior-x:contain]"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={(e) => {
            if (!dragRef.current.dragging) return;
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {courses.map((course) => {
            const requiredTier = (course.tier ?? "free") as Tier;
            const locked = !hasTierAccess(userTier, requiredTier);
            const href = locked ? "/pricing" : undefined;

            return (
              <div
                key={course._id}
                className="w-[260px] sm:w-[300px] lg:w-[320px] shrink-0 snap-start"
              >
                <CourseCard
                  href={href}
                  isLocked={locked}
                  slug={
                    course.slug
                      ? { current: course.slug.current ?? "" }
                      : null
                  }
                  title={course.title}
                  description={course.description}
                  tier={course.tier}
                  thumbnail={course.thumbnail}
                  moduleCount={course.moduleCount}
                  lessonCount={course.lessonCount}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

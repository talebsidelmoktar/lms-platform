import type { CSSProperties } from "react";
import {
  type TestimonialAuthor,
  TestimonialCard,
} from "@/components/ui/testimonial-card";
import { cn } from "@/lib/utils";

export type TestimonialsColumnItem = {
  author: TestimonialAuthor;
  text: string;
  href?: string;
};

export function TestimonialsColumn({
  className,
  testimonials,
  duration = 15,
}: {
  className?: string;
  testimonials: TestimonialsColumnItem[];
  duration?: number;
}) {
  const loop = testimonials.length
    ? [...testimonials, ...testimonials]
    : testimonials;

  return (
    <div
      className={cn("w-full max-w-xs", className)}
      style={
        {
          ["--testimonials-scroll-duration" as string]: `${duration}s`,
        } as CSSProperties
      }
    >
      <div className="animate-testimonials-scroll flex flex-col gap-6 pb-6 will-change-transform">
        {loop.map((t, index) => (
          <TestimonialCard
            key={`${index}-${t.author.name}`}
            author={t.author}
            text={t.text}
            href={t.href}
          />
        ))}
      </div>
    </div>
  );
}

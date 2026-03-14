import {
  TestimonialsColumn,
  type TestimonialsColumnItem,
} from "@/components/ui/testimonials-column";
import { cn } from "@/lib/utils";

export function TestimonialsSection({
  id,
  badge,
  title,
  description,
  testimonials,
  className,
}: {
  id?: string;
  badge?: string;
  title: string;
  description: string;
  testimonials: TestimonialsColumnItem[];
  className?: string;
}) {
  const split = Math.ceil(testimonials.length / 3);
  const firstColumn = testimonials.slice(0, split);
  const secondColumn = testimonials.slice(split, split * 2);
  const thirdColumn = testimonials.slice(split * 2);

  return (
    <section
      id={id}
      className={cn(
        "relative px-6 lg:px-12 py-16 sm:py-24 max-w-7xl mx-auto",
        className,
      )}
    >
      <div className="flex flex-col items-center justify-center max-w-[640px] mx-auto">
        {badge ? (
          <div className="flex justify-center">
            <div className="border border-white/10 bg-white/5 py-1 px-4 rounded-lg text-sm text-zinc-200">
              {badge}
            </div>
          </div>
        ) : null}

        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mt-5 text-center">
          {title}
        </h2>
        <p className="text-center mt-5 text-zinc-400">{description}</p>
      </div>

      <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)] max-h-[740px] overflow-hidden">
        <TestimonialsColumn testimonials={firstColumn} duration={15} />
        <TestimonialsColumn
          testimonials={secondColumn}
          className="hidden md:block"
          duration={19}
        />
        <TestimonialsColumn
          testimonials={thirdColumn}
          className="hidden lg:block"
          duration={17}
        />
      </div>
    </section>
  );
}

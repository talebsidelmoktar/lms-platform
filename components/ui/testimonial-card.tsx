import type { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface TestimonialAuthor {
  name: string;
  title?: string;
  avatar?: string;
}

export function TestimonialCard({
  author,
  text,
  href,
  className,
}: {
  author: TestimonialAuthor;
  text: string;
  href?: string;
  className?: string;
}) {
  const Wrapper = href
    ? ({ children }: { children: ReactNode }) => (
        <a
          href={href}
          className="transition-opacity hover:opacity-90 focus-visible:opacity-90"
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      )
    : ({ children }: { children: ReactNode }) => <>{children}</>;

  const initials = author.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <Wrapper>
      <Card
        className={cn(
          "w-full max-w-[350px] h-full flex flex-col",
          "bg-sky-500/10 border-sky-500/20 text-white shadow-none",
          "py-0 transition-none",
          className,
        )}
      >
        <CardContent className="flex h-full flex-col justify-between gap-4 p-6">
          <p className="text-sm text-zinc-300 leading-relaxed">
            &ldquo;{text}&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {author.avatar ? (
                <AvatarImage src={author.avatar} alt={author.name} />
              ) : null}
              <AvatarFallback className="text-sm font-medium bg-zinc-800 text-zinc-200">
                {initials || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-sm font-medium leading-none text-white">
                {author.name}
              </p>
              {author.title ? (
                <p className="text-xs text-zinc-500">{author.title}</p>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </Wrapper>
  );
}

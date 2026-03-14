"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled,
  className,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  className?: string;
}) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        id={inputId}
        type={isVisible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        className={cn("pr-11", className)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={() => setIsVisible((v) => !v)}
        className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-zinc-400 hover:text-white hover:bg-white/5"
        aria-label={isVisible ? "Hide password" : "Show password"}
      >
        {isVisible ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

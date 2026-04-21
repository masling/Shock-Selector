import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-accent/20 bg-accent-soft px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-accent-dark",
        className,
      )}
    >
      {children}
    </span>
  );
}

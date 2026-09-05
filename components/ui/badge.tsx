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
        "inline-flex items-center rounded-md bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent-dark",
        className,
      )}
    >
      {children}
    </span>
  );
}

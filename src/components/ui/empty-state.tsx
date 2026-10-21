import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** Shared empty state for admin lists and filtered public grids. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center border border-dashed border-border px-6 py-16 text-center",
        className,
      )}
    >
      <div className="brackets mb-5 flex size-12 items-center justify-center text-gold">
        <Icon className="size-5" aria-hidden />
      </div>
      <p className="font-wide text-sm font-semibold tracking-wide uppercase">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

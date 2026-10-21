import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Underline fields, like entries on a logbook line — no boxes. A gold rule
 * fills in on focus.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full min-w-0 rounded-none border-0 border-b border-input bg-transparent px-0.5 py-2 text-[0.9375rem] transition-[border-color,box-shadow] duration-300",
        "placeholder:text-muted-foreground/55",
        "file:mr-3 file:inline-flex file:h-7 file:cursor-pointer file:border-0 file:bg-secondary file:px-3 file:font-mono file:text-[0.625rem] file:tracking-[0.12em] file:text-secondary-foreground file:uppercase",
        "hover:border-foreground/35",
        "focus-visible:border-gold focus-visible:shadow-[0_1px_0_0_var(--gold)] focus-visible:outline-none",
        "aria-invalid:border-destructive aria-invalid:focus-visible:shadow-[0_1px_0_0_var(--destructive)]",
        "disabled:cursor-not-allowed disabled:opacity-55",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

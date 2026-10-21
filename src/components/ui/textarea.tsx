import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "field-sizing-content flex min-h-28 w-full rounded-none border border-input bg-transparent px-3.5 py-3 text-[0.9375rem] leading-relaxed transition-[border-color,box-shadow] duration-300",
        "placeholder:text-muted-foreground/55",
        "hover:border-foreground/35",
        "focus-visible:border-gold focus-visible:shadow-[inset_0_0_0_1px_var(--gold)] focus-visible:outline-none",
        "aria-invalid:border-destructive",
        "disabled:cursor-not-allowed disabled:opacity-55",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

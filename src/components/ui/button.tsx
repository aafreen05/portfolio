import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-none",
    "font-wide text-[0.6875rem] font-medium tracking-[0.14em] uppercase",
    "transition-[color,background-color,background-position,border-color,box-shadow,transform,opacity] duration-400 ease-out",
    "outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-45",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
    "active:translate-y-px",
  ],
  {
    variants: {
      variant: {
        /** Ink that turns to gold — the default action. */
        default: "bg-primary text-primary-foreground hover:bg-gold hover:text-accent-foreground",
        /** Metallic gold. One per view, for the action that matters most. */
        gilded:
          "scan bg-[image:var(--gild-surface)] bg-[length:220%_auto] bg-left font-semibold text-[var(--gild-ink)] shadow-[0_12px_36px_-16px_var(--gold)] hover:bg-right hover:shadow-[0_16px_44px_-14px_var(--gold)]",
        /** Corner brackets that grow into a full frame on hover. */
        bracket: "brackets text-foreground hover:text-gold",
        outline: "border border-border bg-transparent hover:border-gold/60 hover:text-gold",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        ghost: "hover:bg-secondary hover:text-foreground",
        link: "h-auto! px-0! font-sans text-sm tracking-normal normal-case text-foreground underline-offset-[6px] hover:text-gold hover:underline",
        destructive: "bg-destructive text-destructive-foreground hover:brightness-110",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-[0.625rem]",
        lg: "h-13 px-8",
        xl: "h-14 px-9 text-xs",
        icon: "size-10 tracking-normal",
        "icon-sm": "size-8 tracking-normal [&_svg:not([class*='size-'])]:size-3.5",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };

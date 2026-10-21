import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Tags are set in Space Mono capitals with square corners — catalogue
 * labels on an instrument, not candy pills.
 */
const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-none border font-mono text-[0.625rem] font-normal tracking-[0.12em] whitespace-nowrap uppercase transition-colors [&_svg]:size-2.5 [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "border-border bg-secondary/60 text-secondary-foreground",
        outline: "border-border text-muted-foreground",
        solid: "border-transparent bg-primary text-primary-foreground",
        /** The binary pair and the three category tints. */
        gold: "border-gold/35 bg-gold-soft text-gold",
        ice: "border-ice/35 bg-ice-soft text-ice",
        ember: "border-ember/35 bg-ember-soft text-ember",
        orchid: "border-orchid/35 bg-orchid-soft text-orchid",
        sage: "border-sage/35 bg-sage-soft text-sage",
        accent: "border-gold/35 bg-gold-soft text-gold",
        success: "border-sage/35 bg-sage-soft text-sage",
        warning: "border-ember/35 bg-ember-soft text-ember",
        destructive: "border-destructive/30 bg-destructive/10 text-destructive",
      },
      size: {
        default: "px-2.5 py-1",
        sm: "px-2 py-0.5 text-[0.5625rem]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

/** Tints, in the order categories are assigned them. */
export const TINTS = ["gold", "ice", "ember", "orchid", "sage"] as const;
export type Tint = (typeof TINTS)[number];

/**
 * Deterministically maps a label to one of the five tints, so a category
 * keeps the same colour everywhere, across rebuilds, with no configuration.
 */
export function tintForLabel(label: string): Tint {
  let hash = 0;
  for (let i = 0; i < label.length; i += 1) {
    hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  }
  return TINTS[hash % TINTS.length];
}

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp data-slot="badge" className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

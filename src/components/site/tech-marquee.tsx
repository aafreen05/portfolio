import { Marquee } from "@/components/motion/marquee";
import { Sparkle } from "@/components/site/sparkle";
import { cn } from "@/lib/utils";

/**
 * Two counter-scrolling bands of technology names: condensed capitals
 * alternating solid and hollow, over a fine mono ticker running the other
 * way. Pure CSS motion that never stops for the pointer.
 *
 * Screen readers hear the list once — the second band and the marquee's
 * loop copies are hidden from assistive tech.
 */
export function TechMarquee({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <section aria-label="Technologies I work with" className="relative border-y border-border py-7 sm:py-9">
      <Marquee speed={70}>
        {items.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center">
            <span
              className={cn(
                "condensed px-5 text-[clamp(2.25rem,5vw,4.25rem)] leading-[1.1] sm:px-7",
                index % 2 === 0 ? "text-foreground/90" : "text-outline-gold",
              )}
            >
              {item}
            </span>
            <Sparkle className="size-3.5 text-gold/80 sm:size-4" />
          </span>
        ))}
      </Marquee>

      <div aria-hidden className="mt-5">
        <Marquee speed={45} reverse>
          {items.map((item, index) => (
            <span
              key={`${item}-mono-${index}`}
              className="px-5 font-mono text-[0.6875rem] tracking-[0.3em] text-muted-foreground uppercase"
            >
              {item} <span className="text-gold">/</span>
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}

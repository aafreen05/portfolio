import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  /** Two-digit section number, e.g. "02". */
  index: string;
  kicker: string;
  title: React.ReactNode;
  description?: string;
  /** Rendered opposite the heading on wide screens, usually a link. */
  aside?: React.ReactNode;
  className?: string;
}

/**
 * Section opener: Space Mono coordinates, a quiet Antonio numeral behind,
 * and whatever pairing the title uses.
 */
export function SectionHeading({
  index,
  kicker,
  title,
  description,
  aside,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Hollow numeral behind the heading — atmosphere, not content. */}
      <span
        aria-hidden
        className="condensed text-outline pointer-events-none absolute -top-4 right-0 select-none text-[clamp(5rem,11vw,9rem)] leading-[0.8] sm:-top-8"
      >
        {index}
      </span>

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <Reveal className="max-w-3xl">
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-gold">§ {index}</span>
            <span aria-hidden className="draw-rule h-px w-12 bg-gold/60" />
            <span className="kicker">{kicker}</span>
          </div>

          <h2 className="mt-6">{title}</h2>

          {description ? (
            <p className="mt-6 max-w-xl text-[0.9375rem] leading-[1.8] text-muted-foreground sm:text-base">
              {description}
            </p>
          ) : null}
        </Reveal>

        {aside ? (
          <Reveal delay={0.15} className="shrink-0">
            {aside}
          </Reveal>
        ) : null}
      </div>
    </div>
  );
}

/**
 * The house heading: a line of wide geometric capitals over a gilded serif
 * italic. Two voices — system and design — in one line of thought. Sized
 * to lead a section, not to shout.
 */
export function DuoTitle({ caps, italic }: { caps: string; italic: string }) {
  return (
    <>
      <span className="wide-caps block text-[clamp(1.15rem,2.4vw,1.75rem)] leading-[1.1]">{caps}</span>
      <span className="serif-italic text-gilded block text-[clamp(2.2rem,4.8vw,3.75rem)] leading-[1.08]">
        {italic}
      </span>
    </>
  );
}

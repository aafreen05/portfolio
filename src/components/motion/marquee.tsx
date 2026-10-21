import { cn } from "@/lib/utils";

/**
 * Infinite horizontal ticker — pure CSS, no JavaScript.
 *
 * The track holds two identical copies of the children and translates by
 * exactly -50%, so the loop is seamless. The duplicate is `aria-hidden` and
 * the whole strip is presentational, so a screen reader hears the list once.
 *
 * It deliberately keeps running under the pointer: a ticker that freezes
 * whenever the cursor crosses it reads as a glitch, not a feature.
 */
export function Marquee({
  children,
  speed = 42,
  reverse = false,
  className,
}: {
  children: React.ReactNode;
  /** Seconds for one full pass. Longer reads calmer. */
  speed?: number;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("fade-x relative overflow-clip", className)}>
      <div
        className={cn(
          "animate-marquee flex w-max items-center",
          reverse && "[animation-direction:reverse]",
        )}
        style={{ "--marquee-duration": `${speed}s` } as React.CSSProperties}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}

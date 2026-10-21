import { cn } from "@/lib/utils";

/**
 * Four-point star — the recurring glyph of the design. Used as bullet,
 * separator, active-state marker and brand mark.
 */
export function Sparkle({
  className,
  twinkle = false,
}: {
  className?: string;
  /** Adds the slow twinkle loop. */
  twinkle?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      focusable="false"
      className={cn("inline-block shrink-0", twinkle && "animate-twinkle", className)}
      fill="currentColor"
    >
      <path d="M8 0 9.5 6.5 16 8 9.5 9.5 8 16 6.5 9.5 0 8 6.5 6.5Z" />
    </svg>
  );
}

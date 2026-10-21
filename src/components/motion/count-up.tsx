"use client";

import * as React from "react";

/**
 * Counts from zero to `value` the first time the element is on screen.
 *
 * Stepped with `setTimeout` rather than rAF for the same reason as the scroll
 * reveals: rAF stalls in throttled renderers, and a stat frozen at 0 is worse
 * than one that arrives a frame late. The final value is rendered on the
 * server, so it is correct before hydration and for anyone without JS.
 */
export function CountUp({
  value,
  duration = 1100,
  pad = 0,
  className,
}: {
  value: number;
  duration?: number;
  /** Zero-pad to this many digits, e.g. 2 → "05". */
  pad?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = React.useState(value);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer: number | undefined;
    let cancelled = false;

    const run = () => {
      const start = Date.now();
      setDisplay(0);

      const tick = () => {
        if (cancelled) return;
        const elapsed = Date.now() - start;
        const progress = Math.min(1, elapsed / duration);
        // easeOutExpo — fast out of the gate, settles gently on the number.
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

        setDisplay(Math.round(eased * value));
        if (progress < 1) timer = window.setTimeout(tick, 32);
      };

      tick();
    };

    const check = () => {
      if (cancelled) return;
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
        window.removeEventListener("scroll", check);
        run();
      }
    };

    window.addEventListener("scroll", check, { passive: true });
    timer = window.setTimeout(check, 120);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener("scroll", check);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {String(display).padStart(pad, "0")}
    </span>
  );
}

"use client";

import * as React from "react";

/**
 * Altitude gauge — a vertical instrument on the right edge of wide screens.
 *
 * A gold marker climbs a ticked rail as the page scrolls, and the name of the
 * section in view is set vertically beside it. Sections opt in by carrying a
 * `data-label` attribute; pages without any show progress alone.
 *
 * Measured on a throttled passive scroll listener (not rAF, not
 * IntersectionObserver — both stall in throttled renderers). Decorative, so
 * `aria-hidden`: the navbar already announces the active section.
 */
export function Altitude() {
  const [progress, setProgress] = React.useState(0);
  const [label, setLabel] = React.useState("");

  React.useEffect(() => {
    let queued = false;

    const measure = () => {
      queued = false;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0);

      const marker = window.innerHeight * 0.4;
      let current = "";
      for (const section of document.querySelectorAll<HTMLElement>("[data-label]")) {
        if (section.getBoundingClientRect().top <= marker) current = section.dataset.label ?? "";
      }
      setLabel(current);
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      window.setTimeout(measure, 80);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const percent = Math.round(progress * 100);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed top-1/2 right-6 z-40 hidden -translate-y-1/2 items-center gap-4 min-[92.5rem]:flex"
    >
      <span
        className="font-mono text-[0.625rem] tracking-[0.3em] text-muted-foreground uppercase transition-opacity duration-500"
        style={{ writingMode: "vertical-rl", opacity: label ? 1 : 0 }}
      >
        {label || "—"}
      </span>

      <div className="flex flex-col items-center gap-3">
        <span className="font-mono text-[0.625rem] tabular-nums text-gold">
          {String(percent).padStart(3, "0")}
        </span>

        <div className="relative h-[34vh] w-px bg-border">
          {/* Tick marks, like a gauge. */}
          {Array.from({ length: 11 }).map((_, i) => (
            <span
              key={i}
              className="absolute left-1/2 h-px -translate-x-1/2 bg-border"
              style={{ top: `${i * 10}%`, width: i % 5 === 0 ? 10 : 5 }}
            />
          ))}

          {/* Filled rail. */}
          <span
            className="absolute inset-x-0 top-0 bg-gold/70 transition-[height] duration-300 ease-out"
            style={{ height: `${percent}%` }}
          />

          {/* The marker: a small gold star. */}
          <span
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 transition-[top] duration-300 ease-out"
            style={{ top: `${percent}%` }}
          >
            <svg viewBox="0 0 16 16" className="size-3 text-gold" fill="currentColor">
              <path d="M8 0 9.6 6.4 16 8 9.6 9.6 8 16 6.4 9.6 0 8 6.4 6.4Z" />
            </svg>
          </span>
        </div>

        <span className="font-mono text-[0.625rem] text-muted-foreground">ALT</span>
      </div>
    </div>
  );
}

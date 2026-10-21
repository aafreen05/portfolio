"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Decoding text — the "code" voice of the design.
 *
 * Characters resolve left to right out of a stream of random glyphs, like a
 * signal locking on. Always set in a monospace face so the scramble never
 * shifts layout.
 *
 * Driven by `setInterval`, not rAF: rAF stalls in throttled renderers and a
 * label frozen mid-scramble reads as broken. The real text is always in the
 * DOM for assistive tech; only the animated copy is `aria-hidden`.
 */

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+<>/\\{}[]=~";
const TICK_MS = 32;

function randomGlyph() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Returns the text currently on screen and a `run(target)` that decodes
 * toward a new string over `duration` milliseconds.
 */
function useDecoder(initial: string, duration = 650) {
  const [display, setDisplay] = React.useState(initial);
  const timer = React.useRef<number | undefined>(undefined);

  const run = React.useCallback(
    (target: string) => {
      window.clearInterval(timer.current);

      if (prefersReducedMotion()) {
        setDisplay(target);
        return;
      }

      const start = Date.now();
      // Each position locks at its own moment, loosely left to right.
      const lockAt = Array.from(
        target,
        (_, i) => (i / Math.max(1, target.length)) * duration * 0.75 + Math.random() * duration * 0.25,
      );

      timer.current = window.setInterval(() => {
        const elapsed = Date.now() - start;
        let done = true;

        const next = Array.from(target, (char, i) => {
          if (char === " " || elapsed >= lockAt[i]) return char;
          done = false;
          return randomGlyph();
        }).join("");

        setDisplay(next);
        if (done) window.clearInterval(timer.current);
      }, TICK_MS);
    },
    [duration],
  );

  React.useEffect(() => () => window.clearInterval(timer.current), []);

  return [display, run] as const;
}

/**
 * Scrambles and re-resolves whenever the *parent* interactive element is
 * hovered or focused — put it inside a link or button.
 */
export function ScrambleText({ text, className }: { text: string; className?: string }) {
  const [display, run] = useDecoder(text, 480);
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const host = ref.current?.closest("a, button");
    if (!host) return;

    const trigger = () => run(text);
    host.addEventListener("pointerenter", trigger);
    host.addEventListener("focus", trigger);
    return () => {
      host.removeEventListener("pointerenter", trigger);
      host.removeEventListener("focus", trigger);
    };
  }, [run, text]);

  return (
    <span ref={ref} className={cn("relative inline-block", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>{display}</span>
    </span>
  );
}

/**
 * Cycles through `items`, decoding from one to the next. Pauses while hovered
 * or focused (so it can be read), and holds still under reduced motion.
 */
export function RoleRotator({
  items,
  interval = 3200,
  className,
}: {
  items: string[];
  interval?: number;
  className?: string;
}) {
  const [display, run] = useDecoder(items[0] ?? "", 700);
  const [paused, setPaused] = React.useState(false);
  const index = React.useRef(0);

  React.useEffect(() => {
    if (items.length < 2 || paused || prefersReducedMotion()) return;

    const id = window.setInterval(() => {
      index.current = (index.current + 1) % items.length;
      run(items[index.current]);
    }, interval);

    return () => window.clearInterval(id);
  }, [items, interval, paused, run]);

  return (
    <span
      className={cn("relative inline-flex items-center", className)}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      {/* Every role, once, for screen readers. */}
      <span className="sr-only">{items.join(", ")}</span>
      <span aria-hidden>{display}</span>
      <span aria-hidden className="animate-caret ml-1 inline-block h-[1em] w-[0.55em] bg-current opacity-70" />
    </span>
  );
}

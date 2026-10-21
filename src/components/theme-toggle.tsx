"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { MoonStar, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * One click, one change: Night ⇄ Porcelain.
 *
 * This used to open a dropdown menu, and that menu was the cause of the
 * page shifting sideways on every theme change. Radix menus are modal:
 * while open they lock scrolling by hiding the body's overflow and padding
 * the body by the scrollbar's width. A plain toggle needs no menu, so it
 * never touches scroll or layout at all.
 *
 * Where the View Transitions API exists, the new theme is revealed as a
 * circle growing out of the button. The class is switched synchronously
 * inside the transition callback (next-themes would otherwise apply it a
 * frame later, after the "new" snapshot was taken). Without the API, or
 * with reduced motion requested, the switch is instant.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme } = useTheme();
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  function apply(next: "light" | "dark") {
    const root = document.documentElement;

    // Freeze CSS transitions for the switch itself, so colours change in
    // one frame instead of each element easing at its own speed.
    const freeze = document.createElement("style");
    freeze.textContent = "*,*::before,*::after{transition:none!important}";
    document.head.appendChild(freeze);

    root.classList.remove("light", "dark");
    root.classList.add(next);
    root.style.colorScheme = next;
    flushSync(() => setTheme(next));

    // Force the new styles to compute before transitions come back.
    void window.getComputedStyle(document.body).color;
    window.setTimeout(() => freeze.remove(), 1);
  }

  function toggle() {
    // The class on <html> is the truth even before hydration settles.
    const next = document.documentElement.classList.contains("dark") ? "light" : "dark";

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (typeof document.startViewTransition !== "function" || reduceMotion) {
      apply(next);
      return;
    }

    const rect = buttonRef.current?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 48;
    const y = rect ? rect.top + rect.height / 2 : 32;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const transition = document.startViewTransition(() => apply(next));
    transition.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          {
            duration: 700,
            easing: "cubic-bezier(0.65, 0, 0.35, 1)",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      .catch(() => {
        // A skipped transition still ran the callback; nothing to undo.
      });
  }

  return (
    <Button
      ref={buttonRef}
      type="button"
      variant="bracket"
      size="icon-sm"
      onClick={toggle}
      className={cn("overflow-hidden text-muted-foreground hover:text-gold", className)}
      aria-label="Toggle light and dark theme"
      title="Toggle theme"
    >
      {/*
        Both icons are always rendered and swapped by the `dark` class, so
        the right one is in the very first paint with nothing to hydrate.
      */}
      <Sun
        aria-hidden
        className="absolute size-3.5 transition-[rotate,scale,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] dark:scale-50 dark:-rotate-90 dark:opacity-0"
      />
      <MoonStar
        aria-hidden
        className="absolute size-3.5 scale-50 rotate-90 opacity-0 transition-[rotate,scale,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] dark:scale-100 dark:rotate-0 dark:opacity-100"
      />
    </Button>
  );
}

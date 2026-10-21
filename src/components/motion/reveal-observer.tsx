"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    __revealFailsafe?: number;
  }
}

/** Reveal anything whose top edge has entered this fraction of the viewport. */
const TRIGGER_RATIO = 0.92;

/**
 * The one piece of JavaScript behind every section reveal on the site.
 *
 * Mounted once in the root layout. It measures unrevealed `[data-reveal]`
 * elements on scroll and flips `data-visible`, which CSS transitions respond to.
 *
 * Deliberately not IntersectionObserver: IO callbacks are tied to the
 * rendering lifecycle and never fire while a page is not being painted, which
 * would leave content stranded at opacity 0 in exactly the cases a visitor
 * would not forgive — a restored background tab, a throttled or low-power
 * renderer. A rect measurement on a passive scroll listener always resolves.
 * The cost stays negligible because elements leave the pending set as they
 * reveal, and the listener detaches once the set is empty.
 */
export function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement;

    // The inline head script hid these and armed a failsafe in case this file
    // never ran. It ran, so disarm it — this effect owns visibility now.
    if (window.__revealFailsafe) {
      window.clearTimeout(window.__revealFailsafe);
      window.__revealFailsafe = undefined;
    }

    // Reduced motion: show everything at once, with no transition at all.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.remove("js");
      return;
    }

    let pending: HTMLElement[] = [];
    let scheduled = false;
    let disposed = false;

    const collect = () => {
      pending = Array.from(
        document.querySelectorAll<HTMLElement>(
          "[data-reveal]:not([data-visible]), [data-reveal-group]:not([data-visible])",
        ),
      );
    };

    const reveal = (element: HTMLElement) => {
      element.dataset.visible = "true";

      // A group staggers its own items rather than animating as one block.
      if (element.hasAttribute("data-reveal-group")) {
        const stagger = Number(element.dataset.revealStagger) || 0.07;
        element
          .querySelectorAll<HTMLElement>("[data-reveal-item]")
          .forEach((item, index) => {
            item.style.transitionDelay = `${index * stagger}s`;
            item.dataset.visible = "true";
          });
      }
    };

    const check = () => {
      scheduled = false;
      if (disposed || pending.length === 0) return;

      const limit = window.innerHeight * TRIGGER_RATIO;
      const remaining: HTMLElement[] = [];

      for (const element of pending) {
        // `top < limit` also covers anything already scrolled past, so
        // deep-linking to #contact does not leave the sections above it blank.
        if (element.getBoundingClientRect().top < limit) reveal(element);
        else remaining.push(element);
      }

      pending = remaining;
      if (pending.length === 0) detach();
    };

    const schedule = () => {
      if (scheduled || disposed) return;
      scheduled = true;
      // A timeout rather than rAF: rAF is throttled in exactly the
      // low-paint conditions this needs to survive.
      window.setTimeout(check, 100);
    };

    const onScroll = () => schedule();

    const attach = () => {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
    };

    const detach = () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };

    const refresh = () => {
      collect();
      if (pending.length > 0) {
        attach();
        check();
      }
    };

    refresh();

    /**
     * Late passes catch content that lands after hydration — fonts changing
     * metrics, images loading, streamed sections — without waiting for a
     * scroll. They also guarantee that whatever is above the fold resolves
     * even if scroll events are being coalesced or suppressed. Anything below
     * the fold still needs a scroll, which is fine: if no scroll ever
     * happened, the visitor never reached it.
     */
    const settles = [400, 1200, 2500].map((delay) => window.setTimeout(refresh, delay));

    // Client-side navigation swaps the tree without remounting this component.
    const mutation = new MutationObserver(refresh);
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      disposed = true;
      for (const settle of settles) window.clearTimeout(settle);
      mutation.disconnect();
      detach();
    };
  }, []);

  return null;
}

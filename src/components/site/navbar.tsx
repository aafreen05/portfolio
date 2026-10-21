"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";

import { ScrambleText } from "@/components/motion/scramble-text";
import { Sparkle } from "@/components/site/sparkle";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { NAV_SECTIONS, sectionHref, type NavSectionId } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface NavbarProps {
  name: string;
  hasResume: boolean;
}

export function Navbar({ name, hasResume }: NavbarProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<NavSectionId>("home");

  // Detach into a floating instrument bar once the hero moves away.
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /**
   * Scroll-spy by measurement rather than IntersectionObserver: IO callbacks
   * are tied to the paint lifecycle and stall in throttled renderers, which
   * would pin the marker to "Home" for the whole page.
   */
  React.useEffect(() => {
    if (!isHome) return;
    let queued = false;

    const measure = () => {
      queued = false;
      const marker = window.innerHeight * 0.32;
      let current: NavSectionId = "home";
      for (const { id } of NAV_SECTIONS) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= marker) current = id;
      }
      setActive(current);
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      window.setTimeout(measure, 100);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isHome]);

  /*
   * Lock page scroll under the open menu. Hiding the overflow also removes
   * the scrollbar, which would widen the page underneath by its width — so
   * the body is padded by exactly that gap to keep everything still.
   */
  React.useEffect(() => {
    if (!open) return;
    const { body, documentElement } = document;
    const gap = window.innerWidth - documentElement.clientWidth;
    const previous = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };

    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    return () => {
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.paddingRight;
    };
  }, [open]);

  // The menu is hidden from xl up; if the window grows past that while it
  // is open, close it too, or the scroll lock would outlive it.
  React.useEffect(() => {
    if (!open) return;
    const query = window.matchMedia("(min-width: 80rem)");
    const onChange = () => {
      if (query.matches) setOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [open]);

  const menuButtonRef = React.useRef<HTMLButtonElement>(null);

  function closeMenu({ restoreFocus }: { restoreFocus: boolean }) {
    setOpen(false);
    if (restoreFocus) menuButtonRef.current?.focus();
  }

  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      menuButtonRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[80] focus:bg-gold focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:text-accent-foreground focus:uppercase"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50 w-full">
        <div
          className={cn(
            "mx-auto w-full transition-[max-width,padding] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
            scrolled ? "max-w-[76rem] px-3 pt-3 sm:px-5" : "max-w-[82rem] px-0 pt-0",
          )}
        >
          <nav
            aria-label="Primary"
            className={cn(
              "relative flex items-center justify-between gap-6 border transition-[background-color,border-color,height,padding] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
              scrolled
                ? "h-14 border-border bg-background/75 px-4 backdrop-blur-xl sm:px-5"
                : "h-20 border-transparent bg-transparent px-5 sm:px-8 lg:px-12",
            )}
          >
            {/* Gold corner marks appear once the bar floats. */}
            <span
              aria-hidden
              className={cn(
                "brackets pointer-events-none absolute -inset-px text-gold transition-opacity duration-700",
                scrolled ? "opacity-100" : "opacity-0",
              )}
            />

            <Link
              href="/"
              className="group relative flex shrink-0 items-center gap-2.5 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Sparkle
                twinkle
                className="size-3.5 text-gold transition-transform duration-700 group-hover:rotate-90"
              />
              <span className="font-wide text-[0.6875rem] font-semibold tracking-[0.16em] uppercase">
                {name}
              </span>
            </Link>

            <ul className="relative hidden items-center gap-1 xl:flex">
              {NAV_SECTIONS.map(({ id, label }, index) => {
                const isActive = isHome && active === id;
                return (
                  <li key={id}>
                    <Link
                      href={sectionHref(id, isHome)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "group flex items-center gap-1.5 px-2 py-2 font-mono text-[0.6875rem] tracking-[0.12em] uppercase transition-colors duration-300 2xl:px-2.5 2xl:tracking-[0.14em]",
                        "focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
                        isActive ? "text-gold" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "grid w-2.5 place-items-center transition-all duration-500",
                          isActive ? "scale-100 opacity-100" : "scale-50 opacity-0",
                        )}
                      >
                        <Sparkle className="size-2.5" />
                      </span>
                      {/* Indices only where there is room: between 1280 and
                          1536 they would push a Résumé button off the bar. */}
                      <span aria-hidden className="hidden text-[0.5625rem] opacity-50 2xl:inline">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <ScrambleText text={label} />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="relative flex items-center gap-2">
              <ThemeToggle />
              {hasResume ? (
                <Button asChild variant="bracket" size="sm" className="hidden sm:inline-flex">
                  <a href="/resume" target="_blank" rel="noopener noreferrer">
                    Resume
                    <ArrowUpRight aria-hidden />
                  </a>
                </Button>
              ) : null}
              <Button
                ref={menuButtonRef}
                variant="bracket"
                size="icon-sm"
                className="xl:hidden"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                aria-expanded={open}
                aria-controls="mobile-nav"
              >
                <Menu aria-hidden />
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {open ? (
        <MobileMenu
          isHome={isHome}
          hasResume={hasResume}
          onDismiss={() => closeMenu({ restoreFocus: true })}
          onNavigate={() => closeMenu({ restoreFocus: false })}
        />
      ) : null}
    </>
  );
}

function MobileMenu({
  isHome,
  hasResume,
  onDismiss,
  onNavigate,
}: {
  isHome: boolean;
  hasResume: boolean;
  /** Closed without choosing a destination: focus returns to the menu button. */
  onDismiss: () => void;
  /** A link was followed: focus goes wherever the link leads. */
  onNavigate: () => void;
}) {
  const dialogRef = React.useRef<HTMLDivElement>(null);

  // Keep Tab inside the open dialog, as aria-modal promises.
  function trapFocus(event: React.KeyboardEvent) {
    if (event.key !== "Tab" || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      ref={dialogRef}
      id="mobile-nav"
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      onKeyDown={trapFocus}
      className="fixed inset-0 z-[70] flex flex-col bg-background/92 backdrop-blur-xl animate-in fade-in duration-500 xl:hidden"
    >
      <div className="flex h-16 items-center justify-between px-5">
        <span className="kicker flex items-center gap-2">
          <Sparkle className="size-3 text-gold" />
          Navigation
        </span>
        <Button
          variant="bracket"
          size="icon-sm"
          onClick={onDismiss}
          aria-label="Close menu"
          autoFocus
        >
          <X aria-hidden />
        </Button>
      </div>

      <ul className="flex flex-1 flex-col justify-center gap-1 px-6">
        {NAV_SECTIONS.map(({ id, label }, index) => (
          <li
            key={id}
            className="animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards duration-700"
            style={{ animationDelay: `${120 + index * 60}ms` }}
          >
            <Link
              href={sectionHref(id, isHome)}
              onClick={onNavigate}
              className="group flex items-baseline gap-5 py-2 focus-visible:outline-none focus-visible:[&>span:last-child]:text-gold"
            >
              <span className="numeric w-8 text-lg text-gold">{String(index + 1).padStart(2, "0")}</span>
              <span className="serif-italic text-[2.1rem] leading-[1.15] transition-colors duration-300 group-hover:text-gold">
                {label}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="px-6 pb-10">
        <div aria-hidden className="hairline-gold mb-6" />
        {hasResume ? (
          <Button asChild variant="gilded" size="lg" className="w-full">
            <a href="/resume" target="_blank" rel="noopener noreferrer" onClick={onNavigate}>
              Download résumé
              <ArrowUpRight aria-hidden />
            </a>
          </Button>
        ) : (
          <p className="kicker text-center">Scroll · Explore · Connect</p>
        )}
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

/**
 * Scroll-triggered entrance.
 *
 * These are Server Components: they ship no JavaScript of their own and only
 * emit a class plus a `data-reveal` hook. A single observer mounted once in
 * the root layout (`RevealObserver`) flips `data-visible`, and the transition
 * itself is plain CSS running on the compositor.
 *
 * Two reasons for that design over animating from JS per section:
 *  - Sections reveal correctly even when rAF is throttled (background tabs,
 *    low-power mode), where JS-driven tweens stall mid-animation and can
 *    strand content at opacity 0.
 *  - Nothing here counts toward the client bundle, which is most of the page.
 *
 * `globals.css` scopes the hidden state to `html.js` and removes that class if
 * the observer never starts, so content is never permanently invisible.
 */

type RevealTag =
  | "div"
  | "section"
  | "li"
  | "article"
  | "span"
  | "ul"
  | "ol"
  | "h1"
  | "h2"
  | "dl"
  | "p"
  | "figure";

/** `scale` and `blur` add depth for hero and card entrances. */
type RevealFrom = "bottom" | "left" | "right" | "none" | "scale" | "blur";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds to wait before this element starts. */
  delay?: number;
  /** Direction or quality the element travels from. */
  from?: RevealFrom;
  as?: RevealTag;
}

export function Reveal({
  children,
  className,
  delay = 0,
  from = "bottom",
  as: Tag = "div",
}: RevealProps) {
  return (
    <Tag
      data-reveal=""
      data-reveal-from={from}
      className={cn(className)}
      style={delay ? ({ "--reveal-delay": `${delay}s` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}

/**
 * Staggers its `RevealItem` children. The observer walks the group once it
 * enters view and assigns each item an incremental transition delay.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.07,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  as?: RevealTag;
}) {
  return (
    <Tag
      data-reveal-group=""
      data-reveal-stagger={stagger}
      className={cn(className)}
    >
      {children}
    </Tag>
  );
}

export function RevealItem({
  children,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: RevealTag;
}) {
  return (
    <Tag data-reveal-item="" className={cn(className)}>
      {children}
    </Tag>
  );
}

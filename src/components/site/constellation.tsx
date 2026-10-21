import { cn } from "@/lib/utils";

/**
 * A deterministic constellation.
 *
 * The same `seed` always produces the same star pattern — on every render,
 * every deploy, server and client alike — so a skill category or a project
 * keeps its own recognisable "shape" without anyone drawing it by hand.
 *
 * Lines carry `.draw-line` and `pathLength="1"`, so they trace themselves in
 * when an ancestor reveal is marked visible (see `globals.css`). Stars
 * twinkle on staggered, per-star timings so the plate never pulses in unison.
 */

export interface ConstellationProps {
  seed: string;
  /** How many stars, typically one per item it represents. Clamped to 3–10. */
  count: number;
  /** Relative brightness per star (1–3). Defaults to all 2. */
  magnitudes?: number[];
  /** CSS colour for stars and lines, e.g. `var(--gold)`. */
  color?: string;
  className?: string;
  /** Draw the faint coordinate grid behind the stars. */
  grid?: boolean;
}

const WIDTH = 240;
const HEIGHT = 120;
const PAD = 16;

/** String → 32-bit seed (FNV-1a). */
function hash(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Tiny seeded PRNG (mulberry32). */
function prng(seed: number) {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function layoutConstellation(seed: string, count: number) {
  const random = prng(hash(seed));
  const n = Math.max(3, Math.min(10, count));
  const minGap = 34;
  const points: { x: number; y: number }[] = [];

  for (let i = 0; i < n; i += 1) {
    let candidate = { x: 0, y: 0 };
    // Rejection-sample for breathing room; accept the last try regardless.
    for (let attempt = 0; attempt < 40; attempt += 1) {
      candidate = {
        x: PAD + random() * (WIDTH - PAD * 2),
        y: PAD + random() * (HEIGHT - PAD * 2),
      };
      if (points.every((p) => Math.hypot(p.x - candidate.x, p.y - candidate.y) >= minGap)) break;
    }
    points.push(candidate);
  }

  // Read left to right, like a figure traced across the sky.
  points.sort((a, b) => a.x - b.x);

  const links: [number, number][] = [];
  for (let i = 0; i < points.length - 1; i += 1) links.push([i, i + 1]);

  // One branch off the spine, so it looks drawn rather than plotted.
  if (points.length >= 5) {
    const from = 1 + Math.floor(random() * (points.length - 3));
    const to = Math.min(points.length - 1, from + 2 + Math.floor(random() * 2));
    if (!links.some(([a, b]) => a === from && b === to)) links.push([from, to]);
  }

  return { points, links, random };
}

export function Constellation({
  seed,
  count,
  magnitudes,
  color = "var(--gold)",
  className,
  grid = true,
}: ConstellationProps) {
  const { points, links, random } = layoutConstellation(seed, count);
  const brightest = magnitudes?.length
    ? magnitudes.indexOf(Math.max(...magnitudes))
    : Math.floor(points.length / 2);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      aria-hidden
      focusable="false"
      className={cn("h-auto w-full overflow-visible", className)}
      style={{ color }}
    >
      {grid ? (
        <g stroke="currentColor" strokeOpacity="0.08" strokeWidth="0.5">
          {[40, 80, 120, 160, 200].map((x) => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2={HEIGHT} />
          ))}
          {[30, 60, 90].map((y) => (
            <line key={`h${y}`} x1="0" y1={y} x2={WIDTH} y2={y} />
          ))}
        </g>
      ) : null}

      <g stroke="currentColor" strokeOpacity="0.55" strokeWidth="0.8" fill="none">
        {links.map(([a, b], index) => (
          <line
            key={`${a}-${b}`}
            className="draw-line"
            pathLength={1}
            x1={points[a].x}
            y1={points[a].y}
            x2={points[b].x}
            y2={points[b].y}
            style={{ "--draw-delay": `${0.2 + index * 0.18}s` } as React.CSSProperties}
          />
        ))}
      </g>

      {points.map((point, index) => {
        const magnitude = magnitudes?.[index] ?? 2;
        const radius = 1.2 + magnitude * 0.9;
        const duration = 2.4 + random() * 2.8;
        const delay = -random() * 4;

        return (
          <g key={index} transform={`translate(${point.x} ${point.y})`}>
            <circle r={radius * 3.2} fill="currentColor" opacity="0.12" />
            <circle
              r={radius}
              fill="currentColor"
              className="animate-twinkle"
              style={
                {
                  "--twinkle-duration": `${duration}s`,
                  animationDelay: `${delay}s`,
                  transformBox: "fill-box",
                  transformOrigin: "center",
                } as React.CSSProperties
              }
            />
            {index === brightest ? (
              <path
                d="M0 -9 1.4 -1.4 9 0 1.4 1.4 0 9 -1.4 1.4 -9 0 -1.4 -1.4Z"
                fill="currentColor"
                opacity="0.85"
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

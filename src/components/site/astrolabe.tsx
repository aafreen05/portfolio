import Image from "next/image";

import { cn, initialsOf } from "@/lib/utils";

/**
 * The hero instrument — an astrolabe holding a binary star.
 *
 *   bezel      degree ticks, turning once every four minutes
 *   text ring  the role title, circling the other way
 *   orbit A    a gold star: design
 *   orbit B    an ice-blue star: code
 *   sweep      a faint scanning wedge, like a dome searching the sky
 *   plate      the portrait, or a gilded monogram before one is uploaded
 *
 * Pure SVG + CSS animation: no JavaScript, composited transforms only, and
 * every loop is frozen by `prefers-reduced-motion`.
 */

const SIZE = 600;
const C = SIZE / 2;
const R_BEZEL = 290;
const R_TEXT = 256;
const R_ORBIT_A = 206;
const R_ORBIT_B = 160;
const R_PLATE = 118;

export function Astrolabe({
  image,
  name,
  roleTitle,
  className,
}: {
  image: string | null;
  name: string;
  roleTitle: string;
  className?: string;
}) {
  // Enough repetitions that the ring reads as continuous text; `textLength`
  // then stretches the spacing to close the circle exactly.
  const unit = `${roleTitle.toUpperCase()} ✦ `;
  const repeats = Math.max(2, Math.round(210 / Math.max(1, unit.length)));
  const ringText = unit.repeat(repeats);
  const circumference = 2 * Math.PI * R_TEXT;

  const ticks = Array.from({ length: 72 }, (_, i) => i * 5);
  const plateInset = `${((C - R_PLATE) / SIZE) * 100}%`;
  const sweepInset = `${((C - R_ORBIT_A) / SIZE) * 100}%`;

  return (
    <div className={cn("relative aspect-square w-full select-none", className)}>
      {/* Soft light pooled behind the instrument. */}
      <div
        aria-hidden
        className="absolute inset-[12%] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 42% 40%, color-mix(in oklab, var(--gold) 26%, transparent), transparent 60%), radial-gradient(circle at 62% 64%, color-mix(in oklab, var(--ice) 22%, transparent), transparent 62%)",
        }}
      />

      {/* Scanning sweep, clipped to a ring between the plate and orbit A. */}
      <div
        aria-hidden
        className="animate-orbit absolute rounded-full"
        style={
          {
            inset: sweepInset,
            "--orbit-duration": "24s",
            background:
              "conic-gradient(from 0deg, color-mix(in oklab, var(--gold) 15%, transparent), transparent 16%)",
            maskImage: "radial-gradient(circle, transparent 57%, #000 58%)",
            WebkitMaskImage: "radial-gradient(circle, transparent 57%, #000 58%)",
          } as React.CSSProperties
        }
      />

      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden focusable="false" className="relative h-full w-full">
        <defs>
          <path
            id="astrolabe-text-ring"
            d={`M ${C} ${C} m -${R_TEXT} 0 a ${R_TEXT} ${R_TEXT} 0 1 1 ${R_TEXT * 2} 0 a ${R_TEXT} ${R_TEXT} 0 1 1 -${R_TEXT * 2} 0`}
          />
          <radialGradient id="astrolabe-gold-glow" style={{ color: "var(--gold)" }}>
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="astrolabe-ice-glow" style={{ color: "var(--ice)" }}>
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Fixed crosshair — the frame of reference everything turns in. */}
        <g stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" style={{ color: "var(--foreground)" }}>
          <line x1={C} y1={C - R_BEZEL} x2={C} y2={C + R_BEZEL} />
          <line x1={C - R_BEZEL} y1={C} x2={C + R_BEZEL} y2={C} />
        </g>

        {/* Bezel: ticks every 5°, long ones every 30°, degree labels. */}
        <g
          className="animate-orbit"
          style={{ "--orbit-duration": "240s", color: "var(--foreground)" } as React.CSSProperties}
        >
          <circle cx={C} cy={C} r={R_BEZEL} fill="none" stroke="currentColor" strokeOpacity="0.22" />
          <circle cx={C} cy={C} r={R_BEZEL - 22} fill="none" stroke="currentColor" strokeOpacity="0.1" />
          {ticks.map((degree) => {
            const major = degree % 30 === 0;
            const radians = (degree * Math.PI) / 180;
            const inner = R_BEZEL - (major ? 14 : 7);
            return (
              <line
                key={degree}
                x1={C + Math.cos(radians) * inner}
                y1={C + Math.sin(radians) * inner}
                x2={C + Math.cos(radians) * R_BEZEL}
                y2={C + Math.sin(radians) * R_BEZEL}
                stroke="currentColor"
                style={major ? { color: "var(--gold)" } : undefined}
                strokeOpacity={major ? 0.8 : 0.3}
                strokeWidth={major ? 1.4 : 1}
              />
            );
          })}
          {[0, 90, 180, 270].map((degree) => {
            const radians = ((degree - 90) * Math.PI) / 180;
            const r = R_BEZEL - 30;
            return (
              <text
                key={degree}
                x={C + Math.cos(radians) * r}
                y={C + Math.sin(radians) * r}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="currentColor"
                fillOpacity="0.9"
                fontSize="11"
                letterSpacing="2"
                style={{ color: "var(--gold)", fontFamily: "var(--font-space-mono), monospace" }}
              >
                {String(degree).padStart(3, "0")}°
              </text>
            );
          })}
        </g>

        {/* The role title circling the instrument, counter to the bezel. */}
        <g className="animate-orbit-reverse" style={{ "--orbit-duration": "120s" } as React.CSSProperties}>
          <text
            fill="currentColor"
            fillOpacity="0.55"
            fontSize="12"
            style={{ color: "var(--foreground)", fontFamily: "var(--font-space-mono), monospace" }}
          >
            <textPath
              href="#astrolabe-text-ring"
              textLength={circumference}
              lengthAdjust="spacing"
            >
              {ringText}
            </textPath>
          </text>
        </g>

        {/* Orbit A — design, in gold. */}
        <circle
          cx={C}
          cy={C}
          r={R_ORBIT_A}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.35"
          strokeDasharray="2 6"
          style={{ color: "var(--gold)" }}
        />
        <g
          className="animate-orbit"
          style={{ "--orbit-duration": "22s", color: "var(--gold)" } as React.CSSProperties}
        >
          <circle cx={C} cy={C - R_ORBIT_A} r="22" fill="url(#astrolabe-gold-glow)" opacity="0.55" />
          <circle cx={C} cy={C - R_ORBIT_A} r="6.5" fill="currentColor" />
          <path
            d={`M ${C} ${C - R_ORBIT_A - 14} l 2 12 12 2 -12 2 -2 12 -2 -12 -12 -2 12 -2Z`}
            fill="currentColor"
            opacity="0.9"
          />
        </g>

        {/* Orbit B — code, in ice. Counter-rotating, faster. */}
        <circle
          cx={C}
          cy={C}
          r={R_ORBIT_B}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.28"
          style={{ color: "var(--ice)" }}
        />
        <g
          className="animate-orbit-reverse"
          style={{ "--orbit-duration": "15s", color: "var(--ice)" } as React.CSSProperties}
        >
          <circle cx={C + R_ORBIT_B} cy={C} r="18" fill="url(#astrolabe-ice-glow)" opacity="0.55" />
          <circle cx={C + R_ORBIT_B} cy={C} r="5" fill="currentColor" />
        </g>

        {/* Plate rim. */}
        <circle
          cx={C}
          cy={C}
          r={R_PLATE + 8}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.45"
          strokeWidth="1"
          style={{ color: "var(--gold)" }}
        />
      </svg>

      {/* The plate: portrait, or a gilded monogram until one is uploaded. */}
      <div
        className="absolute overflow-hidden rounded-full border border-gold/30 bg-card"
        style={{ inset: plateInset }}
      >
        {image ? (
          <Image
            src={image}
            alt={`Portrait of ${name}`}
            fill
            priority
            sizes="(max-width: 1024px) 12rem, 14rem"
            className="object-cover"
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center">
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 50% 38%, color-mix(in oklab, var(--gold) 16%, transparent), transparent 70%)",
              }}
            />
            <span aria-hidden className="serif-italic text-gilded text-gilded-animate relative text-[clamp(3rem,6vw,4.75rem)] leading-none">
              {initialsOf(name)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

import { getHero, getProfile } from "@/lib/queries";

export const alt = "Aafreen Begam H — Full Stack Developer & UI/UX Designer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social card in the Binary Star style, built from live profile content.
 *
 * Uses the site's real faces — Playfair, Parisienne and Space Mono — as
 * static WOFF instances shipped in `src/assets/og-fonts`, because the image
 * renderer cannot read variable fonts or WOFF2. All are SIL Open Font
 * License. Playfair's static cut is its sturdy text optical size, so its
 * hairlines survive any scale.
 */

const FONT_DIR = path.join(process.cwd(), "src/assets/og-fonts");

async function loadFont(file: string) {
  try {
    return await readFile(path.join(FONT_DIR, file));
  } catch {
    return null;
  }
}

/** Deterministic scatter, so the card is identical on every build. */
function seededStars(count: number) {
  let seed = 20260926;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  return Array.from({ length: count }, () => ({
    x: random() * 1200,
    y: random() * 630,
    r: 0.6 + random() * 1.8,
    o: 0.2 + random() * 0.7,
  }));
}

export default async function OpenGraphImage() {
  const [profile, hero, serif, serifItalic, spaceMono, script] = await Promise.all([
    getProfile(),
    getHero(),
    loadFont("playfair-500-normal.woff"),
    loadFont("playfair-400-italic.woff"),
    loadFont("space-mono-400-normal.woff"),
    loadFont("parisienne-400-normal.woff"),
  ]);

  const ivory = "#eee8dc";
  const muted = "#a3a0b5";
  const gold = "#e6c27a";
  const ice = "#9dd6ff";

  const greeting =
    hero.heading_accent && hero.heading.includes(hero.heading_accent)
      ? hero.heading.slice(0, hero.heading.indexOf(hero.heading_accent)).trim()
      : "";

  const [firstWord, ...rest] = profile.name.trim().split(/\s+/);
  const restOfName = rest.join(" ");

  const stars = seededStars(110);
  const ticks = Array.from({ length: 48 }, (_, i) => (i * 360) / 48);

  const fonts = [
    serif && { name: "Serif", data: serif, weight: 500 as const, style: "normal" as const },
    serifItalic && { name: "Serif", data: serifItalic, weight: 400 as const, style: "italic" as const },
    spaceMono && { name: "Mono", data: spaceMono, weight: 400 as const, style: "normal" as const },
    script && { name: "Script", data: script, weight: 400 as const, style: "normal" as const },
  ].filter((font): font is NonNullable<typeof font> => Boolean(font));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#05060c",
          fontFamily: "Serif",
        }}
      >
        {/*
          Sky glow, starfield and astrolabe in one SVG. The glows are SVG
          radial gradients: the renderer's CSS radial-gradient support is
          partial and left a hard edge in the corner.
        */}
        <svg
          width="1200"
          height="630"
          viewBox="0 0 1200 630"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <defs>
            <radialGradient id="sky" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#4050aa" stopOpacity="0.42" />
              <stop offset="1" stopColor="#4050aa" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="warm" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor={gold} stopOpacity="0.16" />
              <stop offset="1" stopColor={gold} stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="980" cy="20" r="460" fill="url(#sky)" />
          <circle cx="80" cy="680" r="360" fill="url(#warm)" />
          {stars.map((star, index) => (
            <circle key={index} cx={star.x} cy={star.y} r={star.r} fill={ivory} fillOpacity={star.o} />
          ))}
          <g transform="translate(930 315)">
            <circle r="230" fill="none" stroke={ivory} strokeOpacity="0.2" />
            <circle r="206" fill="none" stroke={ivory} strokeOpacity="0.1" />
            {ticks.map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const major = deg % 45 === 0;
              const inner = major ? 212 : 220;
              return (
                <line
                  key={deg}
                  x1={Math.cos(rad) * inner}
                  y1={Math.sin(rad) * inner}
                  x2={Math.cos(rad) * 230}
                  y2={Math.sin(rad) * 230}
                  stroke={major ? gold : ivory}
                  strokeOpacity={major ? 0.9 : 0.35}
                  strokeWidth={major ? 2 : 1}
                />
              );
            })}
            <circle r="160" fill="none" stroke={gold} strokeOpacity="0.4" strokeDasharray="3 8" />
            <circle r="118" fill="none" stroke={ice} strokeOpacity="0.35" />
            <circle cx="113" cy="-113" r="22" fill={gold} fillOpacity="0.18" />
            <circle cx="113" cy="-113" r="8" fill={gold} />
            <circle cx="-118" cy="0" r="16" fill={ice} fillOpacity="0.2" />
            <circle cx="-118" cy="0" r="6" fill={ice} />
            <circle r="80" fill="#0b0e1a" stroke={gold} strokeOpacity="0.5" />
          </g>
        </svg>

        {/* Gold rule across the top. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: 6,
            display: "flex",
            background: `linear-gradient(90deg, transparent, ${gold} 30%, #b88a3e 70%, transparent)`,
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "64px 72px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontFamily: "Mono",
              fontSize: 18,
              letterSpacing: 5,
              color: gold,
            }}
          >
            {/* Drawn rather than typed: Space Mono has no four-point star glyph. */}
            <svg width="18" height="18" viewBox="0 0 16 16">
              <path d="M8 0 9.5 6.5 16 8 9.5 9.5 8 16 6.5 9.5 0 8 6.5 6.5Z" fill={gold} />
            </svg>
            PORTFOLIO
          </div>

          <div style={{ display: "flex", flexDirection: "column", maxWidth: 720 }}>
            {greeting ? (
              <div style={{ display: "flex", fontFamily: "Script", fontSize: 56, color: gold, lineHeight: 1.2 }}>
                {greeting}
              </div>
            ) : null}
            {/*
              Two deliberate lines (first word / the rest), as in the hero —
              letting it wrap freely orphans the final initial. The explicit
              weight matters: at the default 400 the renderer would pick the
              italic file, the only 400 instance registered.
            */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 96,
                fontWeight: 500,
                fontStyle: "normal",
                lineHeight: 1.04,
                color: ivory,
                letterSpacing: -1,
              }}
            >
              <span>{firstWord}</span>
              {restOfName ? <span>{restOfName}</span> : null}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 26,
                fontFamily: "Mono",
                fontSize: 22,
                letterSpacing: 2,
                color: muted,
                textTransform: "uppercase",
              }}
            >
              {profile.role_title}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: "Mono", fontSize: 18, color: muted }}>
            <div style={{ display: "flex", width: 40, height: 1, background: gold }} />
            {profile.location || "India"}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}

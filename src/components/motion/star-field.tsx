"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * The living night sky behind the whole site.
 *
 *  - Stars sit on a depth axis. Near ones are larger, brighter, drift
 *    faster and parallax further when the page scrolls.
 *  - Near stars close enough to each other are joined by faint lines, so
 *    constellations form and dissolve as the field drifts.
 *  - The cursor is a gravity well: nearby stars lean toward it and link to
 *    it, and a soft lens glow follows it.
 *  - Now and then a shooting star crosses the upper sky.
 *
 * In the light "porcelain" theme the same field renders as an engraved
 * chart: a sparser scatter of ink dots, a few fine cross marks, hairline
 * links, no glow and no shooting stars.
 *
 * Cost control: star count scales with viewport area and is capped; the
 * loop stops while the tab is hidden; nothing runs at all under
 * `prefers-reduced-motion`, which gets a single still frame instead.
 * Purely decorative — `aria-hidden` and pointer-transparent.
 */

type RGB = [number, number, number];

interface Star {
  x: number;
  y: number;
  /** Depth, 0.15 (far) to 1 (near). */
  z: number;
  vx: number;
  vy: number;
  r: number;
  phase: number;
  speed: number;
  /** 0 = starlight, 1 = gold (design), 2 = ice (code). */
  tint: 0 | 1 | 2;
  /** Drawn as a chart cross in the light theme. */
  cross: boolean;
  /** 0–1; the light theme only draws stars below its density. */
  rank: number;
}

interface Shot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
}

interface Palette {
  star: RGB;
  link: RGB;
  gold: RGB;
  ice: RGB;
  glow: boolean;
  alpha: number;
}

const TAU = Math.PI * 2;
const LINK_DEPTH = 0.5;
/** Share of the field drawn in the light theme — ink reads heavier than light. */
const LIGHT_DENSITY = 0.62;

/** Wraps a coordinate into [-margin, size + margin), however far it moved. */
function wrap(value: number, size: number, margin = 10) {
  const span = size + margin * 2;
  return ((((value + margin) % span) + span) % span) - margin;
}

function hexToRgb(value: string, fallback: RGB): RGB {
  const hex = value.trim().replace("#", "");
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    return [0, 1, 2].map((i) => parseInt(hex[i] + hex[i], 16)) as RGB;
  }
  if (/^[0-9a-f]{6}$/i.test(hex)) {
    return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as RGB;
  }
  return fallback;
}

const rgba = ([r, g, b]: RGB, a: number) => `rgba(${r},${g},${b},${a})`;

function readPalette(): Palette {
  const styles = getComputedStyle(document.documentElement);
  const read = (name: string) => styles.getPropertyValue(name).trim();

  return {
    star: hexToRgb(read("--particle"), [244, 239, 228]),
    link: hexToRgb(read("--particle-link"), [201, 214, 255]),
    gold: hexToRgb(read("--gold"), [230, 194, 122]),
    ice: hexToRgb(read("--ice"), [157, 214, 255]),
    glow: parseFloat(read("--particle-glow") || "1") > 0.5,
    alpha: parseFloat(read("--particle-alpha") || "0.9") || 0.9,
  };
}

/** Pre-rendered glow discs — far cheaper than `shadowBlur` per star. */
function buildSprites(palette: Palette) {
  const make = (color: RGB) => {
    const size = 64;
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = size;
    const context = sprite.getContext("2d");
    if (!context) return sprite;

    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, rgba(color, 1));
    gradient.addColorStop(0.12, rgba(color, 0.9));
    gradient.addColorStop(0.32, rgba(color, 0.22));
    gradient.addColorStop(1, rgba(color, 0));
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
    return sprite;
  };

  return [make(palette.star), make(palette.gold), make(palette.ice)] as const;
}

export function StarField({ className }: { className?: string }) {
  const ref = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvasElement = ref.current;
    if (!canvasElement) return;
    const context2d = canvasElement.getContext("2d");
    if (!context2d) return;

    // Re-bound to non-null locals so nested functions keep the narrowing.
    const canvas: HTMLCanvasElement = canvasElement;
    const ctx: CanvasRenderingContext2D = context2d;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let palette = readPalette();
    let sprites = buildSprites(palette);
    let linkDistance = 130;

    let frameId = 0;
    let running = false;
    let last = performance.now();
    let lastScroll = window.scrollY;
    let nextShot = last + 4000 + Math.random() * 6000;
    let shot: Shot | null = null;

    const pointer = { x: 0, y: 0, active: false };

    function makeStar(anywhere = true): Star {
      const z = 0.15 + Math.random() * 0.85;
      const roll = Math.random();
      return {
        x: Math.random() * width,
        y: anywhere ? Math.random() * height : -4,
        z,
        vx: (Math.random() - 0.5) * 0.14 * z,
        vy: (Math.random() - 0.5) * 0.1 * z - 0.02 * z,
        r: 0.35 + z * z * 1.55,
        phase: Math.random() * TAU,
        speed: 0.008 + Math.random() * 0.02,
        tint: roll < 0.09 ? 1 : roll < 0.17 ? 2 : 0,
        cross: Math.random() < 0.12,
        rank: Math.random(),
      };
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      // The canvas is sized by CSS (fixed, inset 0); measure it rather than
      // window.innerWidth, which includes the scrollbar the canvas sits beside.
      width = canvas.clientWidth || document.documentElement.clientWidth;
      height = canvas.clientHeight || window.innerHeight;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const mobile = width < 640;
      const target = Math.round(
        Math.min(mobile ? 70 : 170, Math.max(mobile ? 32 : 60, (width * height) / (mobile ? 10500 : 8200))),
      );
      linkDistance = mobile ? 105 : Math.min(150, Math.max(110, width / 11));

      if (stars.length === 0) {
        stars = Array.from({ length: target }, () => makeStar());
      } else {
        while (stars.length < target) stars.push(makeStar());
        stars.length = target;
        for (const star of stars) {
          star.x = Math.min(star.x, width);
          star.y = Math.min(star.y, height);
        }
      }
    }

    function step(dt: number, now: number) {
      // Scroll parallax: near stars travel further than far ones.
      const scrollDelta = window.scrollY - lastScroll;
      lastScroll = window.scrollY;

      for (const star of stars) {
        star.x += star.vx * dt;
        star.y += star.vy * dt - scrollDelta * star.z * 0.28;
        star.phase += star.speed * dt;

        if (pointer.active) {
          const dx = pointer.x - star.x;
          const dy = pointer.y - star.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 200 && distance > 1) {
            // Gentle pull, strongest mid-range, so stars lean rather than clump.
            const pull = (1 - distance / 200) * 0.018 * star.z * dt;
            star.x += dx * pull * 0.06;
            star.y += dy * pull * 0.06;
          }
        }

        // Wrap with a modulo, not a clamp: a long jump (a nav link, the
        // End key) moves near stars thousands of pixels at once, and
        // clamping would pile them all up along one edge.
        star.x = wrap(star.x, width);
        star.y = wrap(star.y, height);
      }

      if (palette.glow) {
        if (!shot && now > nextShot) {
          // Down and to the left, 20–35° below the horizon. Screen y grows
          // downward, so a descending streak needs a positive vy.
          const dip = ((20 + Math.random() * 15) * Math.PI) / 180;
          const speed = 11 + Math.random() * 5;
          shot = {
            x: width * (0.35 + Math.random() * 0.65),
            y: height * Math.random() * 0.35,
            vx: -Math.cos(dip) * speed,
            vy: Math.sin(dip) * speed,
            life: 0,
            max: 48 + Math.random() * 20,
          };
          nextShot = now + 9000 + Math.random() * 9000;
        }
        if (shot) {
          shot.x += shot.vx * dt;
          shot.y += shot.vy * dt;
          shot.life += dt;
          if (shot.life > shot.max) shot = null;
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const { alpha: strength, glow } = palette;
      const density = glow ? 1 : LIGHT_DENSITY;

      // --- Constellation links between near stars ---------------------
      ctx.lineWidth = glow ? 0.6 : 0.5;
      for (let i = 0; i < stars.length; i += 1) {
        const a = stars[i];
        if (a.z < LINK_DEPTH || a.rank >= density) continue;
        for (let j = i + 1; j < stars.length; j += 1) {
          const b = stars[j];
          if (b.z < LINK_DEPTH || b.rank >= density) continue;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          if (Math.abs(dx) > linkDistance || Math.abs(dy) > linkDistance) continue;
          const distance = Math.hypot(dx, dy);
          if (distance > linkDistance) continue;

          const opacity = (1 - distance / linkDistance) * Math.min(a.z, b.z) * strength * (glow ? 0.38 : 0.26);
          ctx.strokeStyle = rgba(palette.link, opacity);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // --- Cursor: lens glow and gravity links -------------------------
      if (pointer.active) {
        if (glow) {
          const lens = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 170);
          lens.addColorStop(0, rgba(palette.gold, 0.06));
          lens.addColorStop(1, rgba(palette.gold, 0));
          ctx.fillStyle = lens;
          ctx.fillRect(pointer.x - 170, pointer.y - 170, 340, 340);
        }

        ctx.lineWidth = 0.6;
        for (const star of stars) {
          if (star.rank >= density) continue;
          const distance = Math.hypot(star.x - pointer.x, star.y - pointer.y);
          if (distance > 160) continue;
          const opacity = (1 - distance / 160) * star.z * (glow ? 0.4 : 0.3);
          ctx.strokeStyle = rgba(palette.gold, opacity);
          ctx.beginPath();
          ctx.moveTo(pointer.x, pointer.y);
          ctx.lineTo(star.x, star.y);
          ctx.stroke();
        }
      }

      // --- Stars -------------------------------------------------------
      for (const star of stars) {
        if (star.rank >= density) continue;
        const twinkle = 0.62 + 0.38 * Math.sin(star.phase);
        const color = star.tint === 1 ? palette.gold : star.tint === 2 ? palette.ice : palette.star;
        const opacity = Math.min(1, (0.25 + star.z * 0.75) * twinkle * strength);

        if (glow) {
          if (star.r > 1.05) {
            const size = star.r * 9;
            ctx.globalAlpha = opacity;
            ctx.drawImage(sprites[star.tint], star.x - size / 2, star.y - size / 2, size, size);
            ctx.globalAlpha = 1;
          }
          ctx.fillStyle = rgba(color, opacity);
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r * 0.62, 0, TAU);
          ctx.fill();
        } else if (star.cross && star.z > 0.45) {
          // Porcelain theme: the brighter stars become engraved cross marks.
          const arm = star.r * 2.2;
          ctx.strokeStyle = rgba(color, opacity * 0.8);
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(star.x - arm, star.y);
          ctx.lineTo(star.x + arm, star.y);
          ctx.moveTo(star.x, star.y - arm);
          ctx.lineTo(star.x, star.y + arm);
          ctx.stroke();
        } else {
          ctx.fillStyle = rgba(color, opacity * 0.75);
          ctx.beginPath();
          ctx.arc(star.x, star.y, Math.max(0.45, star.r * 0.5), 0, TAU);
          ctx.fill();
        }
      }

      // --- Shooting star ---------------------------------------------------
      if (shot) {
        const fade = 1 - shot.life / shot.max;
        const tailX = shot.x - shot.vx * 9;
        const tailY = shot.y - shot.vy * 9;
        const trail = ctx.createLinearGradient(shot.x, shot.y, tailX, tailY);
        trail.addColorStop(0, rgba(palette.star, 0.9 * fade));
        trail.addColorStop(1, rgba(palette.star, 0));
        ctx.strokeStyle = trail;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(shot.x, shot.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }
    }

    function loop(now: number) {
      const dt = Math.min(64, now - last) / 16.667;
      last = now;
      step(dt, now);
      draw();
      frameId = window.requestAnimationFrame(loop);
    }

    function start() {
      if (running || reduceMotion || document.hidden) return;
      running = true;
      last = performance.now();
      lastScroll = window.scrollY;
      frameId = window.requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      window.cancelAnimationFrame(frameId);
    }

    // Initial paint happens synchronously, so a still sky is present even
    // before (or without) the first animation frame.
    resize();
    draw();
    start();

    let resizeTimer: number | undefined;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        // Mobile browsers fire resize as the URL bar slides; resizing the
        // canvas clears it, so skip changes too small to matter.
        const nextWidth = canvas.clientWidth;
        const nextHeight = canvas.clientHeight;
        if (nextWidth === width && Math.abs(nextHeight - height) < 80) return;
        resize();
        draw();
      }, 120);
    };

    const onVisibility = () => (document.hidden ? stop() : start());

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };

    // Re-read colours when the theme class flips on <html>.
    const themeObserver = new MutationObserver(() => {
      palette = readPalette();
      sprites = buildSprites(palette);
      if (!palette.glow) shot = null;
      draw();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    if (finePointer && !reduceMotion) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onPointerLeave);
      window.addEventListener("blur", onPointerLeave);
    }

    return () => {
      stop();
      window.clearTimeout(resizeTimer);
      themeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("blur", onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      data-starfield=""
      className={cn("pointer-events-none fixed inset-0 -z-10 block h-full w-full", className)}
    />
  );
}

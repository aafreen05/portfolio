import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Turn a title into a URL-safe slug. Used by the project editor. */
export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Dates render in one fixed zone — India Standard Time, where the site's
 * owner reads them — so the server and the browser always produce the same
 * text (no hydration mismatch) and admin timestamps match the owner's clock.
 * Date-only values such as "2024-06-01" parse as UTC midnight, which is the
 * same calendar day in IST.
 */
const TIME_ZONE = "Asia/Kolkata";

export function formatDate(
  value: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short" },
) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", { timeZone: TIME_ZONE, ...options }).format(date);
}

/** Date and time, labelled with its zone so it is never ambiguous. */
export function formatDateTime(value: string | Date | null | undefined) {
  const formatted = formatDate(value, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return formatted ? `${formatted} IST` : "";
}

/** "2 hours ago" style stamps for the admin inbox. */
export function relativeTime(value: string | Date | null | undefined) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";

  const diff = date.getTime() - Date.now();
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 1000 * 60 * 60 * 24 * 365],
    ["month", 1000 * 60 * 60 * 24 * 30],
    ["day", 1000 * 60 * 60 * 24],
    ["hour", 1000 * 60 * 60],
    ["minute", 1000 * 60],
  ];

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, ms] of units) {
    if (Math.abs(diff) >= ms) return formatter.format(Math.round(diff / ms), unit);
  }
  return "just now";
}

export function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * The site's canonical origin. NEXT_PUBLIC_SITE_URL wins; on Vercel the
 * project's production domain is the fallback, so a forgotten variable still
 * yields correct canonical URLs and sitemap entries instead of localhost.
 */
function siteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

/** Absolute URL helper — canonical tags, OG images and sitemaps all need one. Server-only use. */
export function absoluteUrl(path = "") {
  const base = siteOrigin().replace(/\/$/, "");
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

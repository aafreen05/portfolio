import { createPublicClient } from "@/lib/supabase/public";

/**
 * Supabase keep-alive.
 *
 * Free Supabase projects pause after a week without database activity, so
 * two independent schedulers call this route:
 *
 *   - Vercel Cron, daily (vercel.json). Vercel sends
 *     `Authorization: Bearer $CRON_SECRET` when that env var is set.
 *   - GitHub Actions, every 4 days (.github/workflows/supabase-keep-alive.yml),
 *     which calls Supabase directly when its secrets are configured and
 *     falls back to this route otherwise.
 *
 * Each call runs `keep_alive()` in the database — a real write — which also
 * records when each source last checked in (shown on the admin Settings
 * page). The route is deliberately public, since a ping reveals and changes
 * nothing of value, but callers without the cron secret are throttled so it
 * cannot be used to hammer the database.
 */

export const dynamic = "force-dynamic";

type Source = "vercel-cron" | "github-actions" | "site";

const THROTTLE_MS = 5 * 60 * 1000;
const lastPing = new Map<Source, number>();

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorized = Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;

  const userAgent = request.headers.get("user-agent") ?? "";
  const requested = new URL(request.url).searchParams.get("source");

  // Labels only — they decide what the Settings page shows, never access.
  const source: Source =
    authorized || userAgent.startsWith("vercel-cron")
      ? "vercel-cron"
      : requested === "github-actions"
        ? "github-actions"
        : "site";

  if (!authorized) {
    const previous = lastPing.get(source) ?? 0;
    if (Date.now() - previous < THROTTLE_MS) {
      return json({ ok: true, source, throttled: true });
    }
  }

  const supabase = createPublicClient();
  if (!supabase) return json({ ok: false, error: "Supabase is not configured." }, 503);

  const { data, error } = await supabase.rpc("keep_alive", { ping_source: source });

  if (error) {
    console.error(`[keep-alive] ${source} ping failed: ${error.message}`);
    return json({ ok: false, source, error: error.message }, 503);
  }

  lastPing.set(source, Date.now());
  return json({ ok: true, source, pingedAt: data });
}

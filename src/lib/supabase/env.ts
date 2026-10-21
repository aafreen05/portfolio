/**
 * Environment access for Supabase.
 *
 * The site is designed to render fully without a database connection: when
 * the env vars are absent every read falls back to the curated content in
 * `lib/content/defaults.ts`. That keeps `npm run build`, previews and the
 * first clone of the repo working before Supabase is provisioned, and it
 * means a transient outage degrades to static content instead of a 500.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True when the public (anon) client can be constructed. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Service-role key is server-only and never imported into client bundles. */
export function getServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
}

export const SUPABASE_NOT_CONFIGURED_MESSAGE =
  "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment, then restart the dev server.";

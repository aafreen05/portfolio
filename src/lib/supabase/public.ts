import "server-only";

import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

let publicClient: SupabaseClient | null = null;

/**
 * Cookie-free anon client for reading published portfolio content.
 *
 * Public content is readable by `anon` under RLS, so no session is involved.
 * Avoiding `cookies()` here is what keeps the marketing pages statically
 * rendered and revalidated on a schedule rather than dynamic per request.
 */
export function createPublicClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  publicClient ??= createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return publicClient;
}

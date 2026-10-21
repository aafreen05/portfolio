import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  getServiceRoleKey,
  isSupabaseConfigured,
} from "./env";

/**
 * Request-scoped client that reads and refreshes the auth cookie.
 * Returns null when Supabase is not configured so callers can fall back.
 */
export async function createClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return null;

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // `middleware.ts` refreshes the session, so this is safe to ignore.
        }
      },
    },
  });
}

/**
 * Service-role client. Bypasses RLS, so it is only used for writes that have
 * already been authorised server-side (admin mutations, storage uploads) and
 * for inserting public contact messages.
 */
export function createServiceClient(): SupabaseClient | null {
  const serviceKey = getServiceRoleKey();
  if (!SUPABASE_URL || !serviceKey) return null;

  return createServerClient(SUPABASE_URL, serviceKey, {
    cookies: { getAll: () => [], setAll: () => {} },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** The signed-in Supabase user, or null. Never throws. */
export async function getSessionUser() {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

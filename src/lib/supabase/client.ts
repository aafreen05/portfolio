"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

let browserClient: SupabaseClient | null = null;

/**
 * Browser client, used only by the admin sign-in form. Everything else runs
 * on the server. Returns null when Supabase is not configured.
 */
export function createClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  browserClient ??= createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return browserClient;
}

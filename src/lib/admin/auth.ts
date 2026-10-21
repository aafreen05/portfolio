import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

/**
 * The signed-in user plus whether they are on the admin allowlist.
 *
 * Being signed in is not enough: Supabase allows public sign-ups unless they
 * are switched off, so anyone could create an account. Admin rights come from
 * `public.admin_users`, checked by the database function `is_admin()` — the
 * same function the Row Level Security policies use, so the app and the
 * database can never disagree about who is an admin.
 *
 * Cached per request: a dashboard render makes several reads, and each would
 * otherwise repeat the auth round trip.
 */
const getAdminSession = cache(async () => {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false };

  const { data, error } = await supabase.rpc("is_admin");
  if (error) console.error(`[admin] is_admin check failed: ${error.message}`);

  return { supabase, user, isAdmin: !error && data === true };
});

/**
 * Gate for every admin page and mutation.
 *
 * `proxy.ts` already redirects unauthenticated requests, but this is the
 * check that actually protects data: Server Actions are public HTTP endpoints
 * and must never rely on the caller having come through a guarded page.
 */
export async function requireAdmin(): Promise<User> {
  const session = await getAdminSession();
  if (!session?.user) redirect("/admin/login");
  if (!session.isAdmin) redirect("/admin/login?error=not-admin");
  return session.user;
}

/** Authenticated Supabase client, or a redirect if the session is gone. */
export async function getAdminClient() {
  const session = await getAdminSession();
  if (!session?.user) redirect("/admin/login");
  if (!session.isAdmin) redirect("/admin/login?error=not-admin");
  return session.supabase;
}

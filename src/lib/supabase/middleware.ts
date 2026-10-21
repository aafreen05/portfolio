import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

/**
 * Refreshes the Supabase auth cookie on admin requests and gates `/admin`.
 *
 * Auth tokens are short-lived; without this the admin session would expire
 * mid-session inside Server Components, which cannot write cookies.
 *
 * A signed-in account that is not on the admin allowlist is signed out here
 * (the proxy can write cookies; pages cannot) and sent to the login page
 * with an explanation — otherwise login → dashboard → login would loop.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const isLoginRoute = request.nextUrl.pathname === "/admin/login";

  if (!isSupabaseConfigured) {
    // Without Supabase there is no way to authenticate, so the dashboard is
    // unreachable by design. The login page explains the setup steps.
    if (!isLoginRoute) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return response;
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /** A redirect that keeps any cookies Supabase just set or cleared. */
  const redirectTo = (path: string, params: Record<string, string> = {}) => {
    const url = new URL(path, request.url);
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
    const redirect = NextResponse.redirect(url);
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  };

  if (!user) {
    return isLoginRoute ? response : redirectTo("/admin/login", { next: request.nextUrl.pathname });
  }

  const { data: isAdmin, error } = await supabase.rpc("is_admin");

  if (error || isAdmin !== true) {
    // Signed in, but not an administrator: end that session.
    await supabase.auth.signOut();
    return isLoginRoute && request.nextUrl.searchParams.get("error") === "not-admin"
      ? response
      : redirectTo("/admin/login", { error: "not-admin" });
  }

  if (isLoginRoute) return redirectTo("/admin");

  return response;
}

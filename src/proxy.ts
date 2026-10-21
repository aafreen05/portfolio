import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next 16 renamed the middleware convention to `proxy`. This keeps the
 * Supabase auth cookie fresh and gates `/admin` on every admin request.
 *
 * Only admin routes are matched: the public site has no sessions, and running
 * the proxy on every page view would add a function invocation (and an auth
 * round trip) to requests that are otherwise served straight from the cache.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

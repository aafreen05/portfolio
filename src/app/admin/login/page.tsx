import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Database } from "lucide-react";

import { LoginForm } from "@/app/admin/login/login-form";
import { StarField } from "@/components/motion/star-field";
import { Sparkle } from "@/components/site/sparkle";
import { Skeleton } from "@/components/ui/skeleton";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5 py-12">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20"
        style={{ background: "radial-gradient(ellipse 90% 60% at 50% 20%, var(--sky-top), transparent 65%)" }}
      />
      <StarField />

      <div className="relative w-full max-w-sm">
        <Link
          href="/"
          className="group inline-flex items-center gap-3 font-mono text-[0.6875rem] tracking-[0.16em] text-muted-foreground uppercase transition-colors hover:text-gold"
        >
          <ArrowLeft className="size-3.5 transition-transform duration-500 group-hover:-translate-x-1" aria-hidden />
          Back to site
        </Link>

        <div className="frame relative mt-8 bg-card! p-8 elevate-lg">
          <p className="kicker flex items-center gap-2">
            <Sparkle twinkle className="size-3 text-gold" />
            Observatory · Control room
          </p>

          <h1 className="mt-7">
            <span className="wide-caps block text-2xl">Sign</span>
            <span className="serif-italic text-gilded block text-5xl leading-none">in</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Manage the portfolio content, projects and messages.
          </p>

          <div className="mt-9">
            {isSupabaseConfigured ? (
              <Suspense fallback={<LoginSkeleton />}>
                <LoginForm />
              </Suspense>
            ) : (
              <SetupNotice />
            )}
          </div>
        </div>

        <p className="mt-6 text-center font-mono text-[0.625rem] tracking-[0.14em] text-muted-foreground uppercase">
          Restricted · Accounts are issued in Supabase
        </p>
      </div>
    </main>
  );
}

function LoginSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

/** Shown before the project has been pointed at a Supabase instance. */
function SetupNotice() {
  return (
    <div className="border border-dashed border-border p-5">
      <div className="flex items-center gap-2.5">
        <Database className="size-4 text-gold" aria-hidden />
        <p className="font-wide text-xs font-semibold tracking-wide uppercase">Supabase not connected</p>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        The public site is running on its built-in seed content. To sign in and edit it, add these
        to <code className="font-mono text-xs text-foreground">.env.local</code> and restart the dev
        server:
      </p>
      <ul className="mt-4 flex flex-col gap-1.5 font-mono text-xs text-gold">
        <li>NEXT_PUBLIC_SUPABASE_URL</li>
        <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
        <li>SUPABASE_SERVICE_ROLE_KEY</li>
      </ul>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Full walkthrough in the README.</p>
    </div>
  );
}

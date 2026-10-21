"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, RotateCw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Error boundary for the CMS.
 *
 * Unlike the public site this one *does* surface the message: the only person
 * who sees it is the signed-in administrator, and knowing whether a save
 * failed on a constraint or a network hiccup is the difference between
 * retrying and giving up.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] unhandled error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-start px-5 py-16 sm:px-8">
      <span className="flex size-12 items-center justify-center border border-ember/30 bg-ember-soft">
        <TriangleAlert className="size-5 text-ember" aria-hidden />
      </span>

      <h1 className="mt-6 font-wide text-xl font-semibold tracking-wide uppercase">Something went wrong</h1>
      <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
        This screen failed to load. Your content is unaffected — nothing was saved or deleted by
        this error.
      </p>

      <pre className="mt-6 w-full overflow-x-auto border border-border bg-secondary/60 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
        {error.message || "Unknown error"}
        {error.digest ? `\n\nReference: ${error.digest}` : ""}
      </pre>

      <div className="mt-7 flex flex-wrap gap-3">
        <Button onClick={reset}>
          <RotateCw className="size-4" aria-hidden />
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin">
            <LayoutDashboard className="size-4" aria-hidden />
            Back to dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}

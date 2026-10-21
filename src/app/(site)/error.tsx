"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Error boundary for the public site.
 *
 * Keeps the visitor inside the design with a way forward, instead of the
 * framework's default screen. The message is deliberately generic — the real
 * error goes to the console and server logs, never to the page, where it
 * could leak internals.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[site] unhandled error:", error);
  }, [error]);

  return (
    <div className="section-shell flex min-h-[75vh] flex-col items-center justify-center py-24 text-center">
      <p className="kicker text-ember">Transmission interrupted</p>

      <h1 className="mt-6 max-w-2xl">
        <span className="serif-display block text-[clamp(1.75rem,3.6vw,2.6rem)] leading-[1.1]">Something drifted</span>
        <span className="serif-italic text-gilded block text-[clamp(2.2rem,4.6vw,3.4rem)] leading-[1.1]">
          out of orbit.
        </span>
      </h1>

      <p className="mt-7 max-w-md text-base leading-[1.8] text-muted-foreground">
        Most likely a temporary glitch. Try again — and if it persists, the rest of the site is still
        working.
      </p>

      {error.digest ? (
        <p className="mt-5 font-mono text-xs text-muted-foreground">
          Reference <span className="text-foreground">{error.digest}</span>
        </p>
      ) : null}

      <div className="mt-11 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset} variant="gilded" size="lg">
          <RotateCw aria-hidden />
          Try again
        </Button>
        <Button asChild variant="bracket" size="lg">
          <Link href="/">
            <ArrowLeft aria-hidden />
            Return home
          </Link>
        </Button>
      </div>
    </div>
  );
}

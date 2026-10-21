import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { StarField } from "@/components/motion/star-field";
import { Button } from "@/components/ui/button";

// Next marks 404 responses noindex itself; only the title is needed.
export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-clip px-5 py-24 text-center">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20"
        style={{ background: "radial-gradient(ellipse 90% 60% at 50% 30%, var(--sky-top), transparent 65%)" }}
      />
      <StarField />

      <p className="kicker text-gold">Error 404 · Signal lost</p>

      <p
        aria-hidden
        className="condensed text-outline-gold mt-4 text-[clamp(7rem,22vw,14rem)] leading-[0.85]"
      >
        404
      </p>

      <h1 className="mt-4 max-w-2xl">
        <span className="serif-display block text-[clamp(1.75rem,3.6vw,2.6rem)] leading-[1.1]">This star isn&apos;t</span>
        <span className="serif-italic text-gilded block text-[clamp(2.2rem,4.6vw,3.4rem)] leading-[1.1]">
          on the chart.
        </span>
      </h1>

      <p className="mt-7 max-w-md text-base leading-[1.8] text-muted-foreground">
        The link may be outdated, or the page may have moved. Everything else is still exactly where
        it should be.
      </p>

      <div className="mt-11 flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant="gilded" size="lg">
          <Link href="/">
            <ArrowLeft aria-hidden />
            Return home
          </Link>
        </Button>
        <Button asChild variant="bracket" size="lg">
          <Link href="/projects">
            Browse projects
            <ArrowUpRight aria-hidden />
          </Link>
        </Button>
      </div>
    </main>
  );
}

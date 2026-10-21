import Link from "next/link";
import { ArrowUp, ArrowUpRight } from "lucide-react";

import { SocialLinks } from "@/components/site/social-links";
import { Sparkle } from "@/components/site/sparkle";
import { Button } from "@/components/ui/button";
import { NAV_SECTIONS } from "@/lib/navigation";
import type { Profile, SiteSettings, SocialLink } from "@/lib/types";

interface FooterProps {
  profile: Profile;
  settings: SiteSettings;
  socials: SocialLink[];
  hasResume: boolean;
}

export function Footer({ profile, settings, socials, hasResume }: FooterProps) {
  const year = new Date().getFullYear();
  const firstName = profile.name.split(/\s+/)[0] ?? profile.name;

  return (
    <footer className="relative overflow-clip border-t border-border">
      <div className="section-shell pt-24 pb-10 sm:pt-28">
        {/* Sign-off: the name, set large, countersigned by hand. */}
        <div className="relative">
          <p className="kicker flex items-center gap-3">
            <Sparkle twinkle className="size-2.5 text-gold" />
            End of transmission
          </p>
          <p className="serif-display mt-7 text-[clamp(2.5rem,6.5vw,5.5rem)] leading-[1] text-balance">
            {profile.name}
          </p>
          <span
            aria-hidden
            className="script pointer-events-none absolute right-0 -bottom-8 -rotate-6 text-[clamp(2.1rem,4vw,3.4rem)] leading-[1.2] sm:right-4"
          >
            {firstName}
          </span>
        </div>

        <div className="mt-20 grid gap-12 border-t border-border pt-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="min-w-0 max-w-sm">
            <p className="text-sm leading-[1.85] text-muted-foreground">{profile.bio}</p>
            {socials.length > 0 ? <SocialLinks links={socials} className="mt-7" size="sm" /> : null}
          </div>

          <nav aria-label="Footer" className="min-w-0">
            <h2 className="kicker">Navigate</h2>
            <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-1">
              {NAV_SECTIONS.filter(({ id }) => id !== "home").map(({ id, label }, index) => (
                <li key={id}>
                  <Link
                    href={`/#${id}`}
                    className="group inline-flex items-baseline gap-2.5 text-sm transition-colors hover:text-gold"
                  >
                    <span className="font-mono text-[0.625rem] text-muted-foreground group-hover:text-gold">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0">
            <h2 className="kicker">Elsewhere</h2>
            <ul className="mt-6 flex flex-col gap-3">
              {profile.email ? (
                <li>
                  <a
                    href={`mailto:${profile.email}`}
                    className="text-sm break-all transition-colors hover:text-gold"
                  >
                    {profile.email}
                  </a>
                </li>
              ) : null}
              <li>
                <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm transition-colors hover:text-gold">
                  Full project log
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </Link>
              </li>
              {hasResume ? (
                <li>
                  <a
                    href="/resume"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm transition-colors hover:text-gold"
                  >
                    Résumé
                    <ArrowUpRight className="size-3.5" aria-hidden />
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-5 border-t border-border pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[0.6875rem] tracking-[0.12em] text-muted-foreground uppercase">
            © <span className="numeric text-sm tracking-normal">{year}</span> {profile.name}
          </p>

          <div className="flex items-center gap-5">
            {settings.footer_note ? (
              <p className="max-w-md text-xs leading-relaxed text-muted-foreground sm:text-right">
                {settings.footer_note}
              </p>
            ) : null}
            <Button asChild variant="bracket" size="icon-sm" className="shrink-0" aria-label="Back to top">
              <a href="#main">
                <ArrowUp aria-hidden />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}

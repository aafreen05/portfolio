import { ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { ContactForm } from "@/components/site/contact-form";
import { SectionHeading } from "@/components/site/section-heading";
import { SocialLinks } from "@/components/site/social-links";
import type { Profile, SiteSettings, SocialLink } from "@/lib/types";

interface ContactSectionProps {
  profile: Profile;
  settings: SiteSettings;
  socials: SocialLink[];
}

export function ContactSection({ profile, settings, socials }: ContactSectionProps) {
  return (
    <section
      id="contact"
      data-label="Contact"
      className="relative overflow-clip border-t border-border py-28 sm:py-32 lg:py-40"
    >
      {/* A pool of gold light rising from the bottom edge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[70%]"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 50% 100%, color-mix(in oklab, var(--gold) 12%, transparent), transparent 70%)",
        }}
      />

      <div className="section-shell">
        <SectionHeading
          index="06"
          kicker="Contact"
          title={
            <>
              <span className="serif-display block text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.08] text-balance">
                {settings.contact_heading}
              </span>
              <span className="script block -rotate-2 pl-[0.1em] text-[clamp(2.5rem,4.6vw,3.75rem)] leading-[1.25]">
                together.
              </span>
            </>
          }
          description={settings.contact_body}
        />

        <div className="mt-20 grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal from="left" className="min-w-0">
            <dl className="border-t border-border">
              {profile.email ? (
                <div className="grid gap-2 border-b border-border py-6 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-baseline sm:gap-6">
                  <dt className="kicker">Direct line</dt>
                  <dd className="min-w-0">
                    <a
                      href={`mailto:${profile.email}`}
                      className="group inline-flex max-w-full items-baseline gap-2 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      <span className="serif-display truncate text-[clamp(1.2rem,1.9vw,1.55rem)] transition-colors duration-300 group-hover:text-gold">
                        {profile.email}
                      </span>
                      <ArrowUpRight
                        className="size-4 shrink-0 text-gold transition-transform duration-500 group-hover:rotate-45"
                        aria-hidden
                      />
                    </a>
                  </dd>
                </div>
              ) : null}

              {profile.location ? (
                <div className="grid gap-2 border-b border-border py-6 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-baseline sm:gap-6">
                  <dt className="kicker">Based in</dt>
                  <dd className="text-[0.9375rem] font-semibold">{profile.location}</dd>
                </div>
              ) : null}

              {profile.available && profile.availability ? (
                <div className="grid gap-2 border-b border-border py-6 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-baseline sm:gap-6">
                  <dt className="kicker">Status</dt>
                  <dd className="flex items-center gap-2.5 text-[0.9375rem] font-semibold text-sage">
                    <span className="relative flex size-2">
                      <span className="animate-beacon absolute inset-0 rounded-full bg-sage" />
                      <span className="relative size-2 rounded-full bg-sage" />
                    </span>
                    {profile.availability}
                  </dd>
                </div>
              ) : null}

              {socials.length > 0 ? (
                <div className="grid gap-3 border-b border-border py-6 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-center sm:gap-6">
                  <dt className="kicker">Channels</dt>
                  <dd>
                    <SocialLinks links={socials} />
                  </dd>
                </div>
              ) : null}
            </dl>
          </Reveal>

          <Reveal from="right" delay={0.12} className="min-w-0">
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

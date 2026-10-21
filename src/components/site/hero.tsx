import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, FileText, MapPin } from "lucide-react";

import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { RoleRotator } from "@/components/motion/scramble-text";
import { WordsReveal } from "@/components/motion/words-reveal";
import { Astrolabe } from "@/components/site/astrolabe";
import { SocialLinks } from "@/components/site/social-links";
import { Sparkle } from "@/components/site/sparkle";
import { Button } from "@/components/ui/button";
import type { Hero as HeroContent, Profile, SocialLink } from "@/lib/types";

interface HeroProps {
  hero: HeroContent;
  profile: Profile;
  socials: SocialLink[];
  hasResume: boolean;
  stats: { label: string; value: number }[];
}

/**
 * Splits the editable heading around its accent phrase: whatever precedes
 * the name ("Hi, I'm") becomes the handwritten greeting, the name itself is
 * set in the display serif. With no usable accent, the whole heading is the name.
 */
function splitHeading(heading: string, accent: string | null | undefined) {
  if (!accent || !heading.includes(accent)) return { greeting: "", name: heading, trailing: "" };
  const start = heading.indexOf(accent);
  return {
    greeting: heading.slice(0, start).trim(),
    name: accent,
    trailing: heading.slice(start + accent.length).trim(),
  };
}

export function Hero({ hero, profile, socials, hasResume, stats }: HeroProps) {
  const image = hero.image_url ?? profile.avatar_url;
  const { greeting, name, trailing } = splitHeading(hero.heading, hero.heading_accent);
  const roles = hero.subtitle
    .split(/[·•|]/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    // `overflow-clip`, not `overflow-hidden`: a hidden box is still a scroll
    // container, so focusing a link or `scrollIntoView` could scroll the hero
    // *inside itself* into its oversized glow, leaving a blank band. A
    // clipped box clips the same but can never scroll.
    <section id="home" data-label="Home" className="relative isolate overflow-clip">
      {/* Horizon glow — where the sky meets the page. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[120%]"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 72% 38%, var(--sky-top), transparent 70%), radial-gradient(ellipse 60% 50% at 10% 90%, var(--sky-bottom), transparent 70%)",
        }}
      />

      <div className="section-shell grid items-center gap-16 pt-10 pb-10 sm:pt-14 lg:grid-cols-[1.12fr_0.88fr] lg:gap-10 lg:pt-16">
        <div className="min-w-0">
          <Reveal from="blur">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              {profile.available && profile.availability ? (
                <span className="flex items-center gap-2.5">
                  <span className="relative flex size-2">
                    <span className="animate-beacon absolute inset-0 rounded-full bg-sage" />
                    <span className="relative size-2 rounded-full bg-sage" />
                  </span>
                  <span className="kicker text-sage">{profile.availability}</span>
                </span>
              ) : null}
              {hero.eyebrow ? (
                <span className="kicker flex items-center gap-2">
                  <MapPin className="size-3 text-gold" aria-hidden />
                  {hero.eyebrow}
                </span>
              ) : null}
            </div>
          </Reveal>

          <h1 className="mt-9">
            {greeting ? (
              <Reveal as="span" from="left" delay={0.1} className="block">
                <span className="script inline-block -rotate-2 text-[clamp(2rem,3.6vw,2.75rem)] leading-[1.2]">
                  {greeting}
                </span>
              </Reveal>
            ) : null}

            {/*
              The name is its own reveal group with one item per word. Whole
              words (not letters) keep the font's kerning and ligatures
              intact — splitting into inline-block letters breaks both.
            */}
            <span
              data-reveal-group=""
              data-reveal-stagger="0.12"
              className="serif-display mt-1 block text-[clamp(2.9rem,7vw,6rem)] leading-[1.02]"
            >
              <WordsReveal text={name} />
            </span>

            {trailing ? (
              <span className="serif-italic mt-3 block text-[clamp(1.25rem,2.2vw,1.75rem)] text-muted-foreground">
                {trailing}
              </span>
            ) : null}
          </h1>

          {roles.length > 0 ? (
            <Reveal delay={0.45}>
              <p className="mt-8 flex flex-wrap items-center gap-3 font-mono text-xs tracking-[0.1em] uppercase sm:text-[0.8125rem]">
                <span className="text-muted-foreground">Currently</span>
                <span aria-hidden className="h-px w-8 bg-gold/60" />
                <RoleRotator items={roles} className="text-gold" />
              </p>
            </Reveal>
          ) : null}

          <Reveal delay={0.55}>
            <p className="mt-6 max-w-xl text-[0.9375rem] leading-[1.85] text-muted-foreground sm:text-base">
              {hero.description}
            </p>
          </Reveal>

          <Reveal delay={0.65}>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button asChild variant="gilded" size="xl" className="w-full sm:w-auto">
                <Link href={hero.primary_cta_href}>
                  {hero.primary_cta_label}
                  <ArrowDownRight aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="bracket" size="xl" className="w-full sm:w-auto">
                <Link href={hero.secondary_cta_href}>
                  {hero.secondary_cta_label}
                  <ArrowUpRight aria-hidden />
                </Link>
              </Button>
              {hasResume ? (
                <Button asChild variant="link" className="justify-center sm:ml-2">
                  <a href="/resume" target="_blank" rel="noopener noreferrer">
                    <FileText className="size-4" aria-hidden />
                    Résumé
                  </a>
                </Button>
              ) : null}
            </div>
          </Reveal>
        </div>

        <Reveal from="scale" delay={0.25} className="mx-auto w-full max-w-[26rem] sm:max-w-[30rem] lg:max-w-[36rem]">
          <Astrolabe image={image} name={profile.name} roleTitle={profile.role_title} />
          <div className="mt-6 flex items-center justify-center gap-8">
            <span className="kicker flex items-center gap-2">
              <span aria-hidden className="size-2 rounded-full bg-gold shadow-[0_0_12px_var(--gold)]" />
              Design
            </span>
            <span aria-hidden className="h-px w-10 bg-border" />
            <span className="kicker flex items-center gap-2">
              <span aria-hidden className="size-2 rounded-full bg-ice shadow-[0_0_12px_var(--ice)]" />
              Code
            </span>
          </div>
        </Reveal>
      </div>

      {/* Instrument strip: scroll cue, live counts, channels. */}
      <Reveal delay={0.8} className="section-shell pb-12">
        <div className="flex flex-col gap-8 border-t border-border pt-7 md:flex-row md:items-center md:justify-between">
          <Link
            href="#about"
            className="group hidden items-center gap-4 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none md:flex"
          >
            <span className="relative block h-10 w-px overflow-hidden bg-border">
              <span className="animate-cue absolute inset-x-0 top-0 h-3 bg-gold" />
            </span>
            <span className="kicker transition-colors group-hover:text-gold">Scroll to explore</span>
          </Link>

          {stats.length > 0 ? (
            <dl className="grid grid-cols-3 gap-4 sm:flex sm:items-center sm:gap-12">
              {stats.map((stat) => (
                // dt precedes dd in the DOM, as a description list requires;
                // flex order puts the numeral first visually. Phones stack
                // numeral over label so three stats fit across 320px.
                <div key={stat.label} className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-3">
                  <dt className="kicker order-last leading-tight">
                    <Sparkle className="mb-1 block size-2 text-gold" />
                    {stat.label}
                  </dt>
                  <dd className="numeric text-4xl leading-none sm:text-[2.75rem]">
                    <CountUp value={stat.value} pad={2} />
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          {socials.length > 0 ? <SocialLinks links={socials} /> : null}
        </div>
      </Reveal>
    </section>
  );
}

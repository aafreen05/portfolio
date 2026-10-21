import { MapPin } from "lucide-react";

import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { DuoTitle, SectionHeading } from "@/components/site/section-heading";
import { Sparkle } from "@/components/site/sparkle";
import type { Education } from "@/lib/types";

interface EducationSectionProps {
  education: Education[];
}

export function EducationSection({ education }: EducationSectionProps) {
  if (education.length === 0) return null;

  return (
    <section
      id="education"
      data-label="Education"
      className="relative border-y border-border bg-surface/40 py-28 sm:py-32 lg:py-40"
    >
      <div className="section-shell">
        <SectionHeading
          index="04"
          kicker="Education"
          title={<DuoTitle caps="Foundations" italic="where it all began" />}
        />

        <div className="relative mt-20">
          {/*
            The orbit rail, with a comet endlessly running down it. Sits in
            the gutter between the year column and the entries on wide
            screens, and at the left edge on narrow ones.
          */}
          <div
            aria-hidden
            className="absolute top-0 bottom-0 left-[7px] w-px overflow-hidden bg-border md:left-[calc(13rem+7px)]"
          >
            <span className="animate-comet absolute inset-0">
              <span className="absolute top-0 left-0 h-28 w-px bg-gradient-to-b from-transparent via-gold/70 to-gold" />
            </span>
          </div>

          <RevealGroup as="ol" stagger={0.15} className="flex flex-col gap-14">
            {education.map((entry) => (
              <RevealItem
                as="li"
                key={entry.id}
                className="relative grid gap-6 pl-10 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-0 md:pl-0"
              >
                {/* Years, set tall. */}
                <div className="md:pr-12 md:text-right">
                  <p className="numeric text-4xl leading-none md:text-5xl">{entry.start_year}</p>
                  {entry.end_year ? (
                    <p className="numeric mt-1 text-xl leading-none text-muted-foreground">
                      → {entry.end_year}
                    </p>
                  ) : null}
                  {entry.current ? (
                    <p className="kicker mt-4 flex items-center gap-2 text-sage md:justify-end">
                      <span className="relative flex size-1.5">
                        <span className="animate-beacon absolute inset-0 rounded-full bg-sage" />
                        <span className="relative size-1.5 rounded-full bg-sage" />
                      </span>
                      In progress
                    </p>
                  ) : null}
                </div>

                {/* Marker on the rail. */}
                <span
                  aria-hidden
                  className="absolute top-2 left-0 grid size-[15px] place-items-center bg-background text-gold md:left-[13rem]"
                >
                  <Sparkle twinkle className="size-[15px]" />
                </span>

                <article className="frame frame-hover relative p-7 sm:p-9 md:ml-12">
                  <p className="wide-caps text-sm tracking-wide">{entry.degree}</p>
                  <h3 className="serif-italic text-gilded mt-2 text-[clamp(1.6rem,2.8vw,2.3rem)] leading-[1.15]">
                    {entry.field}
                  </h3>
                  <p className="mt-4 text-[0.9375rem] font-semibold">{entry.institution}</p>

                  <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
                    {entry.location ? (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-3 text-gold" aria-hidden />
                        {entry.location}
                      </span>
                    ) : null}
                    {entry.status ? <span className="text-gold">{entry.status}</span> : null}
                  </p>

                  {entry.description ? (
                    <p className="mt-6 max-w-2xl text-sm leading-[1.9] text-muted-foreground">
                      {entry.description}
                    </p>
                  ) : null}

                  {entry.highlights.length > 0 ? (
                    <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2.5 border-t border-border pt-6">
                      {entry.highlights.map((highlight) => (
                        <li
                          key={highlight}
                          className="flex items-center gap-2 font-mono text-[0.6875rem] tracking-[0.08em] text-muted-foreground uppercase"
                        >
                          <Sparkle className="size-2 text-gold" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}

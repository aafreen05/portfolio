import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Constellation } from "@/components/site/constellation";
import { SectionHeading } from "@/components/site/section-heading";
import { Sparkle } from "@/components/site/sparkle";
import type { About, Education } from "@/lib/types";

interface AboutSectionProps {
  about: About;
  education: Education[];
  name: string;
}

const NUMERALS = ["I", "II", "III"];

/** "Computer Science and Engineering" → "CSE": capitalised words only. */
function initialism(field: string) {
  return field
    .split(/\s+/)
    .filter((word) => /^[A-Z]/.test(word))
    .map((word) => word[0])
    .join("");
}

/**
 * A gold serif drop cap on the first *letter* only.
 *
 * Done in markup rather than with `::first-letter`, which by spec swallows
 * adjacent punctuation — "I'm" would become a giant "I'" followed by "m".
 */
function DropCap({ text }: { text: string }) {
  const index = text.search(/\p{L}/u);
  if (index === -1) return <>{text}</>;

  // Floating changes the visual layout only; the text still reads in order,
  // so "I" + "'m a third-year…" is announced as "I'm a third-year…".
  return (
    <>
      <span className="serif-display float-left mt-1 mr-3 text-[3.6rem] leading-[0.8] text-gold">
        {text.slice(0, index + 1)}
      </span>
      {text.slice(index + 1)}
    </>
  );
}

export function AboutSection({ about, education, name }: AboutSectionProps) {
  const current = education.find((entry) => entry.current) ?? education[0];
  const paragraphs = about.body.split(/\n\s*\n/).filter(Boolean);
  const firstName = name.split(/\s+/)[0] ?? name;

  const pillars = [
    { title: about.fullstack_title, body: about.fullstack_body, tint: "var(--ice)" },
    { title: about.design_title, body: about.design_body, tint: "var(--gold)" },
    { title: about.goals_title, body: about.goals_body, tint: "var(--orchid)" },
  ];

  return (
    <section id="about" data-label="About" className="section-shell relative py-28 sm:py-32 lg:py-40">
      <SectionHeading
        index="01"
        kicker={about.eyebrow || "About"}
        title={
          <span className="serif-display block text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.14] text-balance">
            {about.heading}
          </span>
        }
      />

      <div className="mt-20 grid gap-14 lg:grid-cols-12 lg:gap-14">
        {/* The spread: pull quote, two-column body, signature. */}
        <div className="min-w-0 lg:col-span-7">
          <Reveal from="blur">
            <blockquote className="serif-italic relative text-[clamp(1.3rem,2.1vw,1.7rem)] leading-[1.5]">
              {/* An oversized opening mark as ornament, hung into the margin. */}
              <span
                aria-hidden
                className="absolute -top-10 -left-1 text-[6.5rem] leading-none text-gold/45 sm:-left-8"
              >
                “
              </span>
              {about.lead}
            </blockquote>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-12 grid gap-6 md:grid-cols-2 md:gap-10">
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="text-[0.9375rem] leading-[1.9] text-muted-foreground">
                  {index === 0 ? <DropCap text={paragraph} /> : paragraph}
                </p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-12 flex items-end gap-5">
              <span className="script -rotate-3 text-[2.9rem] leading-[1.15]">{firstName}</span>
              {current ? (
                <span className="kicker mb-2 leading-relaxed">
                  {current.degree} · {initialism(current.field)}
                  <br />
                  {current.status || current.institution}
                </span>
              ) : null}
            </div>
          </Reveal>
        </div>

        {/* Field notes — an instrument readout beside the essay. */}
        <Reveal from="right" delay={0.15} className="min-w-0 lg:col-span-5">
          <aside className="frame relative overflow-clip p-7 sm:p-8">
            <Constellation
              seed={`about-${name}`}
              count={6}
              grid={false}
              className="pointer-events-none absolute -top-4 -right-6 w-52 opacity-70"
            />

            <p className="kicker relative flex items-center gap-2">
              <Sparkle className="size-2.5 text-gold" />
              Field notes
            </p>

            {current ? (
              <div className="relative mt-8">
                <p className="kicker text-gold">Currently studying</p>
                <p className="wide-caps mt-3 text-sm leading-snug">
                  {current.degree} · {current.field}
                </p>
                <p className="serif-italic mt-2 text-xl leading-snug">{current.institution}</p>
                <p className="mt-2 font-mono text-xs text-muted-foreground">
                  {[current.location, current.status].filter(Boolean).join(" · ")}
                </p>
              </div>
            ) : null}

            {about.stats.length > 0 ? (
              <dl className="relative mt-8 grid grid-cols-2 border-t border-l border-border">
                {about.stats.map((stat) => (
                  <div key={stat.label} className="border-r border-b border-border px-4 py-4">
                    <dt className="kicker">{stat.label}</dt>
                    <dd className="mt-2 font-wide text-[0.8125rem] font-semibold tracking-wide uppercase">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </aside>
        </Reveal>
      </div>

      {/* Three focus areas, numbered like chapters. */}
      <div className="mt-28">
        {about.focus_heading ? (
          <Reveal>
            <p className="kicker flex items-center gap-3">
              <span aria-hidden className="draw-rule h-px w-10 bg-gold/60" />
              {about.focus_heading}
            </p>
          </Reveal>
        ) : null}

        <RevealGroup as="ol" className="mt-8 grid border-t border-border md:grid-cols-3">
          {pillars.map((pillar, index) => (
            <RevealItem
              as="li"
              key={pillar.title}
              className="group relative border-b border-border py-10 md:border-b-0 md:px-8 md:first:pl-0 md:[&:not(:first-child)]:border-l"
            >
              {/* A tinted rule sweeps across the top on hover. */}
              <span
                aria-hidden
                className="absolute inset-x-0 -top-px h-px origin-left scale-x-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 md:group-first:left-0"
                style={{ background: pillar.tint }}
              />
              <span
                className="serif-italic block text-5xl leading-none transition-transform duration-700 group-hover:-translate-y-1"
                style={{ color: pillar.tint }}
              >
                {NUMERALS[index]}
              </span>
              <h3 className="wide-caps mt-7 text-[0.9375rem] leading-snug">{pillar.title}</h3>
              <p className="mt-4 text-sm leading-[1.85] text-muted-foreground">{pillar.body}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Constellation } from "@/components/site/constellation";
import { DuoTitle, SectionHeading } from "@/components/site/section-heading";
import { Sparkle } from "@/components/site/sparkle";
import { SKILL_CATEGORIES, type Skill, type SkillCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SkillsSectionProps {
  skills: Skill[];
}

/** Code-side disciplines lean ice, craft-side lean gold and orchid. */
const CATEGORY_TINT: Record<SkillCategory, string> = {
  frontend: "var(--ice)",
  backend: "var(--gold)",
  database: "var(--ember)",
  uiux: "var(--orchid)",
  tools: "var(--sage)",
};

const LEVEL: Record<Skill["level"], { stars: number; label: string }> = {
  learning: { stars: 1, label: "Learning" },
  working: { stars: 2, label: "Working knowledge" },
  confident: { stars: 3, label: "Confident" },
};

/** Grid spans that always fill rows: 3 across on top, 2 wider below. */
const SPAN = [
  "xl:col-span-2",
  "xl:col-span-2",
  "xl:col-span-2",
  "xl:col-span-3",
  "xl:col-span-3",
];

export function SkillsSection({ skills }: SkillsSectionProps) {
  const grouped = SKILL_CATEGORIES.map((category) => ({
    ...category,
    items: skills.filter((skill) => skill.category === category.value),
  })).filter((category) => category.items.length > 0);

  if (grouped.length === 0) return null;

  return (
    <section
      id="skills"
      data-label="Skills"
      className="relative border-y border-border bg-surface/40 py-28 sm:py-32 lg:py-40"
    >
      <div className="section-shell">
        <SectionHeading
          index="02"
          kicker="Skills"
          title={<DuoTitle caps="Instruments" italic="of the craft" />}
          description="Grouped by where they sit in a project. Each constellation maps one discipline — the brighter the star, the more I use it. No invented expertise."
        />

        <RevealGroup as="div" stagger={0.1} className="mt-20 grid gap-5 md:grid-cols-2 xl:grid-cols-6">
          {grouped.map((category, index) => {
            const tint = CATEGORY_TINT[category.value];
            const oddLast = grouped.length % 2 === 1 && index === grouped.length - 1;

            return (
              <RevealItem
                key={category.value}
                className={cn(SPAN[index] ?? "xl:col-span-2", oddLast && "md:col-span-2 xl:col-span-3")}
              >
                <article className="frame frame-hover relative flex h-full flex-col overflow-clip p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="kicker" style={{ color: tint }}>
                        Constellation {String(index + 1).padStart(2, "0")}
                      </p>
                      <h3 className="wide-caps mt-3 text-base leading-tight">{category.label}</h3>
                      <p className="mt-1.5 text-xs text-muted-foreground">{category.blurb}</p>
                    </div>
                    <span className="numeric text-[2.5rem] leading-none" style={{ color: tint }}>
                      {String(category.items.length).padStart(2, "0")}
                    </span>
                  </div>

                  <Constellation
                    seed={`skills-${category.value}`}
                    count={category.items.length}
                    magnitudes={category.items.map((skill) => LEVEL[skill.level].stars)}
                    color={tint}
                    className="mt-6"
                  />

                  <ul className="mt-6 flex flex-col border-t border-border">
                    {category.items.map((skill) => (
                      <li
                        key={skill.id}
                        className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{skill.name}</p>
                          {skill.note ? (
                            <p className="mt-0.5 truncate font-mono text-[0.6875rem] text-muted-foreground">
                              {skill.note}
                            </p>
                          ) : null}
                        </div>
                        <Magnitude level={skill.level} tint={tint} />
                      </li>
                    ))}
                  </ul>
                </article>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}

/**
 * Brightness as three stars — a coarse, honest signal. A fake "92% React"
 * would claim a precision nobody has.
 */
function Magnitude({ level, tint }: { level: Skill["level"]; tint: string }) {
  const { stars, label } = LEVEL[level];

  return (
    // Sparkles paint with currentColor, so the tint set here reaches them.
    <span
      className="flex shrink-0 items-center gap-1"
      role="img"
      aria-label={label}
      title={label}
      style={{ color: tint }}
    >
      {[0, 1, 2].map((index) => (
        <Sparkle key={index} className={cn("size-2.5", index < stars ? "opacity-100" : "opacity-20")} />
      ))}
    </span>
  );
}

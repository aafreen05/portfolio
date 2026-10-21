import type { Metadata } from "next";
import { FolderOpen } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { WordsReveal } from "@/components/motion/words-reveal";
import { ProjectsIndex } from "@/components/site/projects-index";
import { EmptyState } from "@/components/ui/empty-state";
import { getProjects } from "@/lib/queries";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Web applications and interface design work by Aafreen Begam H — full stack builds, UI/UX case studies and front-end experiments.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div data-label="Archive">
      <header className="section-shell relative pt-14 pb-16 sm:pt-20 lg:pt-24 lg:pb-20">
        <span
          aria-hidden
          className="condensed text-outline pointer-events-none absolute top-8 right-5 select-none text-[clamp(5.5rem,13vw,11rem)] leading-[0.8] sm:right-8 lg:right-12"
        >
          {String(projects.length).padStart(2, "0")}
        </span>

        <Reveal>
          <p className="kicker flex items-center gap-4">
            <span className="font-mono text-gold">§ Archive</span>
            <span aria-hidden className="draw-rule h-px w-14 bg-gold/60" />
            {String(projects.length).padStart(2, "0")} entries
          </p>
        </Reveal>

        <h1 className="relative mt-8">
          <Reveal as="span" className="wide-caps block text-[clamp(1.35rem,3vw,2.25rem)] leading-[1.1]">
            The complete
          </Reveal>
          <span
            data-reveal-group=""
            data-reveal-stagger="0.06"
            className="serif-italic text-gilded block text-[clamp(2.6rem,6vw,4.75rem)] leading-[1.08]"
          >
            <WordsReveal text="observation log" />
          </span>
        </h1>

        <Reveal delay={0.3}>
          <p className="mt-7 max-w-xl text-[0.9375rem] leading-[1.85] text-muted-foreground sm:text-base">
            Full stack builds, interface design studies and front-end experiments. Filter by
            discipline, or open any entry for the full story behind it.
          </p>
        </Reveal>
      </header>

      <div className="section-shell pb-28 sm:pb-32">
        {projects.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="The log is empty"
            description="Projects published from the admin panel will appear here."
          />
        ) : (
          <Reveal delay={0.2}>
            <ProjectsIndex projects={projects} />
          </Reveal>
        )}
      </div>
    </div>
  );
}

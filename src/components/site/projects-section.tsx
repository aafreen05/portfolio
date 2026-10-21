import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { ProjectsIndex } from "@/components/site/projects-index";
import { DuoTitle, SectionHeading } from "@/components/site/section-heading";
import { Button } from "@/components/ui/button";
import type { Project } from "@/lib/types";

interface ProjectsSectionProps {
  projects: Project[];
  totalCount: number;
}

export function ProjectsSection({ projects, totalCount }: ProjectsSectionProps) {
  if (projects.length === 0) return null;

  return (
    <section
      id="projects"
      data-label="Work"
      className="section-shell relative py-28 sm:py-32 lg:py-40"
    >
      <SectionHeading
        index="03"
        kicker="Selected work"
        title={<DuoTitle caps="Observations" italic="designed & built" />}
        description="Every entry began as a problem worth solving. Open one to read how it was approached — the problem, the thinking, and what shipped."
        aside={
          totalCount > projects.length ? (
            <Button asChild variant="bracket" size="lg">
              <Link href="/projects">
                Full log · {String(totalCount).padStart(2, "0")}
                <ArrowUpRight aria-hidden />
              </Link>
            </Button>
          ) : null
        }
      />

      <Reveal delay={0.1} className="mt-16">
        <ProjectsIndex projects={projects} />
      </Reveal>
    </section>
  );
}

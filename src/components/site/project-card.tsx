import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ProjectPlate } from "@/components/site/project-plate";
import { Sparkle } from "@/components/site/sparkle";
import { Badge, tintForLabel } from "@/components/ui/badge";
import type { Project } from "@/lib/types";

/**
 * Compact card for secondary placements (related work on a project page).
 * The primary listing is the observation log in `projects-index.tsx`.
 */
export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  return (
    <article className="frame frame-hover group relative flex h-full flex-col overflow-clip">
      <div className="relative aspect-[16/10] overflow-hidden border-b border-border">
        {project.cover_url ? (
          <Image
            src={project.cover_url}
            alt={`${project.title} cover image`}
            fill
            sizes="(max-width: 768px) 100vw, 36rem"
            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <ProjectPlate
            slug={project.slug}
            title={project.title}
            category={project.category}
            index={index}
            starCount={Math.max(4, Math.min(8, project.technologies.length))}
            className="transition-transform duration-1000 ease-out group-hover:scale-[1.04]"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant={tintForLabel(project.category)} size="sm">
            {project.category}
          </Badge>
          {project.year ? <span className="numeric text-sm text-muted-foreground">{project.year}</span> : null}
          {project.featured ? (
            <span className="kicker flex items-center gap-1 text-gold">
              <Sparkle className="size-2.5" /> Featured
            </span>
          ) : null}
        </div>

        <h3 className="serif-display mt-4 text-2xl leading-tight">
          {/* Stretched link keeps the whole card clickable without nesting anchors. */}
          <Link
            href={`/projects/${project.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {project.title}
          </Link>
        </h3>

        <p className="mt-3 line-clamp-3 text-sm leading-[1.8] text-muted-foreground">{project.summary}</p>

        <div className="mt-auto flex items-center justify-between gap-4 pt-6">
          <span className="truncate font-mono text-[0.6875rem] tracking-[0.1em] text-muted-foreground uppercase">
            {project.technologies.slice(0, 3).join(" / ")}
          </span>
          <ArrowUpRight
            className="size-5 shrink-0 text-muted-foreground transition-transform duration-500 group-hover:rotate-45 group-hover:text-gold"
            aria-hidden
          />
        </div>
      </div>
    </article>
  );
}

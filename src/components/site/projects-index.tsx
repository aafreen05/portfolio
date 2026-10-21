"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, FolderOpen } from "lucide-react";

import { ProjectPlate } from "@/components/site/project-plate";
import { Sparkle } from "@/components/site/sparkle";
import { Badge, tintForLabel } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

const ALL = "All";

/**
 * The observation log — projects as ruled entries with serif titles, not a
 * grid of cards.
 *
 * On devices with a fine pointer, hovering an entry summons a preview plate
 * that trails the cursor. It is positioned by writing a transform straight
 * to the element (no React re-render per pointer move), with a CSS
 * transition supplying the lag. Touch devices get an inline plate per entry
 * instead.
 */
export function ProjectsIndex({ projects }: { projects: Project[] }) {
  const [active, setActive] = React.useState(ALL);
  const [hovered, setHovered] = React.useState<Project | null>(null);
  const [canHover, setCanHover] = React.useState(false);
  const previewRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const query = window.matchMedia("(pointer: fine) and (min-width: 1024px)");
    const update = () => setCanHover(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const categories = React.useMemo(() => {
    const unique = Array.from(new Set(projects.map((project) => project.category))).sort();
    return [ALL, ...unique];
  }, [projects]);

  const filtered = React.useMemo(
    () => (active === ALL ? projects : projects.filter((project) => project.category === active)),
    [active, projects],
  );

  function movePreview(event: React.PointerEvent) {
    const element = previewRef.current;
    if (!element) return;

    // Beside the cursor so it never covers the title — flipped to the left
    // near the right edge, and kept clear of the top and bottom.
    const { offsetWidth: w, offsetHeight: h } = element;
    const right = event.clientX + 28;
    const x = right + w > window.innerWidth - 16 ? event.clientX - 28 - w : right;
    const y = Math.min(Math.max(event.clientY - 90, 16), window.innerHeight - h - 16);
    const transform = `translate3d(${x}px, ${y}px, 0)`;

    if (element.dataset.placed !== "true") {
      // First move after entering: snap into place instead of gliding in
      // from wherever it was last parked.
      element.style.transition = "none";
      element.style.transform = transform;
      void element.offsetWidth;
      element.style.transition = "";
      element.dataset.placed = "true";
      return;
    }

    element.style.transform = transform;
  }

  function leaveList() {
    setHovered(null);
    if (previewRef.current) previewRef.current.dataset.placed = "false";
  }

  return (
    <div>
      {categories.length > 2 ? (
        <div
          role="group"
          aria-label="Filter projects by category"
          className="flex flex-wrap items-center gap-x-1 gap-y-2 border-b border-border"
        >
          {categories.map((category) => {
            const isActive = active === category;
            const count =
              category === ALL
                ? projects.length
                : projects.filter((project) => project.category === category).length;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setActive(category)}
                aria-pressed={isActive}
                className={cn(
                  "-mb-px flex items-center gap-2 border-b px-4 py-3 font-mono text-[0.6875rem] tracking-[0.16em] uppercase transition-colors duration-300",
                  "focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
                  isActive
                    ? "border-gold text-gold"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {isActive ? <Sparkle className="size-2.5" /> : null}
                {category}
                <sup className="text-[0.5625rem] opacity-60">{String(count).padStart(2, "0")}</sup>
              </button>
            );
          })}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Nothing logged here yet"
          description="No projects in this category. Try another filter."
          className="mt-10"
        />
      ) : (
        <ol
          key={active}
          className="border-t border-border"
          onPointerMove={canHover ? movePreview : undefined}
          onPointerLeave={leaveList}
        >
          {filtered.map((project, index) => (
            <li
              key={project.id}
              className="group relative border-b border-border animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards duration-700"
              style={{ animationDelay: `${Math.min(index, 8) * 80}ms` }}
              onPointerEnter={(event) => {
                setHovered(project);
                // Scrolling under a still cursor fires pointerenter with no
                // pointermove; place the preview here too, or it would show
                // up parked wherever it was last left (initially the corner).
                if (canHover) movePreview(event);
              }}
            >
              <Link
                href={`/projects/${project.slug}`}
                className="grid gap-6 py-9 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none lg:grid-cols-[4.5rem_minmax(0,1fr)_auto] lg:items-center lg:gap-10 lg:py-10"
              >
                <span className="numeric hidden text-5xl leading-none text-muted-foreground/40 transition-colors duration-500 group-hover:text-gold lg:block">
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Touch devices: an inline plate instead of the hover preview. */}
                <div className="frame relative aspect-[16/9] overflow-hidden lg:hidden">
                  {project.cover_url ? (
                    <Image
                      src={project.cover_url}
                      alt=""
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                  ) : (
                    <ProjectPlate
                      slug={project.slug}
                      title={project.title}
                      category={project.category}
                      index={index}
                      starCount={Math.max(4, Math.min(8, project.technologies.length))}
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant={tintForLabel(project.category)} size="sm">
                      {project.category}
                    </Badge>
                    {project.year ? (
                      <span className="numeric text-sm text-muted-foreground">{project.year}</span>
                    ) : null}
                    {project.featured ? (
                      <span className="kicker flex items-center gap-1.5 text-gold">
                        <Sparkle twinkle className="size-2.5" /> Featured
                      </span>
                    ) : null}
                  </div>

                  <h3 className="serif-display mt-4 text-[clamp(1.6rem,2.8vw,2.4rem)] leading-[1.12] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3">
                    {project.title}
                  </h3>

                  <p className="mt-4 line-clamp-2 max-w-2xl text-sm leading-[1.8] text-muted-foreground lg:line-clamp-1">
                    {project.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-6 lg:justify-end">
                  <span className="max-w-[14rem] truncate font-mono text-[0.6875rem] tracking-[0.1em] text-muted-foreground uppercase">
                    {project.technologies.slice(0, 3).join(" / ")}
                  </span>
                  <span className="brackets grid size-12 shrink-0 place-items-center text-muted-foreground group-hover:text-gold">
                    <ArrowUpRight
                      className="size-5 transition-transform duration-500 group-hover:rotate-45"
                      aria-hidden
                    />
                  </span>
                </div>
              </Link>

              {/* Gold rule sweeping along the bottom edge on hover. */}
              <span
                aria-hidden
                className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-gold transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
              />
            </li>
          ))}
        </ol>
      )}

      {canHover ? (
        <div
          ref={previewRef}
          aria-hidden
          className="pointer-events-none fixed top-0 left-0 z-40 w-[22rem] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        >
          <div
            className={cn(
              "frame relative aspect-[16/10] overflow-hidden elevate-lg transition-[opacity,scale,rotate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
              hovered ? "scale-100 rotate-0 opacity-100" : "scale-90 -rotate-3 opacity-0",
            )}
          >
            {hovered ? (
              hovered.cover_url ? (
                <Image src={hovered.cover_url} alt="" fill sizes="22rem" className="object-cover" />
              ) : (
                <ProjectPlate
                  slug={hovered.slug}
                  title={hovered.title}
                  category={hovered.category}
                  index={Math.max(0, filtered.findIndex((project) => project.id === hovered.id))}
                  starCount={Math.max(4, Math.min(8, hovered.technologies.length))}
                />
              )
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

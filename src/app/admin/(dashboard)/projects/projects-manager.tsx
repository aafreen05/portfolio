"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, ExternalLink, FolderKanban, ImageIcon, Loader2, Pencil, Star } from "lucide-react";
import { toast } from "sonner";

import {
  deleteProject,
  duplicateProject,
  reorderProjects,
  toggleProjectFeatured,
  toggleProjectPublished,
} from "@/app/admin/_actions/projects";
import { DeleteAction, ReorderAction, ToggleAction } from "@/components/admin/row-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProjectsManager({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [, startTransition] = React.useTransition();

  const ordered = [...projects].sort((a, b) => a.sort_order - b.sort_order);

  function move(index: number, direction: "up" | "down") {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= ordered.length) return;

    const next = [...ordered];
    [next[index], next[target]] = [next[target], next[index]];

    startTransition(async () => {
      const result = await reorderProjects(next.map((project) => project.id));
      if (!result.ok) toast.error(result.message);
    });
  }

  function handleDuplicate(project: Project) {
    setPendingId(project.id);
    startTransition(async () => {
      const result = await duplicateProject(project.id);
      setPendingId(null);

      if (result.ok) {
        toast.success(result.message);
        if (result.id) router.push(`/admin/projects/${result.id}`);
      } else {
        toast.error(result.message);
      }
    });
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="No projects yet"
        description="Create your first project to fill the Projects section of the site."
        className="mt-8"
        action={
          <Button asChild>
            <Link href="/admin/projects/new">Create project</Link>
          </Button>
        }
      />
    );
  }

  return (
    <ul className="mt-8 flex flex-col gap-3">
      {ordered.map((project, index) => (
        <li
          key={project.id}
          className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <ReorderAction
              label={project.title}
              canMoveUp={index > 0}
              canMoveDown={index < ordered.length - 1}
              onMove={(direction) => move(index, direction)}
            />

            <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
              {project.cover_url ? (
                <Image
                  src={project.cover_url}
                  alt=""
                  fill
                  unoptimized
                  sizes="3.5rem"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="size-4 text-muted-foreground/50" aria-hidden />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{project.title}</p>
                {project.featured ? (
                  <Star className="size-3 shrink-0 fill-accent text-accent" aria-label="Featured" />
                ) : null}
              </div>
              <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                /{project.slug}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" size="sm">
                  {project.category}
                </Badge>
                <Badge variant={project.published ? "success" : "warning"} size="sm">
                  {project.published ? "Published" : "Draft"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-3 sm:border-0 sm:pt-0">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="hidden sm:inline">Featured</span>
              <ToggleAction
                checked={project.featured}
                label={`Feature ${project.title}`}
                onToggle={(next) => toggleProjectFeatured(project.id, next)}
              />
            </label>

            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="hidden sm:inline">Published</span>
              <ToggleAction
                checked={project.published}
                label={`Publish ${project.title}`}
                onToggle={(next) => toggleProjectPublished(project.id, next)}
              />
            </label>

            <div className="ml-auto flex items-center gap-0.5 sm:ml-0">
              {project.published ? (
                <Button
                  asChild
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground"
                >
                  <a
                    href={`/projects/${project.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Preview ${project.title}`}
                  >
                    <ExternalLink className="size-3.5" aria-hidden />
                  </a>
                </Button>
              ) : null}

              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground"
                onClick={() => handleDuplicate(project)}
                disabled={pendingId === project.id}
                aria-label={`Duplicate ${project.title}`}
              >
                {pendingId === project.id ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                ) : (
                  <Copy className="size-3.5" aria-hidden />
                )}
              </Button>

              <Button
                asChild
                variant="ghost"
                size="icon-sm"
                className={cn("text-muted-foreground")}
              >
                <Link href={`/admin/projects/${project.id}`} aria-label={`Edit ${project.title}`}>
                  <Pencil className="size-3.5" aria-hidden />
                </Link>
              </Button>

              <DeleteAction
                itemLabel={project.title}
                description="The project and its screenshots will be permanently removed."
                onConfirm={() => deleteProject(project.id)}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

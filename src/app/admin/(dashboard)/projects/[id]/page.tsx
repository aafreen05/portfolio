import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { ProjectEditor } from "@/app/admin/(dashboard)/projects/project-editor";
import { ScreenshotsManager } from "@/app/admin/(dashboard)/projects/screenshots-manager";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { adminGetProject, adminGetProjects } from "@/lib/admin/queries";

export const metadata = { title: "Edit project" };

export default async function EditProjectPage({ params }: PageProps<"/admin/projects/[id]">) {
  const { id } = await params;
  const project = await adminGetProject(id);

  if (!project) notFound();

  const projects = await adminGetProjects();
  const categories = Array.from(new Set(projects.map((item) => item.category))).sort();

  return (
    <PageBody>
      <Link
        href="/admin/projects"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
      >
        <ArrowLeft className="size-4" aria-hidden />
        All projects
      </Link>

      <PageHeader
        title={project.title}
        description={`/projects/${project.slug}`}
        actions={
          project.published ? (
            <Button asChild variant="outline" size="sm">
              <a href={`/projects/${project.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-3.5" aria-hidden />
                View live
              </a>
            </Button>
          ) : null
        }
      />

      <ProjectEditor
        project={project}
        nextSortOrder={project.sort_order}
        categories={categories}
      />

      <div className="mt-6">
        <ScreenshotsManager projectId={project.id} images={project.images ?? []} />
      </div>
    </PageBody>
  );
}

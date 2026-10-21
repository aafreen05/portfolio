import Link from "next/link";
import { Plus } from "lucide-react";

import { ProjectsManager } from "@/app/admin/(dashboard)/projects/projects-manager";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { adminGetProjects } from "@/lib/admin/queries";

export const metadata = { title: "Projects" };

export default async function AdminProjectsPage() {
  const projects = await adminGetProjects();
  const published = projects.filter((project) => project.published).length;

  return (
    <PageBody>
      <PageHeader
        title="Projects"
        description={`${projects.length} total · ${published} published. Order here controls the order on the site; featured projects appear on the home page.`}
        actions={
          <Button asChild>
            <Link href="/admin/projects/new">
              <Plus className="size-4" aria-hidden />
              New project
            </Link>
          </Button>
        }
      />
      <ProjectsManager projects={projects} />
    </PageBody>
  );
}

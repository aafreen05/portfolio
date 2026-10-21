import { ProjectEditor } from "@/app/admin/(dashboard)/projects/project-editor";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { adminGetProjects } from "@/lib/admin/queries";

export const metadata = { title: "New project" };

export default async function NewProjectPage() {
  const projects = await adminGetProjects();
  const nextSortOrder =
    projects.length > 0 ? Math.max(...projects.map((project) => project.sort_order)) + 1 : 1;
  const categories = Array.from(new Set(projects.map((project) => project.category))).sort();

  return (
    <PageBody>
      <PageHeader
        title="New project"
        description="Save the basics first — screenshots can be added once the project exists."
      />
      <ProjectEditor nextSortOrder={nextSortOrder} categories={categories} />
    </PageBody>
  );
}

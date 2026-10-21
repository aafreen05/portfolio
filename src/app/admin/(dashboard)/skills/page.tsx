import { SkillsManager } from "@/app/admin/(dashboard)/skills/skills-manager";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { adminGetSkills } from "@/lib/admin/queries";

export const metadata = { title: "Skills" };

export default async function AdminSkillsPage() {
  const skills = await adminGetSkills();

  return (
    <PageBody>
      <PageHeader
        title="Skills"
        description="Grouped by category on the public site. Reorder within a category, hide a skill without deleting it, and keep the levels honest."
      />
      <SkillsManager skills={skills} />
    </PageBody>
  );
}

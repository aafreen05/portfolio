import { EducationManager } from "@/app/admin/(dashboard)/education/education-manager";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { adminGetEducation } from "@/lib/admin/queries";

export const metadata = { title: "Education" };

export default async function AdminEducationPage() {
  const entries = await adminGetEducation();

  return (
    <PageBody>
      <PageHeader
        title="Education"
        description="Your degree and any other qualifications. The entry marked Current is also shown in the About section."
      />
      <EducationManager entries={entries} />
    </PageBody>
  );
}

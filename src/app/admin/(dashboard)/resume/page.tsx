import { ResumeManager } from "@/app/admin/(dashboard)/resume/resume-manager";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { adminGetResume } from "@/lib/admin/queries";

export const metadata = { title: "Resume" };

export default async function AdminResumePage() {
  const resume = await adminGetResume();

  return (
    <PageBody>
      <PageHeader
        title="Resume"
        description="Visitors reach the file through /resume, which always points at the current upload."
      />
      <ResumeManager resume={resume} />
    </PageBody>
  );
}

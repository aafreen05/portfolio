import { CertificatesManager } from "@/app/admin/(dashboard)/certificates/certificates-manager";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { adminGetCertificates } from "@/lib/admin/queries";

export const metadata = { title: "Certificates" };

export default async function AdminCertificatesPage() {
  const certificates = await adminGetCertificates();

  return (
    <PageBody>
      <PageHeader
        title="Certificates"
        description="Courses and credentials shown in a grid on the site. Order here is the order they appear in."
      />
      <CertificatesManager certificates={certificates} />
    </PageBody>
  );
}

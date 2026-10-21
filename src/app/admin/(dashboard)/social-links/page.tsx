import { SocialLinksManager } from "@/app/admin/(dashboard)/social-links/social-links-manager";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { adminGetSocialLinks } from "@/lib/admin/queries";

export const metadata = { title: "Social Links" };

export default async function AdminSocialLinksPage() {
  const links = await adminGetSocialLinks();

  return (
    <PageBody>
      <PageHeader
        title="Social Links"
        description="Shown in the hero, the contact section and the footer. Only enabled links are rendered, so there are never empty icons."
      />
      <SocialLinksManager links={links} />
    </PageBody>
  );
}

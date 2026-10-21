import { saveSettings } from "@/app/admin/_actions/content";
import { AdminForm, SaveBar, TagField } from "@/components/admin/admin-form";
import { FormCard, TextAreaField, TextField } from "@/components/admin/form-fields";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { adminGetSettings } from "@/lib/admin/queries";

export const metadata = { title: "SEO" };

export default async function AdminSeoPage() {
  const settings = await adminGetSettings();

  return (
    <PageBody>
      <PageHeader
        title="SEO"
        description="How the site appears in search results and when a link is shared. Admin pages are excluded from search engines automatically."
      />

      <AdminForm action={saveSettings} className="mt-8">
        {/* Contact copy lives in Settings; carried through so one save writes the whole row. */}
        <input type="hidden" name="contact_heading" value={settings.contact_heading} />
        <input type="hidden" name="contact_body" value={settings.contact_body} />
        <input type="hidden" name="footer_note" value={settings.footer_note} />

        <FormCard title="Search results">
          <TextField
            name="site_title"
            label="Site title"
            defaultValue={settings.site_title}
            required
            hint="Shown in the browser tab and as the search result headline. Around 60 characters reads best."
          />

          <TextAreaField
            name="site_description"
            label="Meta description"
            defaultValue={settings.site_description}
            rows={3}
            required
            hint="The snippet under the title in search results. Aim for 150–160 characters."
          />

          <TagField
            name="keywords"
            label="Keywords"
            defaultValue={settings.keywords}
            placeholder="Full Stack Developer"
            hint="A handful of terms you want to be found for."
            max={20}
          />
        </FormCard>

        <FormCard
          title="Social sharing"
          description="Used for Open Graph and X/Twitter cards when someone shares a link."
        >
          <ImageUploadField
            name="og_image_url"
            label="Share image"
            bucket="avatars"
            defaultValue={settings.og_image_url}
            hint="1200 × 630 works best. Leave empty to use the generated card, which is built from your profile automatically."
          />

          <TextField
            name="twitter_handle"
            label="X / Twitter handle"
            defaultValue={settings.twitter_handle}
            placeholder="@username"
            hint="Optional. Adds attribution to shared cards."
          />
        </FormCard>

        <SaveBar />
      </AdminForm>
    </PageBody>
  );
}

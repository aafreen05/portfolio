import { saveHero } from "@/app/admin/_actions/content";
import { AdminForm, SaveBar } from "@/components/admin/admin-form";
import { FieldRow, FormCard, TextAreaField, TextField } from "@/components/admin/form-fields";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { adminGetHero } from "@/lib/admin/queries";

export const metadata = { title: "Hero" };

export default async function AdminHeroPage() {
  const hero = await adminGetHero();

  return (
    <PageBody>
      <PageHeader
        title="Hero"
        description="The first screen a visitor sees. Keep the heading short and let the description carry the detail."
      />

      <AdminForm action={saveHero} className="mt-8">
        <FormCard title="Headline">
          <TextField
            name="eyebrow"
            label="Eyebrow"
            defaultValue={hero.eyebrow}
            hint="Small label above the heading — usually your location."
            placeholder="Thanjavur, India"
          />

          <TextField
            name="heading"
            label="Heading"
            defaultValue={hero.heading}
            required
            placeholder="Hi, I'm Aafreen Begam H"
          />

          <TextField
            name="heading_accent"
            label="Accent phrase"
            defaultValue={hero.heading_accent}
            hint="A phrase from the heading to set in the italic serif. Must match the heading text exactly, or it is ignored."
            placeholder="Aafreen Begam H"
          />

          <TextField
            name="subtitle"
            label="Subtitle"
            defaultValue={hero.subtitle}
            required
            hint="Separate each role with a · and they render as individual tokens."
            placeholder="B.Tech CSE Student · Full Stack Developer · UI/UX Enthusiast"
          />

          <TextAreaField
            name="description"
            label="Description"
            defaultValue={hero.description}
            rows={4}
            required
            hint="Two or three sentences on what you do and where you are."
          />
        </FormCard>

        <FormCard
          title="Call to action"
          description="Links can be an in-page anchor (#projects), a path (/projects) or a full URL."
        >
          <FieldRow>
            <TextField
              name="primary_cta_label"
              label="Primary button label"
              defaultValue={hero.primary_cta_label}
              required
            />
            <TextField
              name="primary_cta_href"
              label="Primary button link"
              defaultValue={hero.primary_cta_href}
              required
              placeholder="#projects"
            />
          </FieldRow>

          <FieldRow>
            <TextField
              name="secondary_cta_label"
              label="Secondary button label"
              defaultValue={hero.secondary_cta_label}
              required
            />
            <TextField
              name="secondary_cta_href"
              label="Secondary button link"
              defaultValue={hero.secondary_cta_href}
              required
              placeholder="#contact"
            />
          </FieldRow>
        </FormCard>

        <FormCard title="Visual">
          <ImageUploadField
            name="image_url"
            label="Hero image"
            bucket="avatars"
            aspect="portrait"
            defaultValue={hero.image_url}
            hint="Overrides the profile image in the hero. Leave empty to fall back to the profile image, or to the monogram card if neither is set."
          />
        </FormCard>

        <SaveBar />
      </AdminForm>
    </PageBody>
  );
}

import { saveProfile } from "@/app/admin/_actions/content";
import { AdminForm, SaveBar, SwitchField } from "@/components/admin/admin-form";
import { FieldRow, FormCard, TextAreaField, TextField } from "@/components/admin/form-fields";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { adminGetProfile } from "@/lib/admin/queries";

export const metadata = { title: "Profile" };

export default async function AdminProfilePage() {
  const profile = await adminGetProfile();

  return (
    <PageBody>
      <PageHeader
        title="Profile"
        description="Your name, role and contact details. These appear in the hero, the contact section, the footer and the site's structured data."
      />

      <AdminForm action={saveProfile} className="mt-8">
        <FormCard title="Identity" description="How you are introduced across the site.">
          <FieldRow>
            <TextField name="name" label="Full name" defaultValue={profile.name} required />
            <TextField
              name="role_title"
              label="Role"
              defaultValue={profile.role_title}
              hint="For example: Full Stack Developer & UI/UX Designer"
              required
            />
          </FieldRow>

          <TextAreaField
            name="bio"
            label="Short bio"
            defaultValue={profile.bio}
            rows={3}
            hint="One or two sentences. Used in the footer and search results."
            required
          />

          <ImageUploadField
            name="avatar_url"
            label="Profile image"
            bucket="avatars"
            aspect="portrait"
            defaultValue={profile.avatar_url}
            hint="Used in the hero when no separate hero image is set. A portrait crop works best."
          />
        </FormCard>

        <FormCard title="Contact & availability">
          <FieldRow>
            <TextField
              name="email"
              label="Email"
              type="email"
              defaultValue={profile.email}
              required
            />
            <TextField
              name="location"
              label="Location"
              defaultValue={profile.location}
              placeholder="Thanjavur, Tamil Nadu, India"
            />
          </FieldRow>

          <TextField
            name="availability"
            label="Availability note"
            defaultValue={profile.availability}
            hint="Shown next to the status dot in the hero and contact section."
            placeholder="Open to internships and freelance work"
          />

          <SwitchField
            name="available"
            label="Show availability status"
            description="Turn off to hide the status dot and availability note everywhere."
            defaultChecked={profile.available}
          />
        </FormCard>

        <SaveBar />
      </AdminForm>
    </PageBody>
  );
}

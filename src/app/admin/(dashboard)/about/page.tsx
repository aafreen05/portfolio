import { saveAbout } from "@/app/admin/_actions/content";
import { AdminForm, SaveBar } from "@/components/admin/admin-form";
import { FormCard, TextAreaField, TextField } from "@/components/admin/form-fields";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { StatsField } from "@/components/admin/stats-field";
import { adminGetAbout } from "@/lib/admin/queries";

export const metadata = { title: "About" };

export default async function AdminAboutPage() {
  const about = await adminGetAbout();

  return (
    <PageBody>
      <PageHeader
        title="About"
        description="The editorial section under the hero. The lead paragraph is set large, so make it the sentence you most want read."
      />

      <AdminForm action={saveAbout} className="mt-8">
        <FormCard title="Introduction">
          <TextField name="eyebrow" label="Eyebrow" defaultValue={about.eyebrow} placeholder="About" />
          <TextField name="heading" label="Heading" defaultValue={about.heading} required />
          <TextAreaField
            name="lead"
            label="Lead paragraph"
            defaultValue={about.lead}
            rows={3}
            required
            hint="Set at a larger size than the rest. One strong sentence beats three ordinary ones."
          />
          <TextAreaField
            name="body"
            label="Body"
            defaultValue={about.body}
            rows={8}
            required
            hint="Leave a blank line between paragraphs to split them."
          />
        </FormCard>

        <FormCard
          title="Focus areas"
          description="The three cards beside the body text."
        >
          <TextField name="focus_heading" label="Section label" defaultValue={about.focus_heading} />

          <div className="flex flex-col gap-5 rounded-lg border border-border p-4">
            <TextField
              name="fullstack_title"
              label="Card 1 — title"
              defaultValue={about.fullstack_title}
              required
            />
            <TextAreaField
              name="fullstack_body"
              label="Card 1 — body"
              defaultValue={about.fullstack_body}
              rows={3}
              required
            />
          </div>

          <div className="flex flex-col gap-5 rounded-lg border border-border p-4">
            <TextField
              name="design_title"
              label="Card 2 — title"
              defaultValue={about.design_title}
              required
            />
            <TextAreaField
              name="design_body"
              label="Card 2 — body"
              defaultValue={about.design_body}
              rows={3}
              required
            />
          </div>

          <div className="flex flex-col gap-5 rounded-lg border border-border p-4">
            <TextField
              name="goals_title"
              label="Card 3 — title"
              defaultValue={about.goals_title}
              required
            />
            <TextAreaField
              name="goals_body"
              label="Card 3 — body"
              defaultValue={about.goals_body}
              rows={3}
              required
            />
          </div>
        </FormCard>

        <FormCard title="Statistics">
          <StatsField name="stats" defaultValue={about.stats} />
        </FormCard>

        <SaveBar />
      </AdminForm>
    </PageBody>
  );
}

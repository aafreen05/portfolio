"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Wand2 } from "lucide-react";

import { saveProject } from "@/app/admin/_actions/projects";
import { AdminForm, SaveBar, SwitchField, TagField, useFieldError } from "@/components/admin/admin-form";
import {
  FieldRow,
  FormCard,
  TextAreaField,
  TextField,
} from "@/components/admin/form-fields";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Project } from "@/lib/types";
import { slugify } from "@/lib/utils";

interface ProjectEditorProps {
  project?: Project;
  nextSortOrder: number;
  /** Existing categories, offered as datalist suggestions. */
  categories: string[];
}

export function ProjectEditor({ project, nextSortOrder, categories }: ProjectEditorProps) {
  const router = useRouter();
  const isNew = !project;

  return (
    <AdminForm
      action={saveProject}
      className="mt-8"
      onCreated={(id) => router.replace(`/admin/projects/${id}`)}
    >
      <input type="hidden" name="id" value={project?.id ?? ""} />
      <input type="hidden" name="sort_order" value={project?.sort_order ?? nextSortOrder} />

      <FormCard title="Basics">
        <TitleAndSlug
          defaultTitle={project?.title ?? ""}
          defaultSlug={project?.slug ?? ""}
          autoSlug={isNew}
        />

        <TextAreaField
          name="summary"
          label="Summary"
          defaultValue={project?.summary}
          rows={3}
          required
          hint="One or two sentences shown on the project card. Lead with the problem it solves."
        />

        <FieldRow>
          <CategoryField defaultValue={project?.category ?? ""} categories={categories} />
          <TextField
            name="year"
            label="Year"
            defaultValue={project?.year}
            placeholder="2025"
          />
        </FieldRow>

        <TextField
          name="role"
          label="Your role"
          defaultValue={project?.role}
          placeholder="Design and development"
        />
      </FormCard>

      <FormCard title="Cover image">
        <ImageUploadField
          name="cover_url"
          label="Cover"
          bucket="projects"
          defaultValue={project?.cover_url}
          hint="Shown on the card and at the top of the project page. A 16:9 or 16:10 crop works best. Without one, a typographic plate is used instead."
        />
      </FormCard>

      <FormCard
        title="Case study"
        description="These three sections make up the project page. Leave any of them empty to hide that section."
      >
        <TextAreaField
          name="overview"
          label="Overview"
          defaultValue={project?.overview}
          rows={5}
          hint="What the project is, in context. Blank lines separate paragraphs."
        />
        <TextAreaField
          name="problem"
          label="The problem"
          defaultValue={project?.problem}
          rows={5}
          hint="What was broken or missing before this existed."
        />
        <TextAreaField
          name="solution"
          label="The approach"
          defaultValue={project?.solution}
          rows={5}
          hint="How you solved it, and the decisions worth explaining."
        />
      </FormCard>

      <FormCard title="Details">
        <TagField
          name="features"
          label="Key features"
          defaultValue={project?.features ?? []}
          placeholder="Type a feature and press Enter"
          hint="Listed beside the case study on the project page."
          max={20}
        />

        <TagField
          name="technologies"
          label="Technologies"
          defaultValue={project?.technologies ?? []}
          placeholder="Next.js, TypeScript…"
          hint="Shown as tags on the card and in the project meta panel."
          max={24}
        />

        <FieldRow>
          <TextField
            name="github_url"
            label="GitHub URL"
            defaultValue={project?.github_url}
            placeholder="https://github.com/…"
          />
          <TextField
            name="demo_url"
            label="Live demo URL"
            defaultValue={project?.demo_url}
            placeholder="https://…"
          />
        </FieldRow>
      </FormCard>

      <FormCard title="Visibility">
        <SwitchField
          name="published"
          label="Published"
          description="Unpublished projects are hidden from the site and excluded from the sitemap."
          defaultChecked={project?.published ?? false}
        />
        <SwitchField
          name="featured"
          label="Featured"
          description="Featured projects appear in the Projects section on the home page."
          defaultChecked={project?.featured ?? false}
        />
      </FormCard>

      <SaveBar>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/projects")}>
          Back to list
        </Button>
      </SaveBar>
    </AdminForm>
  );
}

/**
 * Title and slug, linked while creating.
 *
 * On a new project the slug tracks the title until it is edited by hand, at
 * which point it stops following — the usual CMS behaviour. On an existing
 * project the slug never changes on its own, because it is a live URL.
 */
function TitleAndSlug({
  defaultTitle,
  defaultSlug,
  autoSlug,
}: {
  defaultTitle: string;
  defaultSlug: string;
  autoSlug: boolean;
}) {
  const [title, setTitle] = React.useState(defaultTitle);
  const [slug, setSlug] = React.useState(defaultSlug);
  const [slugTouched, setSlugTouched] = React.useState(!autoSlug && Boolean(defaultSlug));

  const titleError = useFieldError("title");
  const slugError = useFieldError("slug");

  function handleTitle(value: string) {
    setTitle(value);
    if (autoSlug && !slugTouched) setSlug(slugify(value));
  }

  return (
    <>
      <Field label="Title" htmlFor="title" error={titleError} required>
        <Input
          id="title"
          name="title"
          value={title}
          onChange={(event) => handleTitle(event.target.value)}
          placeholder="Campus Event Platform"
          aria-invalid={Boolean(titleError)}
        />
      </Field>

      <Field
        label="Slug"
        htmlFor="slug"
        error={slugError}
        hint="The project's URL: /projects/your-slug. Changing it on a live project breaks existing links."
        required
      >
        <div className="flex gap-2">
          <Input
            id="slug"
            name="slug"
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
            placeholder="campus-event-platform"
            className="font-mono"
            aria-invalid={Boolean(slugError)}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={() => {
              setSlug(slugify(title));
              setSlugTouched(true);
            }}
            aria-label="Generate slug from title"
            title="Generate from title"
          >
            <Wand2 className="size-4" aria-hidden />
          </Button>
        </div>
      </Field>
    </>
  );
}

/** Free-text category with suggestions from categories already in use. */
function CategoryField({
  defaultValue,
  categories,
}: {
  defaultValue: string;
  categories: string[];
}) {
  const error = useFieldError("category");

  return (
    <Field
      label="Category"
      htmlFor="category"
      error={error}
      hint="Used by the filter on the projects page."
      required
    >
      <Input
        id="category"
        name="category"
        defaultValue={defaultValue}
        list="project-categories"
        placeholder="Full Stack"
        aria-invalid={Boolean(error)}
      />
      <datalist id="project-categories">
        {categories.map((category) => (
          <option key={category} value={category} />
        ))}
      </datalist>
    </Field>
  );
}

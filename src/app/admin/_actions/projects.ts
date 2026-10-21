"use server";

import { getAdminClient } from "@/lib/admin/auth";
import {
  bool,
  failed,
  invalid,
  jsonArray,
  nullable,
  num,
  revalidatePublic,
  saved,
  str,
  withoutPosition,
  type ActionState,
} from "@/lib/admin/action-utils";
import { projectSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

/** Postgres unique-violation — surfaced as a friendly slug message. */
const UNIQUE_VIOLATION = "23505";

export async function saveProject(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = projectSchema.safeParse({
    title: str(formData, "title"),
    slug: str(formData, "slug"),
    summary: str(formData, "summary"),
    category: str(formData, "category"),
    cover_url: str(formData, "cover_url"),
    overview: str(formData, "overview"),
    problem: str(formData, "problem"),
    solution: str(formData, "solution"),
    features: jsonArray(formData, "features"),
    technologies: jsonArray(formData, "technologies"),
    github_url: str(formData, "github_url"),
    demo_url: str(formData, "demo_url"),
    year: str(formData, "year"),
    role: str(formData, "role"),
    featured: bool(formData, "featured"),
    published: bool(formData, "published"),
    sort_order: num(formData, "sort_order"),
  });

  if (!parsed.success) return invalid(parsed.error);

  const supabase = await getAdminClient();
  const id = str(formData, "id");

  const values = {
    ...parsed.data,
    cover_url: nullable(parsed.data.cover_url ?? ""),
    overview: nullable(parsed.data.overview ?? ""),
    problem: nullable(parsed.data.problem ?? ""),
    solution: nullable(parsed.data.solution ?? ""),
    github_url: nullable(parsed.data.github_url ?? ""),
    demo_url: nullable(parsed.data.demo_url ?? ""),
    year: nullable(parsed.data.year ?? ""),
    role: nullable(parsed.data.role ?? ""),
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { error } = await supabase.from("projects").update(withoutPosition(values)).eq("id", id);
    if (error) return projectError(error);

    revalidatePublic([`/projects/${parsed.data.slug}`]);
    return saved();
  }

  const { data, error } = await supabase.from("projects").insert(values).select("id").single();
  if (error) return projectError(error);

  revalidatePublic([`/projects/${parsed.data.slug}`]);
  return { ...saved("Project created."), id: data?.id as string | undefined };
}

export async function deleteProject(id: string): Promise<ActionState> {
  const supabase = await getAdminClient();

  // project_images cascades on delete via the foreign key.
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return failed(`Could not delete: ${error.message}`);

  revalidatePublic();
  return saved("Project deleted.");
}

/** Copy a project as an unpublished draft with a free slug. */
export async function duplicateProject(id: string): Promise<ActionState> {
  const supabase = await getAdminClient();

  const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
  if (error || !data) return failed("Could not find that project.");

  const source = data as Record<string, unknown>;
  delete source.id;
  delete source.created_at;

  const baseSlug = slugify(`${String(source.slug)}-copy`);
  const slug = await findFreeSlug(supabase, baseSlug);

  // The copy goes to the end of the list. Reusing the source's sort_order
  // would tie the two, leaving their relative order up to the database.
  const { data: last } = await supabase
    .from("projects")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: created, error: insertError } = await supabase
    .from("projects")
    .insert({
      ...source,
      title: `${String(source.title)} (copy)`,
      slug,
      published: false,
      featured: false,
      sort_order: ((last?.sort_order as number | undefined) ?? 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insertError) return projectError(insertError);

  revalidatePublic();
  return { ...saved("Project duplicated as a draft."), id: created?.id as string | undefined };
}

export async function toggleProjectPublished(
  id: string,
  published: boolean,
): Promise<ActionState> {
  const supabase = await getAdminClient();
  const { error } = await supabase
    .from("projects")
    .update({ published, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return failed(error.message);
  revalidatePublic();
  return saved(published ? "Project published." : "Project unpublished.");
}

export async function toggleProjectFeatured(id: string, featured: boolean): Promise<ActionState> {
  const supabase = await getAdminClient();
  const { error } = await supabase
    .from("projects")
    .update({ featured, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return failed(error.message);
  revalidatePublic();
  return saved(featured ? "Marked as featured." : "Removed from featured.");
}

export async function reorderProjects(ids: string[]): Promise<ActionState> {
  const supabase = await getAdminClient();

  const results = await Promise.all(
    ids.map((id, index) => supabase.from("projects").update({ sort_order: index + 1 }).eq("id", id)),
  );

  const firstError = results.find((result) => result.error)?.error;
  if (firstError) return failed(`Could not reorder: ${firstError.message}`);

  revalidatePublic();
  return saved("Order updated.");
}

/* ------------------------------------------------------- project images --- */

export async function addProjectImage(
  projectId: string,
  url: string,
  alt: string,
): Promise<ActionState> {
  const supabase = await getAdminClient();

  const { count } = await supabase
    .from("project_images")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);

  const { error } = await supabase.from("project_images").insert({
    project_id: projectId,
    url,
    alt: alt || "Project screenshot",
    sort_order: (count ?? 0) + 1,
  });

  if (error) return failed(`Could not add the image: ${error.message}`);
  revalidatePublic();
  return saved("Screenshot added.");
}

export async function updateProjectImage(
  id: string,
  values: { alt?: string; caption?: string | null },
): Promise<ActionState> {
  const supabase = await getAdminClient();
  const { error } = await supabase.from("project_images").update(values).eq("id", id);

  if (error) return failed(error.message);
  revalidatePublic();
  return saved("Screenshot updated.");
}

export async function deleteProjectImage(id: string): Promise<ActionState> {
  const supabase = await getAdminClient();
  const { error } = await supabase.from("project_images").delete().eq("id", id);

  if (error) return failed(error.message);
  revalidatePublic();
  return saved("Screenshot removed.");
}

/* ------------------------------------------------------------- helpers --- */

function projectError(error: { code?: string; message: string }): ActionState {
  if (error.code === UNIQUE_VIOLATION) {
    return {
      ok: false,
      message: "That slug is already used by another project.",
      fieldErrors: { slug: "This slug is already taken." },
    };
  }
  console.error(`[admin] project: ${error.message}`);
  return failed(`Could not save: ${error.message}`);
}

async function findFreeSlug(
  supabase: Awaited<ReturnType<typeof getAdminClient>>,
  base: string,
): Promise<string> {
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const { data } = await supabase.from("projects").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
  }
  return `${base}-${Date.now()}`;
}

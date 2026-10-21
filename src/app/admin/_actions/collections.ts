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
  type ActionState,
} from "@/lib/admin/action-utils";
import { certificateSchema, educationSchema, skillSchema, socialLinkSchema } from "@/lib/validations";

/**
 * CRUD for the list-shaped content types.
 *
 * All four share the same shape — create or update by optional id, delete by
 * id, and reorder by an array of ids — so they share one set of helpers.
 */

async function upsertRow(
  table: string,
  id: string,
  values: Record<string, unknown>,
): Promise<ActionState> {
  const supabase = await getAdminClient();

  const { error } = id
    ? await supabase.from(table).update(values).eq("id", id)
    : await supabase.from(table).insert(values);

  if (error) {
    console.error(`[admin] save ${table}: ${error.message}`);
    return failed(`Could not save: ${error.message}`);
  }

  revalidatePublic();
  return saved(id ? "Changes saved." : "Created.");
}

async function removeRow(table: string, id: string): Promise<ActionState> {
  const supabase = await getAdminClient();
  const { error } = await supabase.from(table).delete().eq("id", id);

  if (error) {
    console.error(`[admin] delete ${table}: ${error.message}`);
    return failed(`Could not delete: ${error.message}`);
  }

  revalidatePublic();
  return saved("Deleted.");
}

/** Persist a new ordering by writing each row's index as its sort_order. */
async function reorderRows(table: string, ids: string[]): Promise<ActionState> {
  const supabase = await getAdminClient();

  const results = await Promise.all(
    ids.map((id, index) => supabase.from(table).update({ sort_order: index + 1 }).eq("id", id)),
  );

  const firstError = results.find((result) => result.error)?.error;
  if (firstError) {
    console.error(`[admin] reorder ${table}: ${firstError.message}`);
    return failed(`Could not reorder: ${firstError.message}`);
  }

  revalidatePublic();
  return saved("Order updated.");
}

/* ----------------------------------------------------------------- skills */

export async function saveSkill(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = skillSchema.safeParse({
    name: str(formData, "name"),
    category: str(formData, "category"),
    level: str(formData, "level"),
    note: str(formData, "note"),
    sort_order: num(formData, "sort_order"),
    enabled: bool(formData, "enabled"),
  });

  if (!parsed.success) return invalid(parsed.error);

  return upsertRow("skills", str(formData, "id"), {
    ...parsed.data,
    note: nullable(parsed.data.note ?? ""),
  });
}

export async function deleteSkill(id: string) {
  return removeRow("skills", id);
}

export async function reorderSkills(ids: string[]) {
  return reorderRows("skills", ids);
}

export async function toggleSkill(id: string, enabled: boolean): Promise<ActionState> {
  const supabase = await getAdminClient();
  const { error } = await supabase.from("skills").update({ enabled }).eq("id", id);

  if (error) return failed(error.message);
  revalidatePublic();
  return saved(enabled ? "Skill shown." : "Skill hidden.");
}

/* -------------------------------------------------------------- education */

export async function saveEducation(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = educationSchema.safeParse({
    institution: str(formData, "institution"),
    degree: str(formData, "degree"),
    field: str(formData, "field"),
    location: str(formData, "location"),
    start_year: str(formData, "start_year"),
    end_year: str(formData, "end_year"),
    status: str(formData, "status"),
    description: str(formData, "description"),
    highlights: jsonArray(formData, "highlights"),
    current: bool(formData, "current"),
    sort_order: num(formData, "sort_order"),
  });

  if (!parsed.success) return invalid(parsed.error);

  return upsertRow("education", str(formData, "id"), {
    ...parsed.data,
    description: nullable(parsed.data.description ?? ""),
  });
}

export async function deleteEducation(id: string) {
  return removeRow("education", id);
}

/* ----------------------------------------------------------- certificates */

export async function saveCertificate(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = certificateSchema.safeParse({
    title: str(formData, "title"),
    issuer: str(formData, "issuer"),
    issue_date: str(formData, "issue_date"),
    credential_id: str(formData, "credential_id"),
    credential_url: str(formData, "credential_url"),
    image_url: str(formData, "image_url"),
    sort_order: num(formData, "sort_order"),
    published: bool(formData, "published"),
  });

  if (!parsed.success) return invalid(parsed.error);

  return upsertRow("certificates", str(formData, "id"), {
    ...parsed.data,
    issue_date: nullable(parsed.data.issue_date ?? ""),
    credential_id: nullable(parsed.data.credential_id ?? ""),
    credential_url: nullable(parsed.data.credential_url ?? ""),
    image_url: nullable(parsed.data.image_url ?? ""),
  });
}

export async function deleteCertificate(id: string) {
  return removeRow("certificates", id);
}

export async function reorderCertificates(ids: string[]) {
  return reorderRows("certificates", ids);
}

/* ----------------------------------------------------------- social links */

export async function saveSocialLink(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = socialLinkSchema.safeParse({
    platform: str(formData, "platform"),
    label: str(formData, "label"),
    url: str(formData, "url"),
    sort_order: num(formData, "sort_order"),
    enabled: bool(formData, "enabled"),
  });

  if (!parsed.success) return invalid(parsed.error);

  return upsertRow("social_links", str(formData, "id"), parsed.data);
}

export async function deleteSocialLink(id: string) {
  return removeRow("social_links", id);
}

export async function reorderSocialLinks(ids: string[]) {
  return reorderRows("social_links", ids);
}

export async function toggleSocialLink(id: string, enabled: boolean): Promise<ActionState> {
  const supabase = await getAdminClient();
  const { error } = await supabase.from("social_links").update({ enabled }).eq("id", id);

  if (error) return failed(error.message);
  revalidatePublic();
  return saved(enabled ? "Link shown." : "Link hidden.");
}

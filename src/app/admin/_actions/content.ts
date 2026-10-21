"use server";

import { getAdminClient } from "@/lib/admin/auth";
import {
  bool,
  failed,
  invalid,
  jsonArray,
  nullable,
  revalidatePublic,
  saved,
  str,
  type ActionState,
} from "@/lib/admin/action-utils";
import type { AboutStat } from "@/lib/types";
import { aboutSchema, heroSchema, profileSchema, settingsSchema } from "@/lib/validations";

/**
 * Singleton content tables.
 *
 * Each holds exactly one row keyed `default`, so every save is an upsert on
 * that id — no "did the row exist?" branching in the UI.
 */
const SINGLETON_ID = "default";

async function upsertSingleton(
  table: string,
  values: Record<string, unknown>,
): Promise<ActionState> {
  const supabase = await getAdminClient();

  const { error } = await supabase
    .from(table)
    .upsert({ id: SINGLETON_ID, ...values, updated_at: new Date().toISOString() });

  if (error) {
    console.error(`[admin] save ${table}: ${error.message}`);
    return failed(`Could not save: ${error.message}`);
  }

  revalidatePublic();
  return saved();
}

export async function saveProfile(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = profileSchema.safeParse({
    name: str(formData, "name"),
    role_title: str(formData, "role_title"),
    bio: str(formData, "bio"),
    email: str(formData, "email"),
    location: str(formData, "location"),
    availability: str(formData, "availability"),
    available: bool(formData, "available"),
    avatar_url: str(formData, "avatar_url"),
  });

  if (!parsed.success) return invalid(parsed.error);

  return upsertSingleton("profiles", {
    ...parsed.data,
    avatar_url: nullable(parsed.data.avatar_url ?? ""),
  });
}

export async function saveHero(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = heroSchema.safeParse({
    eyebrow: str(formData, "eyebrow"),
    heading: str(formData, "heading"),
    heading_accent: str(formData, "heading_accent"),
    subtitle: str(formData, "subtitle"),
    description: str(formData, "description"),
    primary_cta_label: str(formData, "primary_cta_label"),
    primary_cta_href: str(formData, "primary_cta_href"),
    secondary_cta_label: str(formData, "secondary_cta_label"),
    secondary_cta_href: str(formData, "secondary_cta_href"),
    image_url: str(formData, "image_url"),
  });

  if (!parsed.success) return invalid(parsed.error);

  return upsertSingleton("hero", {
    ...parsed.data,
    image_url: nullable(parsed.data.image_url ?? ""),
  });
}

export async function saveAbout(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = aboutSchema.safeParse({
    eyebrow: str(formData, "eyebrow"),
    heading: str(formData, "heading"),
    lead: str(formData, "lead"),
    body: str(formData, "body"),
    focus_heading: str(formData, "focus_heading"),
    fullstack_title: str(formData, "fullstack_title"),
    fullstack_body: str(formData, "fullstack_body"),
    design_title: str(formData, "design_title"),
    design_body: str(formData, "design_body"),
    goals_title: str(formData, "goals_title"),
    goals_body: str(formData, "goals_body"),
    stats: jsonArray<AboutStat>(formData, "stats"),
  });

  if (!parsed.success) return invalid(parsed.error);

  return upsertSingleton("about", parsed.data);
}

export async function saveSettings(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = settingsSchema.safeParse({
    site_title: str(formData, "site_title"),
    site_description: str(formData, "site_description"),
    keywords: jsonArray(formData, "keywords"),
    og_image_url: str(formData, "og_image_url"),
    twitter_handle: str(formData, "twitter_handle"),
    contact_heading: str(formData, "contact_heading"),
    contact_body: str(formData, "contact_body"),
    footer_note: str(formData, "footer_note"),
  });

  if (!parsed.success) return invalid(parsed.error);

  return upsertSingleton("site_settings", {
    ...parsed.data,
    og_image_url: nullable(parsed.data.og_image_url ?? ""),
    twitter_handle: nullable(parsed.data.twitter_handle ?? ""),
  });
}

export async function saveResume(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const fileUrl = nullable(str(formData, "file_url"));
  const fileName = nullable(str(formData, "file_name"));
  const versionLabel = nullable(str(formData, "version_label"));

  if (fileUrl && !/^https?:\/\//i.test(fileUrl)) {
    return failed("The resume URL must start with http:// or https://");
  }

  return upsertSingleton("resume", {
    file_url: fileUrl,
    // Clearing the URL removes the resume; don't leave its old name behind.
    file_name: fileUrl ? fileName : null,
    version_label: versionLabel,
  });
}

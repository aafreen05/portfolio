import "server-only";

import {
  defaultAbout,
  defaultCertificates,
  defaultEducation,
  defaultHero,
  defaultProfile,
  defaultProjects,
  defaultResume,
  defaultSettings,
  defaultSkills,
  defaultSocials,
} from "@/lib/content/defaults";
import { getAdminClient } from "@/lib/admin/auth";
import type {
  About,
  Certificate,
  Education,
  Hero,
  KeepAlivePing,
  Message,
  Profile,
  Project,
  Resume,
  SiteSettings,
  Skill,
  SocialLink,
} from "@/lib/types";

/**
 * Admin reads.
 *
 * Unlike the public queries these include unpublished rows, and they go
 * through the authenticated client so RLS sees a signed-in user. Seed content
 * is still used as a fallback so the dashboard is explorable before the
 * schema has been applied.
 */
async function adminRead<T>(
  table: string,
  fallback: T,
  build: (client: Awaited<ReturnType<typeof getAdminClient>>) => PromiseLike<{
    data: unknown;
    error: { message: string } | null;
  }>,
): Promise<T> {
  const supabase = await getAdminClient();

  try {
    const { data, error } = await build(supabase);
    if (error) {
      console.error(`[admin] ${table}: ${error.message}`);
      return fallback;
    }

    // An emptied collection must stay empty in the editor too, otherwise
    // deleting every row appears to do nothing.
    if (Array.isArray(data)) return data as T;
    if (data === null) return fallback;

    return data as T;
  } catch (error) {
    console.error(`[admin] ${table}:`, error);
    return fallback;
  }
}

export const adminGetProfile = () =>
  adminRead<Profile>("profiles", defaultProfile, (c) =>
    c.from("profiles").select("*").limit(1).maybeSingle(),
  );

export const adminGetHero = () =>
  adminRead<Hero>("hero", defaultHero, (c) => c.from("hero").select("*").limit(1).maybeSingle());

export const adminGetAbout = async () => {
  const about = await adminRead<About>("about", defaultAbout, (c) =>
    c.from("about").select("*").limit(1).maybeSingle(),
  );
  return { ...about, stats: Array.isArray(about.stats) ? about.stats : [] };
};

export const adminGetSettings = async () => {
  const settings = await adminRead<SiteSettings>("site_settings", defaultSettings, (c) =>
    c.from("site_settings").select("*").limit(1).maybeSingle(),
  );
  return { ...settings, keywords: Array.isArray(settings.keywords) ? settings.keywords : [] };
};

export const adminGetResume = () =>
  adminRead<Resume>("resume", defaultResume, (c) =>
    c.from("resume").select("*").limit(1).maybeSingle(),
  );

export const adminGetSkills = () =>
  adminRead<Skill[]>("skills", defaultSkills, (c) =>
    c.from("skills").select("*").order("sort_order", { ascending: true }),
  );

export const adminGetProjects = async () => {
  const projects = await adminRead<Project[]>("projects", defaultProjects, (c) =>
    c.from("projects").select("*").order("sort_order", { ascending: true }),
  );
  return projects.map((project) => ({
    ...project,
    features: Array.isArray(project.features) ? project.features : [],
    technologies: Array.isArray(project.technologies) ? project.technologies : [],
  }));
};

export const adminGetProject = async (id: string): Promise<Project | null> => {
  const supabase = await getAdminClient();

  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*, images:project_images(*)")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error(`[admin] project ${id}: ${error.message}`);
      return defaultProjects.find((project) => project.id === id) ?? null;
    }
    if (!data) return null;

    const project = data as Project;
    return {
      ...project,
      features: Array.isArray(project.features) ? project.features : [],
      technologies: Array.isArray(project.technologies) ? project.technologies : [],
      images: [...(project.images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    };
  } catch (error) {
    console.error(`[admin] project ${id}:`, error);
    return null;
  }
};

export const adminGetEducation = () =>
  adminRead<Education[]>("education", defaultEducation, (c) =>
    c.from("education").select("*").order("sort_order", { ascending: true }),
  );

export const adminGetCertificates = () =>
  adminRead<Certificate[]>("certificates", defaultCertificates, (c) =>
    c.from("certificates").select("*").order("sort_order", { ascending: true }),
  );

export const adminGetSocialLinks = () =>
  adminRead<SocialLink[]>("social_links", defaultSocials, (c) =>
    c.from("social_links").select("*").order("sort_order", { ascending: true }),
  );

export const adminGetMessages = () =>
  adminRead<Message[]>("messages", [], (c) =>
    c.from("messages").select("*").order("created_at", { ascending: false }),
  );

/** When each keep-alive scheduler last reached the database. */
export const adminGetKeepAlive = () =>
  adminRead<KeepAlivePing[]>("keep_alive", [], (c) =>
    c.from("keep_alive").select("*").order("source", { ascending: true }),
  );

/**
 * Unread count for the sidebar badge.
 *
 * A head-only count query, because the admin layout runs this on *every*
 * admin page render — fetching every message row just to compute a number
 * scales badly once the inbox fills up.
 */
export async function adminGetUnreadCount(): Promise<number> {
  const supabase = await getAdminClient();

  try {
    const { count, error } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("status", "new");

    if (error) {
      console.error(`[admin] unread count: ${error.message}`);
      return 0;
    }
    return count ?? 0;
  } catch (error) {
    console.error("[admin] unread count:", error);
    return 0;
  }
}

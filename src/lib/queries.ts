import "server-only";

import { cache } from "react";

import {
  defaultAbout,
  defaultCertificates,
  defaultContent,
  defaultEducation,
  defaultHero,
  defaultProfile,
  defaultProjects,
  defaultResume,
  defaultSettings,
  defaultSkills,
  defaultSocials,
} from "@/lib/content/defaults";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  About,
  Certificate,
  Education,
  Hero,
  PortfolioContent,
  Profile,
  Project,
  Resume,
  SiteSettings,
  Skill,
  SocialLink,
} from "@/lib/types";

/**
 * Read layer for the public site.
 *
 * Every query follows the same contract: ask Supabase, and if it is not
 * configured or the call fails, return the seed content instead. A section
 * never renders empty because of infrastructure, and the site builds on a
 * clean clone with no environment variables set.
 */
async function read<T>(
  table: string,
  fallback: T,
  query: (client: NonNullable<ReturnType<typeof createPublicClient>>) => PromiseLike<{
    data: unknown;
    error: { message: string } | null;
  }>,
): Promise<T> {
  const supabase = createPublicClient();
  if (!supabase) return fallback;

  try {
    const { data, error } = await query(supabase);
    if (error) {
      console.error(`[supabase] ${table}: ${error.message}`);
      return fallback;
    }

    /**
     * An empty *collection* is a real answer, not a missing one: if every
     * skill has been deleted, the section must render empty rather than
     * resurrecting seed content on the live site. A missing *singleton* row
     * does mean "not set up yet", so that still falls back — `maybeSingle()`
     * returns null there, which is handled below.
     */
    if (Array.isArray(data)) return data as T;
    if (data === null) return fallback;

    return data as T;
  } catch (error) {
    console.error(`[supabase] ${table}:`, error);
    return fallback;
  }
}

export const getProfile = cache(async (): Promise<Profile> =>
  read("profiles", defaultProfile, (c) => c.from("profiles").select("*").limit(1).maybeSingle()),
);

export const getHero = cache(async (): Promise<Hero> =>
  read("hero", defaultHero, (c) => c.from("hero").select("*").limit(1).maybeSingle()),
);

export const getAbout = cache(async (): Promise<About> => {
  const about = await read<About>("about", defaultAbout, (c) =>
    c.from("about").select("*").limit(1).maybeSingle(),
  );
  // `stats` is jsonb; guard against a hand-edited row holding something else.
  return { ...about, stats: Array.isArray(about.stats) ? about.stats : [] };
});

export const getSkills = cache(async (): Promise<Skill[]> =>
  read("skills", defaultSkills, (c) =>
    c.from("skills").select("*").eq("enabled", true).order("sort_order", { ascending: true }),
  ),
);

export const getProjects = cache(async (): Promise<Project[]> => {
  const projects = await read<Project[]>("projects", defaultProjects, (c) =>
    c
      .from("projects")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
  );
  return projects.map(normaliseProject);
});

export const getFeaturedProjects = cache(async (): Promise<Project[]> => {
  const projects = await getProjects();
  const featured = projects.filter((project) => project.featured);
  return featured.length > 0 ? featured : projects.slice(0, 3);
});

export const getProjectBySlug = cache(async (slug: string): Promise<Project | null> => {
  const supabase = createPublicClient();

  if (!supabase) {
    return defaultProjects.find((project) => project.slug === slug) ?? null;
  }

  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*, images:project_images(*)")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    if (error) {
      console.error(`[supabase] project ${slug}: ${error.message}`);
      return defaultProjects.find((project) => project.slug === slug) ?? null;
    }
    if (!data) return null;

    const project = normaliseProject(data as Project);
    project.images = [...(project.images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
    return project;
  } catch (error) {
    console.error(`[supabase] project ${slug}:`, error);
    return defaultProjects.find((project) => project.slug === slug) ?? null;
  }
});

export const getEducation = cache(async (): Promise<Education[]> =>
  read("education", defaultEducation, (c) =>
    c.from("education").select("*").order("sort_order", { ascending: true }),
  ),
);

export const getCertificates = cache(async (): Promise<Certificate[]> =>
  read("certificates", defaultCertificates, (c) =>
    c.from("certificates").select("*").eq("published", true).order("sort_order", { ascending: true }),
  ),
);

export const getSocialLinks = cache(async (): Promise<SocialLink[]> =>
  read("social_links", defaultSocials, (c) =>
    c.from("social_links").select("*").eq("enabled", true).order("sort_order", { ascending: true }),
  ),
);

export const getResume = cache(async (): Promise<Resume> =>
  read("resume", defaultResume, (c) => c.from("resume").select("*").limit(1).maybeSingle()),
);

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const settings = await read<SiteSettings>("site_settings", defaultSettings, (c) =>
    c.from("site_settings").select("*").limit(1).maybeSingle(),
  );
  return { ...settings, keywords: Array.isArray(settings.keywords) ? settings.keywords : [] };
});

/** Everything the home page needs, resolved in parallel. */
export const getPortfolioContent = cache(async (): Promise<PortfolioContent> => {
  const [profile, hero, about, skills, projects, education, certificates, socials, resume, settings] =
    await Promise.all([
      getProfile(),
      getHero(),
      getAbout(),
      getSkills(),
      getProjects(),
      getEducation(),
      getCertificates(),
      getSocialLinks(),
      getResume(),
      getSettings(),
    ]);

  return {
    ...defaultContent,
    profile,
    hero,
    about,
    skills,
    projects,
    education,
    certificates,
    socials,
    resume,
    settings,
  };
});

/** Array columns are jsonb/text[]; coerce anything unexpected to an array. */
function normaliseProject(project: Project): Project {
  return {
    ...project,
    features: Array.isArray(project.features) ? project.features : [],
    technologies: Array.isArray(project.technologies) ? project.technologies : [],
    images: Array.isArray(project.images) ? project.images : [],
  };
}

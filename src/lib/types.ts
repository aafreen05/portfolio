/**
 * Shared domain types.
 *
 * These mirror the Postgres tables in `supabase/setup.sql`. Keeping them
 * hand-written (rather than generated) keeps the repo dependency-free and
 * makes the fallback content in `lib/content/defaults.ts` type-checked
 * against exactly the same shape the database returns.
 */

export type SkillCategory = "frontend" | "backend" | "database" | "uiux" | "tools";

export const SKILL_CATEGORIES: { value: SkillCategory; label: string; blurb: string }[] = [
  { value: "frontend", label: "Frontend", blurb: "Interfaces, state and interaction" },
  { value: "backend", label: "Backend", blurb: "APIs, auth and server logic" },
  { value: "database", label: "Database", blurb: "Modelling, queries and storage" },
  { value: "uiux", label: "UI/UX", blurb: "Research, systems and prototyping" },
  { value: "tools", label: "Tools", blurb: "Workflow, versioning and deployment" },
];

export type SkillLevel = "learning" | "working" | "confident";

export const SKILL_LEVELS: { value: SkillLevel; label: string }[] = [
  { value: "learning", label: "Learning" },
  { value: "working", label: "Working knowledge" },
  { value: "confident", label: "Confident" },
];

export type MessageStatus = "new" | "read" | "replied" | "archived";

export const MESSAGE_STATUSES: { value: MessageStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
  { value: "archived", label: "Archived" },
];

export interface Profile {
  id: string;
  name: string;
  role_title: string;
  bio: string;
  email: string;
  location: string;
  availability: string;
  available: boolean;
  avatar_url: string | null;
  updated_at?: string;
}

export interface Hero {
  id: string;
  eyebrow: string;
  heading: string;
  heading_accent: string;
  subtitle: string;
  description: string;
  primary_cta_label: string;
  primary_cta_href: string;
  secondary_cta_label: string;
  secondary_cta_href: string;
  image_url: string | null;
  updated_at?: string;
}

export interface AboutStat {
  label: string;
  value: string;
}

export interface About {
  id: string;
  eyebrow: string;
  heading: string;
  lead: string;
  body: string;
  focus_heading: string;
  fullstack_title: string;
  fullstack_body: string;
  design_title: string;
  design_body: string;
  goals_title: string;
  goals_body: string;
  stats: AboutStat[];
  updated_at?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  note: string | null;
  sort_order: number;
  enabled: boolean;
  created_at?: string;
}

export interface ProjectImage {
  id: string;
  project_id: string;
  url: string;
  alt: string;
  caption: string | null;
  sort_order: number;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  cover_url: string | null;
  overview: string | null;
  problem: string | null;
  solution: string | null;
  features: string[];
  technologies: string[];
  github_url: string | null;
  demo_url: string | null;
  year: string | null;
  role: string | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
  images?: ProjectImage[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  start_year: string;
  end_year: string;
  status: string;
  description: string | null;
  highlights: string[];
  current: boolean;
  sort_order: number;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issue_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
  image_url: string | null;
  sort_order: number;
  published: boolean;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  /** When the email notification was delivered to the owner, if it was. */
  notified_at?: string | null;
  /** Why the email notification failed, if it did. */
  notify_error?: string | null;
  created_at: string;
}

export type SocialPlatform =
  | "github"
  | "linkedin"
  | "instagram"
  | "behance"
  | "dribbble"
  | "email"
  | "x"
  | "website";

export const SOCIAL_PLATFORMS: { value: SocialPlatform; label: string }[] = [
  { value: "github", label: "GitHub" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
  { value: "behance", label: "Behance" },
  { value: "dribbble", label: "Dribbble" },
  { value: "email", label: "Email" },
  { value: "x", label: "X" },
  { value: "website", label: "Website" },
];

/** One row per scheduler in `public.keep_alive` (see supabase/setup.sql). */
export interface KeepAlivePing {
  source: "vercel-cron" | "github-actions" | "site" | "manual";
  pinged_at: string;
  ping_count: number;
}

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  label: string;
  url: string;
  sort_order: number;
  enabled: boolean;
}

export interface Resume {
  id: string;
  file_url: string | null;
  file_name: string | null;
  version_label: string | null;
  updated_at?: string;
}

export interface SiteSettings {
  id: string;
  site_title: string;
  site_description: string;
  keywords: string[];
  og_image_url: string | null;
  twitter_handle: string | null;
  contact_heading: string;
  contact_body: string;
  footer_note: string;
  updated_at?: string;
}

/** Everything the public site renders, resolved once per request. */
export interface PortfolioContent {
  profile: Profile;
  hero: Hero;
  about: About;
  skills: Skill[];
  projects: Project[];
  education: Education[];
  certificates: Certificate[];
  socials: SocialLink[];
  resume: Resume;
  settings: SiteSettings;
}

import { z } from "zod";

/**
 * One schema per form, shared by the client-side React Hook Form resolver and
 * the server action that writes to the database. The client copy is a
 * convenience; the server copy is the one that actually protects the data.
 */

const requiredText = (label: string, max = 280) =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} is too long`);

const optionalText = (max = 2000) =>
  z
    .string()
    .trim()
    .max(max, "This field is too long")
    .optional()
    .or(z.literal(""))
    .transform((value) => value ?? "");

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((value) => value === "" || /^https?:\/\/.+/i.test(value), {
    message: "Enter a full URL starting with http:// or https://",
  })
  .optional()
  .or(z.literal(""));

/** Accepts absolute URLs, site-relative paths and in-page anchors. */
const linkTarget = z
  .string()
  .trim()
  .min(1, "Link is required")
  .max(500)
  .refine((value) => /^(https?:\/\/|\/|#|mailto:|tel:)/i.test(value), {
    message: "Use a full URL, a path like /projects, or an anchor like #contact",
  });

/* ---------------------------------------------------------------- contact */

export const contactSchema = z.object({
  name: requiredText("Name", 80),
  email: z.string().trim().min(1, "Email is required").max(160).pipe(z.email("Enter a valid email address")),
  subject: requiredText("Subject", 140),
  message: z
    .string()
    .trim()
    .min(20, "Please write at least 20 characters so I can reply usefully")
    .max(4000, "Message is too long"),
  /**
   * Honeypot. Real people never see this field, so anything in it is a bot.
   *
   * Deliberately permissive: the action inspects it *after* parsing and
   * returns a success response without writing anything, which tells a bot
   * nothing. Rejecting it here instead would fail validation and advertise
   * that the field is a trap. Paired with a per-IP rate limit in the action.
   */
  website: z.string().max(200).optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;

/* ------------------------------------------------------------------- auth */

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").pipe(z.email("Enter a valid email address")),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/* ---------------------------------------------------------------- profile */

export const profileSchema = z.object({
  name: requiredText("Name", 120),
  role_title: requiredText("Role", 160),
  bio: z.string().trim().min(1, "Bio is required").max(1200),
  email: z.string().trim().min(1, "Email is required").pipe(z.email("Enter a valid email address")),
  location: optionalText(160),
  availability: optionalText(160),
  available: z.boolean(),
  avatar_url: optionalUrl,
});

/* ------------------------------------------------------------------- hero */

export const heroSchema = z.object({
  eyebrow: optionalText(80),
  heading: requiredText("Heading", 160),
  heading_accent: optionalText(160),
  subtitle: requiredText("Subtitle", 220),
  description: z.string().trim().min(1, "Description is required").max(900),
  primary_cta_label: requiredText("Primary button label", 40),
  primary_cta_href: linkTarget,
  secondary_cta_label: requiredText("Secondary button label", 40),
  secondary_cta_href: linkTarget,
  image_url: optionalUrl,
});

/* ------------------------------------------------------------------ about */

export const aboutStatSchema = z.object({
  label: requiredText("Label", 40),
  value: requiredText("Value", 40),
});

export const aboutSchema = z.object({
  eyebrow: optionalText(60),
  heading: requiredText("Heading", 220),
  lead: z.string().trim().min(1, "Lead paragraph is required").max(800),
  body: z.string().trim().min(1, "Body is required").max(4000),
  focus_heading: optionalText(120),
  fullstack_title: requiredText("Full stack title", 120),
  fullstack_body: z.string().trim().min(1, "Required").max(1200),
  design_title: requiredText("Design title", 120),
  design_body: z.string().trim().min(1, "Required").max(1200),
  goals_title: requiredText("Goals title", 120),
  goals_body: z.string().trim().min(1, "Required").max(1200),
  stats: z.array(aboutStatSchema).max(6, "Up to six statistics"),
});

/* ----------------------------------------------------------------- skills */

export const skillSchema = z.object({
  name: requiredText("Skill name", 60),
  category: z.enum(["frontend", "backend", "database", "uiux", "tools"]),
  level: z.enum(["learning", "working", "confident"]),
  note: optionalText(120),
  sort_order: z.coerce.number().int().min(0).max(9999),
  enabled: z.boolean(),
});

/* --------------------------------------------------------------- projects */

export const projectSchema = z.object({
  title: requiredText("Title", 140),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(140)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
  summary: z.string().trim().min(1, "Summary is required").max(400),
  category: requiredText("Category", 60),
  cover_url: optionalUrl,
  overview: optionalText(4000),
  problem: optionalText(4000),
  solution: optionalText(4000),
  features: z.array(z.string().trim().min(1).max(240)).max(20, "Up to 20 features"),
  technologies: z.array(z.string().trim().min(1).max(40)).max(24, "Up to 24 technologies"),
  github_url: optionalUrl,
  demo_url: optionalUrl,
  year: optionalText(20),
  role: optionalText(120),
  featured: z.boolean(),
  published: z.boolean(),
  sort_order: z.coerce.number().int().min(0).max(9999),
});

/* -------------------------------------------------------------- education */

export const educationSchema = z.object({
  institution: requiredText("Institution", 200),
  degree: requiredText("Degree", 120),
  field: requiredText("Field of study", 160),
  location: optionalText(160),
  start_year: requiredText("Start year", 12),
  end_year: optionalText(12),
  status: optionalText(80),
  description: optionalText(1600),
  highlights: z.array(z.string().trim().min(1).max(120)).max(16),
  current: z.boolean(),
  sort_order: z.coerce.number().int().min(0).max(9999),
});

/* ----------------------------------------------------------- certificates */

export const certificateSchema = z.object({
  title: requiredText("Title", 200),
  issuer: requiredText("Issuer", 140),
  issue_date: z
    .string()
    .trim()
    .refine((value) => value === "" || !Number.isNaN(Date.parse(value)), "Enter a valid date")
    .optional()
    .or(z.literal("")),
  credential_id: optionalText(140),
  credential_url: optionalUrl,
  image_url: optionalUrl,
  sort_order: z.coerce.number().int().min(0).max(9999),
  published: z.boolean(),
});

/* ---------------------------------------------------------- social links */

export const socialLinkSchema = z.object({
  platform: z.enum(["github", "linkedin", "instagram", "behance", "dribbble", "email", "x", "website"]),
  label: requiredText("Label", 60),
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .max(500)
    .refine((value) => /^(https?:\/\/|mailto:)/i.test(value), {
      message: "Use a full URL, or mailto: for email",
    }),
  sort_order: z.coerce.number().int().min(0).max(9999),
  enabled: z.boolean(),
});

/* ------------------------------------------------------------------- seo */

export const settingsSchema = z.object({
  site_title: requiredText("Site title", 160),
  site_description: z.string().trim().min(1, "Description is required").max(320),
  keywords: z.array(z.string().trim().min(1).max(60)).max(20, "Up to 20 keywords"),
  og_image_url: optionalUrl,
  twitter_handle: optionalText(40),
  contact_heading: requiredText("Contact heading", 120),
  contact_body: z.string().trim().min(1, "Required").max(600),
  footer_note: optionalText(400),
});

/* --------------------------------------------------------------- uploads */

export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10 MB

export const messageStatusSchema = z.enum(["new", "read", "replied", "archived"]);

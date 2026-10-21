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
 * Seed content.
 *
 * Two jobs: it renders the site before Supabase is connected, and it is the
 * exact payload `supabase/setup.sql` seeds, so the admin panel starts from
 * something real rather than empty forms. Everything here is editable from
 * `/admin` — no copy is hard-coded into components.
 *
 * Projects and certificates below are illustrative placeholders for Aafreen
 * to replace with her own work. They claim no metrics, clients or awards.
 */

export const OWNER_NAME = "Aafreen Begam H";

export const defaultProfile: Profile = {
  id: "default",
  name: OWNER_NAME,
  role_title: "Full Stack Developer & UI/UX Designer",
  bio: "Third-year Computer Science and Engineering student building web products end to end — from the data model to the last pixel of the interface.",
  email: "hello@example.com",
  location: "Thanjavur, Tamil Nadu, India",
  availability: "Open to internships and freelance work",
  available: true,
  avatar_url: null,
};

export const defaultHero: Hero = {
  id: "default",
  eyebrow: "Thanjavur, India",
  heading: "Hi, I'm Aafreen Begam H",
  heading_accent: "Aafreen Begam H",
  subtitle: "B.Tech CSE Student · Full Stack Developer · UI/UX Enthusiast",
  description:
    "I design and build web applications where the interface and the system behind it are considered together. Currently in my third year of Computer Science and Engineering at PMIST, Thanjavur.",
  primary_cta_label: "View Projects",
  primary_cta_href: "#projects",
  secondary_cta_label: "Contact Me",
  secondary_cta_href: "#contact",
  image_url: null,
};

export const defaultAbout: About = {
  id: "default",
  eyebrow: "About",
  heading: "I work at the seam between design and engineering.",
  lead: "Most products break down at the handoff — where a considered design meets an implementation that can't quite carry it. I learned to work on both sides so that seam disappears.",
  body: "I'm a third-year Computer Science and Engineering student at Periyar Maniammai Institute of Science and Technology in Thanjavur. My coursework covers the fundamentals — data structures, databases, networks, operating systems — and I spend my own time turning those fundamentals into things people can actually use.\n\nMy process usually starts in a design file and ends in a deployed application. I sketch the flow, build the interface, model the data behind it, and keep iterating until the two halves feel like one product rather than two deliverables stitched together.",
  focus_heading: "What I focus on",
  fullstack_title: "Full Stack Development",
  fullstack_body:
    "Typed React and Next.js on the front, relational data and server-side logic behind it. I care about clear data models, predictable state, and the kind of code a teammate can pick up six months later without asking me a single question.",
  design_title: "UI/UX Design",
  design_body:
    "Interface design grounded in structure: typography that establishes hierarchy, spacing that does the organising, and components that stay consistent as a product grows. I prototype before I build, so decisions get made in Figma rather than in a pull request.",
  goals_title: "Where I'm heading",
  goals_body:
    "I'm looking for internships and early-career work where I can ship real features to real users alongside people who set a high bar. Long term, I want to build product teams' design systems and the applications that run on them.",
  stats: [
    { label: "Degree", value: "B.Tech CSE" },
    { label: "Year", value: "3rd Year" },
    { label: "Institute", value: "PMIST, Thanjavur" },
    { label: "Focus", value: "Web & Product" },
  ],
};

export const defaultSkills: Skill[] = [
  // Frontend
  { id: "s-1", name: "HTML & CSS", category: "frontend", level: "confident", note: "Semantic markup, modern layout", sort_order: 1, enabled: true },
  { id: "s-2", name: "JavaScript", category: "frontend", level: "confident", note: "ES2022+", sort_order: 2, enabled: true },
  { id: "s-3", name: "TypeScript", category: "frontend", level: "working", note: "Typed components and APIs", sort_order: 3, enabled: true },
  { id: "s-4", name: "React", category: "frontend", level: "confident", note: "Hooks, composition, state", sort_order: 4, enabled: true },
  { id: "s-5", name: "Next.js", category: "frontend", level: "working", note: "App Router, Server Components", sort_order: 5, enabled: true },
  { id: "s-6", name: "Tailwind CSS", category: "frontend", level: "confident", note: null, sort_order: 6, enabled: true },
  // Backend
  { id: "s-7", name: "Node.js", category: "backend", level: "working", note: null, sort_order: 7, enabled: true },
  { id: "s-8", name: "Express", category: "backend", level: "working", note: "REST APIs", sort_order: 8, enabled: true },
  { id: "s-9", name: "Python", category: "backend", level: "working", note: "Scripting and coursework", sort_order: 9, enabled: true },
  { id: "s-10", name: "Java", category: "backend", level: "working", note: "OOP coursework", sort_order: 10, enabled: true },
  { id: "s-11", name: "REST APIs", category: "backend", level: "working", note: "Design and consumption", sort_order: 11, enabled: true },
  { id: "s-12", name: "Authentication", category: "backend", level: "learning", note: "Sessions, JWT, RLS", sort_order: 12, enabled: true },
  // Database
  { id: "s-13", name: "PostgreSQL", category: "database", level: "working", note: null, sort_order: 13, enabled: true },
  { id: "s-14", name: "MySQL", category: "database", level: "working", note: "Coursework and projects", sort_order: 14, enabled: true },
  { id: "s-15", name: "Supabase", category: "database", level: "working", note: "Auth, storage, RLS", sort_order: 15, enabled: true },
  { id: "s-16", name: "MongoDB", category: "database", level: "learning", note: null, sort_order: 16, enabled: true },
  { id: "s-17", name: "SQL & Data Modelling", category: "database", level: "working", note: "Normalisation, indexes", sort_order: 17, enabled: true },
  // UI/UX
  { id: "s-18", name: "Figma", category: "uiux", level: "confident", note: "Components, variants, auto layout", sort_order: 18, enabled: true },
  { id: "s-19", name: "Wireframing", category: "uiux", level: "confident", note: "Low to high fidelity", sort_order: 19, enabled: true },
  { id: "s-20", name: "Prototyping", category: "uiux", level: "working", note: "Interactive flows", sort_order: 20, enabled: true },
  { id: "s-21", name: "Design Systems", category: "uiux", level: "working", note: "Tokens and components", sort_order: 21, enabled: true },
  { id: "s-22", name: "Typography & Layout", category: "uiux", level: "confident", note: null, sort_order: 22, enabled: true },
  { id: "s-23", name: "Accessibility", category: "uiux", level: "learning", note: "WCAG basics", sort_order: 23, enabled: true },
  // Tools
  { id: "s-24", name: "Git & GitHub", category: "tools", level: "confident", note: "Branching, reviews", sort_order: 24, enabled: true },
  { id: "s-25", name: "VS Code", category: "tools", level: "confident", note: null, sort_order: 25, enabled: true },
  { id: "s-26", name: "Vercel", category: "tools", level: "working", note: "Preview and production deploys", sort_order: 26, enabled: true },
  { id: "s-27", name: "Postman", category: "tools", level: "working", note: "API testing", sort_order: 27, enabled: true },
  { id: "s-28", name: "Framer Motion", category: "tools", level: "working", note: "Interface animation", sort_order: 28, enabled: true },
];

export const defaultProjects: Project[] = [
  {
    id: "p-1",
    slug: "campus-event-platform",
    title: "Campus Event Platform",
    summary:
      "A single place for a college to publish events, take registrations and check attendees in — replacing the spreadsheet-and-WhatsApp workflow most departments run on.",
    category: "Full Stack",
    cover_url: null,
    overview:
      "Departments at my college announce events over notice boards and group chats, then collect registrations in a spreadsheet that one person owns. Attendance gets counted on paper at the door. This project consolidates the whole cycle — publish, register, check in, review — into one application with a role for each person involved.",
    problem:
      "Registration data lived in whichever spreadsheet the organiser created, so nobody could see totals across departments, duplicate sign-ups were common, and a student had no single page that told them what was happening on campus this week. Check-in at the door was a printed list and a pen.",
    solution:
      "A role-aware web app built on a normalised Postgres schema. Organisers create an event and get a shareable page plus a live registration count. Students browse a filtered feed and register in one tap. At the door, a QR code on the student's ticket is scanned against the registration table, so attendance is recorded as it happens rather than transcribed afterwards.",
    features: [
      "Role-based access for students, organisers and administrators",
      "Event feed with filters for department, date and category",
      "One-tap registration with duplicate protection at the database level",
      "QR ticket generation and scan-based check-in",
      "Live registration and attendance counts for organisers",
      "Responsive layout designed mobile-first for use at the venue",
    ],
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL", "Supabase", "Vercel"],
    github_url: "https://github.com",
    demo_url: null,
    year: "2025",
    role: "Design and development",
    featured: true,
    published: true,
    sort_order: 1,
    images: [],
  },
  {
    id: "p-2",
    slug: "design-system-starter",
    title: "Design System Starter",
    summary:
      "A small, opinionated component library — tokens, primitives and documentation — built to keep my own projects visually consistent instead of restyling buttons every time.",
    category: "UI/UX",
    cover_url: null,
    overview:
      "Every new project started with the same two days of work: picking type scales, settling on spacing, rebuilding a button. This is that groundwork done once, as a documented system with a Figma library and a matching React implementation that share the same token names.",
    problem:
      "Design files and code drifted apart immediately. A colour adjusted in Figma never made it to the stylesheet, components were rebuilt slightly differently in each project, and there was no single source of truth for what 'medium spacing' actually meant.",
    solution:
      "A token layer defined once and consumed by both sides. Figma variables and CSS custom properties use identical names, so a change is a rename rather than a translation. On top of the tokens sits a set of accessible primitives — button, input, card, dialog, badge — each documented with its variants and the rule for when to use it.",
    features: [
      "Colour, type, spacing and radius tokens shared between Figma and CSS",
      "Accessible primitives built on Radix UI",
      "Light and dark themes authored separately rather than inverted",
      "Usage documentation with do and don't examples for each component",
      "Keyboard and screen-reader behaviour verified per component",
    ],
    technologies: ["Figma", "React", "TypeScript", "Tailwind CSS", "Radix UI"],
    github_url: "https://github.com",
    demo_url: null,
    year: "2025",
    role: "Design systems",
    featured: true,
    published: true,
    sort_order: 2,
    images: [],
  },
  {
    id: "p-3",
    slug: "expense-tracker",
    title: "Shared Expense Tracker",
    summary:
      "A hostel-room expense splitter that settles a month of shared costs into the smallest possible set of payments.",
    category: "Full Stack",
    cover_url: null,
    overview:
      "Four people sharing a room accumulate dozens of small shared expenses a month. Working out who owes whom at the end of it is tedious and usually slightly wrong. This app records each expense as it happens and computes the minimum set of transfers that settles the group.",
    problem:
      "Splitting costs by hand produces a web of small debts — A owes B, B owes C, C owes A — where most of the payments cancel out. People either overpay or stop tracking entirely after the first week.",
    solution:
      "Each expense is stored with its payer and its participants, so any split — equal, exact amounts or shares — resolves to a per-person balance. A settlement pass then reduces the balance graph to the fewest transfers that clear it, which is usually two or three payments instead of a dozen.",
    features: [
      "Equal, exact and share-based splits",
      "Debt simplification down to the minimum number of transfers",
      "Monthly summary by category",
      "Offline-tolerant entry that syncs when the connection returns",
      "Group history with a per-expense audit trail",
    ],
    technologies: ["React", "TypeScript", "Node.js", "Express", "PostgreSQL"],
    github_url: "https://github.com",
    demo_url: null,
    year: "2024",
    role: "Full stack development",
    featured: true,
    published: true,
    sort_order: 3,
    images: [],
  },
  {
    id: "p-4",
    slug: "library-seat-finder",
    title: "Library Seat Finder",
    summary:
      "A live floor map of the college library showing which reading-room seats are free, so students stop walking three floors to find out.",
    category: "Frontend",
    cover_url: null,
    overview:
      "An interface exercise that turned into something genuinely useful: rendering the library's reading rooms as an interactive floor plan, with seat state updating in real time as people check in and out.",
    problem:
      "During exam weeks the library fills unpredictably. The only way to find a seat is to walk each floor, and the floors that look empty from the stairwell usually aren't.",
    solution:
      "An SVG floor plan where each seat is a node bound to a realtime subscription. Occupancy is colour-coded with a pattern fallback so the map still reads for colour-blind users, and the whole thing is keyboard navigable — arrow keys move between seats, Enter claims one.",
    features: [
      "Interactive SVG floor plan per level",
      "Realtime seat state without polling",
      "Colour plus pattern encoding for accessibility",
      "Full keyboard navigation across the map",
      "Occupancy trend by hour to help plan a visit",
    ],
    technologies: ["React", "TypeScript", "SVG", "Supabase Realtime", "Tailwind CSS"],
    github_url: "https://github.com",
    demo_url: null,
    year: "2024",
    role: "Frontend and interaction design",
    featured: false,
    published: true,
    sort_order: 4,
    images: [],
  },
  {
    id: "p-5",
    slug: "recipe-app-redesign",
    title: "Recipe App Redesign",
    summary:
      "A self-directed UX case study: rebuilding a cluttered recipe app around the one moment that matters — cooking with your hands full.",
    category: "UI/UX",
    cover_url: null,
    overview:
      "A redesign study of a popular recipe app, working from the observation that its interface is optimised for browsing while the actual job — following steps at a stove — is where it fails hardest.",
    problem:
      "Ingredients and method sit on separate screens, so following a recipe means scrolling back and forth with wet hands. Step text is set at the same weight as everything else, and the screen sleeps halfway through a simmer.",
    solution:
      "A dedicated cook mode: one step per screen at a size readable from arm's length, the ingredients for that step pinned in view, a persistent timer for steps that need one, and the display kept awake for the duration. Browsing stays as it was — the redesign adds a mode rather than replacing the app.",
    features: [
      "Cook mode with one step per screen and arm's-length typography",
      "Per-step ingredient list pinned in view",
      "Inline timers attached to the steps that need them",
      "Screen-wake handling for the length of a session",
      "Annotated before-and-after flows with the reasoning for each change",
    ],
    technologies: ["Figma", "Prototyping", "User Flows", "Design Systems"],
    github_url: null,
    demo_url: null,
    year: "2024",
    role: "UX research and interface design",
    featured: false,
    published: true,
    sort_order: 5,
    images: [],
  },
];

export const defaultEducation: Education[] = [
  {
    id: "e-1",
    institution: "Periyar Maniammai Institute of Science and Technology",
    degree: "B.Tech",
    field: "Computer Science and Engineering",
    location: "Thanjavur, Tamil Nadu",
    start_year: "2023",
    end_year: "2027",
    status: "3rd Year · In progress",
    description:
      "Core computer science with a focus on software engineering and web technologies. Coursework spans data structures and algorithms, database management systems, operating systems, computer networks and object-oriented programming.",
    highlights: [
      "Data Structures & Algorithms",
      "Database Management Systems",
      "Operating Systems",
      "Computer Networks",
      "Object-Oriented Programming",
      "Software Engineering",
    ],
    current: true,
    sort_order: 1,
  },
];

export const defaultCertificates: Certificate[] = [
  {
    id: "c-1",
    title: "Responsive Web Design",
    issuer: "freeCodeCamp",
    issue_date: "2024-06-01",
    credential_id: null,
    credential_url: "https://www.freecodecamp.org/",
    image_url: null,
    sort_order: 1,
    published: true,
  },
  {
    id: "c-2",
    title: "Google UX Design — Foundations",
    issuer: "Coursera",
    issue_date: "2024-11-01",
    credential_id: null,
    credential_url: "https://www.coursera.org/",
    image_url: null,
    sort_order: 2,
    published: true,
  },
  {
    id: "c-3",
    title: "JavaScript Algorithms and Data Structures",
    issuer: "freeCodeCamp",
    issue_date: "2025-02-01",
    credential_id: null,
    credential_url: "https://www.freecodecamp.org/",
    image_url: null,
    sort_order: 3,
    published: true,
  },
];

export const defaultSocials: SocialLink[] = [
  { id: "l-1", platform: "github", label: "GitHub", url: "https://github.com", sort_order: 1, enabled: true },
  { id: "l-2", platform: "linkedin", label: "LinkedIn", url: "https://linkedin.com", sort_order: 2, enabled: true },
  { id: "l-3", platform: "email", label: "Email", url: "mailto:hello@example.com", sort_order: 3, enabled: true },
];

export const defaultResume: Resume = {
  id: "default",
  file_url: null,
  file_name: null,
  version_label: null,
};

export const defaultSettings: SiteSettings = {
  id: "default",
  site_title: "Aafreen Begam H — Full Stack Developer & UI/UX Designer",
  site_description:
    "Portfolio of Aafreen Begam H, a third-year B.Tech Computer Science and Engineering student at PMIST Thanjavur building web applications end to end — from data model to interface.",
  keywords: [
    "Aafreen Begam H",
    "Full Stack Developer",
    "UI/UX Designer",
    "Next.js Developer",
    "React Developer",
    "PMIST Thanjavur",
    "Computer Science Student Portfolio",
  ],
  og_image_url: null,
  twitter_handle: null,
  contact_heading: "Let's build something",
  contact_body:
    "Open to internships, freelance projects and collaborations. Tell me what you're working on and I'll reply within a couple of days.",
  footer_note:
    "Designed and built from scratch — Next.js, TypeScript and a deliberately small set of dependencies.",
};

export const defaultContent: PortfolioContent = {
  profile: defaultProfile,
  hero: defaultHero,
  about: defaultAbout,
  skills: defaultSkills,
  projects: defaultProjects,
  education: defaultEducation,
  certificates: defaultCertificates,
  socials: defaultSocials,
  resume: defaultResume,
  settings: defaultSettings,
};

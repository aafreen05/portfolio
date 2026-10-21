-- ===========================================================================
--  Database setup — Aafreen Begam H portfolio
--
--  HOW TO RUN: Supabase dashboard -> SQL Editor -> New query -> paste this
--  whole file -> Run. Then run `npm run admin:setup` to create the admin login.
--
--  Safe to run again (e.g. after pulling an update): it creates what is
--  missing and refreshes functions and policies, but it never deletes or
--  overwrites content — seed rows only go into EMPTY tables.
--
--  Access model
--    anon     reads published content, may submit a contact message and
--             may call keep_alive().
--    admin    a signed-in user whose id is in public.admin_users: full
--             read/write — the admin panel. Merely being signed in is NOT
--             enough, because Supabase allows public sign-ups by default.
--
--  Every table has Row Level Security enabled. Nothing is reachable without
--  a matching policy.
-- ===========================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
--  Helpers
-- ---------------------------------------------------------------------------

-- Keeps `updated_at` honest without the application having to remember.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
--  Admin allowlist
--  The only accounts that may edit content or read messages. Filled by
--  `npm run admin:setup` (service-role key), never through the public API.
-- ---------------------------------------------------------------------------

create table if not exists public.admin_users (
  user_id     uuid        primary key references auth.users (id) on delete cascade,
  email       text        not null,
  created_at  timestamptz not null default now()
);

alter table public.admin_users enable row level security;
-- No policies on purpose: the allowlist cannot be read or changed through
-- the API. is_admin() reads it with its owner's rights.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
--  Singleton tables
--  One row each, always id = 'default'. The check constraint makes a second
--  row impossible, so `select ... limit 1` is guaranteed to be the right row.
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id            text primary key default 'default' check (id = 'default'),
  name          text        not null default '',
  role_title    text        not null default '',
  bio           text        not null default '',
  email         text        not null default '',
  location      text        not null default '',
  availability  text        not null default '',
  available     boolean     not null default true,
  avatar_url    text,
  updated_at    timestamptz not null default now()
);

create table if not exists public.hero (
  id                   text primary key default 'default' check (id = 'default'),
  eyebrow              text        not null default '',
  heading              text        not null default '',
  heading_accent       text        not null default '',
  subtitle             text        not null default '',
  description          text        not null default '',
  primary_cta_label    text        not null default 'View Projects',
  primary_cta_href     text        not null default '#projects',
  secondary_cta_label  text        not null default 'Contact Me',
  secondary_cta_href   text        not null default '#contact',
  image_url            text,
  updated_at           timestamptz not null default now()
);

create table if not exists public.about (
  id               text primary key default 'default' check (id = 'default'),
  eyebrow          text        not null default 'About',
  heading          text        not null default '',
  lead             text        not null default '',
  body             text        not null default '',
  focus_heading    text        not null default '',
  fullstack_title  text        not null default '',
  fullstack_body   text        not null default '',
  design_title     text        not null default '',
  design_body      text        not null default '',
  goals_title      text        not null default '',
  goals_body       text        not null default '',
  -- [{ "label": "Degree", "value": "B.Tech CSE" }, …]
  stats            jsonb       not null default '[]'::jsonb,
  updated_at       timestamptz not null default now()
);

create table if not exists public.resume (
  id             text primary key default 'default' check (id = 'default'),
  file_url       text,
  file_name      text,
  version_label  text,
  updated_at     timestamptz not null default now()
);

create table if not exists public.site_settings (
  id                text primary key default 'default' check (id = 'default'),
  site_title        text        not null default '',
  site_description  text        not null default '',
  keywords          jsonb       not null default '[]'::jsonb,
  og_image_url      text,
  twitter_handle    text,
  contact_heading   text        not null default '',
  contact_body      text        not null default '',
  footer_note       text        not null default '',
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
--  Collections
-- ---------------------------------------------------------------------------

create table if not exists public.skills (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null,
  category    text        not null check (category in ('frontend','backend','database','uiux','tools')),
  level       text        not null default 'working' check (level in ('learning','working','confident')),
  note        text,
  sort_order  integer     not null default 0,
  enabled     boolean     not null default true,
  created_at  timestamptz not null default now()
);

-- The public query filters on `enabled` and orders by `sort_order`.
create index if not exists skills_enabled_sort_idx on public.skills (enabled, sort_order);
create index if not exists skills_category_idx     on public.skills (category);

create table if not exists public.projects (
  id            uuid primary key default gen_random_uuid(),
  slug          text        not null unique,
  title         text        not null,
  summary       text        not null default '',
  category      text        not null default 'Project',
  cover_url     text,
  overview      text,
  problem       text,
  solution      text,
  features      jsonb       not null default '[]'::jsonb,
  technologies  jsonb       not null default '[]'::jsonb,
  github_url    text,
  demo_url      text,
  year          text,
  role          text,
  featured      boolean     not null default false,
  published     boolean     not null default false,
  sort_order    integer     not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- `slug` already has a unique index; these cover the list and filter queries.
create index if not exists projects_published_sort_idx on public.projects (published, sort_order);
create index if not exists projects_featured_idx       on public.projects (featured) where published;
create index if not exists projects_category_idx       on public.projects (category);

create table if not exists public.project_images (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid        not null references public.projects (id) on delete cascade,
  url         text        not null,
  alt         text        not null default '',
  caption     text,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists project_images_project_idx on public.project_images (project_id, sort_order);

create table if not exists public.education (
  id           uuid primary key default gen_random_uuid(),
  institution  text        not null,
  degree       text        not null default '',
  field        text        not null default '',
  location     text        not null default '',
  start_year   text        not null default '',
  end_year     text        not null default '',
  status       text        not null default '',
  description  text,
  highlights   jsonb       not null default '[]'::jsonb,
  current      boolean     not null default false,
  sort_order   integer     not null default 0,
  created_at   timestamptz not null default now()
);

create index if not exists education_sort_idx on public.education (sort_order);

create table if not exists public.certificates (
  id              uuid primary key default gen_random_uuid(),
  title           text        not null,
  issuer          text        not null default '',
  issue_date      date,
  credential_id   text,
  credential_url  text,
  image_url       text,
  sort_order      integer     not null default 0,
  published       boolean     not null default true,
  created_at      timestamptz not null default now()
);

create index if not exists certificates_published_sort_idx on public.certificates (published, sort_order);

create table if not exists public.social_links (
  id          uuid primary key default gen_random_uuid(),
  platform    text        not null check (platform in ('github','linkedin','instagram','behance','dribbble','email','x','website')),
  label       text        not null default '',
  url         text        not null,
  sort_order  integer     not null default 0,
  enabled     boolean     not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists social_links_enabled_sort_idx on public.social_links (enabled, sort_order);

-- ---------------------------------------------------------------------------
--  Contact messages — the admin inbox
--  `notified_at` / `notify_error` record whether the email notification for
--  each message was delivered, so a failure is visible in the inbox.
-- ---------------------------------------------------------------------------

create table if not exists public.messages (
  id            uuid primary key default gen_random_uuid(),
  name          text        not null,
  email         text        not null,
  subject       text        not null,
  message       text        not null,
  status        text        not null default 'new' check (status in ('new','read','replied','archived')),
  notified_at   timestamptz,
  notify_error  text,
  created_at    timestamptz not null default now()
);

alter table public.messages add column if not exists notified_at  timestamptz;
alter table public.messages add column if not exists notify_error text;

-- Same limits as the form's validation, enforced again in the database
-- because the anon key can insert without going through the form.
alter table public.messages drop constraint if exists messages_lengths_check;
alter table public.messages add constraint messages_lengths_check check (
  char_length(name) between 1 and 80
  and char_length(email) between 3 and 160
  and char_length(subject) between 1 and 140
  and char_length(message) between 1 and 4000
);

-- The inbox sorts newest first and filters by status.
create index if not exists messages_created_idx on public.messages (created_at desc);
create index if not exists messages_status_idx  on public.messages (status);

-- ---------------------------------------------------------------------------
--  Keep-alive heartbeat
--  Free Supabase projects pause after a week without database activity.
--  A Vercel cron job (daily) and a GitHub Actions workflow (every 4 days)
--  call keep_alive(), which performs a real write and records when each
--  source last checked in — the admin Settings page shows it.
-- ---------------------------------------------------------------------------

create table if not exists public.keep_alive (
  source      text        primary key check (source in ('vercel-cron','github-actions','site','manual')),
  pinged_at   timestamptz not null default now(),
  ping_count  bigint      not null default 0
);

alter table public.keep_alive enable row level security;

create or replace function public.keep_alive(ping_source text default 'manual')
returns timestamptz
language sql
volatile
security definer
set search_path = ''
as $$
  insert into public.keep_alive as k (source, pinged_at, ping_count)
  values (
    case when ping_source in ('vercel-cron','github-actions','site','manual') then ping_source else 'site' end,
    now(),
    1
  )
  on conflict (source) do update
    set pinged_at = excluded.pinged_at,
        ping_count = k.ping_count + 1
  returning pinged_at;
$$;

revoke all on function public.keep_alive(text) from public;
grant execute on function public.keep_alive(text) to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
--  updated_at triggers
-- ---------------------------------------------------------------------------

drop trigger if exists profiles_touch      on public.profiles;
drop trigger if exists hero_touch          on public.hero;
drop trigger if exists about_touch         on public.about;
drop trigger if exists resume_touch        on public.resume;
drop trigger if exists site_settings_touch on public.site_settings;
drop trigger if exists projects_touch      on public.projects;

create trigger profiles_touch      before update on public.profiles      for each row execute function public.touch_updated_at();
create trigger hero_touch          before update on public.hero          for each row execute function public.touch_updated_at();
create trigger about_touch         before update on public.about         for each row execute function public.touch_updated_at();
create trigger resume_touch        before update on public.resume        for each row execute function public.touch_updated_at();
create trigger site_settings_touch before update on public.site_settings for each row execute function public.touch_updated_at();
create trigger projects_touch      before update on public.projects      for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
--  Row Level Security
--  `(select public.is_admin())` is wrapped in a sub-select so Postgres
--  evaluates it once per statement instead of once per row.
-- ---------------------------------------------------------------------------

alter table public.profiles       enable row level security;
alter table public.hero           enable row level security;
alter table public.about          enable row level security;
alter table public.resume         enable row level security;
alter table public.site_settings  enable row level security;
alter table public.skills         enable row level security;
alter table public.projects       enable row level security;
alter table public.project_images enable row level security;
alter table public.education      enable row level security;
alter table public.certificates   enable row level security;
alter table public.social_links   enable row level security;
alter table public.messages       enable row level security;

-- Public, always-visible content ---------------------------------------------

drop policy if exists "public read profiles"      on public.profiles;
drop policy if exists "public read hero"          on public.hero;
drop policy if exists "public read about"         on public.about;
drop policy if exists "public read resume"        on public.resume;
drop policy if exists "public read site_settings" on public.site_settings;
drop policy if exists "public read education"     on public.education;

create policy "public read profiles"      on public.profiles      for select to anon, authenticated using (true);
create policy "public read hero"          on public.hero          for select to anon, authenticated using (true);
create policy "public read about"         on public.about         for select to anon, authenticated using (true);
create policy "public read resume"        on public.resume        for select to anon, authenticated using (true);
create policy "public read site_settings" on public.site_settings for select to anon, authenticated using (true);
create policy "public read education"     on public.education     for select to anon, authenticated using (true);

-- Content gated on a published / enabled flag --------------------------------
-- Visitors (and any non-admin account) see live rows only; admins see all.

drop policy if exists "public read enabled skills"            on public.skills;
drop policy if exists "admin read all skills"                 on public.skills;
drop policy if exists "public read published projects"        on public.projects;
drop policy if exists "admin read all projects"               on public.projects;
drop policy if exists "public read published project images"  on public.project_images;
drop policy if exists "admin read all project images"         on public.project_images;
drop policy if exists "public read published certificates"    on public.certificates;
drop policy if exists "admin read all certificates"           on public.certificates;
drop policy if exists "public read enabled social_links"      on public.social_links;
drop policy if exists "admin read all social_links"           on public.social_links;

create policy "public read enabled skills"   on public.skills   for select to anon, authenticated using (enabled);
create policy "admin read all skills"        on public.skills   for select to authenticated using ((select public.is_admin()));

create policy "public read published projects" on public.projects for select to anon, authenticated using (published);
create policy "admin read all projects"        on public.projects for select to authenticated using ((select public.is_admin()));

create policy "public read published project images"
  on public.project_images for select to anon, authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.published));
create policy "admin read all project images"
  on public.project_images for select to authenticated using ((select public.is_admin()));

create policy "public read published certificates" on public.certificates for select to anon, authenticated using (published);
create policy "admin read all certificates"        on public.certificates for select to authenticated using ((select public.is_admin()));

create policy "public read enabled social_links" on public.social_links for select to anon, authenticated using (enabled);
create policy "admin read all social_links"      on public.social_links for select to authenticated using ((select public.is_admin()));

-- Contact form ---------------------------------------------------------------
-- Anyone may create a message (as unread, with no delivery status) but may
-- never read one back. Only admins read, update or delete.

drop policy if exists "anyone can send a message" on public.messages;
drop policy if exists "admin reads messages"      on public.messages;
drop policy if exists "admin updates messages"    on public.messages;
drop policy if exists "admin deletes messages"    on public.messages;

create policy "anyone can send a message" on public.messages for insert to anon, authenticated
  with check (status = 'new' and notified_at is null and notify_error is null);
create policy "admin reads messages"   on public.messages for select to authenticated using ((select public.is_admin()));
create policy "admin updates messages" on public.messages for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin deletes messages" on public.messages for delete to authenticated using ((select public.is_admin()));

-- Keep-alive status, readable by admins for the Settings page ---------------

drop policy if exists "admin reads keep_alive" on public.keep_alive;
create policy "admin reads keep_alive" on public.keep_alive for select to authenticated using ((select public.is_admin()));

-- Admin write access ---------------------------------------------------------
-- One "manage" policy per content table, for allowlisted admins only.

do $$
declare
  target text;
begin
  foreach target in array array[
    'profiles','hero','about','resume','site_settings',
    'skills','projects','project_images','education','certificates','social_links'
  ]
  loop
    execute format('drop policy if exists "admin manage %1$s" on public.%1$I', target);
    execute format(
      'create policy "admin manage %1$s" on public.%1$I for all to authenticated '
      'using ((select public.is_admin())) with check ((select public.is_admin()))',
      target
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
--  Storage
--  Public read (files are served straight from the CDN); only admins write.
--  Size and type limits are enforced by Storage itself, not only by the app.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars',      'avatars',      true, 5242880,  array['image/jpeg','image/png','image/webp','image/avif']),
  ('projects',     'projects',     true, 5242880,  array['image/jpeg','image/png','image/webp','image/avif']),
  ('certificates', 'certificates', true, 5242880,  array['image/jpeg','image/png','image/webp','image/avif']),
  ('resume',       'resume',       true, 10485760, array['application/pdf'])
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public read portfolio media"   on storage.objects;
drop policy if exists "admin upload portfolio media"  on storage.objects;
drop policy if exists "admin update portfolio media"  on storage.objects;
drop policy if exists "admin delete portfolio media"  on storage.objects;

create policy "public read portfolio media"
  on storage.objects for select to anon, authenticated
  using (bucket_id in ('avatars','projects','certificates','resume'));

create policy "admin upload portfolio media"
  on storage.objects for insert to authenticated
  with check (bucket_id in ('avatars','projects','certificates','resume') and (select public.is_admin()));

create policy "admin update portfolio media"
  on storage.objects for update to authenticated
  using (bucket_id in ('avatars','projects','certificates','resume') and (select public.is_admin()))
  with check (bucket_id in ('avatars','projects','certificates','resume') and (select public.is_admin()));

create policy "admin delete portfolio media"
  on storage.objects for delete to authenticated
  using (bucket_id in ('avatars','projects','certificates','resume') and (select public.is_admin()));

-- ---------------------------------------------------------------------------
--  Seed content
--  Mirrors src/lib/content/defaults.ts, so the site looks exactly as it does
--  before Supabase is connected. Projects and certificates are placeholders
--  to replace from /admin. Only fills EMPTY tables — never overwrites edits.
-- ---------------------------------------------------------------------------

-- >>> SEED START (generated from src/lib/content/defaults.ts)

-- Singletons: inserted only when the row is missing.

insert into public.profiles (id, name, role_title, bio, email, location, availability, available, avatar_url)
values ('default', $s$Aafreen Begam H$s$, $s$Full Stack Developer & UI/UX Designer$s$, $s$Third-year Computer Science and Engineering student building web products end to end — from the data model to the last pixel of the interface.$s$, $s$hello@example.com$s$, $s$Thanjavur, Tamil Nadu, India$s$, $s$Open to internships and freelance work$s$, true, null)
on conflict (id) do nothing;

insert into public.hero (id, eyebrow, heading, heading_accent, subtitle, description, primary_cta_label, primary_cta_href, secondary_cta_label, secondary_cta_href, image_url)
values ('default', $s$Thanjavur, India$s$, $s$Hi, I'm Aafreen Begam H$s$, $s$Aafreen Begam H$s$, $s$B.Tech CSE Student · Full Stack Developer · UI/UX Enthusiast$s$, $s$I design and build web applications where the interface and the system behind it are considered together. Currently in my third year of Computer Science and Engineering at PMIST, Thanjavur.$s$, $s$View Projects$s$, $s$#projects$s$, $s$Contact Me$s$, $s$#contact$s$, null)
on conflict (id) do nothing;

insert into public.about (id, eyebrow, heading, lead, body, focus_heading, fullstack_title, fullstack_body, design_title, design_body, goals_title, goals_body, stats)
values ('default', $s$About$s$, $s$I work at the seam between design and engineering.$s$, $s$Most products break down at the handoff — where a considered design meets an implementation that can't quite carry it. I learned to work on both sides so that seam disappears.$s$, $s$I'm a third-year Computer Science and Engineering student at Periyar Maniammai Institute of Science and Technology in Thanjavur. My coursework covers the fundamentals — data structures, databases, networks, operating systems — and I spend my own time turning those fundamentals into things people can actually use.

My process usually starts in a design file and ends in a deployed application. I sketch the flow, build the interface, model the data behind it, and keep iterating until the two halves feel like one product rather than two deliverables stitched together.$s$, $s$What I focus on$s$, $s$Full Stack Development$s$, $s$Typed React and Next.js on the front, relational data and server-side logic behind it. I care about clear data models, predictable state, and the kind of code a teammate can pick up six months later without asking me a single question.$s$, $s$UI/UX Design$s$, $s$Interface design grounded in structure: typography that establishes hierarchy, spacing that does the organising, and components that stay consistent as a product grows. I prototype before I build, so decisions get made in Figma rather than in a pull request.$s$, $s$Where I'm heading$s$, $s$I'm looking for internships and early-career work where I can ship real features to real users alongside people who set a high bar. Long term, I want to build product teams' design systems and the applications that run on them.$s$, $s$[{"label":"Degree","value":"B.Tech CSE"},{"label":"Year","value":"3rd Year"},{"label":"Institute","value":"PMIST, Thanjavur"},{"label":"Focus","value":"Web & Product"}]$s$::jsonb)
on conflict (id) do nothing;

insert into public.resume (id, file_url, file_name, version_label)
values ('default', null, null, null)
on conflict (id) do nothing;

insert into public.site_settings (id, site_title, site_description, keywords, og_image_url, twitter_handle, contact_heading, contact_body, footer_note)
values ('default', $s$Aafreen Begam H — Full Stack Developer & UI/UX Designer$s$, $s$Portfolio of Aafreen Begam H, a third-year B.Tech Computer Science and Engineering student at PMIST Thanjavur building web applications end to end — from data model to interface.$s$, $s$["Aafreen Begam H","Full Stack Developer","UI/UX Designer","Next.js Developer","React Developer","PMIST Thanjavur","Computer Science Student Portfolio"]$s$::jsonb, null, null, $s$Let's build something$s$, $s$Open to internships, freelance projects and collaborations. Tell me what you're working on and I'll reply within a couple of days.$s$, $s$Designed and built from scratch — Next.js, TypeScript and a deliberately small set of dependencies.$s$)
on conflict (id) do nothing;

-- Collections: inserted only when the table is empty.

do $seed$
begin
  if not exists (select 1 from public.skills) then
    insert into public.skills (name, category, level, note, sort_order, enabled) values
      ($s$HTML & CSS$s$, $s$frontend$s$, $s$confident$s$, $s$Semantic markup, modern layout$s$, 1, true),
      ($s$JavaScript$s$, $s$frontend$s$, $s$confident$s$, $s$ES2022+$s$, 2, true),
      ($s$TypeScript$s$, $s$frontend$s$, $s$working$s$, $s$Typed components and APIs$s$, 3, true),
      ($s$React$s$, $s$frontend$s$, $s$confident$s$, $s$Hooks, composition, state$s$, 4, true),
      ($s$Next.js$s$, $s$frontend$s$, $s$working$s$, $s$App Router, Server Components$s$, 5, true),
      ($s$Tailwind CSS$s$, $s$frontend$s$, $s$confident$s$, null, 6, true),
      ($s$Node.js$s$, $s$backend$s$, $s$working$s$, null, 7, true),
      ($s$Express$s$, $s$backend$s$, $s$working$s$, $s$REST APIs$s$, 8, true),
      ($s$Python$s$, $s$backend$s$, $s$working$s$, $s$Scripting and coursework$s$, 9, true),
      ($s$Java$s$, $s$backend$s$, $s$working$s$, $s$OOP coursework$s$, 10, true),
      ($s$REST APIs$s$, $s$backend$s$, $s$working$s$, $s$Design and consumption$s$, 11, true),
      ($s$Authentication$s$, $s$backend$s$, $s$learning$s$, $s$Sessions, JWT, RLS$s$, 12, true),
      ($s$PostgreSQL$s$, $s$database$s$, $s$working$s$, null, 13, true),
      ($s$MySQL$s$, $s$database$s$, $s$working$s$, $s$Coursework and projects$s$, 14, true),
      ($s$Supabase$s$, $s$database$s$, $s$working$s$, $s$Auth, storage, RLS$s$, 15, true),
      ($s$MongoDB$s$, $s$database$s$, $s$learning$s$, null, 16, true),
      ($s$SQL & Data Modelling$s$, $s$database$s$, $s$working$s$, $s$Normalisation, indexes$s$, 17, true),
      ($s$Figma$s$, $s$uiux$s$, $s$confident$s$, $s$Components, variants, auto layout$s$, 18, true),
      ($s$Wireframing$s$, $s$uiux$s$, $s$confident$s$, $s$Low to high fidelity$s$, 19, true),
      ($s$Prototyping$s$, $s$uiux$s$, $s$working$s$, $s$Interactive flows$s$, 20, true),
      ($s$Design Systems$s$, $s$uiux$s$, $s$working$s$, $s$Tokens and components$s$, 21, true),
      ($s$Typography & Layout$s$, $s$uiux$s$, $s$confident$s$, null, 22, true),
      ($s$Accessibility$s$, $s$uiux$s$, $s$learning$s$, $s$WCAG basics$s$, 23, true),
      ($s$Git & GitHub$s$, $s$tools$s$, $s$confident$s$, $s$Branching, reviews$s$, 24, true),
      ($s$VS Code$s$, $s$tools$s$, $s$confident$s$, null, 25, true),
      ($s$Vercel$s$, $s$tools$s$, $s$working$s$, $s$Preview and production deploys$s$, 26, true),
      ($s$Postman$s$, $s$tools$s$, $s$working$s$, $s$API testing$s$, 27, true),
      ($s$Framer Motion$s$, $s$tools$s$, $s$working$s$, $s$Interface animation$s$, 28, true);
  end if;
end;
$seed$;

do $seed$
begin
  if not exists (select 1 from public.projects) then
    insert into public.projects (slug, title, summary, category, cover_url, overview, problem, solution, features, technologies, github_url, demo_url, year, role, featured, published, sort_order) values
      ($s$campus-event-platform$s$, $s$Campus Event Platform$s$, $s$A single place for a college to publish events, take registrations and check attendees in — replacing the spreadsheet-and-WhatsApp workflow most departments run on.$s$, $s$Full Stack$s$, null, $s$Departments at my college announce events over notice boards and group chats, then collect registrations in a spreadsheet that one person owns. Attendance gets counted on paper at the door. This project consolidates the whole cycle — publish, register, check in, review — into one application with a role for each person involved.$s$, $s$Registration data lived in whichever spreadsheet the organiser created, so nobody could see totals across departments, duplicate sign-ups were common, and a student had no single page that told them what was happening on campus this week. Check-in at the door was a printed list and a pen.$s$, $s$A role-aware web app built on a normalised Postgres schema. Organisers create an event and get a shareable page plus a live registration count. Students browse a filtered feed and register in one tap. At the door, a QR code on the student's ticket is scanned against the registration table, so attendance is recorded as it happens rather than transcribed afterwards.$s$, $s$["Role-based access for students, organisers and administrators","Event feed with filters for department, date and category","One-tap registration with duplicate protection at the database level","QR ticket generation and scan-based check-in","Live registration and attendance counts for organisers","Responsive layout designed mobile-first for use at the venue"]$s$::jsonb, $s$["Next.js","TypeScript","Tailwind CSS","PostgreSQL","Supabase","Vercel"]$s$::jsonb, $s$https://github.com$s$, null, $s$2025$s$, $s$Design and development$s$, true, true, 1),
      ($s$design-system-starter$s$, $s$Design System Starter$s$, $s$A small, opinionated component library — tokens, primitives and documentation — built to keep my own projects visually consistent instead of restyling buttons every time.$s$, $s$UI/UX$s$, null, $s$Every new project started with the same two days of work: picking type scales, settling on spacing, rebuilding a button. This is that groundwork done once, as a documented system with a Figma library and a matching React implementation that share the same token names.$s$, $s$Design files and code drifted apart immediately. A colour adjusted in Figma never made it to the stylesheet, components were rebuilt slightly differently in each project, and there was no single source of truth for what 'medium spacing' actually meant.$s$, $s$A token layer defined once and consumed by both sides. Figma variables and CSS custom properties use identical names, so a change is a rename rather than a translation. On top of the tokens sits a set of accessible primitives — button, input, card, dialog, badge — each documented with its variants and the rule for when to use it.$s$, $s$["Colour, type, spacing and radius tokens shared between Figma and CSS","Accessible primitives built on Radix UI","Light and dark themes authored separately rather than inverted","Usage documentation with do and don't examples for each component","Keyboard and screen-reader behaviour verified per component"]$s$::jsonb, $s$["Figma","React","TypeScript","Tailwind CSS","Radix UI"]$s$::jsonb, $s$https://github.com$s$, null, $s$2025$s$, $s$Design systems$s$, true, true, 2),
      ($s$expense-tracker$s$, $s$Shared Expense Tracker$s$, $s$A hostel-room expense splitter that settles a month of shared costs into the smallest possible set of payments.$s$, $s$Full Stack$s$, null, $s$Four people sharing a room accumulate dozens of small shared expenses a month. Working out who owes whom at the end of it is tedious and usually slightly wrong. This app records each expense as it happens and computes the minimum set of transfers that settles the group.$s$, $s$Splitting costs by hand produces a web of small debts — A owes B, B owes C, C owes A — where most of the payments cancel out. People either overpay or stop tracking entirely after the first week.$s$, $s$Each expense is stored with its payer and its participants, so any split — equal, exact amounts or shares — resolves to a per-person balance. A settlement pass then reduces the balance graph to the fewest transfers that clear it, which is usually two or three payments instead of a dozen.$s$, $s$["Equal, exact and share-based splits","Debt simplification down to the minimum number of transfers","Monthly summary by category","Offline-tolerant entry that syncs when the connection returns","Group history with a per-expense audit trail"]$s$::jsonb, $s$["React","TypeScript","Node.js","Express","PostgreSQL"]$s$::jsonb, $s$https://github.com$s$, null, $s$2024$s$, $s$Full stack development$s$, true, true, 3),
      ($s$library-seat-finder$s$, $s$Library Seat Finder$s$, $s$A live floor map of the college library showing which reading-room seats are free, so students stop walking three floors to find out.$s$, $s$Frontend$s$, null, $s$An interface exercise that turned into something genuinely useful: rendering the library's reading rooms as an interactive floor plan, with seat state updating in real time as people check in and out.$s$, $s$During exam weeks the library fills unpredictably. The only way to find a seat is to walk each floor, and the floors that look empty from the stairwell usually aren't.$s$, $s$An SVG floor plan where each seat is a node bound to a realtime subscription. Occupancy is colour-coded with a pattern fallback so the map still reads for colour-blind users, and the whole thing is keyboard navigable — arrow keys move between seats, Enter claims one.$s$, $s$["Interactive SVG floor plan per level","Realtime seat state without polling","Colour plus pattern encoding for accessibility","Full keyboard navigation across the map","Occupancy trend by hour to help plan a visit"]$s$::jsonb, $s$["React","TypeScript","SVG","Supabase Realtime","Tailwind CSS"]$s$::jsonb, $s$https://github.com$s$, null, $s$2024$s$, $s$Frontend and interaction design$s$, false, true, 4),
      ($s$recipe-app-redesign$s$, $s$Recipe App Redesign$s$, $s$A self-directed UX case study: rebuilding a cluttered recipe app around the one moment that matters — cooking with your hands full.$s$, $s$UI/UX$s$, null, $s$A redesign study of a popular recipe app, working from the observation that its interface is optimised for browsing while the actual job — following steps at a stove — is where it fails hardest.$s$, $s$Ingredients and method sit on separate screens, so following a recipe means scrolling back and forth with wet hands. Step text is set at the same weight as everything else, and the screen sleeps halfway through a simmer.$s$, $s$A dedicated cook mode: one step per screen at a size readable from arm's length, the ingredients for that step pinned in view, a persistent timer for steps that need one, and the display kept awake for the duration. Browsing stays as it was — the redesign adds a mode rather than replacing the app.$s$, $s$["Cook mode with one step per screen and arm's-length typography","Per-step ingredient list pinned in view","Inline timers attached to the steps that need them","Screen-wake handling for the length of a session","Annotated before-and-after flows with the reasoning for each change"]$s$::jsonb, $s$["Figma","Prototyping","User Flows","Design Systems"]$s$::jsonb, null, null, $s$2024$s$, $s$UX research and interface design$s$, false, true, 5);
  end if;
end;
$seed$;

do $seed$
begin
  if not exists (select 1 from public.education) then
    insert into public.education (institution, degree, field, location, start_year, end_year, status, description, highlights, current, sort_order) values
      ($s$Periyar Maniammai Institute of Science and Technology$s$, $s$B.Tech$s$, $s$Computer Science and Engineering$s$, $s$Thanjavur, Tamil Nadu$s$, $s$2023$s$, $s$2027$s$, $s$3rd Year · In progress$s$, $s$Core computer science with a focus on software engineering and web technologies. Coursework spans data structures and algorithms, database management systems, operating systems, computer networks and object-oriented programming.$s$, $s$["Data Structures & Algorithms","Database Management Systems","Operating Systems","Computer Networks","Object-Oriented Programming","Software Engineering"]$s$::jsonb, true, 1);
  end if;
end;
$seed$;

do $seed$
begin
  if not exists (select 1 from public.certificates) then
    insert into public.certificates (title, issuer, issue_date, credential_id, credential_url, image_url, sort_order, published) values
      ($s$Responsive Web Design$s$, $s$freeCodeCamp$s$, $s$2024-06-01$s$, null, $s$https://www.freecodecamp.org/$s$, null, 1, true),
      ($s$Google UX Design — Foundations$s$, $s$Coursera$s$, $s$2024-11-01$s$, null, $s$https://www.coursera.org/$s$, null, 2, true),
      ($s$JavaScript Algorithms and Data Structures$s$, $s$freeCodeCamp$s$, $s$2025-02-01$s$, null, $s$https://www.freecodecamp.org/$s$, null, 3, true);
  end if;
end;
$seed$;

do $seed$
begin
  if not exists (select 1 from public.social_links) then
    insert into public.social_links (platform, label, url, sort_order, enabled) values
      ($s$github$s$, $s$GitHub$s$, $s$https://github.com$s$, 1, true),
      ($s$linkedin$s$, $s$LinkedIn$s$, $s$https://linkedin.com$s$, 2, true),
      ($s$email$s$, $s$Email$s$, $s$mailto:hello@example.com$s$, 3, true);
  end if;
end;
$seed$;

-- <<< SEED END

-- Make the API pick up the new tables and functions immediately.
notify pgrst, 'reload schema';

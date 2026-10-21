# Aafreen Begam H — Portfolio

A production-ready portfolio and content management system, built from scratch.

The public site is a statically rendered Next.js application. Everything on it —
copy, projects, skills, education, certificates, social links, the resume PDF and
the SEO metadata — is edited from a password-protected admin panel at `/admin`,
with no code changes required.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Supabase
(Postgres, Auth, Storage) · React Hook Form + Zod · Radix UI primitives ·
Motion · Lucide icons · Vercel.

---

## Contents

1. [Quick start](#1-quick-start)
2. [Supabase setup](#2-supabase-setup)
3. [Environment variables](#3-environment-variables)
4. [Database setup](#4-database-setup)
5. [Admin authentication](#5-admin-authentication)
6. [Local development](#6-local-development)
7. [Deploying to Vercel](#7-deploying-to-vercel)
8. [How the project is organised](#8-how-the-project-is-organised)
9. [Design notes](#9-design-notes)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>.

The site runs **without Supabase configured**. Every read falls back to curated
seed content in [`src/lib/content/defaults.ts`](src/lib/content/defaults.ts), so
you get a complete, working portfolio on the first run. `/admin` is unreachable
until Supabase is connected, and the sign-in page explains what is missing.

Connect Supabase when you want to edit content from the browser.

---

## 2. Supabase setup

1. Create a free project at <https://supabase.com/dashboard>.
2. Choose a region close to your visitors (for India, Mumbai / `ap-south-1`).
3. Wait for provisioning to finish (a minute or two).

Then open **Project Settings → API** and copy:

| Value                        | Goes to                             |
| ---------------------------- | ----------------------------------- |
| Project URL                  | `NEXT_PUBLIC_SUPABASE_URL`          |
| `anon` / publishable key     | `NEXT_PUBLIC_SUPABASE_ANON_KEY`     |
| `service_role` / secret key  | `SUPABASE_SERVICE_ROLE_KEY`         |

> The `anon` key is safe in the browser — Row Level Security is what protects
> your data, and the policies in `supabase/setup.sql` assume that key is
> public. The `service_role` key **bypasses Row Level Security**. Keep it
> server-side only, never prefix it with `NEXT_PUBLIC_`, and never commit it.

---

## 3. Environment variables

Copy `.env.example` to `.env.local` and fill it in. `.env.local` is
git-ignored; `.env.example` is committed, so it must only ever hold
placeholders.

| Variable                        | Where            | Purpose                                                                                          |
| ------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Local + Vercel   | Database, auth and storage endpoint.                                                             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Local + Vercel   | Public client key, constrained by RLS.                                                           |
| `SUPABASE_SERVICE_ROLE_KEY`     | Local + Vercel   | Server-only. Saves contact messages and records whether their email notification went out.       |
| `NEXT_PUBLIC_SITE_URL`          | Local + Vercel   | Canonical origin, no trailing slash: `http://localhost:3000` locally, `https://aafreenbegam.in` on Vercel. |
| `RESEND_API_KEY`                | Local + Vercel   | Sends the email notification for each contact message ([resend.com](https://resend.com/api-keys)). |
| `CONTACT_NOTIFY_EMAIL`          | Local + Vercel   | The inbox that receives those notifications — the Resend account's own email.                  |
| `RESEND_FROM_EMAIL`             | Optional         | Leave unset to use Resend's default sender — see [Contact messages](#contact-messages-and-email-notifications). |
| `CRON_SECRET`                   | Vercel (+ local) | Any long random string. Vercel sends it to authenticate its daily keep-alive call.               |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Local only       | Read by `npm run admin:setup` to create the admin login. Not needed on Vercel.                   |

Restart the dev server after changing any of these.

---

## 4. Database setup

Everything the database needs is in one file. In the Supabase dashboard open
**SQL Editor → New query**, paste the whole of
**[`supabase/setup.sql`](supabase/setup.sql)** and click **Run**. It creates:

- the content tables, indexes and `updated_at` triggers;
- the **admin allowlist** (`admin_users`) and the `is_admin()` check every
  policy uses;
- Row Level Security policies for every table, and the four storage buckets
  (`avatars`, `projects`, `certificates`, `resume`) with size and file-type
  limits enforced by Storage itself;
- the contact inbox (`messages`), with database-level length limits;
- the keep-alive heartbeat (`keep_alive` table and `keep_alive()` function);
- starter content identical to the built-in fallback, so the site looks the
  same the moment it is connected.

It is safe to run again, for example after pulling an update: it creates
whatever is missing and refreshes functions and policies, but **never deletes
or overwrites content** — starter rows only go into empty tables.

### Access model

| Who                               | Can do                                                                    |
| --------------------------------- | ------------------------------------------------------------------------- |
| Visitors (`anon`)                 | Read published content. Submit a contact message. Call `keep_alive()`.     |
| Signed-in, not on the allowlist   | Exactly what a visitor can — nothing more.                                 |
| Admins (in `admin_users`)         | Full read and write on all content, messages and uploads.                  |

Unpublished projects, disabled skills and hidden certificates are invisible to
visitors at the database level — not merely filtered in the application.
Contact messages can be inserted by anyone but read only by an admin.

### Tables

`profiles`, `hero`, `about`, `resume`, `site_settings` are **singletons** — one
row each, pinned to `id = 'default'` by a check constraint, so every save is a
simple upsert.

`skills`, `projects`, `project_images`, `education`, `certificates`,
`social_links`, `messages` are **collections** with UUID keys, `sort_order`
columns for manual ordering, and indexes covering the queries the site actually
runs. `project_images` cascades on project delete.

`admin_users` and `keep_alive` are internal: neither is readable or writable
through the public API except as described above.

---

## 5. Admin authentication

The admin login is created from `.env.local` with one command, after
`setup.sql` has run:

```bash
npm run admin:setup
```

It creates the Supabase Auth user from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (email
pre-confirmed) and adds it to the admin allowlist. Running it again resets that
account's password to `ADMIN_PASSWORD`, which doubles as password recovery.
Then sign in at `/admin/login`.

**Being signed in is not enough to be an admin.** Supabase allows public
sign-ups by default, so the app and the database both check the allowlist:
any account that is not on it is signed out with an explanation, and RLS
gives it no more access than a visitor. For tidiness you can also switch off
**Authentication → Sign In / Providers → Allow new users to sign up**.

Security notes:

- `src/proxy.ts` gates every `/admin` request and signs out non-admins.
- Every admin page and **every server action** independently calls
  `requireAdmin()`. Server Actions are public HTTP endpoints, so the proxy
  alone is never treated as sufficient.
- All admin routes are `noindex, nofollow` via metadata, an `X-Robots-Tag`
  response header, and a `Disallow` in `robots.txt`.
- Every mutation re-validates its input with Zod on the server, regardless of
  what the client already checked.

---

## 6. Local development

```bash
npm run dev          # start the dev server
npm run lint         # ESLint, including the React Compiler rules
npm run build        # production build
npm start            # serve the production build
npm run admin:setup  # create or update the admin login
```

### Editing content

Sign in at `/admin` and work through the sidebar:

| Section          | What it controls                                                              |
| ---------------- | ----------------------------------------------------------------------------- |
| **Dashboard**    | Counts, recent messages, featured projects.                                   |
| **Profile**      | Name, role, bio, photo, email, location, availability.                        |
| **Hero**         | Headline, accent phrase, subtitle, description, both CTAs, hero image.        |
| **About**        | Lead, body, the three focus cards, statistics.                                |
| **Skills**       | Add, edit, delete, categorise, reorder, show/hide.                            |
| **Projects**     | Full editor, case study fields, images, publish, feature, duplicate, reorder. |
| **Education**    | Degree entries; the one marked Current also appears in About.                 |
| **Certificates** | Title, issuer, date, credential ID, verification URL, image.                  |
| **Messages**     | Inbox with New / Read / Replied / Archived, and email delivery status.        |
| **Resume**       | Upload or replace the PDF.                                                    |
| **Social Links** | Only configured links are rendered — never empty icons.                       |
| **SEO**          | Title, meta description, keywords, share image, X handle.                     |
| **Settings**     | Contact and footer copy, configuration check, test email, keep-alive status.  |

Saving purges the cached public pages, so changes appear on the next request
rather than waiting for the hourly revalidation.

### Contact messages and email notifications

Every message sent through the contact form is saved to the `messages` table —
the admin inbox, with an unread badge and a "Recent messages" panel on the
dashboard — and then emailed to `CONTACT_NOTIFY_EMAIL` through
[Resend](https://resend.com). Replying to that email answers the visitor
directly. The email goes out after the visitor's response is sent, so they
never wait on it, and its outcome is recorded on the message: the inbox shows
"Emailed" or "Email failed" with the reason. A failed email never loses a
message.

**Settings → Email notifications → Send test email** checks delivery at any
time, including on the live site.

Notifications use Resend's default sender, `onboarding@resend.dev`, so no
domain setup is needed. That sender **only delivers to the email address that
owns the Resend account**, so `CONTACT_NOTIFY_EMAIL` must be that account's
email (for example the Gmail you signed up to Resend with). If you ever change
`RESEND_API_KEY` to a key from another Resend account, update
`CONTACT_NOTIFY_EMAIL` to match — the inbox and **Send test email** show the
exact error if they disagree.

Optional: to send to any address, verify a domain in Resend (**Domains → Add
domain**, then add its DNS records) and set `RESEND_FROM_EMAIL`, for example
`Portfolio <hello@aafreenbegam.in>`.

Spam protection: a honeypot field, a per-IP rate limit, server-side
validation and database length limits.

### Uploads

Images are limited to JPEG, PNG, WebP or AVIF at 5 MB; the resume to PDF at
10 MB. The limits are enforced in the browser for fast feedback, on the
server, **and** by Supabase Storage itself. Uploads get randomised object
names, so they cannot be guessed or overwritten by collision.

Any image field also accepts a plain URL, so you can host images elsewhere.

---

## 7. Deploying to Vercel

1. In Vercel, **Add New → Project** and import the GitHub repository. Next.js
   is detected automatically — no build settings to change.
2. Before the first deploy, open **Environment Variables** and add every
   "Local + Vercel" variable from [step 3](#3-environment-variables), with
   `NEXT_PUBLIC_SITE_URL` set to `https://aafreenbegam.in` (no trailing
   slash). The values are in your `.env.local`.
3. Deploy.
4. **Settings → Domains → Add** `aafreenbegam.in` and follow the DNS
   instructions Vercel shows (an `A` record for the apex domain and a `CNAME`
   for `www`, at your registrar). Vercel issues the HTTPS certificate itself.
5. In Supabase, **Authentication → URL Configuration**: set **Site URL** to
   `https://aafreenbegam.in`.

If `NEXT_PUBLIC_SITE_URL` is ever missing, canonical URLs fall back to the
project's production domain on Vercel rather than to localhost.

### Keeping Supabase awake

Free Supabase projects pause after a week without database activity. Two
independent schedulers prevent that, and each one performs a real database
write through `keep_alive()`:

| Scheduler          | Cadence                          | Defined in                                     |
| ------------------ | -------------------------------- | ---------------------------------------------- |
| **Vercel Cron**    | Daily at 06:30 UTC               | `vercel.json` → `/api/keep-alive`              |
| **GitHub Actions** | Every 4 days, with `curl`        | `.github/workflows/supabase-keep-alive.yml`    |

Supabase's own guidance is that "a few user requests to the database each day"
keeps a project active, which is why the Vercel job runs daily; the GitHub job
is a second, independent path, so a missed run on either side never leaves the
project idle long enough to pause.

Both start on their own: the cron once the site is deployed, the workflow once
the code is on GitHub. **Settings → Database keep-alive** in the admin shows
when each last ran (with a warning past five days) and has a **Ping now**
button. For the GitHub job to reach Supabase even if the site were down, add
repository secrets `SUPABASE_URL` and `SUPABASE_ANON_KEY` (**Settings →
Secrets and variables → Actions**); without them it pings through the site.
GitHub disables scheduled workflows after 60 days without commits only in
**public** repositories — if you make the repository public, re-enable the
workflow from the Actions tab if that ever happens.

### After going live

- Submit `https://aafreenbegam.in/sitemap.xml` to Google Search Console.
- Check the social card by pasting a link into any chat app.
- **Settings → Send test email** confirms notifications work in production.
- Replace the placeholder content from `/admin`: the profile email and the
  email social link (`hello@example.com`), the GitHub and LinkedIn URLs, and
  the sample projects and certificates.

---

## 8. How the project is organised

```
src/
├─ app/
│  ├─ (site)/                 Public site — statically rendered, revalidated hourly
│  │  ├─ page.tsx             Home: hero, about, skills, projects, education, certificates, contact
│  │  └─ projects/            Index and /projects/[slug] case study pages
│  ├─ admin/
│  │  ├─ (dashboard)/         Authenticated CMS screens
│  │  ├─ _actions/            Server actions: content, collections, projects, messages, uploads, auth
│  │  └─ login/               Sign-in
│  ├─ actions/contact.ts      Public contact form submission
│  ├─ resume/route.ts         Stable /resume link that redirects to the current PDF
│  ├─ opengraph-image.tsx     Social card generated from live profile content
│  ├─ sitemap.ts, robots.ts
│  └─ globals.css             Design tokens and the reveal system
├─ components/
│  ├─ ui/                     Design-system primitives (button, card, input, dialog, …)
│  ├─ site/                   Public sections
│  ├─ admin/                  CMS building blocks (forms, fields, uploads, row actions)
│  └─ motion/                 Scroll reveal
├─ lib/
│  ├─ queries.ts              Public reads, with fallback to seed content
│  ├─ admin/                  Auth guard, admin reads, server-action helpers
│  ├─ supabase/               Browser, server, service-role and cookie-free clients
│  ├─ validations.ts          Zod schemas shared by client forms and server actions
│  └─ types.ts                Domain types mirroring the database
└─ proxy.ts                   Session refresh and the /admin gate
```

### Rendering

Public pages are statically generated and revalidated hourly, because reads use
a **cookie-free** Supabase client — no `cookies()` call means no forced dynamic
rendering. Project pages are pre-rendered from `generateStaticParams`, and new
slugs are generated on first request and then cached. Admin pages are
`force-dynamic`: an editor must always see current data.

### Client JavaScript

Sections, cards and case studies are Server Components. Client components are
limited to the parts that genuinely need interaction: the navbar, the project
filter, forms, dialogs, the theme toggle and a single scroll-reveal listener.

---

## 9. Design notes

### Concept — "Binary Star"

The portfolio is an observatory at night. Two stars in orbit carry the whole
idea: **gold is design, ice-blue is code** — "I understand both" made literal.
They orbit the portrait in the hero's astrolabe, they are the two dots in the
favicon, and they tint the rest of the palette.

Geometry is taken from scientific instruments rather than app UI: square
corners, hairline rules, gold corner brackets that stretch into full frames on
hover, tick marks, catalogue numbers. There are no rounded pills anywhere.

The light theme is not an inversion. It is its own concept — **"Porcelain"**,
an engraved star chart on fine paper: a warm off-white ground, white cards
lifted by soft ink-tinted shadows, navy ink, dark antique brass, champagne-gold
buttons carrying ink text, and a sparser starfield of ink dots and fine cross
marks with no glow.

The theme control is a single toggle (Night ⇄ Porcelain). Where the View
Transitions API exists, the new theme opens as a circle from the button;
otherwise — or with reduced motion — it switches instantly.

### Typography — six faces, six jobs

Each face is unmistakably different from the others and confined to one role,
so the mix reads as intentional.

| Face               | Role                                                                     |
| ------------------ | ------------------------------------------------------------------------ |
| **Playfair**       | Serif — the name, headlines, pull quotes. The *design* voice.             |
| **Unbounded**      | Wide geometric capitals — section titles, buttons. The *system* voice.    |
| **Manrope**        | Body copy and interface text.                                             |
| **Space Mono**     | Coordinates, labels, metadata, decoding effects. The *code* voice.        |
| **Parisienne**     | Script — the "Hi, I'm" greeting and the signatures. Used sparingly.       |
| **Antonio**        | Condensed numerals, the stats and the technology marquee.                 |

Utilities carry the tracking and weight each face needs: `.serif-display`,
`.serif-italic`, `.wide-caps`, `.kicker`, `.script`, `.condensed`,
`.numeric`, plus `.text-gilded` for the metallic gold fill. Antonio is not
preloaded because it first appears below the fold.

Rendering rules learned the hard way:

- **Playfair is pinned to a sturdy optical size** (`"opsz" 24`, automatic
  optical sizing off). Left on auto, large headings select the display cut,
  whose hairlines are so thin that the left stroke of an "A" and the crossbar
  of an "H" disappear on ordinary screens.
- **Script is solid gold, never gradient-clipped.** `background-clip: text`
  only paints inside the element's box, and script swashes overhang it.
- **Headings animate word by word, not letter by letter.** Splitting a word
  into inline-block letters throws away the font's kerning.
- Sizes are capped so headings lead rather than shout: section titles top out
  around 3.75rem, the hero name at 6rem.

The share card (`opengraph-image.tsx`) uses the real faces too, from static
WOFF files in `src/assets/og-fonts` — the image renderer cannot read variable
fonts or WOFF2. All are SIL Open Font License.

### Colour

```
gold    design · primary accent · buttons · rules
ice     code · frontend
ember   database · warnings
orchid  UI/UX
sage    tools · availability · success
```

Tints are navigational, not decorative: skill constellations, project and
certificate categories (mapped by `tintForLabel()`, which hashes the label so
a category keeps its colour across the site and across rebuilds).

**Every text/background pair used on the site clears WCAG AA (4.5:1) in both
themes**, verified by measuring the tokens: the weakest pair is 7.56:1 in
Night and 4.77:1 in Porcelain. Metallic "gilded" text is used only at
display sizes, where the large-text threshold of 3:1 applies, and the light
theme's gold ramp is darkened so its palest stop still clears it.

### Motion

- **Starfield** (`star-field.tsx`) — a canvas behind every public page. Stars
  sit on a depth axis and parallax on scroll; near stars within reach of each
  other are joined by lines, so constellations form and dissolve as the field
  drifts; the cursor is a gravity well that pulls nearby stars and links to
  them; an occasional shooting star crosses the upper sky. Star count scales
  with viewport area and is capped; the loop stops while the tab is hidden;
  glow is pre-rendered to sprites rather than using `shadowBlur`.
- **Astrolabe** — degree bezel, counter-rotating ring of text, two orbiting
  stars and a scanning sweep. Pure SVG and CSS.
- **Hero name** — materialises word by word out of a blur, with no client
  JavaScript: each word is a reveal item in the heading's reveal group.
- **Decoding text** — the role line cycles through roles by scrambling through
  random glyphs before locking on; nav labels do the same on hover.
- **Constellations** — each skill category and each project gets a
  deterministic star figure (seeded from its name), whose lines trace
  themselves in as the card arrives.
- **Observation log** — hovering a project row on desktop summons a preview
  plate that trails the cursor.
- Plus the altitude gauge on the right edge of very wide screens, the
  counter-scrolling technology marquee (which deliberately keeps running under
  the pointer), the comet running down the education timeline, rotating
  certificate seals, gilded text shimmer and bracket frames that grow on hover.

### Layout rules that prevent shifting

- **Nothing sets `overflow` on `<html>` or `<body>`.** Horizontal clipping
  lives on an inner `.page-frame` wrapper. On `<html>` it blocked the body's
  overflow from reaching the viewport, so a modal scroll lock kept the
  scrollbar *and* added its width as margin (the page shook sideways on every
  theme change) and turned `<body>` into the sticky navbar's scroll container
  (the navbar vanished when the theme changed at the bottom of the page).
- **The theme control is a plain button**, not a menu: menus lock scrolling,
  a toggle has no reason to touch layout at all.
- **Decorative clipping uses `overflow: clip`, not `hidden`.** A hidden box is
  still scrollable by script, focus and find-in-page, which could scroll a
  section *inside itself* into its oversized glow.
- **The mobile menu's scroll lock pads the body by the scrollbar width** and
  releases itself if the window grows past the breakpoint.
- **One anchor offset** (`scroll-padding-top` on `<html>`) clears the
  floating navbar; sections add no scroll margin of their own.

Anything that controls whether content is *visible* is driven by CSS and
measurement, never by `requestAnimationFrame` or `IntersectionObserver` —
both stall in throttled renderers and would strand content at opacity 0. The
hidden state is scoped to `html.js` with a failsafe, so content is never lost
if JavaScript fails. `prefers-reduced-motion` freezes every loop, stops the
particle animation (a single still sky is drawn instead) and removes all
entrance transforms.

### Empty states are designed, not missing

A project without a cover image gets a generated star plate — its own
constellation, tinted by category, with a catalogue number. A certificate
without a scan gets a rotating seal engraved with the issuer's name. A
profile without a photo gets a gilded monogram inside the astrolabe. Sections
with no content hide themselves entirely.

## 10. Troubleshooting

**The site shows content I never entered.**
Supabase is not connected, or a query failed, so it fell back to seed content.
Check `/admin/settings` for a configuration report.

**`/admin` redirects me back to the login page.**
The session expired, Supabase is not configured, or the account is not on the
admin allowlist (the login page then says so). Run `npm run admin:setup`.

**Images do not load after uploading.**
`next.config.ts` derives its allowed image host from
`NEXT_PUBLIC_SUPABASE_URL`. If you changed that value, restart the dev server
or redeploy.

**Changes in the admin panel do not appear on the site.**
Saving revalidates the public routes. If you edited rows directly in the
Supabase table editor instead, wait for the hourly revalidation or redeploy.

**The contact form says it is not connected.**
It needs the Supabase variables and `supabase/setup.sql` applied.

**Messages arrive in the inbox but no email does.**
The inbox shows the reason on each message. Most often `CONTACT_NOTIFY_EMAIL` is not the
email that owns the Resend account behind `RESEND_API_KEY` (see
[Contact messages](#contact-messages-and-email-notifications)). **Settings → Send test email**
shows the exact error.

**Build fails on Vercel with a Supabase error.**
It should not — the build is designed to succeed without any Supabase
variables. Check the build log for the actual failing route.

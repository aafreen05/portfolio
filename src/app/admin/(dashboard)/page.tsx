import Link from "next/link";
import {
  Award,
  ExternalLink,
  FolderKanban,
  GraduationCap,
  Inbox,
  Plus,
  Star,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { PageBody, PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  adminGetCertificates,
  adminGetEducation,
  adminGetMessages,
  adminGetProfile,
  adminGetProjects,
  adminGetSkills,
} from "@/lib/admin/queries";
import { cn, relativeTime } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const [profile, projects, skills, education, certificates, messages] = await Promise.all([
    adminGetProfile(),
    adminGetProjects(),
    adminGetSkills(),
    adminGetEducation(),
    adminGetCertificates(),
    adminGetMessages(),
  ]);

  const unread = messages.filter((message) => message.status === "new");
  const published = projects.filter((project) => project.published);
  const drafts = projects.filter((project) => !project.published);
  const featured = projects.filter((project) => project.featured && project.published);

  /** One accent hue each, matching the colour coding on the public site. */
  const stats: {
    label: string;
    value: number;
    sub: string;
    href: string;
    icon: LucideIcon;
    ink: string;
    wash: string;
    ring: string;
  }[] = [
    {
      label: "Projects",
      value: published.length,
      sub: drafts.length > 0 ? `${drafts.length} in draft` : "all published",
      href: "/admin/projects",
      icon: FolderKanban,
      ink: "text-gold",
      wash: "bg-gold-soft",
      ring: "border-gold/30",
    },
    {
      label: "Messages",
      value: unread.length,
      sub: unread.length === 1 ? "unread message" : "unread messages",
      href: "/admin/messages",
      icon: Inbox,
      ink: "text-ember",
      wash: "bg-ember-soft",
      ring: "border-ember/30",
    },
    {
      label: "Skills",
      value: skills.filter((skill) => skill.enabled).length,
      sub: `of ${skills.length} total`,
      href: "/admin/skills",
      icon: Wrench,
      ink: "text-ice",
      wash: "bg-ice-soft",
      ring: "border-ice/30",
    },
    {
      label: "Certificates",
      value: certificates.filter((certificate) => certificate.published).length,
      sub: `${education.length} education ${education.length === 1 ? "entry" : "entries"}`,
      href: "/admin/certificates",
      icon: Award,
      ink: "text-sage",
      wash: "bg-sage-soft",
      ring: "border-sage/30",
    },
  ];

  return (
    <PageBody>
      <PageHeader
        title={`Welcome back, ${profile.name.split(" ")[0]}`}
        description="Everything on the public site is editable from here. Changes appear immediately after saving."
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <a href="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-3.5" aria-hidden />
                View site
              </a>
            </Button>
            <Button asChild size="sm">
              <Link href="/admin/projects/new">
                <Plus className="size-4" aria-hidden />
                New project
              </Link>
            </Button>
          </>
        }
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="frame frame-hover group relative p-5 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
          >
            <div className="flex items-center justify-between">
              <span className="label-mono">{stat.label}</span>
              <span
                className={cn(
                  "flex size-8 items-center justify-center border transition-transform duration-300 group-hover:scale-110",
                  stat.ring,
                  stat.wash,
                )}
              >
                <stat.icon className={cn("size-4", stat.ink)} aria-hidden />
              </span>
            </div>
            <p className={cn("numeric mt-5 text-5xl leading-none", stat.ink)}>{String(stat.value).padStart(2, "0")}</p>
            <p className="mt-2 text-xs text-muted-foreground">{stat.sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
            <h2 className="font-display text-base font-bold tracking-tight">Recent messages</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/messages">View all</Link>
            </Button>
          </div>

          {messages.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No messages yet"
              description="Contact form submissions will appear here."
              className="m-5 border-0 py-10"
            />
          ) : (
            <ul>
              {messages.slice(0, 5).map((message) => (
                <li key={message.id} className="border-b border-border last:border-0">
                  <Link
                    href="/admin/messages"
                    className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-secondary/50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{message.name}</span>
                        {message.status === "new" ? (
                          <Badge variant="accent" size="sm">
                            New
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {message.subject}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-[0.688rem] text-muted-foreground">
                      {relativeTime(message.created_at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
            <h2 className="font-display text-base font-bold tracking-tight">Featured on the home page</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/projects">Manage</Link>
            </Button>
          </div>

          {featured.length === 0 ? (
            <EmptyState
              icon={Star}
              title="Nothing featured"
              description="Mark a published project as featured and it will lead the home page."
              className="m-5 border-0 py-10"
            />
          ) : (
            <ul>
              {featured.slice(0, 5).map((project) => (
                <li key={project.id} className="border-b border-border last:border-0">
                  <Link
                    href={`/admin/projects/${project.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-secondary/50"
                  >
                    <Star className="size-3.5 shrink-0 fill-gold text-gold" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{project.title}</p>
                      <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                        /{project.slug}
                      </p>
                    </div>
                    <Badge variant="outline" size="sm" className="shrink-0">
                      {project.category}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {education.length === 0 ? (
        <section className="mt-6 rounded-2xl border border-dashed border-border p-6">
          <div className="flex items-start gap-3">
            <GraduationCap className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
            <div>
              <p className="text-sm font-medium">Add your education</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                The Education section is empty, so it is hidden on the site.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link href="/admin/education">Add education</Link>
              </Button>
            </div>
          </div>
        </section>
      ) : null}
    </PageBody>
  );
}

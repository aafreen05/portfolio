import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { WordsReveal } from "@/components/motion/words-reveal";
import { GithubIcon } from "@/components/site/brand-icons";
import { ProjectCard } from "@/components/site/project-card";
import { ProjectPlate } from "@/components/site/project-plate";
import { Sparkle } from "@/components/site/sparkle";
import { Badge, tintForLabel } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProjectBySlug, getProjects } from "@/lib/queries";
import type { Project } from "@/lib/types";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 3600;
/** Any slug not pre-rendered is generated on first request, then cached. */
export const dynamicParams = true;

const NUMERALS = ["I", "II", "III"];

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return { title: "Project not found", robots: { index: false, follow: false } };
  }

  const url = `/projects/${project.slug}`;

  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: project.title,
      description: project.summary,
      url: absoluteUrl(url),
      images: project.cover_url ? [{ url: project.cover_url, alt: project.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.summary,
      images: project.cover_url ? [project.cover_url] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const all = await getProjects();
  const position = Math.max(0, all.findIndex((item) => item.slug === project.slug));
  const related = all.filter((item) => item.slug !== project.slug).slice(0, 2);
  const tint = tintForLabel(project.category);

  const sections = [
    { key: "overview", label: "Overview", body: project.overview },
    { key: "problem", label: "The problem", body: project.problem },
    { key: "solution", label: "The approach", body: project.solution },
  ].filter((section) => Boolean(section.body));

  return (
    <article data-label="Case study" className="pb-28 sm:pb-32">
      <ProjectJsonLd project={project} />

      <header className="section-shell relative pt-10 sm:pt-14">
        <Reveal>
          <Link
            href="/projects"
            className="group inline-flex items-center gap-3 font-mono text-[0.6875rem] tracking-[0.16em] text-muted-foreground uppercase transition-colors hover:text-gold focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
          >
            <ArrowLeft className="size-3.5 transition-transform duration-500 group-hover:-translate-x-1" aria-hidden />
            Observation log
          </Link>
        </Reveal>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.4fr_0.6fr] lg:items-end lg:gap-16">
          <div className="min-w-0">
            <Reveal from="blur">
              <div className="flex flex-wrap items-center gap-3">
                <span className="kicker text-gold">Entry {String(position + 1).padStart(2, "0")}</span>
                <span aria-hidden className="h-px w-8 bg-gold/50" />
                <Badge variant={tint} size="sm">
                  {project.category}
                </Badge>
                {project.year ? <span className="numeric text-base text-muted-foreground">{project.year}</span> : null}
              </div>
            </Reveal>

            <h1
              data-reveal-group=""
              data-reveal-stagger="0.05"
              className="serif-display mt-6 text-[clamp(2.4rem,5.4vw,4.5rem)] leading-[1.06] text-balance"
            >
              <WordsReveal text={project.title} />
            </h1>

            <Reveal delay={0.25}>
              <p className="mt-7 max-w-2xl text-[0.9375rem] leading-[1.85] text-muted-foreground sm:text-base">
                {project.summary}
              </p>
            </Reveal>

            {project.github_url || project.demo_url ? (
              <Reveal delay={0.35}>
                <div className="mt-10 flex flex-wrap gap-3">
                  {project.demo_url ? (
                    <Button asChild variant="gilded" size="lg">
                      <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                        Live demo
                        <ArrowUpRight aria-hidden />
                      </a>
                    </Button>
                  ) : null}
                  {project.github_url ? (
                    <Button asChild variant="bracket" size="lg">
                      <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                        <GithubIcon className="size-3.5" />
                        View source
                      </a>
                    </Button>
                  ) : null}
                </div>
              </Reveal>
            ) : null}
          </div>

          <Reveal delay={0.2} from="right" className="min-w-0">
            <dl className="frame relative">
              {project.role ? (
                <div className="border-b border-border px-6 py-5">
                  <dt className="kicker">Role</dt>
                  <dd className="mt-2 text-sm font-semibold">{project.role}</dd>
                </div>
              ) : null}
              {project.year ? (
                <div className="border-b border-border px-6 py-5">
                  <dt className="kicker">Year</dt>
                  <dd className="numeric mt-1 text-3xl">{project.year}</dd>
                </div>
              ) : null}
              {project.technologies.length > 0 ? (
                <div className="px-6 py-5">
                  <dt className="kicker">Instruments</dt>
                  <dd className="mt-3">
                    <ul className="flex flex-wrap gap-1.5">
                      {project.technologies.map((tech) => (
                        <li key={tech}>
                          <Badge variant="outline" size="sm">
                            {tech}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ) : null}
            </dl>
          </Reveal>
        </div>
      </header>

      <Reveal from="scale" delay={0.1} className="section-shell mt-16">
        <div className="frame relative aspect-[16/9] overflow-hidden sm:aspect-[21/9]">
          {project.cover_url ? (
            <Image
              src={project.cover_url}
              alt={`${project.title} cover image`}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 78rem"
              className="object-cover"
            />
          ) : (
            <ProjectPlate
              slug={project.slug}
              title={project.title}
              category={project.category}
              index={position}
              starCount={Math.max(5, Math.min(9, project.technologies.length + 2))}
              size="large"
            />
          )}
        </div>
      </Reveal>

      <div className="section-shell mt-24 grid gap-16 lg:grid-cols-[1.4fr_0.6fr] lg:gap-16">
        {/* Spacing lives on this container: each section is the only child of
            its Reveal wrapper, so a `last:` margin variant would match them all. */}
        <div className="flex min-w-0 flex-col gap-16">
          {sections.map((section, index) => (
            <Reveal key={section.key} delay={index * 0.05}>
              <section>
                <h2 className="flex items-baseline gap-5">
                  <span className="serif-italic text-gilded text-4xl leading-none">{NUMERALS[index]}</span>
                  <span className="wide-caps text-base">{section.label}</span>
                </h2>
                <div className="mt-6 flex flex-col gap-5 border-l border-gold/35 pl-7">
                  {section.body!
                    .split(/\n\s*\n/)
                    .filter(Boolean)
                    .map((paragraph, i) => (
                      <p key={i} className="leading-[1.95] text-muted-foreground">
                        {paragraph}
                      </p>
                    ))}
                </div>
              </section>
            </Reveal>
          ))}
        </div>

        {project.features.length > 0 ? (
          <Reveal delay={0.1} from="right" className="min-w-0">
            <div className="frame relative p-7 lg:sticky lg:top-28">
              <h2 className="kicker flex items-center gap-2">
                <Sparkle className="size-2.5 text-gold" />
                Key features
              </h2>
              <RevealGroup as="ul" className="mt-6 flex flex-col">
                {project.features.map((feature) => (
                  <RevealItem
                    as="li"
                    key={feature}
                    className="flex items-start gap-3 border-t border-border py-4 first:border-t-0 first:pt-0"
                  >
                    <Sparkle className="mt-1.5 size-2.5 text-gold" />
                    <span className="text-sm leading-relaxed">{feature}</span>
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>
          </Reveal>
        ) : null}
      </div>

      {project.images && project.images.length > 0 ? (
        <div className="section-shell mt-24">
          <Reveal>
            <h2 className="flex items-baseline gap-4">
              <span className="wide-caps text-lg">Plates</span>
              <span className="kicker">{String(project.images.length).padStart(2, "0")} screenshots</span>
            </h2>
          </Reveal>
          <RevealGroup as="ul" className="mt-8 grid gap-6 sm:grid-cols-2">
            {project.images.map((image) => (
              <RevealItem as="li" key={image.id}>
                <figure className="group">
                  <div className="frame relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={image.url}
                      alt={image.alt || `${project.title} screenshot`}
                      fill
                      sizes="(max-width: 640px) 100vw, 38rem"
                      className="object-cover transition-transform duration-1000 group-hover:scale-[1.04]"
                    />
                  </div>
                  {image.caption ? (
                    <figcaption className="mt-3 font-mono text-[0.6875rem] leading-relaxed text-muted-foreground">
                      {image.caption}
                    </figcaption>
                  ) : null}
                </figure>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      ) : null}

      {related.length > 0 ? (
        <div className="section-shell mt-28 border-t border-border pt-16">
          <Reveal>
            <h2 className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <span className="wide-caps text-xl">More</span>
              <span className="serif-italic text-gilded text-[2.1rem]">observations</span>
            </h2>
          </Reveal>
          <RevealGroup as="div" className="mt-10 grid gap-5 sm:grid-cols-2">
            {related.map((item) => (
              <RevealItem key={item.id}>
                <ProjectCard project={item} index={all.indexOf(item)} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      ) : null}
    </article>
  );
}

function ProjectJsonLd({ project }: { project: Project }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    headline: project.title,
    description: project.summary,
    url: absoluteUrl(`/projects/${project.slug}`),
    image: project.cover_url ?? undefined,
    dateCreated: project.year ?? undefined,
    keywords: project.technologies.join(", "),
    author: { "@type": "Person", name: "Aafreen Begam H", url: absoluteUrl() },
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

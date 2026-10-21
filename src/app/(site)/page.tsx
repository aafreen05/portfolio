import { AboutSection } from "@/components/site/about-section";
import { CertificatesSection } from "@/components/site/certificates-section";
import { ContactSection } from "@/components/site/contact-section";
import { EducationSection } from "@/components/site/education-section";
import { Hero } from "@/components/site/hero";
import { ProjectsSection } from "@/components/site/projects-section";
import { SkillsSection } from "@/components/site/skills-section";
import { TechMarquee } from "@/components/site/tech-marquee";
import { getFeaturedProjects, getPortfolioContent } from "@/lib/queries";
import { absoluteUrl } from "@/lib/utils";

/** Content is served from cache and refreshed hourly; admin saves purge it. */
export const revalidate = 3600;

export default async function HomePage() {
  const content = await getPortfolioContent();
  const featured = await getFeaturedProjects();
  const hasResume = Boolean(content.resume.file_url);

  /** Real counts from real content — never padded to look impressive. */
  const stats = [
    { label: "Projects", value: content.projects.length },
    { label: "Skills", value: content.skills.length },
    { label: "Certificates", value: content.certificates.length },
  ].filter((stat) => stat.value > 0);

  /**
   * What she actually works with. Project technologies first (evidence of
   * use), topped up with listed skills, de-duplicated.
   */
  const marquee = Array.from(
    new Set([
      ...content.projects.flatMap((project) => project.technologies),
      ...content.skills.map((skill) => skill.name),
    ]),
  ).slice(0, 18);

  return (
    <>
      <JsonLd content={content} />

      <Hero
        hero={content.hero}
        profile={content.profile}
        socials={content.socials}
        hasResume={hasResume}
        stats={stats}
      />
      <TechMarquee items={marquee} />
      <AboutSection about={content.about} education={content.education} name={content.profile.name} />
      <SkillsSection skills={content.skills} />
      <ProjectsSection projects={featured} totalCount={content.projects.length} />
      <EducationSection education={content.education} />
      <CertificatesSection certificates={content.certificates} />
      <ContactSection
        profile={content.profile}
        settings={content.settings}
        socials={content.socials}
      />
    </>
  );
}

/** Person + WebSite structured data for richer search results. */
function JsonLd({ content }: { content: Awaited<ReturnType<typeof getPortfolioContent>> }) {
  const { profile, education, skills, socials, settings } = content;
  const current = education.find((entry) => entry.current) ?? education[0];

  const graph = [
    {
      "@type": "Person",
      "@id": `${absoluteUrl()}/#person`,
      name: profile.name,
      jobTitle: profile.role_title,
      description: profile.bio,
      email: profile.email ? `mailto:${profile.email}` : undefined,
      url: absoluteUrl(),
      image: profile.avatar_url ?? undefined,
      address: profile.location
        ? { "@type": "PostalAddress", addressLocality: profile.location }
        : undefined,
      alumniOf: current
        ? {
            "@type": "CollegeOrUniversity",
            name: current.institution,
            address: current.location
              ? { "@type": "PostalAddress", addressLocality: current.location }
              : undefined,
          }
        : undefined,
      knowsAbout: skills.slice(0, 20).map((skill) => skill.name),
      sameAs: socials
        .filter((link) => link.url.startsWith("http"))
        .map((link) => link.url),
    },
    {
      "@type": "WebSite",
      "@id": `${absoluteUrl()}/#website`,
      url: absoluteUrl(),
      name: settings.site_title,
      description: settings.site_description,
      inLanguage: "en",
      publisher: { "@id": `${absoluteUrl()}/#person` },
    },
  ];

  return (
    <script
      type="application/ld+json"
      // Structured data is built from our own content, not user input.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
      }}
    />
  );
}

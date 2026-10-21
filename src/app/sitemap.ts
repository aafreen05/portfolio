import type { MetadataRoute } from "next";

import { getProjects } from "@/lib/queries";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  const now = new Date();

  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "monthly", priority: 1 },
    {
      url: absoluteUrl("/projects"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...projects.map((project) => ({
      url: absoluteUrl(`/projects/${project.slug}`),
      lastModified: project.updated_at ? new Date(project.updated_at) : now,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}

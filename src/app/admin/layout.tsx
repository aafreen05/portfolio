import type { Metadata } from "next";

/**
 * Admin routes are never indexed. This sits on the segment root so it applies
 * to the sign-in page as well as the dashboard, and is reinforced by an
 * `X-Robots-Tag` header in `next.config.ts` and a Disallow in robots.txt.
 */
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s — Admin" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}

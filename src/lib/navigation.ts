/** Single source of truth for the public navigation and scroll-spy. */
export const NAV_SECTIONS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "education", label: "Education" },
  { id: "certificates", label: "Certificates" },
  { id: "contact", label: "Contact" },
] as const;

export type NavSectionId = (typeof NAV_SECTIONS)[number]["id"];

/**
 * Section links are in-page anchors on the home page and absolute links
 * everywhere else, so the nav works identically from a project detail page.
 */
export function sectionHref(id: NavSectionId, isHome: boolean) {
  if (id === "home") return isHome ? "#home" : "/";
  return isHome ? `#${id}` : `/#${id}`;
}

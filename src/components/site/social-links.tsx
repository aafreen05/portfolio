import { FALLBACK_SOCIAL_ICON, SOCIAL_ICONS } from "@/components/site/brand-icons";
import type { SocialLink } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SocialLinksProps {
  links: SocialLink[];
  className?: string;
  size?: "sm" | "default";
}

/**
 * Square bracketed glyphs. Only configured links render — an unfilled
 * platform never produces an empty icon.
 */
export function SocialLinks({ links, className, size = "default" }: SocialLinksProps) {
  if (links.length === 0) return null;

  return (
    <ul className={cn("flex flex-wrap items-center gap-2", className)}>
      {links.map((link) => {
        const Icon = SOCIAL_ICONS[link.platform] ?? FALLBACK_SOCIAL_ICON;
        const isMail = link.url.startsWith("mailto:");

        return (
          <li key={link.id}>
            <a
              href={link.url}
              target={isMail ? undefined : "_blank"}
              rel={isMail ? undefined : "noopener noreferrer"}
              aria-label={link.label}
              title={link.label}
              className={cn(
                "brackets flex items-center justify-center text-muted-foreground",
                "hover:-translate-y-0.5 hover:text-gold",
                "focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
                size === "sm" ? "size-8" : "size-10",
              )}
            >
              <Icon className={size === "sm" ? "size-3.5" : "size-4"} aria-hidden />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

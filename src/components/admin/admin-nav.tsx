"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  FileText,
  FolderKanban,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  Link2,
  Search,
  Settings,
  Sparkles,
  User,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Count badge, used for unread messages. */
  count?: number;
}

const GROUPS: { label: string; items: Omit<NavItem, "count">[] }[] = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/profile", label: "Profile", icon: User },
      { href: "/admin/hero", label: "Hero", icon: Sparkles },
      { href: "/admin/about", label: "About", icon: FileText },
      { href: "/admin/skills", label: "Skills", icon: Wrench },
      { href: "/admin/projects", label: "Projects", icon: FolderKanban },
      { href: "/admin/education", label: "Education", icon: GraduationCap },
      { href: "/admin/certificates", label: "Certificates", icon: Award },
    ],
  },
  {
    label: "Manage",
    items: [
      { href: "/admin/messages", label: "Messages", icon: Inbox },
      { href: "/admin/resume", label: "Resume", icon: FileText },
      { href: "/admin/social-links", label: "Social Links", icon: Link2 },
      { href: "/admin/seo", label: "SEO", icon: Search },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AdminNav({
  unreadCount = 0,
  onNavigate,
}: {
  unreadCount?: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin sections" className="flex flex-col gap-6">
      {GROUPS.map((group) => (
        <div key={group.label}>
          <p className="label-mono px-3">{group.label}</p>
          <ul className="mt-2 flex flex-col gap-0.5">
            {group.items.map((item) => {
              // Only the dashboard needs an exact match; the rest match their subtree.
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const count = item.href === "/admin/messages" ? unreadCount : 0;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-2.5 border-l-2 px-3 py-2 text-sm transition-all duration-300",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      isActive
                        ? "border-gold bg-gold-soft font-semibold text-gold"
                        : "border-transparent text-muted-foreground hover:translate-x-0.5 hover:bg-secondary/60 hover:text-foreground",
                    )}
                  >
                    <item.icon
                      className={cn("size-4 shrink-0 transition-transform duration-300", isActive ? "text-gold" : "group-hover:scale-110")}
                      aria-hidden
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    {count > 0 ? (
                      <Badge variant="accent" size="sm" className="font-mono">
                        {count}
                      </Badge>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

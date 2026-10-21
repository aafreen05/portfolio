"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink, LogOut, Menu, X } from "lucide-react";

import { AdminNav } from "@/components/admin/admin-nav";
import { Sparkle } from "@/components/site/sparkle";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

interface AdminShellProps {
  email: string;
  unreadCount: number;
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
}

function Brand() {
  return (
    <Link href="/admin" className="group flex items-center gap-2.5">
      <Sparkle className="size-3.5 text-gold transition-transform duration-700 group-hover:rotate-90" />
      <span className="font-wide text-[0.6875rem] font-semibold tracking-[0.16em] uppercase">
        Control room
      </span>
    </Link>
  );
}

export function AdminShell({ email, unreadCount, signOutAction, children }: AdminShellProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* Mobile bar */}
      <header className="glass sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-border px-4 lg:hidden">
        <Brand />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="bracket"
            size="icon-sm"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X aria-hidden /> : <Menu aria-hidden />}
          </Button>
        </div>
      </header>

      {menuOpen ? (
        <div className="border-b border-border bg-card px-4 py-5 lg:hidden">
          <AdminNav unreadCount={unreadCount} onNavigate={() => setMenuOpen(false)} />
          <SidebarFooter email={email} signOutAction={signOutAction} className="mt-6" />
        </div>
      ) : null}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center justify-between gap-2 border-b border-border px-5">
          <Brand />
          <ThemeToggle />
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-6">
          <AdminNav unreadCount={unreadCount} />
        </div>

        <SidebarFooter email={email} signOutAction={signOutAction} className="border-t border-border p-4" />
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}

function SidebarFooter({
  email,
  signOutAction,
  className,
}: {
  email: string;
  signOutAction: () => Promise<void>;
  className?: string;
}) {
  return (
    <div className={className}>
      <Button asChild variant="ghost" size="sm" className="w-full justify-start">
        <a href="/" target="_blank" rel="noopener noreferrer">
          <ExternalLink aria-hidden />
          View live site
        </a>
      </Button>

      <div className="mt-3 border border-border bg-secondary/60 px-3 py-2.5">
        <p className="label-mono">Signed in</p>
        <p className="mt-1 truncate text-xs font-medium" title={email}>
          {email}
        </p>
      </div>

      <form action={signOutAction} className="mt-2">
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
        >
          <LogOut aria-hidden />
          Sign out
        </Button>
      </form>
    </div>
  );
}

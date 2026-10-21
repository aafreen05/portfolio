import { Activity, CheckCircle2, Database, Mail, TriangleAlert } from "lucide-react";

import { saveSettings } from "@/app/admin/_actions/content";
import { PingDatabaseButton, SendTestEmailButton } from "@/app/admin/(dashboard)/settings/system-actions";
import { AdminForm, SaveBar } from "@/components/admin/admin-form";
import { FormCard, TextAreaField, TextField } from "@/components/admin/form-fields";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { adminGetKeepAlive, adminGetSettings } from "@/lib/admin/queries";
import { getNotificationConfig } from "@/lib/email/contact-notification";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { KeepAlivePing } from "@/lib/types";
import { cn, formatDateTime, relativeTime } from "@/lib/utils";

export const metadata = { title: "Settings" };

/** Supabase pauses after 7 idle days; flag anything older than 5. */
const STALE_AFTER_MS = 5 * 24 * 60 * 60 * 1000;

function isStale(iso: string) {
  return Date.now() - new Date(iso).getTime() > STALE_AFTER_MS;
}

/** The most recent ping from any source, or null. */
function latestPing(pings: KeepAlivePing[]) {
  return pings.reduce<string | null>(
    (latest, ping) => (!latest || ping.pinged_at > latest ? ping.pinged_at : latest),
    null,
  );
}

const SCHEDULERS: { source: KeepAlivePing["source"]; label: string; cadence: string; hint: string }[] = [
  {
    source: "vercel-cron",
    label: "Vercel Cron",
    cadence: "daily",
    hint: "Starts automatically once the site is deployed on Vercel (vercel.json).",
  },
  {
    source: "github-actions",
    label: "GitHub Actions",
    cadence: "every 4 days",
    hint: "Runs from .github/workflows/supabase-keep-alive.yml once the code is on GitHub.",
  },
];

export default async function AdminSettingsPage() {
  const [settings, pings] = await Promise.all([adminGetSettings(), adminGetKeepAlive()]);
  const notify = getNotificationConfig();
  const lastActivity = latestPing(pings);

  const checks = [
    {
      label: "Supabase connection",
      ok: isSupabaseConfigured,
      detail: isSupabaseConfigured
        ? "Connected — content is read from and written to your database."
        : "Not configured. The site is serving its built-in seed content.",
    },
    {
      label: "Service role key",
      ok: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      detail: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
        ? "Present. Contact messages are written with elevated privileges."
        : "Not set. Contact messages fall back to the anon key, which the RLS policy allows.",
    },
    {
      label: "Public site URL",
      ok: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
      detail: process.env.NEXT_PUBLIC_SITE_URL
        ? `Canonical URLs and the sitemap use ${process.env.NEXT_PUBLIC_SITE_URL}`
        : "Not set. Canonical URLs fall back to localhost — set this before deploying.",
    },
    {
      label: "Cron secret",
      ok: Boolean(process.env.CRON_SECRET),
      detail: process.env.CRON_SECRET
        ? "Set. Vercel's scheduled keep-alive calls are authenticated."
        : "Not set. Keep-alive still works, but set CRON_SECRET so Vercel's calls are authenticated.",
    },
  ];

  return (
    <PageBody>
      <PageHeader
        title="Settings"
        description="Contact and footer copy, plus a check on how this deployment is configured."
      />

      <AdminForm action={saveSettings} className="mt-8">
        {/* SEO fields live on their own page; carried through so one save writes the whole row. */}
        <input type="hidden" name="site_title" value={settings.site_title} />
        <input type="hidden" name="site_description" value={settings.site_description} />
        <input type="hidden" name="keywords" value={JSON.stringify(settings.keywords)} />
        <input type="hidden" name="og_image_url" value={settings.og_image_url ?? ""} />
        <input type="hidden" name="twitter_handle" value={settings.twitter_handle ?? ""} />

        <FormCard title="Contact section">
          <TextField
            name="contact_heading"
            label="Heading"
            defaultValue={settings.contact_heading}
            required
            hint='Set in the serif display face; the word "together." follows it in handwritten script.'
          />
          <TextAreaField
            name="contact_body"
            label="Body"
            defaultValue={settings.contact_body}
            rows={3}
            required
            hint="Set expectations here — what you are open to, and how quickly you reply."
          />
        </FormCard>

        <FormCard title="Footer">
          <TextAreaField
            name="footer_note"
            label="Footer note"
            defaultValue={settings.footer_note}
            rows={2}
            hint="A small line opposite the copyright. Leave empty to hide it."
          />
        </FormCard>

        <SaveBar />
      </AdminForm>

      <section className="mt-10 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-center gap-2.5 border-b border-border pb-4">
          <Database className="size-4 text-accent" aria-hidden />
          <h2 className="font-display text-base font-bold tracking-tight">Deployment</h2>
        </div>

        <ul className="flex flex-col gap-4 pt-5">
          {checks.map((check) => (
            <li key={check.label} className="flex items-start gap-3">
              {check.ok ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--success)]" aria-hidden />
              ) : (
                <TriangleAlert
                  className="mt-0.5 size-4 shrink-0 text-[color-mix(in_oklab,var(--warning)_80%,var(--foreground))]"
                  aria-hidden
                />
              )}
              <div className="min-w-0">
                <p className={cn("text-sm font-medium", !check.ok && "text-foreground")}>
                  {check.label}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {check.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-6 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
          Environment variables are set in <code className="font-mono">.env.local</code> for local
          development, and in the Vercel project settings for preview and production. Changing them
          requires a restart or a redeploy.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <Mail className="size-4 text-accent" aria-hidden />
            <h2 className="font-display text-base font-bold tracking-tight">Email notifications</h2>
          </div>
          <SendTestEmailButton disabled={!notify.configured} />
        </div>

        <div className="flex items-start gap-3 pt-5">
          {notify.configured ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--success)]" aria-hidden />
          ) : (
            <TriangleAlert
              className="mt-0.5 size-4 shrink-0 text-[color-mix(in_oklab,var(--warning)_80%,var(--foreground))]"
              aria-hidden
            />
          )}
          <div className="min-w-0 text-sm">
            {notify.configured ? (
              <>
                <p className="font-medium">
                  Every new message is emailed to <span className="font-mono text-xs">{notify.to}</span>
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Sent from <span className="font-mono">{notify.from}</span>. Reply in your mail app to
                  answer the visitor directly. Messages are saved to the inbox either way.
                  {notify.usingTestSender
                    ? " This is Resend's default sender, which only delivers to the email address that owns the Resend account — so the address above must be that account's email."
                    : null}
                </p>
              </>
            ) : (
              <>
                <p className="font-medium">Not configured</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Set RESEND_API_KEY and CONTACT_NOTIFY_EMAIL to be emailed about new messages. They
                  are still saved to the inbox without them.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <Activity className="size-4 text-accent" aria-hidden />
            <h2 className="font-display text-base font-bold tracking-tight">Database keep-alive</h2>
          </div>
          <PingDatabaseButton />
        </div>

        <p className="pt-4 text-xs leading-relaxed text-muted-foreground">
          Free Supabase projects pause after a week without activity. Two independent schedulers
          write to the database to prevent that.{" "}
          {lastActivity ? (
            <span className={cn(isStale(lastActivity) && "font-medium text-destructive")}>
              Last activity {relativeTime(lastActivity)}.
            </span>
          ) : (
            "No ping recorded yet."
          )}
        </p>

        <ul className="flex flex-col gap-4 pt-4">
          {SCHEDULERS.map((scheduler) => {
            const ping = pings.find((entry) => entry.source === scheduler.source);
            const stale = ping ? isStale(ping.pinged_at) : true;
            return (
              <li key={scheduler.source} className="flex items-start gap-3">
                {ping && !stale ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--success)]" aria-hidden />
                ) : (
                  <TriangleAlert
                    className="mt-0.5 size-4 shrink-0 text-[color-mix(in_oklab,var(--warning)_80%,var(--foreground))]"
                    aria-hidden
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {scheduler.label} <span className="font-normal text-muted-foreground">· {scheduler.cadence}</span>
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {ping
                      ? `Last ping ${relativeTime(ping.pinged_at)} (${formatDateTime(ping.pinged_at)}) · ${ping.ping_count} in total.`
                      : `No ping yet. ${scheduler.hint}`}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </PageBody>
  );
}

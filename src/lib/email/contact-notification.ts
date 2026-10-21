import "server-only";

import { absoluteUrl } from "@/lib/utils";

/**
 * Emails a new contact-form message to the site owner through Resend.
 *
 * The message is always saved to Supabase first — the admin inbox is the
 * source of truth — so an email failure never loses a message; it is only
 * recorded against it. Talks to Resend's REST API with `fetch`, so there is
 * no SDK dependency.
 *
 * Env:
 *   RESEND_API_KEY        required to send
 *   CONTACT_NOTIFY_EMAIL  the inbox that receives notifications
 *   RESEND_FROM_EMAIL     optional sender; defaults to Resend's shared test
 *                         sender, which only delivers to the address that owns
 *                         the Resend account. Verify a domain in Resend to send
 *                         from your own address.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "Portfolio <onboarding@resend.dev>";

export interface ContactNotification {
  /** Message id — makes retries idempotent on Resend's side. */
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt?: Date;
}

export type NotifyResult =
  | { status: "sent"; id: string }
  | { status: "skipped"; reason: string }
  | { status: "failed"; error: string };

export interface NotificationConfig {
  configured: boolean;
  to: string;
  from: string;
  usingTestSender: boolean;
}

export function getNotificationConfig(): NotificationConfig {
  const to = (process.env.CONTACT_NOTIFY_EMAIL ?? "").trim();
  const from = (process.env.RESEND_FROM_EMAIL ?? "").trim() || DEFAULT_FROM;
  return {
    configured: Boolean((process.env.RESEND_API_KEY ?? "").trim() && to),
    to,
    from,
    usingTestSender: from === DEFAULT_FROM,
  };
}

export async function sendContactNotification(
  message: ContactNotification,
  { test = false }: { test?: boolean } = {},
): Promise<NotifyResult> {
  const apiKey = (process.env.RESEND_API_KEY ?? "").trim();
  const { to, from } = getNotificationConfig();

  if (!apiKey) return { status: "skipped", reason: "RESEND_API_KEY is not set." };
  if (!to) return { status: "skipped", reason: "CONTACT_NOTIFY_EMAIL is not set." };

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  if (message.id) headers["Idempotency-Key"] = `contact-message-${message.id}`;

  const subject = `${test ? "[Test] " : ""}New message: ${oneLine(message.subject)}`.slice(0, 200);

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        from,
        to: [to],
        // "Reply" in the mail client answers the visitor directly.
        reply_to: message.email,
        subject,
        html: renderHtml(message, test),
        text: renderText(message, test),
        tags: [{ name: "category", value: test ? "contact_test" : "contact_form" }],
      }),
      signal: AbortSignal.timeout(10_000),
    });

    const body = (await response.json().catch(() => ({}))) as { id?: string; message?: string };

    if (!response.ok) {
      return { status: "failed", error: body.message ?? `Resend responded with HTTP ${response.status}.` };
    }
    return { status: "sent", id: body.id ?? "" };
  } catch (error) {
    return { status: "failed", error: error instanceof Error ? error.message : String(error) };
  }
}

/* ---------------------------------------------------------------- render */

function oneLine(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Received time in India Standard Time — the owner reads these in Thanjavur. */
function receivedAt(date: Date) {
  return `${date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  })} IST`;
}

/** The address is already validated as an email, so it goes in unencoded. */
function replyHref(message: ContactNotification) {
  return `mailto:${message.email}?subject=${encodeURIComponent(`Re: ${oneLine(message.subject)}`)}`;
}

function renderText(message: ContactNotification, test: boolean) {
  return [
    test ? "This is a test notification sent from the admin Settings page.\n" : "",
    `New message from ${message.name} via the portfolio contact form.`,
    "",
    `From:     ${message.name} <${message.email}>`,
    `Subject:  ${oneLine(message.subject)}`,
    `Received: ${receivedAt(message.createdAt ?? new Date())}`,
    "",
    message.message,
    "",
    "—",
    `Reply to this email to answer ${message.name} directly.`,
    `Admin inbox: ${absoluteUrl("/admin/messages")}`,
  ]
    .filter((line, index) => index !== 0 || line)
    .join("\n");
}

function renderHtml(message: ContactNotification, test: boolean) {
  const name = escapeHtml(message.name);
  const email = escapeHtml(message.email);
  const subject = escapeHtml(oneLine(message.subject));
  const body = escapeHtml(message.message);
  const inbox = escapeHtml(absoluteUrl("/admin/messages"));
  const reply = escapeHtml(replyHref(message));
  const when = escapeHtml(receivedAt(message.createdAt ?? new Date()));

  const label = "font:600 11px/1.4 Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#8a7440;padding:6px 16px 6px 0;vertical-align:top;white-space:nowrap";
  const value = "font:14px/1.5 Arial,sans-serif;color:#111327;padding:6px 0;vertical-align:top";

  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:#f4f2ec">
  <div style="display:none;max-height:0;overflow:hidden">${name}: ${subject}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ec;padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e6e1d4">
        <tr><td style="height:4px;background:linear-gradient(90deg,#b88a3e,#e6c27a,#b88a3e)"></td></tr>
        <tr><td style="padding:28px 32px 8px">
          ${test ? `<p style="margin:0 0 16px;padding:8px 12px;background:#fff6e0;border:1px solid #ecd9a8;font:13px/1.5 Arial,sans-serif;color:#6b5320">Test notification sent from the admin Settings page — delivery is working.</p>` : ""}
          <p style="margin:0;font:600 11px/1.4 Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#8a7440">New message · Portfolio contact form</p>
          <h1 style="margin:10px 0 0;font:600 24px/1.25 Georgia,'Times New Roman',serif;color:#111327">${subject}</h1>
        </td></tr>
        <tr><td style="padding:16px 32px 0">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr><td style="${label}">From</td><td style="${value}">${name} &lt;<a href="mailto:${email}" style="color:#1e4f8f">${email}</a>&gt;</td></tr>
            <tr><td style="${label}">Received</td><td style="${value}">${when}</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:20px 32px 0">
          <div style="border-left:3px solid #e6c27a;background:#faf8f3;padding:16px 18px;font:15px/1.65 Arial,sans-serif;color:#111327;white-space:pre-wrap">${body}</div>
        </td></tr>
        <tr><td style="padding:24px 32px 28px">
          <a href="${reply}" style="display:inline-block;background:#111327;color:#ffffff;text-decoration:none;font:600 13px/1 Arial,sans-serif;letter-spacing:.06em;padding:13px 20px">Reply to ${name}</a>
          <a href="${inbox}" style="display:inline-block;margin-left:8px;border:1px solid #d9d2c0;color:#111327;text-decoration:none;font:600 13px/1 Arial,sans-serif;letter-spacing:.06em;padding:12px 18px">Open admin inbox</a>
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid #eee9dd;font:12px/1.5 Arial,sans-serif;color:#6b6a7a">
          Replying to this email answers ${name} directly. The message is also saved in your admin inbox.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

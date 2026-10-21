"use server";

import { headers } from "next/headers";
import { after } from "next/server";

import { sendContactNotification } from "@/lib/email/contact-notification";
import { createServiceClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { contactSchema } from "@/lib/validations";

export interface ContactResult {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Best-effort in-memory throttle.
 *
 * Serverless instances are not shared, so this is a speed bump rather than a
 * guarantee — it stops a single client hammering one instance. Combined with
 * the honeypot and the minimum message length it removes most casual spam.
 * For a hard limit, front the route with Vercel Firewall rate limiting.
 */
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const attempts = new Map<string, number[]>();

function isRateLimited(key: string) {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((time) => now - time < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX) {
    attempts.set(key, recent);
    return true;
  }

  recent.push(now);
  attempts.set(key, recent);

  // Keep the map from growing without bound on a long-lived instance.
  if (attempts.size > 5000) {
    for (const [mapKey, times] of attempts) {
      if (times.every((time) => now - time > RATE_LIMIT_WINDOW_MS)) attempts.delete(mapKey);
    }
  }

  return false;
}

function insertFailed(reason: string): ContactResult {
  console.error("[contact] insert failed:", reason);
  return {
    ok: false,
    message: "Something went wrong sending that. Please try again, or email me directly.",
  };
}

export async function submitContactMessage(
  _previous: ContactResult | null,
  formData: FormData,
): Promise<ContactResult> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "");
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { ok: false, message: "Please check the highlighted fields.", fieldErrors };
  }

  // Honeypot filled → silently accept so the bot does not learn anything.
  if (parsed.data.website) {
    return { ok: true, message: "Thanks — your message has been sent." };
  }

  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return {
      ok: false,
      message: "That's a few messages in a short time. Please try again later, or email me directly.",
    };
  }

  // Prefer the service client when a key is present; fall back to the anon
  // client, which the RLS policy allows to insert into `messages` (but not to
  // read back, so without the service key the row id stays unknown).
  const service = createServiceClient();
  const supabase = service ?? createPublicClient();

  if (!supabase) {
    return {
      ok: false,
      message: "The contact form is not connected yet. Please email me directly instead.",
    };
  }

  const record = {
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject,
    message: parsed.data.message,
    status: "new" as const,
  };

  let messageId: string | undefined;

  if (service) {
    const { data, error } = await service.from("messages").insert(record).select("id").single();
    if (error) return insertFailed(error.message);
    messageId = data.id as string;
  } else {
    const { error } = await supabase.from("messages").insert(record);
    if (error) return insertFailed(error.message);
  }

  // The message is safely stored. Email the owner *after* the response is
  // sent, so the visitor never waits on the mail provider, and record the
  // outcome on the message so a failed notification shows up in the inbox.
  const receivedAt = new Date();
  after(async () => {
    const result = await sendContactNotification({ id: messageId, ...record, createdAt: receivedAt });

    if (result.status === "failed") console.error("[contact] notification failed:", result.error);
    if (result.status === "skipped" || !service || !messageId) return;

    const { error } = await service
      .from("messages")
      .update(
        result.status === "sent"
          ? { notified_at: new Date().toISOString(), notify_error: null }
          : { notify_error: result.error.slice(0, 500) },
      )
      .eq("id", messageId);
    if (error) console.error("[contact] could not record notification status:", error.message);
  });

  return {
    ok: true,
    message: "Message sent. I'll get back to you within a couple of days.",
  };
}

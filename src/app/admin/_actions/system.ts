"use server";

import { revalidatePath } from "next/cache";

import { getAdminClient, requireAdmin } from "@/lib/admin/auth";
import { failed, saved, type ActionState } from "@/lib/admin/action-utils";
import { getNotificationConfig, sendContactNotification } from "@/lib/email/contact-notification";

/** Sends a sample notification so delivery can be checked from production. */
export async function sendTestEmail(): Promise<ActionState> {
  const user = await requireAdmin();

  const result = await sendContactNotification(
    {
      name: "Portfolio test",
      email: user.email ?? "test@example.com",
      subject: "Contact form notifications are working",
      message:
        "This is a test of the email notification sent for every message from the contact form on your portfolio.\n\nIf you are reading this, new messages will reach this inbox. Each one is also saved in the admin inbox.",
    },
    { test: true },
  );

  if (result.status === "sent") {
    return saved(`Test email sent to ${getNotificationConfig().to}. Check that inbox — and its spam folder.`);
  }
  if (result.status === "skipped") return failed(`Not sent: ${result.reason}`);
  return failed(`Resend did not send it: ${result.error}`);
}

/** Runs the same keep-alive call the schedulers make, labelled "manual". */
export async function pingDatabase(): Promise<ActionState> {
  const supabase = await getAdminClient();
  const { error } = await supabase.rpc("keep_alive", { ping_source: "manual" });

  if (error) return failed(`Ping failed: ${error.message}`);

  revalidatePath("/admin/settings");
  return saved("Database pinged.");
}

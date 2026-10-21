"use server";

import { revalidatePath } from "next/cache";

import { getAdminClient } from "@/lib/admin/auth";
import { failed, saved, type ActionState } from "@/lib/admin/action-utils";
import { messageStatusSchema } from "@/lib/validations";
import type { MessageStatus } from "@/lib/types";

export async function updateMessageStatus(
  id: string,
  status: MessageStatus,
): Promise<ActionState> {
  const parsed = messageStatusSchema.safeParse(status);
  if (!parsed.success) return failed("Unknown status.");

  const supabase = await getAdminClient();
  const { error } = await supabase.from("messages").update({ status: parsed.data }).eq("id", id);

  if (error) {
    console.error(`[admin] message status: ${error.message}`);
    return failed(`Could not update: ${error.message}`);
  }

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  return saved("Status updated.");
}

export async function deleteMessage(id: string): Promise<ActionState> {
  const supabase = await getAdminClient();
  const { error } = await supabase.from("messages").delete().eq("id", id);

  if (error) return failed(`Could not delete: ${error.message}`);

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  return saved("Message deleted.");
}

/** Bulk action for the inbox toolbar. */
export async function markAllRead(): Promise<ActionState> {
  const supabase = await getAdminClient();
  const { error } = await supabase.from("messages").update({ status: "read" }).eq("status", "new");

  if (error) return failed(`Could not update: ${error.message}`);

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
  return saved("All new messages marked as read.");
}

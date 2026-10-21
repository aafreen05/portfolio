import "server-only";

import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";

import type { ActionState } from "@/lib/admin/action-state";

export type { ActionState };

export function zodFieldErrors(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path.join(".");
    if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
  }
  return fieldErrors;
}

export function invalid(error: ZodError): ActionState {
  return {
    ok: false,
    message: "Please fix the highlighted fields.",
    fieldErrors: zodFieldErrors(error),
  };
}

export function failed(message: string): ActionState {
  return { ok: false, message };
}

export function saved(message = "Changes saved."): ActionState {
  return { ok: true, message };
}

/**
 * Purge cached pages after a content change.
 *
 * Covers the public site *and* the admin tree. The admin half matters just as
 * much: without it a create, delete or reorder updates the database but the
 * list the editor is looking at keeps rendering its already-fetched payload,
 * so the change appears to have silently failed.
 */
export function revalidatePublic(paths: string[] = []) {
  revalidatePath("/", "layout");
  revalidatePath("/projects");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin", "layout");
  for (const path of paths) revalidatePath(path);
}

/**
 * A row's fields without `sort_order`. Updates must not write it: position is
 * owned by the reorder actions, and a form's copy is a snapshot from when it
 * opened, so writing it back could undo a reorder made in the meantime.
 */
export function withoutPosition(values: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(values).filter(([key]) => key !== "sort_order"));
}

/* --------------------------------------------------- FormData coercion --- */

/**
 * A text field, with line endings normalised to "\n". Browsers submit
 * textarea line breaks as "\r\n" (it is in the HTML spec), which would
 * otherwise leave stray carriage returns in stored content.
 */
export function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.replace(/\r\n?/g, "\n") : "";
}

export function bool(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  return value === "true" || value === "on" || value === "1";
}

export function num(formData: FormData, key: string, fallback = 0): number {
  const parsed = Number(formData.get(key));
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Array fields are posted as a JSON string from the tag/list editors. */
export function jsonArray<T = string>(formData: FormData, key: string): T[] {
  const raw = formData.get(key);
  if (typeof raw !== "string" || raw.trim() === "") return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

/** Empty strings should land in Postgres as NULL, not "". */
export function nullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

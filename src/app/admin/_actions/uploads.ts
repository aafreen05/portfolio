"use server";

import { getAdminClient } from "@/lib/admin/auth";
import { failed, type ActionState } from "@/lib/admin/action-utils";
import { IMAGE_MIME_TYPES, MAX_IMAGE_BYTES, MAX_PDF_BYTES } from "@/lib/validations";

export interface UploadResult extends ActionState {
  url?: string;
  fileName?: string;
}

/** Storage buckets created by `supabase/setup.sql`. */
export type Bucket = "avatars" | "projects" | "certificates" | "resume";

const BUCKETS: Bucket[] = ["avatars", "projects", "certificates", "resume"];

/**
 * Upload an image or the resume PDF to Supabase Storage.
 *
 * Type and size are validated here rather than only in the browser — the
 * client check is a courtesy, this is the one that counts. Buckets are public
 * for reads and writable only by authenticated users (see the RLS policies).
 */
export async function uploadFile(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file");
  const bucket = String(formData.get("bucket") ?? "");

  if (!(file instanceof File) || file.size === 0) {
    return failed("Choose a file to upload.");
  }

  if (!BUCKETS.includes(bucket as Bucket)) {
    return failed("Unknown upload destination.");
  }

  const isResume = bucket === "resume";

  if (isResume) {
    if (file.type !== "application/pdf") return failed("The resume must be a PDF file.");
    if (file.size > MAX_PDF_BYTES) return failed("PDFs must be 10 MB or smaller.");
  } else {
    if (!IMAGE_MIME_TYPES.includes(file.type as (typeof IMAGE_MIME_TYPES)[number])) {
      return failed("Images must be JPEG, PNG, WebP or AVIF.");
    }
    if (file.size > MAX_IMAGE_BYTES) return failed("Images must be 5 MB or smaller.");
  }

  const supabase = await getAdminClient();

  const extension = isResume ? "pdf" : (file.name.split(".").pop() ?? "jpg").toLowerCase();
  // Random path keeps uploads from colliding and from being guessable.
  const path = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension.replace(/[^a-z0-9]/g, "")}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error(`[admin] upload to ${bucket}: ${error.message}`);
    return failed(`Upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return { ok: true, message: "File uploaded.", url: publicUrl, fileName: file.name };
}

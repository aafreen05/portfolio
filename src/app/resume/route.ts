import { redirect } from "next/navigation";

import { getResume } from "@/lib/queries";

/**
 * Stable public URL for the CV.
 *
 * The file itself lives in Supabase Storage and gets replaced from the admin
 * panel, so links shared in an application or an email keep working after an
 * update. Falls back to the contact section when nothing is uploaded yet.
 */
export async function GET() {
  const resume = await getResume();
  redirect(resume.file_url ?? "/#contact");
}

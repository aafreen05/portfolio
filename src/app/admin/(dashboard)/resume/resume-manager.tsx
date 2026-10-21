"use client";

import * as React from "react";
import { ExternalLink, FileText, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { saveResume } from "@/app/admin/_actions/content";
import { uploadFile } from "@/app/admin/_actions/uploads";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { FormCard, TextField } from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Resume } from "@/lib/types";
import { MAX_PDF_BYTES } from "@/lib/validations";
import { formatDateTime } from "@/lib/utils";

/**
 * Resume upload.
 *
 * The public link is always `/resume`, which redirects to whatever file is
 * current — so a CV shared in an application keeps working after a replacement
 * is uploaded.
 */
export function ResumeManager({ resume }: { resume: Resume }) {
  const [fileUrl, setFileUrl] = React.useState(resume.file_url ?? "");
  const [fileName, setFileName] = React.useState(resume.file_name ?? "");
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      toast.error("Wrong file type", { description: "The resume must be a PDF." });
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      toast.error("File too large", { description: "PDFs must be 10 MB or smaller." });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", "resume");

    const result = await uploadFile(formData);
    setUploading(false);

    if (result.ok && result.url) {
      setFileUrl(result.url);
      setFileName(result.fileName ?? file.name);
      toast.success("Resume uploaded", { description: "Remember to save below." });
    } else {
      toast.error(result.message);
    }
  }

  return (
    <AdminForm action={saveResume} className="mt-8">
      <FormCard
        title="Resume file"
        description="A PDF up to 10 MB. Uploading replaces what visitors download; the public link never changes."
      >
        <div className="flex flex-col gap-4 rounded-lg border border-border p-5 sm:flex-row sm:items-center">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-secondary">
            {uploading ? (
              <Loader2 className="size-5 animate-spin text-accent" aria-hidden />
            ) : (
              <FileText className="size-5 text-muted-foreground" aria-hidden />
            )}
          </span>

          <div className="min-w-0 flex-1">
            {fileUrl ? (
              <>
                <p className="truncate text-sm font-medium">{fileName || "resume.pdf"}</p>
                <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                  {resume.updated_at ? `Updated ${formatDateTime(resume.updated_at)}` : fileUrl}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium">No resume uploaded</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  The Resume buttons stay hidden across the site until one is added.
                </p>
              </>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
                event.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="size-3.5" aria-hidden />
              {fileUrl ? "Replace" : "Upload PDF"}
            </Button>

            {fileUrl ? (
              <Button asChild variant="ghost" size="sm">
                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-3.5" aria-hidden />
                  Preview
                </a>
              </Button>
            ) : null}
          </div>
        </div>

        <Field
          label="File URL"
          htmlFor="file_url"
          hint="Set automatically on upload. You can also paste a link to a PDF hosted elsewhere."
        >
          <Input
            id="file_url"
            name="file_url"
            value={fileUrl}
            onChange={(event) => setFileUrl(event.target.value)}
            placeholder="https://…"
            className="font-mono text-xs"
          />
        </Field>

        <input type="hidden" name="file_name" value={fileName} />

        <TextField
          name="version_label"
          label="Version label"
          defaultValue={resume.version_label}
          hint="Private note for you — not shown on the site."
          placeholder="September 2026"
        />
      </FormCard>

      <div className="flex justify-end">
        <SubmitButton>Save resume</SubmitButton>
      </div>
    </AdminForm>
  );
}

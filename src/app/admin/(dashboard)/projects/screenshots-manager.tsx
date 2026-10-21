"use client";

import * as React from "react";
import Image from "next/image";
import { ImageIcon, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  addProjectImage,
  deleteProjectImage,
  updateProjectImage,
} from "@/app/admin/_actions/projects";
import { uploadFile } from "@/app/admin/_actions/uploads";
import { DeleteAction } from "@/components/admin/row-actions";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProjectImage } from "@/lib/types";
import { IMAGE_MIME_TYPES, MAX_IMAGE_BYTES } from "@/lib/validations";

/**
 * Screenshot gallery for a saved project.
 *
 * Alt text and captions save on blur rather than behind a Save button — these
 * are one-line edits and a round trip per field is cheaper than a form.
 */
export function ScreenshotsManager({
  projectId,
  images,
}: {
  projectId: string;
  images: ProjectImage[];
}) {
  const [uploading, setUploading] = React.useState(false);
  const [, startTransition] = React.useTransition();
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!IMAGE_MIME_TYPES.includes(file.type as (typeof IMAGE_MIME_TYPES)[number])) {
      toast.error("Unsupported file", { description: "Use JPEG, PNG, WebP or AVIF." });
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("File too large", { description: "Images must be 5 MB or smaller." });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", "projects");

    const upload = await uploadFile(formData);

    if (!upload.ok || !upload.url) {
      setUploading(false);
      toast.error(upload.message);
      return;
    }

    const result = await addProjectImage(projectId, upload.url, "");
    setUploading(false);

    if (result.ok) toast.success("Screenshot added");
    else toast.error(result.message);
  }

  function saveField(id: string, field: "alt" | "caption", value: string) {
    startTransition(async () => {
      const result = await updateProjectImage(id, {
        [field]: field === "caption" ? value || null : value,
      });
      if (!result.ok) toast.error(result.message);
    });
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Screenshots</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Shown in a gallery on the project page. Alt text is required for accessibility and is
            saved as you type out of each field.
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_MIME_TYPES.join(",")}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
            event.target.value = "";
          }}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="shrink-0"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
          ) : (
            <Plus className="size-3.5" aria-hidden />
          )}
          Add
        </Button>
      </div>

      {images.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No screenshots"
          description="Add a few images to show the project rather than only describing it."
          className="mt-5 border-0 py-10"
        />
      ) : (
        <ul className="mt-5 flex flex-col gap-4">
          {images.map((image, index) => (
            <li
              key={image.id}
              className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row"
            >
              <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-md border border-border bg-secondary sm:w-40">
                <Image
                  src={image.url}
                  alt=""
                  fill
                  unoptimized
                  sizes="10rem"
                  className="object-cover"
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`alt-${image.id}`}>Alt text</Label>
                  <Input
                    id={`alt-${image.id}`}
                    defaultValue={image.alt}
                    placeholder="Describe what the screenshot shows"
                    onBlur={(event) => saveField(image.id, "alt", event.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`caption-${image.id}`}>Caption</Label>
                  <Input
                    id={`caption-${image.id}`}
                    defaultValue={image.caption ?? ""}
                    placeholder="Optional caption shown under the image"
                    onBlur={(event) => saveField(image.id, "caption", event.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">
                    Position {index + 1}
                  </span>
                  <DeleteAction
                    itemLabel="this screenshot"
                    triggerLabel="Remove"
                    onConfirm={() => deleteProjectImage(image.id)}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

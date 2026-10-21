"use client";

import * as React from "react";
import Image from "next/image";
import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { useFieldError } from "@/components/admin/admin-form";
import { uploadFile, type Bucket } from "@/app/admin/_actions/uploads";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { IMAGE_MIME_TYPES, MAX_IMAGE_BYTES } from "@/lib/validations";

interface ImageUploadFieldProps {
  name: string;
  label: string;
  bucket: Bucket;
  defaultValue?: string | null;
  hint?: string;
  /** Preview aspect ratio. */
  aspect?: "square" | "portrait" | "video";
}

const ASPECT: Record<NonNullable<ImageUploadFieldProps["aspect"]>, string> = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  video: "aspect-[16/10]",
};

/**
 * Upload-or-paste image field.
 *
 * The stored value is always a URL, so an externally hosted image works just
 * as well as one uploaded to Supabase Storage. Size and type are checked here
 * for fast feedback and again on the server, which is what actually enforces it.
 */
export function ImageUploadField({
  name,
  label,
  bucket,
  defaultValue,
  hint,
  aspect = "video",
}: ImageUploadFieldProps) {
  const error = useFieldError(name);
  const [url, setUrl] = React.useState(defaultValue ?? "");
  const [uploading, setUploading] = React.useState(false);
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
    formData.append("bucket", bucket);

    const result = await uploadFile(formData);
    setUploading(false);

    if (result.ok && result.url) {
      setUrl(result.url);
      toast.success("Image uploaded");
    } else {
      toast.error(result.message);
    }
  }

  return (
    <Field label={label} htmlFor={`${name}-url`} hint={hint} error={error}>
      <input type="hidden" name={name} value={url} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div
          className={`relative w-full shrink-0 overflow-hidden rounded-lg border border-border bg-secondary sm:w-40 ${ASPECT[aspect]}`}
        >
          {url ? (
            // Unoptimised: the URL may point anywhere, and these previews are
            // small and admin-only.
            <Image
              src={url}
              alt=""
              fill
              unoptimized
              sizes="10rem"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageIcon className="size-5 text-muted-foreground/50" aria-hidden />
            </div>
          )}

          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
              <Loader2 className="size-5 animate-spin text-accent" aria-hidden />
            </div>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Input
            id={`${name}-url`}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://… or upload a file"
            aria-invalid={Boolean(error)}
          />

          <div className="flex flex-wrap items-center gap-2">
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
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="size-3.5" aria-hidden />
              {uploading ? "Uploading…" : "Upload image"}
            </Button>

            {url ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => setUrl("")}
              >
                <Trash2 className="size-3.5" aria-hidden />
                Clear
              </Button>
            ) : null}
          </div>

          <p className="text-xs text-muted-foreground">JPEG, PNG, WebP or AVIF. Up to 5 MB.</p>
        </div>
      </div>
    </Field>
  );
}

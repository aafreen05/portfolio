"use client";

import * as React from "react";
import Image from "next/image";
import { Award, ImageIcon, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  deleteCertificate,
  reorderCertificates,
  saveCertificate,
} from "@/app/admin/_actions/collections";
import { AdminForm, SubmitButton, SwitchField } from "@/components/admin/admin-form";
import { FieldRow, TextField } from "@/components/admin/form-fields";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { DeleteAction, ReorderAction } from "@/components/admin/row-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import type { Certificate } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function CertificatesManager({ certificates }: { certificates: Certificate[] }) {
  const [editing, setEditing] = React.useState<Certificate | null>(null);
  const [adding, setAdding] = React.useState(false);
  const [, startTransition] = React.useTransition();

  const ordered = [...certificates].sort((a, b) => a.sort_order - b.sort_order);
  const nextSortOrder =
    certificates.length > 0 ? Math.max(...certificates.map((c) => c.sort_order)) + 1 : 1;

  function move(index: number, direction: "up" | "down") {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= ordered.length) return;

    const next = [...ordered];
    [next[index], next[target]] = [next[target], next[index]];

    startTransition(async () => {
      const result = await reorderCertificates(next.map((item) => item.id));
      if (!result.ok) toast.error(result.message);
    });
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {certificates.length} {certificates.length === 1 ? "certificate" : "certificates"}
        </p>

        <Dialog open={adding} onOpenChange={setAdding}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="size-4" aria-hidden />
              Add certificate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add certificate</DialogTitle>
              <DialogDescription>
                Include the verification link where you have one — it is what makes the section
                credible.
              </DialogDescription>
            </DialogHeader>
            <CertificateForm defaultSortOrder={nextSortOrder} onDone={() => setAdding(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No certificates yet"
          description="Add a course certificate and it will appear in the Certificates grid."
          className="mt-8"
        />
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {ordered.map((certificate, index) => (
            <li
              key={certificate.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <ReorderAction
                label={certificate.title}
                canMoveUp={index > 0}
                canMoveDown={index < ordered.length - 1}
                onMove={(direction) => move(index, direction)}
              />

              <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
                {certificate.image_url ? (
                  <Image
                    src={certificate.image_url}
                    alt=""
                    fill
                    unoptimized
                    sizes="3rem"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="size-4 text-muted-foreground/50" aria-hidden />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{certificate.title}</p>
                  {!certificate.published ? (
                    <Badge variant="warning" size="sm">
                      Hidden
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {certificate.issuer}
                  {certificate.issue_date ? ` · ${formatDate(certificate.issue_date)}` : ""}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground"
                  onClick={() => setEditing(certificate)}
                  aria-label={`Edit ${certificate.title}`}
                >
                  <Pencil className="size-3.5" aria-hidden />
                </Button>
                <DeleteAction
                  itemLabel={certificate.title}
                  onConfirm={() => deleteCertificate(certificate.id)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit certificate</DialogTitle>
            <DialogDescription>Update the details or replace the image.</DialogDescription>
          </DialogHeader>
          {editing ? (
            <CertificateForm
              key={editing.id}
              certificate={editing}
              defaultSortOrder={editing.sort_order}
              onDone={() => setEditing(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CertificateForm({
  certificate,
  defaultSortOrder,
  onDone,
}: {
  certificate?: Certificate;
  defaultSortOrder: number;
  onDone: () => void;
}) {
  return (
    <AdminForm action={saveCertificate} onSuccess={onDone}>
      <input type="hidden" name="id" value={certificate?.id ?? ""} />
      <input
        type="hidden"
        name="sort_order"
        value={certificate?.sort_order ?? defaultSortOrder}
      />

      <TextField
        name="title"
        label="Title"
        defaultValue={certificate?.title}
        required
        placeholder="Responsive Web Design"
      />

      <FieldRow>
        <TextField
          name="issuer"
          label="Issuer"
          defaultValue={certificate?.issuer}
          required
          placeholder="freeCodeCamp"
        />
        <TextField
          name="issue_date"
          label="Issue date"
          type="date"
          defaultValue={certificate?.issue_date?.slice(0, 10)}
        />
      </FieldRow>

      <FieldRow>
        <TextField
          name="credential_id"
          label="Credential ID"
          defaultValue={certificate?.credential_id}
        />
        <TextField
          name="credential_url"
          label="Verification URL"
          defaultValue={certificate?.credential_url}
          placeholder="https://…"
        />
      </FieldRow>

      <ImageUploadField
        name="image_url"
        label="Certificate image"
        bucket="certificates"
        defaultValue={certificate?.image_url}
        hint="Optional. A screenshot or scan of the certificate."
      />

      <SwitchField
        name="published"
        label="Visible on the site"
        defaultChecked={certificate?.published ?? true}
      />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <SubmitButton>{certificate ? "Save certificate" : "Add certificate"}</SubmitButton>
      </div>
    </AdminForm>
  );
}

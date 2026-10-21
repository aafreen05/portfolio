"use client";

import * as React from "react";
import { GraduationCap, Pencil, Plus } from "lucide-react";

import { deleteEducation, saveEducation } from "@/app/admin/_actions/collections";
import { AdminForm, SubmitButton, SwitchField, TagField } from "@/components/admin/admin-form";
import { FieldRow, TextAreaField, TextField } from "@/components/admin/form-fields";
import { DeleteAction } from "@/components/admin/row-actions";
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
import type { Education } from "@/lib/types";

export function EducationManager({ entries }: { entries: Education[] }) {
  const [editing, setEditing] = React.useState<Education | null>(null);
  const [adding, setAdding] = React.useState(false);

  const nextSortOrder =
    entries.length > 0 ? Math.max(...entries.map((entry) => entry.sort_order)) + 1 : 1;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </p>

        <Dialog open={adding} onOpenChange={setAdding}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="size-4" aria-hidden />
              Add entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add education</DialogTitle>
              <DialogDescription>
                Degrees, diplomas and schooling. Listed newest first by order.
              </DialogDescription>
            </DialogHeader>
            <EducationForm defaultSortOrder={nextSortOrder} onDone={() => setAdding(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No education entries"
          description="Add your degree so the Education section has something to show."
          className="mt-8"
        />
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-start"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold">
                    {entry.degree} {entry.field}
                  </h2>
                  {entry.current ? (
                    <Badge variant="accent" size="sm">
                      Current
                    </Badge>
                  ) : null}
                </div>

                <p className="mt-1 text-sm text-muted-foreground">{entry.institution}</p>

                <p className="mt-1.5 font-mono text-xs text-muted-foreground">
                  {entry.start_year}
                  {entry.end_year ? ` — ${entry.end_year}` : ""}
                  {entry.location ? ` · ${entry.location}` : ""}
                  {entry.status ? ` · ${entry.status}` : ""}
                </p>

                {entry.highlights.length > 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {entry.highlights.length} highlight
                    {entry.highlights.length === 1 ? "" : "s"}
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground"
                  onClick={() => setEditing(entry)}
                  aria-label={`Edit ${entry.degree} ${entry.field}`}
                >
                  <Pencil className="size-3.5" aria-hidden />
                </Button>
                <DeleteAction
                  itemLabel={`${entry.degree} ${entry.field}`}
                  onConfirm={() => deleteEducation(entry.id)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit education</DialogTitle>
            <DialogDescription>Update this entry.</DialogDescription>
          </DialogHeader>
          {editing ? (
            <EducationForm
              key={editing.id}
              entry={editing}
              defaultSortOrder={editing.sort_order}
              onDone={() => setEditing(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EducationForm({
  entry,
  defaultSortOrder,
  onDone,
}: {
  entry?: Education;
  defaultSortOrder: number;
  onDone: () => void;
}) {
  return (
    <AdminForm action={saveEducation} onSuccess={onDone}>
      <input type="hidden" name="id" value={entry?.id ?? ""} />
      <input type="hidden" name="sort_order" value={entry?.sort_order ?? defaultSortOrder} />

      <TextField
        name="institution"
        label="Institution"
        defaultValue={entry?.institution}
        required
        placeholder="Periyar Maniammai Institute of Science and Technology"
      />

      <FieldRow>
        <TextField name="degree" label="Degree" defaultValue={entry?.degree} required placeholder="B.Tech" />
        <TextField
          name="field"
          label="Field of study"
          defaultValue={entry?.field}
          required
          placeholder="Computer Science and Engineering"
        />
      </FieldRow>

      <FieldRow>
        <TextField
          name="location"
          label="Location"
          defaultValue={entry?.location}
          placeholder="Thanjavur, Tamil Nadu"
        />
        <TextField
          name="status"
          label="Status"
          defaultValue={entry?.status}
          placeholder="3rd Year · In progress"
        />
      </FieldRow>

      <FieldRow>
        <TextField name="start_year" label="Start year" defaultValue={entry?.start_year} required placeholder="2023" />
        <TextField name="end_year" label="End year" defaultValue={entry?.end_year} placeholder="2027" />
      </FieldRow>

      <TextAreaField
        name="description"
        label="Description"
        defaultValue={entry?.description}
        rows={3}
        hint="A sentence or two on what the course covers."
      />

      <TagField
        name="highlights"
        label="Highlights"
        defaultValue={entry?.highlights ?? []}
        placeholder="Data Structures & Algorithms"
        hint="Key subjects or achievements, shown as tags."
        max={16}
      />

      <SwitchField
        name="current"
        label="Currently studying here"
        description="Adds a Current badge and uses this entry in the About section."
        defaultChecked={entry?.current ?? false}
      />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <SubmitButton>{entry ? "Save entry" : "Add entry"}</SubmitButton>
      </div>
    </AdminForm>
  );
}

"use client";

import * as React from "react";
import { Link2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  deleteSocialLink,
  reorderSocialLinks,
  saveSocialLink,
  toggleSocialLink,
} from "@/app/admin/_actions/collections";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { SelectField, TextField } from "@/components/admin/form-fields";
import { DeleteAction, ReorderAction, ToggleAction } from "@/components/admin/row-actions";
import { FALLBACK_SOCIAL_ICON, SOCIAL_ICONS } from "@/components/site/brand-icons";
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
import { SOCIAL_PLATFORMS, type SocialLink } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SocialLinksManager({ links }: { links: SocialLink[] }) {
  const [editing, setEditing] = React.useState<SocialLink | null>(null);
  const [adding, setAdding] = React.useState(false);
  const [, startTransition] = React.useTransition();

  const ordered = [...links].sort((a, b) => a.sort_order - b.sort_order);
  const nextSortOrder = links.length > 0 ? Math.max(...links.map((l) => l.sort_order)) + 1 : 1;

  function move(index: number, direction: "up" | "down") {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= ordered.length) return;

    const next = [...ordered];
    [next[index], next[target]] = [next[target], next[index]];

    startTransition(async () => {
      const result = await reorderSocialLinks(next.map((link) => link.id));
      if (!result.ok) toast.error(result.message);
    });
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {links.filter((link) => link.enabled).length} of {links.length} shown on the site
        </p>

        <Dialog open={adding} onOpenChange={setAdding}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="size-4" aria-hidden />
              Add link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add social link</DialogTitle>
              <DialogDescription>
                Only links added here appear on the site — empty platforms are never shown.
              </DialogDescription>
            </DialogHeader>
            <SocialLinkForm defaultSortOrder={nextSortOrder} onDone={() => setAdding(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {links.length === 0 ? (
        <EmptyState
          icon={Link2}
          title="No social links"
          description="Add your GitHub, LinkedIn or email so visitors can reach you."
          className="mt-8"
        />
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {ordered.map((link, index) => {
            const Icon = SOCIAL_ICONS[link.platform] ?? FALLBACK_SOCIAL_ICON;

            return (
              <li
                key={link.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <ReorderAction
                  label={link.label}
                  canMoveUp={index > 0}
                  canMoveDown={index < ordered.length - 1}
                  onMove={(direction) => move(index, direction)}
                />

                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="size-4 text-muted-foreground" aria-hidden />
                </span>

                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-sm font-medium",
                      !link.enabled && "text-muted-foreground",
                    )}
                  >
                    {link.label}
                  </p>
                  <p className="truncate font-mono text-xs text-muted-foreground">{link.url}</p>
                </div>

                <ToggleAction
                  checked={link.enabled}
                  label={`Show ${link.label} on the site`}
                  onToggle={(next) => toggleSocialLink(link.id, next)}
                />

                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground"
                  onClick={() => setEditing(link)}
                  aria-label={`Edit ${link.label}`}
                >
                  <Pencil className="size-3.5" aria-hidden />
                </Button>

                <DeleteAction itemLabel={link.label} onConfirm={() => deleteSocialLink(link.id)} />
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit social link</DialogTitle>
            <DialogDescription>Update the label or destination.</DialogDescription>
          </DialogHeader>
          {editing ? (
            <SocialLinkForm
              key={editing.id}
              link={editing}
              defaultSortOrder={editing.sort_order}
              onDone={() => setEditing(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SocialLinkForm({
  link,
  defaultSortOrder,
  onDone,
}: {
  link?: SocialLink;
  defaultSortOrder: number;
  onDone: () => void;
}) {
  return (
    <AdminForm action={saveSocialLink} onSuccess={onDone}>
      <input type="hidden" name="id" value={link?.id ?? ""} />
      <input type="hidden" name="sort_order" value={link?.sort_order ?? defaultSortOrder} />
      <input type="hidden" name="enabled" value={String(link?.enabled ?? true)} />

      <SelectField
        name="platform"
        label="Platform"
        defaultValue={link?.platform ?? "github"}
        options={SOCIAL_PLATFORMS}
        hint="Determines which icon is used."
        required
      />

      <TextField
        name="label"
        label="Label"
        defaultValue={link?.label}
        required
        hint="Used as the accessible name and tooltip."
        placeholder="GitHub"
      />

      <TextField
        name="url"
        label="URL"
        defaultValue={link?.url}
        required
        hint="A full URL, or mailto:you@example.com for email."
        placeholder="https://github.com/username"
      />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <SubmitButton>{link ? "Save link" : "Add link"}</SubmitButton>
      </div>
    </AdminForm>
  );
}

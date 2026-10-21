"use client";

import * as React from "react";
import { Pencil, Plus, Wrench } from "lucide-react";
import { toast } from "sonner";

import {
  deleteSkill,
  reorderSkills,
  saveSkill,
  toggleSkill,
} from "@/app/admin/_actions/collections";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { FieldRow, SelectField, TextField } from "@/components/admin/form-fields";
import { DeleteAction, ReorderAction, ToggleAction } from "@/components/admin/row-actions";
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
import { SKILL_CATEGORIES, SKILL_LEVELS, type Skill } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SkillsManager({ skills }: { skills: Skill[] }) {
  const [editing, setEditing] = React.useState<Skill | null>(null);
  const [adding, setAdding] = React.useState(false);
  const [, startTransition] = React.useTransition();

  const grouped = SKILL_CATEGORIES.map((category) => ({
    ...category,
    items: skills
      .filter((skill) => skill.category === category.value)
      .sort((a, b) => a.sort_order - b.sort_order),
  }));

  /**
   * Swap a skill with its neighbour inside its category, then persist the
   * order of *every* skill.
   *
   * `sort_order` is global, so sending only one category's ids would renumber
   * them from 1 and collide with the other categories.
   */
  function move(categoryItems: Skill[], index: number, direction: "up" | "down") {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= categoryItems.length) return;

    const all = [...skills].sort((a, b) => a.sort_order - b.sort_order);
    const from = all.findIndex((skill) => skill.id === categoryItems[index].id);
    const to = all.findIndex((skill) => skill.id === categoryItems[target].id);
    if (from === -1 || to === -1) return;

    [all[from], all[to]] = [all[to], all[from]];

    startTransition(async () => {
      const result = await reorderSkills(all.map((skill) => skill.id));
      if (!result.ok) toast.error(result.message);
    });
  }

  const nextSortOrder = skills.length > 0 ? Math.max(...skills.map((s) => s.sort_order)) + 1 : 1;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {skills.length} {skills.length === 1 ? "skill" : "skills"} across{" "}
          {grouped.filter((group) => group.items.length > 0).length} categories
        </p>

        <Dialog open={adding} onOpenChange={setAdding}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="size-4" aria-hidden />
              Add skill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add skill</DialogTitle>
              <DialogDescription>
                Only add what you actually work with — the level indicator is there to be honest,
                not impressive.
              </DialogDescription>
            </DialogHeader>
            <SkillForm defaultSortOrder={nextSortOrder} onDone={() => setAdding(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {skills.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No skills yet"
          description="Add the languages, frameworks and tools you work with."
          className="mt-8"
        />
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {grouped
            .filter((group) => group.items.length > 0)
            .map((group) => (
              <section key={group.value} className="rounded-2xl border border-border bg-card">
                <div className="flex items-baseline justify-between gap-4 border-b border-border px-5 py-3.5">
                  <h2 className="font-display text-sm font-bold tracking-tight">{group.label}</h2>
                  <span className="font-mono text-xs text-muted-foreground">
                    {group.items.length}
                  </span>
                </div>

                <ul>
                  {group.items.map((skill, index) => (
                    <li
                      key={skill.id}
                      className="flex items-center gap-3 border-b border-border px-3 py-2.5 last:border-0 sm:px-5"
                    >
                      <ReorderAction
                        label={skill.name}
                        canMoveUp={index > 0}
                        canMoveDown={index < group.items.length - 1}
                        onMove={(direction) => move(group.items, index, direction)}
                      />

                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "truncate text-sm font-medium",
                            !skill.enabled && "text-muted-foreground line-through",
                          )}
                        >
                          {skill.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {SKILL_LEVELS.find((level) => level.value === skill.level)?.label}
                          {skill.note ? ` · ${skill.note}` : ""}
                        </p>
                      </div>

                      <ToggleAction
                        checked={skill.enabled}
                        label={`Show ${skill.name} on the site`}
                        onToggle={(next) => toggleSkill(skill.id, next)}
                      />

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground"
                        onClick={() => setEditing(skill)}
                        aria-label={`Edit ${skill.name}`}
                      >
                        <Pencil className="size-3.5" aria-hidden />
                      </Button>

                      <DeleteAction
                        itemLabel={skill.name}
                        onConfirm={() => deleteSkill(skill.id)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
        </div>
      )}

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit skill</DialogTitle>
            <DialogDescription>Update the name, category or level.</DialogDescription>
          </DialogHeader>
          {editing ? (
            <SkillForm
              key={editing.id}
              skill={editing}
              defaultSortOrder={editing.sort_order}
              onDone={() => setEditing(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SkillForm({
  skill,
  defaultSortOrder,
  onDone,
}: {
  skill?: Skill;
  defaultSortOrder: number;
  onDone: () => void;
}) {
  return (
    <AdminForm action={saveSkill} onSuccess={onDone}>
      <input type="hidden" name="id" value={skill?.id ?? ""} />
      <input type="hidden" name="sort_order" value={skill?.sort_order ?? defaultSortOrder} />
      <input type="hidden" name="enabled" value={String(skill?.enabled ?? true)} />

      <TextField name="name" label="Name" defaultValue={skill?.name} required />

      <FieldRow>
        <SelectField
          name="category"
          label="Category"
          defaultValue={skill?.category ?? "frontend"}
          options={SKILL_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
          required
        />
        <SelectField
          name="level"
          label="Level"
          defaultValue={skill?.level ?? "working"}
          options={SKILL_LEVELS}
          required
        />
      </FieldRow>

      <TextField
        name="note"
        label="Note"
        defaultValue={skill?.note}
        hint="Optional detail shown under the name."
        placeholder="Hooks, composition, state"
      />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <SubmitButton>{skill ? "Save skill" : "Add skill"}</SubmitButton>
      </div>
    </AdminForm>
  );
}

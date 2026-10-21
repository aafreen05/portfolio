"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";

import { useFieldError } from "@/components/admin/admin-form";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { AboutStat } from "@/lib/types";

/** Repeater for the label/value pairs shown in the About statistics grid. */
export function StatsField({
  name,
  defaultValue = [],
  max = 6,
}: {
  name: string;
  defaultValue?: AboutStat[];
  max?: number;
}) {
  const error = useFieldError(name);
  const [stats, setStats] = React.useState<AboutStat[]>(defaultValue);

  function update(index: number, patch: Partial<AboutStat>) {
    setStats((current) =>
      current.map((stat, i) => (i === index ? { ...stat, ...patch } : stat)),
    );
  }

  return (
    <Field
      label="Statistics"
      hint="Short facts shown in a grid — degree, year, institute, focus. An even number looks best."
      error={error}
    >
      <input type="hidden" name={name} value={JSON.stringify(stats)} />

      <div className="flex flex-col gap-2.5">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={stat.label}
              onChange={(event) => update(index, { label: event.target.value })}
              placeholder="Label"
              aria-label={`Statistic ${index + 1} label`}
              className="flex-1"
            />
            <Input
              value={stat.value}
              onChange={(event) => update(index, { value: event.target.value })}
              placeholder="Value"
              aria-label={`Statistic ${index + 1} value`}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => setStats((current) => current.filter((_, i) => i !== index))}
              aria-label={`Remove statistic ${index + 1}`}
            >
              <Trash2 className="size-3.5" aria-hidden />
            </Button>
          </div>
        ))}

        {stats.length < max ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => setStats((current) => [...current, { label: "", value: "" }])}
          >
            <Plus className="size-3.5" aria-hidden />
            Add statistic
          </Button>
        ) : null}
      </div>
    </Field>
  );
}

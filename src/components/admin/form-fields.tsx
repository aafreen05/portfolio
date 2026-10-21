"use client";

import * as React from "react";

import { useFieldError } from "@/components/admin/admin-form";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/** Grouping card used to break long editors into readable sections. */
export function FormCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("frame relative p-5 sm:p-7", className)}>
      <div className="border-b border-border pb-4">
        <h2 className="font-wide text-sm font-semibold tracking-wide uppercase">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-5 pt-5">{children}</div>
    </section>
  );
}

export function TextField({
  name,
  label,
  defaultValue,
  hint,
  required,
  type = "text",
  placeholder,
  className,
  ...rest
}: {
  name: string;
  label: string;
  defaultValue?: string | number | null;
  hint?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  className?: string;
} & Omit<React.ComponentProps<"input">, "name" | "defaultValue" | "type">) {
  const error = useFieldError(name);

  return (
    <Field label={label} htmlFor={name} hint={hint} error={error} required={required} className={className}>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        {...rest}
      />
    </Field>
  );
}

export function TextAreaField({
  name,
  label,
  defaultValue,
  hint,
  required,
  rows = 4,
  placeholder,
  className,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  hint?: string;
  required?: boolean;
  rows?: number;
  placeholder?: string;
  className?: string;
}) {
  const error = useFieldError(name);

  return (
    <Field label={label} htmlFor={name} hint={hint} error={error} required={required} className={className}>
      <Textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
      />
    </Field>
  );
}

/**
 * Select field. Radix Select is not a native input, so the chosen value is
 * mirrored into a hidden input for FormData.
 */
export function SelectField({
  name,
  label,
  options,
  defaultValue,
  hint,
  required,
  placeholder = "Choose…",
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  hint?: string;
  required?: boolean;
  placeholder?: string;
}) {
  const error = useFieldError(name);
  const [value, setValue] = React.useState(defaultValue ?? "");

  return (
    <Field label={label} htmlFor={name} hint={hint} error={error} required={required}>
      <input type="hidden" name={name} value={value} />
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger id={name} aria-invalid={Boolean(error)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

/** Two fields side by side on wider screens. */
export function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}

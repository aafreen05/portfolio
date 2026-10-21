"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Loader2, Save, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "@/components/ui/tag-input";
import { idleState, type ActionState } from "@/lib/admin/action-state";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------- context --- */

const FormErrorContext = React.createContext<Record<string, string>>({});

/** Read the server-side error for one field, if the last save produced one. */
export function useFieldError(name: string) {
  return React.useContext(FormErrorContext)[name];
}

/* ---------------------------------------------------------------- form --- */

interface AdminFormProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  className?: string;
  /** Called with the new record id after a successful create. */
  onCreated?: (id: string) => void;
  onSuccess?: () => void;
}

/**
 * Wraps a server action in a progressively-enhanced form.
 *
 * Field-level errors returned by the action are distributed through context so
 * individual inputs can render them without the page wiring up prop drilling.
 */
export function AdminForm({
  action,
  children,
  className,
  onCreated,
  onSuccess,
}: AdminFormProps) {
  const [state, formAction] = useActionState(action, idleState);
  const lastHandled = React.useRef<ActionState | null>(null);

  React.useEffect(() => {
    if (state === idleState || state === lastHandled.current) return;
    lastHandled.current = state;

    if (state.ok) {
      toast.success(state.message || "Saved");
      if (state.id) onCreated?.(state.id);
      onSuccess?.();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, onCreated, onSuccess]);

  return (
    <FormErrorContext.Provider value={state.fieldErrors ?? {}}>
      <form action={formAction} className={cn("flex flex-col gap-6", className)}>
        {children}
        <FormStatus state={state} />
      </form>
    </FormErrorContext.Provider>
  );
}

function FormStatus({ state }: { state: ActionState }) {
  if (!state.message) return null;

  return (
    <p
      role="status"
      className={cn(
        "flex items-start gap-2 border p-3 text-sm",
        state.ok
          ? "border-sage/30 bg-sage-soft text-sage"
          : "border-destructive/30 bg-destructive/10 text-destructive",
      )}
    >
      {state.ok ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
      ) : (
        <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      )}
      {state.message}
    </p>
  );
}

/* -------------------------------------------------------------- submit --- */

export function SubmitButton({
  children = "Save changes",
  className,
  size = "default",
}: {
  children?: React.ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg";
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size={size} disabled={pending} className={className}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Saving…
        </>
      ) : (
        <>
          <Save className="size-4" aria-hidden />
          {children}
        </>
      )}
    </Button>
  );
}

/** Sticky save bar for the long single-record editors. */
export function SaveBar({ children }: { children?: React.ReactNode }) {
  return (
    <div className="glass sticky bottom-0 -mx-5 mt-2 flex items-center justify-end gap-3 border-t border-border px-5 py-4 sm:-mx-8 sm:px-8">
      {children}
      <SubmitButton />
    </div>
  );
}

/* --------------------------------------------------------- field types --- */

/**
 * Boolean field. The visible control is a Radix switch; a hidden input carries
 * the value into FormData, because Radix switches are not native inputs.
 */
export function SwitchField({
  name,
  label,
  description,
  defaultChecked = false,
}: {
  name: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = React.useState(defaultChecked);

  return (
    <div className="flex items-start justify-between gap-6 border border-border bg-secondary/30 p-4 transition-colors duration-300 hover:border-gold/40">
      <div className="min-w-0">
        <label htmlFor={`${name}-switch`} className="text-sm font-medium">
          {label}
        </label>
        {description ? (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <input type="hidden" name={name} value={checked ? "true" : "false"} />
      <Switch
        id={`${name}-switch`}
        checked={checked}
        onCheckedChange={setChecked}
        className="mt-0.5 shrink-0"
      />
    </div>
  );
}

/** List field (technologies, features, keywords). Serialised as JSON. */
export function TagField({
  name,
  label,
  hint,
  defaultValue = [],
  placeholder,
  max,
  required,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultValue?: string[];
  placeholder?: string;
  max?: number;
  required?: boolean;
}) {
  const [value, setValue] = React.useState<string[]>(defaultValue);
  const error = useFieldError(name);

  return (
    <Field label={label} htmlFor={name} hint={hint} error={error} required={required}>
      <input type="hidden" name={name} value={JSON.stringify(value)} />
      <TagInput id={name} value={value} onChange={setValue} placeholder={placeholder} max={max} />
    </Field>
  );
}

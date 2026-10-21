"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { ActionState } from "@/lib/admin/action-state";

/** Destructive action behind a confirmation dialog. */
export function DeleteAction({
  itemLabel,
  description,
  onConfirm,
  triggerLabel,
}: {
  itemLabel: string;
  description?: string;
  onConfirm: () => Promise<ActionState>;
  triggerLabel?: string;
}) {
  const [pending, startTransition] = React.useTransition();
  const [open, setOpen] = React.useState(false);

  function handleConfirm() {
    startTransition(async () => {
      const result = await onConfirm();
      if (result.ok) {
        toast.success(result.message);
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size={triggerLabel ? "sm" : "icon-sm"}
          className="text-muted-foreground hover:text-destructive"
          aria-label={triggerLabel ? undefined : `Delete ${itemLabel}`}
        >
          <Trash2 className="size-3.5" aria-hidden />
          {triggerLabel}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {itemLabel}?</AlertDialogTitle>
          <AlertDialogDescription>
            {description ?? "This cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              // Keep the dialog open until the server responds.
              event.preventDefault();
              handleConfirm();
            }}
            disabled={pending}
          >
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Up/down reordering.
 *
 * Chosen over drag-and-drop deliberately: it is keyboard accessible, works on
 * touch without a long-press, and needs no extra dependency.
 */
export function ReorderAction({
  label,
  onMove,
  canMoveUp,
  canMoveDown,
}: {
  label: string;
  onMove: (direction: "up" | "down") => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  return (
    <div className="flex items-center">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground"
        onClick={() => onMove("up")}
        disabled={!canMoveUp}
        aria-label={`Move ${label} up`}
      >
        <ChevronUp className="size-3.5" aria-hidden />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground"
        onClick={() => onMove("down")}
        disabled={!canMoveDown}
        aria-label={`Move ${label} down`}
      >
        <ChevronDown className="size-3.5" aria-hidden />
      </Button>
    </div>
  );
}

/** Optimistic visibility toggle that reports failures back to the UI. */
export function ToggleAction({
  checked,
  label,
  onToggle,
}: {
  checked: boolean;
  label: string;
  onToggle: (next: boolean) => Promise<ActionState>;
}) {
  const [optimistic, setOptimistic] = React.useState(checked);
  const [lastServerValue, setLastServerValue] = React.useState(checked);
  const [, startTransition] = React.useTransition();

  // Adjust state during render when the server value changes — the documented
  // alternative to syncing props into state from an effect.
  if (lastServerValue !== checked) {
    setLastServerValue(checked);
    setOptimistic(checked);
  }

  return (
    <Switch
      checked={optimistic}
      aria-label={label}
      onCheckedChange={(next) => {
        setOptimistic(next);
        startTransition(async () => {
          const result = await onToggle(next);
          if (!result.ok) {
            setOptimistic(!next);
            toast.error(result.message);
          }
        });
      }}
    />
  );
}

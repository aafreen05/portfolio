"use client";

import * as React from "react";
import { Activity, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { pingDatabase, sendTestEmail } from "@/app/admin/_actions/system";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/admin/action-state";

function ActionButton({
  action,
  icon: Icon,
  children,
  disabled,
}: {
  action: () => Promise<ActionState>;
  icon: typeof Send;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const [pending, startTransition] = React.useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled || pending}
      onClick={() =>
        startTransition(async () => {
          const result = await action();
          if (result.ok) toast.success(result.message);
          else toast.error(result.message, { duration: 10000 });
        })
      }
    >
      {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Icon className="size-3.5" aria-hidden />}
      {children}
    </Button>
  );
}

export function SendTestEmailButton({ disabled }: { disabled?: boolean }) {
  return (
    <ActionButton action={sendTestEmail} icon={Send} disabled={disabled}>
      Send test email
    </ActionButton>
  );
}

export function PingDatabaseButton() {
  return (
    <ActionButton action={pingDatabase} icon={Activity}>
      Ping now
    </ActionButton>
  );
}

"use client";

import * as React from "react";
import { Archive, CheckCheck, Inbox, Mail, MailCheck, MailX, Reply } from "lucide-react";
import { toast } from "sonner";

import { deleteMessage, markAllRead, updateMessageStatus } from "@/app/admin/_actions/messages";
import { DeleteAction } from "@/components/admin/row-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MESSAGE_STATUSES, type Message, type MessageStatus } from "@/lib/types";
import { cn, formatDateTime, relativeTime } from "@/lib/utils";

const STATUS_VARIANT: Record<MessageStatus, "accent" | "default" | "success" | "outline"> = {
  new: "accent",
  read: "default",
  replied: "success",
  archived: "outline",
};

/**
 * Whether the email notification for a message went out. Messages from
 * before notifications were configured carry neither field and show nothing.
 */
function DeliveryStatus({ message, detailed = false }: { message: Message; detailed?: boolean }) {
  if (message.notified_at) {
    return (
      <span className="inline-flex items-center gap-1 text-[var(--success)]" title={`Emailed ${formatDateTime(message.notified_at)}`}>
        <MailCheck className="size-3" aria-hidden />
        {detailed ? `Emailed to you ${relativeTime(message.notified_at)}` : "Emailed"}
      </span>
    );
  }
  if (message.notify_error) {
    return (
      <span className="inline-flex items-center gap-1 text-destructive" title={message.notify_error}>
        <MailX className="size-3" aria-hidden />
        {detailed ? `Email notification failed: ${message.notify_error}` : "Email failed"}
      </span>
    );
  }
  return null;
}

export function MessagesInbox({ messages }: { messages: Message[] }) {
  const [filter, setFilter] = React.useState<MessageStatus | "all">("all");
  const [open, setOpen] = React.useState<Message | null>(null);
  const [, startTransition] = React.useTransition();

  const counts = React.useMemo(() => {
    const base: Record<string, number> = { all: messages.length };
    for (const status of MESSAGE_STATUSES) {
      base[status.value] = messages.filter((message) => message.status === status.value).length;
    }
    return base;
  }, [messages]);

  const filtered =
    filter === "all" ? messages : messages.filter((message) => message.status === filter);

  function setStatus(id: string, status: MessageStatus) {
    startTransition(async () => {
      const result = await updateMessageStatus(id, status);
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  /** Opening a message marks it read, mirroring every mail client. */
  function openMessage(message: Message) {
    setOpen(message);
    if (message.status === "new") setStatus(message.id, "read");
  }

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as MessageStatus | "all")}>
          <TabsList>
            <TabsTrigger value="all">
              All
              <span className="font-mono text-[0.688rem] opacity-60">{counts.all}</span>
            </TabsTrigger>
            {MESSAGE_STATUSES.map((status) => (
              <TabsTrigger key={status.value} value={status.value}>
                {status.label}
                <span className="font-mono text-[0.688rem] opacity-60">
                  {counts[status.value]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {counts.new > 0 ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              startTransition(async () => {
                const result = await markAllRead();
                if (result.ok) toast.success(result.message);
                else toast.error(result.message);
              })
            }
          >
            <CheckCheck className="size-3.5" aria-hidden />
            Mark all read
          </Button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={messages.length === 0 ? "No messages yet" : "Nothing in this folder"}
          description={
            messages.length === 0
              ? "Messages sent through the contact form on the site will land here."
              : "Try a different filter."
          }
          className="mt-8"
        />
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {filtered.map((message) => (
            <li key={message.id}>
              <div
                className={cn(
                  "flex items-start gap-4 rounded-xl border bg-card p-4 transition-colors",
                  message.status === "new" ? "border-accent/35" : "border-border",
                )}
              >
                <button
                  type="button"
                  onClick={() => openMessage(message)}
                  className="min-w-0 flex-1 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "truncate text-sm",
                        message.status === "new" ? "font-semibold" : "font-medium",
                      )}
                    >
                      {message.name}
                    </span>
                    <Badge variant={STATUS_VARIANT[message.status]} size="sm">
                      {MESSAGE_STATUSES.find((s) => s.value === message.status)?.label}
                    </Badge>
                  </div>

                  <p className="mt-1 truncate text-sm text-muted-foreground">{message.subject}</p>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground/80">
                    {message.message}
                  </p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-2 font-mono text-[0.688rem] text-muted-foreground">
                    <span>
                      {message.email} · {relativeTime(message.created_at)}
                    </span>
                    <DeliveryStatus message={message} />
                  </p>
                </button>

                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <Button
                    asChild
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground"
                  >
                    <a
                      href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`}
                      aria-label={`Reply to ${message.name}`}
                    >
                      <Reply className="size-3.5" aria-hidden />
                    </a>
                  </Button>
                  <DeleteAction
                    itemLabel={`the message from ${message.name}`}
                    onConfirm={() => deleteMessage(message.id)}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={Boolean(open)} onOpenChange={(next) => !next && setOpen(null)}>
        <DialogContent className="max-w-2xl">
          {open ? (
            <>
              <DialogHeader>
                <DialogTitle>{open.subject}</DialogTitle>
                <DialogDescription>
                  From {open.name} · {open.email}
                  <br />
                  <span className="font-mono text-xs">{formatDateTime(open.created_at)}</span>
                </DialogDescription>
                <p className="font-mono text-xs">
                  <DeliveryStatus message={open} detailed />
                </p>
              </DialogHeader>

              <div className="max-h-[45vh] overflow-y-auto rounded-lg border border-border bg-secondary/40 p-4">
                <p className="text-sm leading-[1.75] whitespace-pre-wrap">{open.message}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="label-mono mr-1">Status</span>
                {MESSAGE_STATUSES.map((status) => (
                  <Button
                    key={status.value}
                    variant={open.status === status.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setStatus(open.id, status.value);
                      setOpen({ ...open, status: status.value });
                    }}
                  >
                    {status.value === "archived" ? (
                      <Archive className="size-3.5" aria-hidden />
                    ) : null}
                    {status.label}
                  </Button>
                ))}
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <Button variant="outline" onClick={() => setOpen(null)}>
                  Close
                </Button>
                <Button asChild>
                  <a
                    href={`mailto:${open.email}?subject=${encodeURIComponent(`Re: ${open.subject}`)}`}
                  >
                    <Mail className="size-4" aria-hidden />
                    Reply by email
                  </a>
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

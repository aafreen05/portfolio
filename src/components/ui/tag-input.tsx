"use client";

import * as React from "react";
import { X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  id?: string;
  max?: number;
  className?: string;
}

/**
 * Chip-style list editor used for technologies, features, highlights and
 * keywords. Enter or comma commits a tag; Backspace on an empty input removes
 * the last one.
 */
export function TagInput({
  value,
  onChange,
  placeholder = "Type and press Enter",
  id,
  max = 24,
  className,
}: TagInputProps) {
  const [draft, setDraft] = React.useState("");

  function commit(raw: string) {
    const next = raw.trim();
    if (!next) return;
    if (value.length >= max) return;
    if (value.some((item) => item.toLowerCase() === next.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...value, next]);
    setDraft("");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commit(draft);
      return;
    }
    if (event.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <Input
        id={id}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => commit(draft)}
        placeholder={placeholder}
        aria-describedby={id ? `${id}-tags` : undefined}
      />
      {value.length > 0 ? (
        <ul id={id ? `${id}-tags` : undefined} className="flex flex-wrap gap-1.5">
          {value.map((tag, index) => (
            <li key={`${tag}-${index}`}>
              <span className="inline-flex items-center gap-1 border border-border bg-secondary/60 py-1 pr-1 pl-2.5 font-mono text-[0.625rem] tracking-[0.1em] uppercase">
                {tag}
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                  className="p-0.5 text-muted-foreground transition-colors hover:text-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                  aria-label={`Remove ${tag}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

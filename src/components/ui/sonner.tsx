"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/** Toast host. Colours are pulled from the design tokens so it matches both themes. */
function Toaster(props: ToasterProps) {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={(resolvedTheme as ToasterProps["theme"]) ?? "system"}
      position="bottom-right"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group rounded-none border border-border bg-popover text-popover-foreground elevate-lg text-sm",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground rounded-none",
          cancelButton: "bg-secondary text-secondary-foreground rounded-none",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { Toaster };

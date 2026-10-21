"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Toast host. Colours are pulled from the design tokens so it matches both themes.
 *
 * Bottom-centre and raised clear of the admin's sticky save bar (about 77px
 * tall). Every primary action in the admin — Save, Add, Delete — sits at the
 * right, and a bottom-right toast landed exactly on it: "Resume uploaded,
 * remember to save below" covered the very Save button it pointed to, and a
 * second save within a few seconds clicked the toast instead.
 */
function Toaster(props: ToasterProps) {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={(resolvedTheme as ToasterProps["theme"]) ?? "system"}
      position="bottom-center"
      offset={{ bottom: 96 }}
      mobileOffset={{ bottom: 92, right: 16, left: 16 }}
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

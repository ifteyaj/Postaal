import * as React from "react";

import { cn } from "@/lib/utils";

type BadgeVariant =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "outline";

const BADGE_STYLES: Record<BadgeVariant, string> = {
  neutral: "bg-control text-ink-subtle",
  accent: "bg-nav-selected text-accent",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  info: "bg-info/10 text-info",
  outline: "border border-border text-ink-subtle",
};

function Badge({
  className,
  variant = "neutral",
  ...props
}: React.ComponentProps<"span"> & { variant?: BadgeVariant }) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-4",
        BADGE_STYLES[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge, type BadgeVariant };

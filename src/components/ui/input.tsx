import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-ink transition-colors",
        "placeholder:text-ink-lavender disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-danger",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

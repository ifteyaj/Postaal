import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "w-full resize-none rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-ink transition-colors",
        "placeholder:text-ink-lavender disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-danger",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

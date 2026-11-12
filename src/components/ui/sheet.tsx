"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/25" />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "fixed z-50 flex flex-col bg-surface shadow-tab",
          side === "left" && "inset-y-0 left-0 h-full w-3/4 border-r",
          side === "right" && "inset-y-0 right-0 h-full w-3/4 border-l",
          side === "top" && "inset-x-0 top-0 border-b",
          side === "bottom" && "inset-x-0 bottom-0 border-t",
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close
          className="absolute right-3 top-3 rounded-md p-1.5 text-ink-lavender transition-colors hover:bg-control hover:text-ink"
          aria-label="Close panel"
        >
          <X className="size-4" aria-hidden="true" />
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      className={cn("text-base font-semibold text-ink", className)}
      {...props}
    />
  );
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetTitle };

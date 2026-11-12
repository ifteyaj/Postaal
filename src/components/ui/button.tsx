import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2.5 whitespace-nowrap rounded-lg text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-ink-inverse text-white hover:opacity-90 focus-visible:outline-offset-2",
        accent:
          "bg-accent text-accent-contrast hover:bg-accent/90",
        outline:
          "border border-border bg-surface text-ink hover:bg-control",
        subtle: "bg-control text-ink hover:bg-hover",
        ghost: "text-ink hover:bg-control",
        link: "text-accent underline-offset-4 hover:underline",
        danger:
          "border border-danger/40 bg-surface text-danger hover:bg-danger/10",
      },
      size: {
        sm: "h-8 px-3 text-[13px] [&_svg]:size-3.5",
        default: "h-10 px-4 [&_svg]:size-4",
        lg: "h-11 px-5 [&_svg]:size-[18px]",
        icon: "size-9 [&_svg]:size-[18px]",
        "icon-sm": "size-8 [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };

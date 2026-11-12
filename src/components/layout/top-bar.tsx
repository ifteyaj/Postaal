"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function TopBar() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <header className="flex h-[76px] shrink-0 items-center justify-end border-b border-border-strong px-6">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? (
              <Moon className="text-ink-muted" aria-hidden="true" />
            ) : (
              <Sun className="text-ink-muted" aria-hidden="true" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isDark ? "Switch to light theme" : "Switch to dark theme"}
        </TooltipContent>
      </Tooltip>
    </header>
  );
}

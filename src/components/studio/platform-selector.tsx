"use client";

import { Check } from "lucide-react";

import { PlatformLogo } from "@/components/brand/platform-logo";
import { PLATFORM_LIST } from "@/lib/platforms";
import type { PlatformId } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Tile metrics transcribed from the Figma source so each platform button
 * keeps its designed width and left padding.
 */
const TILE_METRICS: Record<PlatformId, { minWidth: string; paddingLeft: string }> =
  {
    x: { minWidth: "min-w-[131px]", paddingLeft: "pl-[18px]" },
    instagram: { minWidth: "min-w-[145px]", paddingLeft: "pl-3" },
    linkedin: { minWidth: "min-w-[141px]", paddingLeft: "pl-[18px]" },
    facebook: { minWidth: "min-w-[157px]", paddingLeft: "pl-3" },
  };

export function PlatformSelector({
  selected,
  onToggle,
  onSelectAll,
}: {
  selected: PlatformId[];
  onToggle: (platform: PlatformId) => void;
  onSelectAll: () => void;
}) {
  const allSelected = selected.length === PLATFORM_LIST.length;

  return (
    <section aria-labelledby="select-platforms-heading">
      <div className="flex items-center justify-between">
        <h2
          id="select-platforms-heading"
          className="text-lg leading-[25px] font-semibold text-ink"
        >
          Select Platforms
        </h2>
        <button
          type="button"
          onClick={onSelectAll}
          className="text-sm font-medium text-accent transition-opacity hover:opacity-80"
        >
          {allSelected ? "Clear All" : "Select All"}
        </button>
      </div>

      <ul className="mt-3.5 flex flex-wrap items-start gap-2.5">
        {PLATFORM_LIST.map((platform) => {
          const isSelected = selected.includes(platform.id);
          const metrics = TILE_METRICS[platform.id];
          return (
            <li key={platform.id}>
              <button
                type="button"
                onClick={() => onToggle(platform.id)}
                aria-pressed={isSelected}
                className={cn(
                  "relative flex h-14 items-center gap-3 rounded-md border bg-surface py-2 pr-2 transition-colors",
                  metrics.minWidth,
                  metrics.paddingLeft,
                  isSelected
                    ? "border-accent-soft border-[1.5px]"
                    : "border-border hover:bg-control",
                )}
              >
                <PlatformLogo platform={platform.id} title={null} />
                <span className="text-sm leading-5 font-medium text-ink">
                  {platform.label}
                </span>

                <span
                  className={cn(
                    "absolute top-[9px] right-2 flex size-[17px] items-center justify-center rounded-full border-[1.5px]",
                    isSelected
                      ? "border-accent bg-accent"
                      : "border-circle-border bg-surface",
                  )}
                  aria-hidden="true"
                >
                  {isSelected ? (
                    <Check className="size-3 text-white" strokeWidth={3} />
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

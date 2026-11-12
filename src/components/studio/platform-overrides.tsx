"use client";

import { Pencil, RotateCcw } from "lucide-react";
import { useState } from "react";

import { PlatformLogo } from "@/components/brand/platform-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { effectiveCharacterLimit, PLATFORMS } from "@/lib/platforms";
import type { PlatformId } from "@/lib/types";

export function PlatformOverrides({
  platforms,
  overrides,
  masterContent,
  onChange,
}: {
  platforms: PlatformId[];
  overrides: Partial<Record<PlatformId, { content: string | null }>>;
  masterContent: string;
  onChange: (platform: PlatformId, content: string | null) => void;
}) {
  const [editing, setEditing] = useState<PlatformId | null>(null);

  if (platforms.length < 2) return null;

  return (
    <section aria-labelledby="overrides-heading">
      <div className="flex items-baseline justify-between">
        <h2
          id="overrides-heading"
          className="text-lg leading-[25px] font-semibold text-ink"
        >
          Platform Overrides
        </h2>
        <p className="text-xs text-ink-lavender">
          Tailor the caption per destination
        </p>
      </div>

      <ul className="mt-3.5 flex flex-col gap-2">
        {platforms.map((platform) => {
          const definition = PLATFORMS[platform];
          const override = overrides[platform]?.content ?? null;
          const custom = override !== null && override.length > 0;
          const isEditing = editing === platform;
          const limit = effectiveCharacterLimit([platform]);
          const value = override ?? masterContent;

          return (
            <li
              key={platform}
              className="rounded-md border border-border bg-surface"
            >
              <div className="flex items-center gap-3 px-3 py-2.5">
                <PlatformLogo platform={platform} title={null} />
                <span className="text-sm font-medium text-ink">
                  {definition.label}
                </span>
                <Badge variant={custom ? "accent" : "neutral"}>
                  {custom ? "Custom" : "Master content"}
                </Badge>
                <div className="ml-auto flex items-center gap-1">
                  {custom ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onChange(platform, null);
                        setEditing(null);
                      }}
                    >
                      <RotateCcw aria-hidden="true" />
                      Reset
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(isEditing ? null : platform)}
                    aria-expanded={isEditing}
                  >
                    <Pencil aria-hidden="true" />
                    {isEditing ? "Close" : "Edit"}
                  </Button>
                </div>
              </div>

              {isEditing ? (
                <div className="border-t border-border p-3">
                  <Textarea
                    value={value}
                    onChange={(event) => onChange(platform, event.target.value)}
                    rows={3}
                    aria-label={`${definition.label} caption`}
                    className="text-sm"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-ink-lavender">
                      {value.length} / {limit} characters
                    </p>
                    <Button
                      size="sm"
                      onClick={() =>
                        onChange(
                          platform,
                          value.trim() === masterContent.trim() ? null : value,
                        )
                      }
                    >
                      Save override
                    </Button>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

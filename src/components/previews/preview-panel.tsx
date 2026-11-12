"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useRef } from "react";

import { PlatformTabLogo } from "@/components/brand/platform-logo";
import { FacebookPostPreview } from "@/components/previews/facebook-post-preview";
import { InstagramPostPreview } from "@/components/previews/instagram-post-preview";
import { LinkedInPostPreview } from "@/components/previews/linkedin-post-preview";
import { XPostPreview } from "@/components/previews/x-post-preview";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PLATFORM_LIST } from "@/lib/platforms";
import type { PreviewModel } from "@/lib/preview-model";
import type { PlatformId } from "@/lib/types";
import { cn } from "@/lib/utils";

const PREVIEW_COMPONENTS: Record<
  PlatformId,
  (props: { model: PreviewModel }) => React.ReactElement
> = {
  x: XPostPreview,
  instagram: InstagramPostPreview,
  linkedin: LinkedInPostPreview,
  facebook: FacebookPostPreview,
};

export function PreviewPanel({
  models,
  activePlatform,
  onActivePlatformChange,
  className,
}: {
  models: Record<PlatformId, PreviewModel>;
  activePlatform: PlatformId;
  onActivePlatformChange: (platform: PlatformId) => void;
  className?: string;
}) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const ActivePreview = PREVIEW_COMPONENTS[activePlatform];

  function handleTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const currentIndex = PLATFORM_LIST.findIndex(
      (platform) => platform.id === activePlatform,
    );
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex =
      (currentIndex + delta + PLATFORM_LIST.length) % PLATFORM_LIST.length;
    const next = PLATFORM_LIST[nextIndex];
    if (!next) return;
    onActivePlatformChange(next.id);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <section
      className={cn(
        "flex flex-col rounded-xl border border-border bg-surface shadow-card",
        className,
      )}
      aria-label="Social preview"
    >
      <div className="flex items-start gap-4 px-6 pt-5 pb-4">
        <h2 className="text-[22px] leading-[31px] font-semibold text-ink">
          Preview
        </h2>

        <div className="ml-auto flex items-center gap-3">
          <div
            role="tablist"
            aria-label="Preview platform"
            className="inline-flex items-center rounded-2xl border border-border bg-tabbar p-0.5"
          >
            {PLATFORM_LIST.map((platform, index) => {
              const selected = platform.id === activePlatform;
              return (
                <button
                  key={platform.id}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`preview-tab-${platform.id}`}
                  aria-selected={selected}
                  aria-controls={`preview-panel-${platform.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => onActivePlatformChange(platform.id)}
                  onKeyDown={handleTabKeyDown}
                  className={cn(
                    "flex size-14 items-center justify-center rounded-xl transition-all",
                    selected
                      ? "bg-surface shadow-tab"
                      : "text-ink-lavender hover:text-ink",
                  )}
                >
                  <span className="sr-only">{platform.label}</span>
                  <PlatformTabLogo platform={platform.id} title={null} />
                </button>
              );
            })}
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="text-ink-muted"
              >
                <Link
                  href="/studio/preview"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open preview in a new tab"
                >
                  <ExternalLink aria-hidden="true" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open preview in a new tab</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-6 pb-5">
        <div className="rounded-xl border border-border bg-page/40 p-4">
          <div
            role="tabpanel"
            id={`preview-panel-${activePlatform}`}
            aria-labelledby={`preview-tab-${activePlatform}`}
            className="mx-auto max-w-[539px]"
          >
            <ActivePreview model={models[activePlatform]} />
          </div>
        </div>

        <p className="mt-3 text-[11px] leading-4 text-ink-lavender">
          Simulation only. Postaal previews are approximations and do not
          guarantee how a platform will render or accept the post.
        </p>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { PlatformTabLogo } from "@/components/brand/platform-logo";
import { PostaalLogo } from "@/components/brand/postaal-logo";
import { FacebookPostPreview } from "@/components/previews/facebook-post-preview";
import { InstagramPostPreview } from "@/components/previews/instagram-post-preview";
import { LinkedInPostPreview } from "@/components/previews/linkedin-post-preview";
import { XPostPreview } from "@/components/previews/x-post-preview";
import { useAppData } from "@/components/providers/app-data-provider";
import { Button } from "@/components/ui/button";
import { PLATFORM_LIST } from "@/lib/platforms";
import { buildPreviewModel, emptyPost } from "@/lib/preview-model";
import type { PlatformId } from "@/lib/types";
import { cn } from "@/lib/utils";

const PREVIEW_COMPONENTS = {
  x: XPostPreview,
  instagram: InstagramPostPreview,
  linkedin: LinkedInPostPreview,
  facebook: FacebookPostPreview,
} as const;

export default function StandalonePreviewPage() {
  const { posts, media, accounts, activePostId } = useAppData();
  const [activePlatform, setActivePlatform] = useState<PlatformId>("x");

  const post = useMemo(
    () => posts.find((candidate) => candidate.id === activePostId) ?? null,
    [posts, activePostId],
  );

  const models = useMemo(() => {
    const source = post ?? emptyPost();
    return Object.fromEntries(
      PLATFORM_LIST.map((platform) => [
        platform.id,
        buildPreviewModel({
          post: source,
          platform: platform.id,
          media,
          accounts,
        }),
      ]),
    ) as Record<PlatformId, ReturnType<typeof buildPreviewModel>>;
  }, [post, media, accounts]);

  const ActivePreview = PREVIEW_COMPONENTS[activePlatform];

  return (
    <div className="min-h-dvh bg-page px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-3">
          <PostaalLogo />
          <span className="text-lg font-semibold text-ink">Postaal</span>
          <Button asChild variant="ghost" size="sm" className="ml-auto">
            <Link href="/studio">
              <ArrowLeft aria-hidden="true" />
              Back to Studio
            </Link>
          </Button>
        </div>

        <h1 className="mt-8 text-[28px] leading-9 font-semibold text-ink-strong">
          Preview
        </h1>
        <p className="mt-1 text-sm text-ink-lavender">
          Simulation only. Previews do not guarantee how a platform will render
          or accept the post.
        </p>

        <div
          role="tablist"
          aria-label="Preview platform"
          className="mt-5 inline-flex items-center rounded-2xl border border-border bg-tabbar p-0.5"
        >
          {PLATFORM_LIST.map((platform) => {
            const selected = platform.id === activePlatform;
            return (
              <button
                key={platform.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActivePlatform(platform.id)}
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

        <div className="mt-6">
          {post ? (
            <ActivePreview model={models[activePlatform]} />
          ) : (
            <p className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-ink-lavender">
              No active post. Open the Studio to compose one.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

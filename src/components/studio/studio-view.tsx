"use client";

import { useMemo, useState } from "react";
import { FileText, PenLine } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { PreviewPanel } from "@/components/previews/preview-panel";
import { useAppData } from "@/components/providers/app-data-provider";
import { useToast } from "@/components/providers/toast-provider";
import { AiCaptionDialog } from "@/components/studio/ai-caption-dialog";
import { ContentEditor, type AiAction } from "@/components/studio/content-editor";
import { MediaUploader } from "@/components/studio/media-uploader";
import { PlatformOverrides } from "@/components/studio/platform-overrides";
import { PlatformSelector } from "@/components/studio/platform-selector";
import { PublishResultsDialog } from "@/components/studio/publish-results-dialog";
import { PublishingActions } from "@/components/studio/publishing-actions";
import { ScheduleDialog } from "@/components/studio/schedule-dialog";
import { SchedulePanel } from "@/components/studio/schedule-panel";
import { Button } from "@/components/ui/button";
import { PLATFORMS, PLATFORM_LIST } from "@/lib/platforms";
import {
  buildPreviewModel,
  emptyPost,
  resolveCaption,
} from "@/lib/preview-model";
import { toWallClockInput, wallClockToUtc } from "@/lib/time";
import type { PlatformId } from "@/lib/types";
import { cn } from "@/lib/utils";

function defaultScheduleValue(timezone: string): {
  date: string;
  time: string;
} {
  const soon = new Date(Date.now() + 60 * 60 * 1000);
  const wallClock = toWallClockInput(soon, timezone);
  const [date = "", time = ""] = wallClock.split("T");
  return { date, time };
}

export function StudioView() {
  const {
    posts,
    media,
    accounts,
    settings,
    activePostId,
    createPost,
    updatePost,
    publishPost,
    retryTarget,
    addMedia,
  } = useAppData();
  const { toast } = useToast();

  const [previewChoice, setPreviewChoice] = useState<{
    postId: string;
    platform: PlatformId;
  } | null>(null);
  const [mobilePane, setMobilePane] = useState<"compose" | "preview">("compose");
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleExpanded, setScheduleExpanded] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiAction, setAiAction] = useState<AiAction>("caption");
  const [resultsOpen, setResultsOpen] = useState(false);
  const [resultsPostId, setResultsPostId] = useState<string | null>(null);

  const post = useMemo(
    () => posts.find((candidate) => candidate.id === activePostId) ?? null,
    [posts, activePostId],
  );

  const scheduleDefaults = useMemo(
    () => defaultScheduleValue(settings.timezone),
    [settings.timezone],
  );
  const scheduleDateValue = scheduleDate || scheduleDefaults.date;
  const scheduleTimeValue = scheduleTime || scheduleDefaults.time;

  const activePreview: PlatformId = useMemo(() => {
    if (previewChoice && previewChoice.postId === post?.id) {
      return previewChoice.platform;
    }
    return post?.platforms[0] ?? "x";
  }, [previewChoice, post]);

  const previewModels = useMemo(() => {
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

  const handleSelectPreview = (platform: PlatformId) => {
    if (!post) return;
    setPreviewChoice({ postId: post.id, platform });
  };

  if (!post) {
    return (
      <>
        <PageHeader
          title="Create a Post"
          description="Write, preview and schedule your content."
        />
        <div className="rounded-xl border border-border bg-surface p-10 text-center shadow-card">
          <p className="text-sm font-medium text-ink">No post open</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-ink-lavender">
            Start a new post to compose, preview and schedule your content.
          </p>
          <Button type="button" className="mt-4" onClick={() => createPost()}>
            <PenLine aria-hidden="true" />
            New post
          </Button>
        </div>
      </>
    );
  }

  const caption = post.masterContent;

  const togglePlatform = (platform: PlatformId) => {
    const selected = post.platforms.includes(platform);
    const nextPlatforms = selected
      ? post.platforms.filter((candidate) => candidate !== platform)
      : [...post.platforms, platform];

    updatePost(post.id, { platforms: nextPlatforms });

    // Keep the preview in step with the destinations the user just picked.
    if (!selected) {
      handleSelectPreview(platform);
      return;
    }
    if (!nextPlatforms.includes(activePreview)) {
      handleSelectPreview(nextPlatforms[0] ?? platform);
    }
  };

  const selectAllPlatforms = () => {
    const allSelected = post.platforms.length === PLATFORM_LIST.length;
    const nextPlatforms = allSelected
      ? []
      : PLATFORM_LIST.map((platform) => platform.id);
    updatePost(post.id, { platforms: nextPlatforms });
    const first = nextPlatforms[0];
    if (first) handleSelectPreview(first);
  };

  const handleAttachMedia = (asset: (typeof media)[number]) => {
    addMedia(asset);
    updatePost(post.id, {
      mediaIds: post.mediaIds.includes(asset.id)
        ? post.mediaIds
        : [...post.mediaIds, asset.id],
    });
  };

  const handleDetachMedia = (mediaId: string) => {
    updatePost(post.id, {
      mediaIds: post.mediaIds.filter((candidate) => candidate !== mediaId),
    });
  };

  const issues: string[] = [];
  if (post.platforms.length === 0) {
    issues.push("Select at least one destination.");
  }
  if (caption.trim().length === 0) {
    issues.push("Add a caption before publishing.");
  }
  for (const platform of post.platforms) {
    const definition = PLATFORMS[platform];
    const text = resolveCaption(post, platform);
    if (text.length > definition.characterLimit) {
      issues.push(
        `${definition.label} allows ${definition.characterLimit} characters (this caption is ${text.length}).`,
      );
    }
    if (post.mediaIds.length > definition.mediaLimit) {
      issues.push(
        `${definition.label} allows up to ${definition.mediaLimit} media items.`,
      );
    }
  }
  const canPublish = issues.length === 0;

  const handleSaveDraft = () => {
    updatePost(post.id, { status: "draft", scheduledAt: null });
    toast({
      title: "Draft saved",
      description: "Saved locally in this browser.",
      variant: "success",
    });
  };

  const handlePublishNow = () => {
    if (!canPublish) return;
    publishPost(post.id);
    setResultsPostId(post.id);
    setResultsOpen(true);
    toast({
      title: "Simulated publish started",
      description: "No real post was sent. Results are simulated in your browser.",
    });
  };

  const handleScheduleConfirm = () => {
    if (!scheduleDateValue || !scheduleTimeValue) {
      setScheduleError("Choose a date and a time.");
      return;
    }

    let instant: Date;
    try {
      instant = wallClockToUtc(
        `${scheduleDateValue}T${scheduleTimeValue}`,
        settings.timezone,
      );
    } catch {
      setScheduleError("That date and time could not be read.");
      return;
    }

    if (instant.getTime() <= Date.now()) {
      setScheduleError("Choose a time in the future.");
      return;
    }

    setScheduleError(null);
    updatePost(post.id, {
      status: "scheduled",
      scheduledAt: instant.toISOString(),
    });
    setScheduleDialogOpen(false);
    setScheduleEnabled(true);
    toast({
      title: "Post scheduled",
      description: `Stored as ${instant.toISOString()}.`,
      variant: "success",
    });
  };

  const resultsPost =
    posts.find((candidate) => candidate.id === (resultsPostId ?? post.id)) ??
    null;

  return (
    <>
      <PageHeader
        title="Create a Post"
        description="Write, preview and schedule your content."
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                createPost();
                setScheduleEnabled(false);
              }}
            >
              <PenLine aria-hidden="true" />
              New post
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                const withResults = posts.find(
                  (candidate) =>
                    candidate.status === "published" ||
                    candidate.status === "partial" ||
                    candidate.status === "failed",
                );
                if (!withResults) {
                  toast({
                    title: "No results yet",
                    description: "Publish a post to see its results.",
                  });
                  return;
                }
                setResultsPostId(withResults.id);
                setResultsOpen(true);
              }}
            >
              <FileText aria-hidden="true" />
              Recent results
            </Button>
          </>
        }
      />

      <div className="mb-4 flex rounded-lg border border-border bg-surface p-0.5 lg:hidden">
        <button
          type="button"
          onClick={() => setMobilePane("compose")}
          aria-pressed={mobilePane === "compose"}
          className={cn(
            "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            mobilePane === "compose"
              ? "bg-nav-selected text-accent"
              : "text-ink-lavender",
          )}
        >
          Compose
        </button>
        <button
          type="button"
          onClick={() => setMobilePane("preview")}
          aria-pressed={mobilePane === "preview"}
          className={cn(
            "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            mobilePane === "preview"
              ? "bg-nav-selected text-accent"
              : "text-ink-lavender",
          )}
        >
          Preview
        </button>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <section
          className={cn(
            "flex flex-col gap-7 rounded-xl border border-border bg-surface p-6 shadow-card",
            mobilePane === "compose" ? "block" : "hidden lg:flex",
          )}
          aria-label="Post editor"
        >
          <PlatformSelector
            selected={post.platforms}
            onToggle={togglePlatform}
            onSelectAll={selectAllPlatforms}
          />

          <div className="h-px w-full bg-border" />

          <ContentEditor
            value={caption}
            onChange={(value) => updatePost(post.id, { masterContent: value })}
            platforms={post.platforms}
            onRequestAi={(action) => {
              setAiAction(action);
              setAiDialogOpen(true);
            }}
            error={
              post.platforms.some(
                (platform) =>
                  resolveCaption(post, platform).length >
                  PLATFORMS[platform].characterLimit,
              )
                ? "This caption is longer than one of the selected platforms allows."
                : null
            }
          />

          <PlatformOverrides
            platforms={post.platforms}
            overrides={post.overrides}
            masterContent={caption}
            onChange={(platform, content) =>
              updatePost(post.id, (current) => ({
                overrides: {
                  ...current.overrides,
                  [platform]: { content },
                },
              }))
            }
          />

          <MediaUploader
            mediaIds={post.mediaIds}
            onAttach={handleAttachMedia}
            onDetach={handleDetachMedia}
          />

          <SchedulePanel
            enabled={scheduleEnabled}
            onEnabledChange={(enabled) => {
              setScheduleEnabled(enabled);
              if (enabled) setScheduleExpanded(true);
            }}
            expanded={scheduleExpanded}
            onExpandedChange={setScheduleExpanded}
            date={scheduleDateValue}
            time={scheduleTimeValue}
            onDateChange={setScheduleDate}
            onTimeChange={setScheduleTime}
            timezone={settings.timezone}
            error={scheduleError}
          />

          {issues.length > 0 ? (
            <ul className="rounded-md border border-warning/30 bg-warning/5 p-3 text-xs text-warning">
              {issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          ) : null}

          <PublishingActions
            onSaveDraft={handleSaveDraft}
            onPublishNow={handlePublishNow}
            onSchedule={() => {
              setScheduleError(null);
              setScheduleDialogOpen(true);
            }}
            onPreviewResults={() => {
              setResultsPostId(post.id);
              setResultsOpen(true);
            }}
            canPublish={canPublish}
            hasResults={Object.keys(post.targetResults).length > 0}
            isPublishing={post.status === "publishing"}
          />
        </section>

        <div className={cn(mobilePane === "preview" ? "block" : "hidden lg:block")}>
          <PreviewPanel
            models={previewModels}
            activePlatform={activePreview}
            onActivePlatformChange={handleSelectPreview}
          />
        </div>
      </div>

      <AiCaptionDialog
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        action={aiAction}
        currentContent={caption}
        onApply={(content) => updatePost(post.id, { masterContent: content })}
      />

      <ScheduleDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        date={scheduleDateValue}
        time={scheduleTimeValue}
        timezone={settings.timezone}
        onDateChange={setScheduleDate}
        onTimeChange={setScheduleTime}
        onConfirm={handleScheduleConfirm}
        error={scheduleError}
      />

      <PublishResultsDialog
        open={resultsOpen}
        onOpenChange={setResultsOpen}
        post={resultsPost}
        onRetry={(platform) => {
          if (resultsPost) retryTarget(resultsPost.id, platform);
        }}
      />
    </>
  );
}

"use client";

import { CheckCircle2, CircleDashed, Loader2, TriangleAlert } from "lucide-react";

import { PlatformLogo } from "@/components/brand/platform-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PLATFORMS } from "@/lib/platforms";
import type { PlatformId, Post } from "@/lib/types";

const STATUS_META = {
  pending: { label: "Pending", icon: CircleDashed, className: "text-ink-lavender" },
  publishing: { label: "Publishing", icon: Loader2, className: "text-info" },
  published: { label: "Published", icon: CheckCircle2, className: "text-success" },
  failed: { label: "Failed", icon: TriangleAlert, className: "text-danger" },
} as const;

export function PublishResultsDialog({
  open,
  onOpenChange,
  post,
  onRetry,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post | null;
  onRetry: (platform: PlatformId) => void;
}) {
  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Publishing results</DialogTitle>
          <DialogDescription>
            Simulated results for this prototype. No real post was sent to any
            platform.
          </DialogDescription>
        </DialogHeader>

        <ul className="flex flex-col gap-2">
          {post.platforms.map((platform) => {
            const result = post.targetResults[platform];
            const meta = STATUS_META[result?.status ?? "pending"];
            const Icon = meta.icon;

            return (
              <li
                key={platform}
                className="flex flex-col gap-2 rounded-md border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  <PlatformLogo platform={platform} title={null} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">
                      {PLATFORMS[platform].label}
                    </p>
                    <p className="text-xs text-ink-lavender">
                      {result?.platformPostId
                        ? `Simulated id ${result.platformPostId}`
                        : "No simulated id"}
                    </p>
                  </div>
                  <Badge
                    variant={
                      result?.status === "published"
                        ? "success"
                        : result?.status === "failed"
                          ? "danger"
                          : "neutral"
                    }
                  >
                    <Icon
                      className={`size-3 ${meta.className} ${result?.status === "publishing" ? "animate-spin" : ""}`}
                      aria-hidden="true"
                    />
                    {meta.label}
                  </Badge>
                </div>

                {result?.status === "failed" ? (
                  <div className="rounded-md bg-danger/5 p-2.5">
                    <p className="text-xs text-danger">{result.errorMessage}</p>
                    <p className="mt-1 text-[11px] text-ink-lavender">
                      Code {result.errorCode}. Other destinations are unaffected.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => onRetry(platform)}
                    >
                      Retry this destination
                    </Button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

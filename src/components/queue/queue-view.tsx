"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Copy,
  MoreHorizontal,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";

import { PlatformLogo } from "@/components/brand/platform-logo";
import { useAppData } from "@/components/providers/app-data-provider";
import { useToast } from "@/components/providers/toast-provider";
import { PostStatusBadge } from "@/components/shared/post-status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PLATFORMS } from "@/lib/platforms";
import { formatInZone } from "@/lib/time";
import type { Post } from "@/lib/types";
import { cn } from "@/lib/utils";

type Filter = "all" | "draft" | "scheduled" | "published" | "attention";

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "All" },
  { id: "draft", label: "Drafts" },
  { id: "scheduled", label: "Scheduled" },
  { id: "published", label: "Published" },
  { id: "attention", label: "Needs attention" },
];

function matchesFilter(post: Post, filter: Filter): boolean {
  switch (filter) {
    case "draft":
      return post.status === "draft";
    case "scheduled":
      return post.status === "scheduled" || post.status === "publishing";
    case "published":
      return post.status === "published" || post.status === "partial";
    case "attention":
      return post.status === "failed" || post.status === "partial";
    case "all":
    default:
      return true;
  }
}

export function QueueView() {
  const {
    posts,
    settings,
    deletePost,
    duplicatePost,
    cancelSchedule,
    setActivePost,
  } = useAppData();
  const { toast } = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  const [pendingDelete, setPendingDelete] = useState<Post | null>(null);

  const visiblePosts = useMemo(
    () =>
      posts
        .filter((post) => matchesFilter(post, filter))
        .sort((a, b) => {
          if (a.scheduledAt && b.scheduledAt) {
            return a.scheduledAt.localeCompare(b.scheduledAt);
          }
          if (a.scheduledAt) return -1;
          if (b.scheduledAt) return 1;
          return b.updatedAt.localeCompare(a.updatedAt);
        }),
    [posts, filter],
  );

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setFilter(option.id)}
            aria-pressed={filter === option.id}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              filter === option.id
                ? "border-accent bg-nav-selected text-accent"
                : "border-border bg-surface text-ink-lavender hover:text-ink",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {visiblePosts.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center shadow-card">
          <p className="text-sm font-medium text-ink">Nothing here yet</p>
          <p className="mt-1 text-sm text-ink-lavender">
            {filter === "all"
              ? "Posts you compose in the Studio will appear in this queue."
              : "No posts match this filter right now."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {visiblePosts.map((post) => (
            <li
              key={post.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-card sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <span className="mt-0.5 flex shrink-0 -space-x-1.5">
                  {post.platforms.map((platform) => (
                    <PlatformLogo
                      key={platform}
                      platform={platform}
                      title={null}
                      className="size-6 ring-2 ring-surface"
                    />
                  ))}
                </span>
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm leading-5 text-ink">
                    {post.masterContent || "Untitled post"}
                  </p>
                  <p className="mt-1 text-xs text-ink-lavender">
                    {post.scheduledAt
                      ? `Scheduled for ${formatInZone(post.scheduledAt, settings.timezone, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}`
                      : `Updated ${formatInZone(post.updatedAt, settings.timezone, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}`}
                    {" - "}
                    {post.platforms
                      .map((platform) => PLATFORMS[platform].label)
                      .join(", ")}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <PostStatusBadge status={post.status} />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Actions for ${
                        post.masterContent.slice(0, 30) || "post"
                      }`}
                    >
                      <MoreHorizontal aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link
                        href="/studio"
                        onClick={() => setActivePost(post.id)}
                      >
                        <Pencil aria-hidden="true" />
                        Edit in Studio
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        const id = duplicatePost(post.id);
                        if (id) {
                          toast({
                            title: "Post duplicated",
                            description: "The copy is open in the Studio.",
                            variant: "success",
                          });
                        }
                      }}
                    >
                      <Copy aria-hidden="true" />
                      Duplicate
                    </DropdownMenuItem>
                    {post.scheduledAt ? (
                      <DropdownMenuItem
                        onSelect={() => {
                          cancelSchedule(post.id);
                          toast({
                            title: "Schedule cancelled",
                            description:
                              "The post moved back to drafts.",
                          });
                        }}
                      >
                        <XCircle aria-hidden="true" />
                        Cancel schedule
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="danger"
                      onSelect={() => setPendingDelete(post)}
                    >
                      <Trash2 aria-hidden="true" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this post?</DialogTitle>
            <DialogDescription>
              The post and its simulated results are removed from this browser.
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                if (pendingDelete) {
                  deletePost(pendingDelete.id);
                  toast({ title: "Post deleted" });
                }
                setPendingDelete(null);
              }}
            >
              <Trash2 aria-hidden="true" />
              Delete post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

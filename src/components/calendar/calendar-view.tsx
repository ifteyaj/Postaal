"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { PlatformLogo } from "@/components/brand/platform-logo";
import { useAppData } from "@/components/providers/app-data-provider";
import { PostStatusBadge } from "@/components/shared/post-status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PLATFORMS } from "@/lib/platforms";
import { applyDateFormat, formatInZone, toWallClockInput } from "@/lib/time";
import type { Post } from "@/lib/types";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface CalendarCell {
  date: Date;
  key: string;
  inMonth: boolean;
  isToday: boolean;
  posts: Post[];
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function toKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function CalendarView() {
  const { posts, settings } = useAppData();
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const scheduledPosts = useMemo(
    () => posts.filter((post) => post.scheduledAt !== null),
    [posts],
  );

  const cells = useMemo<CalendarCell[]>(() => {
    const monthStart = startOfMonth(cursor);
    const gridStart = new Date(monthStart);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());

    const todayKey = toKey(new Date());

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      const key = toKey(date);

      const dayPosts = scheduledPosts.filter((post) => {
        if (!post.scheduledAt) return false;
        return toWallClockInput(post.scheduledAt, settings.timezone).slice(0, 10) === key;
      });

      return {
        date,
        key,
        inMonth: date.getMonth() === cursor.getMonth(),
        isToday: key === todayKey,
        posts: dayPosts,
      };
    });
  }, [cursor, scheduledPosts, settings.timezone]);

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(cursor);

  return (
    <>
      <div className="rounded-xl border border-border bg-surface shadow-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold text-ink">{monthLabel}</h2>
          <div className="ml-auto flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCursor(new Date())}
            >
              Today
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Previous month"
              onClick={() =>
                setCursor(
                  new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1),
                )
              }
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Next month"
              onClick={() =>
                setCursor(
                  new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1),
                )
              }
            >
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-border">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="px-3 py-2.5 text-xs font-medium text-ink-lavender"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((cell, index) => (
            <div
              key={cell.key}
              className={cn(
                "min-h-[112px] border-border p-2",
                index % 7 !== 6 && "border-r",
                index < 35 && "border-b",
                !cell.inMonth && "bg-page/50",
              )}
            >
              <p
                className={cn(
                  "mb-1 text-xs font-medium tabular-nums",
                  cell.isToday
                    ? "text-accent"
                    : cell.inMonth
                      ? "text-ink"
                      : "text-ink-lavender/60",
                )}
              >
                {cell.date.getDate()}
              </p>

              <ul className="flex flex-col gap-1">
                {cell.posts.map((post) => (
                  <li key={post.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedPost(post)}
                      className="flex w-full items-center gap-1.5 rounded-md border border-border bg-control px-1.5 py-1 text-left transition-colors hover:border-accent-soft"
                    >
                      <span className="flex shrink-0 -space-x-1">
                        {post.platforms.slice(0, 3).map((platform) => (
                          <PlatformLogo
                            key={platform}
                            platform={platform}
                            title={null}
                            className="size-3.5 ring-1 ring-surface"
                          />
                        ))}
                      </span>
                      <span className="truncate text-[11px] text-ink">
                        {post.masterContent || "Untitled post"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 text-xs text-ink-lavender">
        Times are displayed in {settings.timezone}. Scheduled instants are
        stored in UTC.
      </p>

      <Dialog
        open={selectedPost !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedPost(null);
        }}
      >
        <DialogContent className="max-w-lg">
          {selectedPost ? (
            <>
              <DialogHeader>
                <DialogTitle>Scheduled post</DialogTitle>
                <DialogDescription>
                  {selectedPost.scheduledAt
                    ? formatInZone(selectedPost.scheduledAt, settings.timezone, {
                        dateStyle: "full",
                        timeStyle: "short",
                      })
                    : "Not scheduled"}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-3">
                <p className="text-sm leading-6 whitespace-pre-wrap text-ink">
                  {selectedPost.masterContent || "Untitled post"}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <PostStatusBadge status={selectedPost.status} />
                  {selectedPost.platforms.map((platform) => (
                    <span
                      key={platform}
                      className="flex items-center gap-1.5 rounded-full border border-border bg-control px-2 py-0.5 text-[11px] text-ink-subtle"
                    >
                      <PlatformLogo platform={platform} title={null} className="size-3.5" />
                      {PLATFORMS[platform].label}
                    </span>
                  ))}
                </div>

                {selectedPost.scheduledAt ? (
                  <p className="text-xs text-ink-lavender">
                    Stored instant: {selectedPost.scheduledAt} (
                    {applyDateFormat(selectedPost.scheduledAt, settings.dateFormat)}
                    )
                  </p>
                ) : null}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

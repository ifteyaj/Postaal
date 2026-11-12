"use client";

import { CalendarDays, ChevronDown, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PublishingActions({
  onSaveDraft,
  onPublishNow,
  onSchedule,
  onPreviewResults,
  canPublish,
  hasResults,
  isPublishing,
}: {
  onSaveDraft: () => void;
  onPublishNow: () => void;
  onSchedule: () => void;
  onPreviewResults: () => void;
  canPublish: boolean;
  hasResults: boolean;
  isPublishing: boolean;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={onSaveDraft}
        className="h-[42px] px-4"
      >
        Save Draft
      </Button>

      <div className="flex flex-wrap items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              disabled={!canPublish || isPublishing}
              className="h-[42px] gap-2.5 px-4"
            >
              <Send aria-hidden="true" />
              {isPublishing ? "Publishing" : "Publish Now"}
              <ChevronDown aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuItem
              onSelect={onPublishNow}
              className="flex-col items-start gap-0.5 py-2"
              disabled={!canPublish}
            >
              <span className="text-sm font-medium text-ink">Publish now</span>
              <span className="text-xs text-ink-lavender">
                Simulated publish for every selected destination
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={onSchedule}
              className="flex-col items-start gap-0.5 py-2"
              disabled={!canPublish}
            >
              <span className="text-sm font-medium text-ink">
                Schedule for later
              </span>
              <span className="text-xs text-ink-lavender">
                Choose a date and time in your timezone
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          type="button"
          variant="outline"
          onClick={onSchedule}
          disabled={!canPublish}
          className="h-[42px] gap-2.5 px-4"
        >
          <CalendarDays aria-hidden="true" />
          Schedule
        </Button>

        {hasResults ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onPreviewResults}
            className="h-[42px]"
          >
            View results
          </Button>
        ) : null}
      </div>
    </div>
  );
}

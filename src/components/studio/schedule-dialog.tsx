"use client";

import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  formatInZone,
  timeZoneLabel,
  wallClockToUtc,
} from "@/lib/time";

export function ScheduleDialog({
  open,
  onOpenChange,
  date,
  time,
  timezone,
  onDateChange,
  onTimeChange,
  onConfirm,
  error,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  time: string;
  timezone: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onConfirm: () => void;
  error?: string | null;
}) {
  let utcPreview = "";
  try {
    const instant = wallClockToUtc(`${date}T${time}`, timezone);
    utcPreview = formatInZone(instant, "UTC", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    });
  } catch {
    utcPreview = "";
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="size-4 text-ink" aria-hidden="true" />
            Schedule this post
          </DialogTitle>
          <DialogDescription>
            The time is entered in your timezone and stored as a UTC instant.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="schedule-dialog-date">Date</Label>
            <input
              id="schedule-dialog-date"
              type="date"
              value={date}
              onChange={(event) => onDateChange(event.target.value)}
              className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-ink"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="schedule-dialog-time">Time</Label>
            <input
              id="schedule-dialog-time"
              type="time"
              value={time}
              onChange={(event) => onTimeChange(event.target.value)}
              className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-ink"
            />
          </div>

          <p className="rounded-md bg-control px-3 py-2.5 text-xs text-ink-lavender">
            {timezone} ({timeZoneLabel(timezone)})
            {utcPreview ? (
              <>
                {" - "}
                <span className="text-ink">
                  {utcPreview} UTC
                </span>
              </>
            ) : null}
          </p>

          {error ? (
            <p role="alert" className="text-xs text-danger">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm}>
            Schedule post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

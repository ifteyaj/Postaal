"use client";

import { ChevronDown, Clock } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { timeZoneLabel } from "@/lib/time";
import { cn } from "@/lib/utils";

export function SchedulePanel({
  enabled,
  onEnabledChange,
  expanded,
  onExpandedChange,
  date,
  time,
  onDateChange,
  onTimeChange,
  timezone,
  error,
}: {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  timezone: string;
  error?: string | null;
}) {
  return (
    <section
      className="rounded-xl border border-border bg-control px-5 py-4"
      aria-labelledby="schedule-heading"
    >
      <div className="flex items-center gap-4">
        <Clock className="size-[22px] shrink-0 text-[#30394F]" aria-hidden="true" />

        <div className="min-w-0 flex-1">
          <h2
            id="schedule-heading"
            className="text-sm leading-5 font-semibold text-ink"
          >
            Schedule (Optional)
          </h2>
          <p className="text-xs leading-[17px] text-ink-lavender">
            {enabled
              ? "Pick the date and time this post should go out."
              : "Choose date and time to publish later"}
          </p>
        </div>

        <Switch
          checked={enabled}
          onCheckedChange={onEnabledChange}
          aria-label="Enable scheduling"
        />

        <button
          type="button"
          onClick={() => onExpandedChange(!expanded)}
          aria-expanded={expanded}
          aria-label={expanded ? "Hide scheduling details" : "Show scheduling details"}
          className="rounded-md p-1 text-[#34405B] transition-colors hover:bg-hover"
        >
          <ChevronDown
            className={cn(
              "size-4 transition-transform",
              expanded && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>
      </div>

      {expanded ? (
        <div className="mt-4 border-t border-border pt-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="schedule-date"
                className="text-xs font-medium text-ink-subtle"
              >
                Date
              </label>
              <input
                id="schedule-date"
                type="date"
                value={date}
                onChange={(event) => onDateChange(event.target.value)}
                className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-ink"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="schedule-time"
                className="text-xs font-medium text-ink-subtle"
              >
                Time
              </label>
              <input
                id="schedule-time"
                type="time"
                value={time}
                onChange={(event) => onTimeChange(event.target.value)}
                className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-ink"
              />
            </div>

            <p className="pb-2.5 text-xs text-ink-lavender">
              Times are shown in {timezone} ({timeZoneLabel(timezone)}).
            </p>
          </div>

          {error ? (
            <p role="alert" className="mt-2 text-xs text-danger">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

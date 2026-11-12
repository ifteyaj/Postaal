/**
 * Timezone-aware date helpers.
 *
 * Scheduled instants are persisted as UTC (see `docs/engineering/DOMAIN-MODEL.md`).
 * These helpers convert between a wall-clock time in the user's timezone and the
 * corresponding UTC instant without pulling in a date library.
 */

import type { DateFormat } from "@/lib/types";

export const DEFAULT_TIMEZONE = "UTC";

export function getSupportedTimezones(): string[] {
  try {
    const values = Intl.supportedValuesOf("timeZone");
    if (values.length > 0) return values;
  } catch {
    // Older runtimes fall through to the static list below.
  }
  return [
    "UTC",
    "Africa/Lagos",
    "Africa/Nairobi",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/New_York",
    "America/Sao_Paulo",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Singapore",
    "Asia/Tokyo",
    "Australia/Sydney",
    "Europe/Berlin",
    "Europe/London",
    "Europe/Paris",
    "Pacific/Auckland",
  ];
}

/** Offset in milliseconds between a UTC instant and the given timezone. */
function zoneOffsetMs(instant: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts: Record<string, string> = {};
  for (const part of formatter.formatToParts(instant)) {
    if (part.type !== "literal") parts[part.type] = part.value;
  }

  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  );

  return asUtc - instant.getTime();
}

/**
 * Converts a wall-clock time in `timeZone` to the matching UTC instant.
 *
 * @param wallClock Local date-time string shaped like `YYYY-MM-DDTHH:mm`.
 */
export function wallClockToUtc(wallClock: string, timeZone: string): Date {
  const naive = Date.parse(`${wallClock}:00Z`);
  if (Number.isNaN(naive)) {
    throw new Error(`Invalid wall clock value: ${wallClock}`);
  }

  const firstPass = zoneOffsetMs(new Date(naive), timeZone);
  let timestamp = naive - firstPass;

  const secondPass = zoneOffsetMs(new Date(timestamp), timeZone);
  if (secondPass !== firstPass) {
    timestamp = naive - secondPass;
  }

  return new Date(timestamp);
}

/** Formats an instant as a wall-clock time in the given timezone. */
export function formatInZone(
  instant: Date | string,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
): string {
  const date = typeof instant === "string" ? new Date(instant) : instant;
  return new Intl.DateTimeFormat("en-US", {
    ...options,
    timeZone,
  }).format(date);
}

/** `2026-11-13T09:30` wall-clock value for an instant, in the given timezone. */
export function toWallClockInput(
  instant: Date | string,
  timeZone: string,
): string {
  const date = typeof instant === "string" ? new Date(instant) : instant;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);

  const lookup: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") lookup[part.type] = part.value;
  }

  const hour = lookup.hour === "24" ? "00" : (lookup.hour ?? "00");
  return `${lookup.year}-${lookup.month}-${lookup.day}T${hour}:${lookup.minute}`;
}

/** Short timezone label such as `GMT+1` or `UTC`. */
export function timeZoneLabel(timeZone: string, instant: Date = new Date()): string {
  const offset = zoneOffsetMs(instant, timeZone);
  if (offset === 0) return "UTC";
  const sign = offset > 0 ? "+" : "-";
  const totalMinutes = Math.abs(offset) / 60000;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0
    ? `GMT${sign}${hours}`
    : `GMT${sign}${hours}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Applies the user's date format preference to a formatted date string.
 */
export function applyDateFormat(
  isoDate: string,
  format: DateFormat,
): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;

  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1;
  const year = date.getUTCFullYear();
  const pad = (value: number) => String(value).padStart(2, "0");

  switch (format) {
    case "iso":
      return `${year}-${pad(month)}-${pad(day)}`;
    case "dmy":
      return `${pad(day)}/${pad(month)}/${year}`;
    case "mdy":
      return `${pad(month)}/${pad(day)}/${year}`;
    case "system":
    default:
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }).format(date);
  }
}

export function isValidWallClock(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return false;
  const parsed = Date.parse(`${value}:00Z`);
  return !Number.isNaN(parsed);
}

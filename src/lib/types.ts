/**
 * Domain types for the Postaal frontend prototype.
 *
 * These mirror the logical model in `docs/engineering/DOMAIN-MODEL.md`.
 * They are intentionally free of any framework or transport concern so the
 * same shapes can back a future API layer without change.
 */

export type PlatformId = "x" | "instagram" | "linkedin" | "facebook";

export const PLATFORM_IDS: readonly PlatformId[] = [
  "x",
  "instagram",
  "linkedin",
  "facebook",
];

export type PostStatus =
  | "draft"
  | "scheduled"
  | "publishing"
  | "published"
  | "partial"
  | "failed";

export type TargetStatus = "pending" | "publishing" | "published" | "failed";

export type MediaKind = "image" | "video";

export interface MediaAsset {
  id: string;
  name: string;
  /** Data URL for uploads, or an app-relative path for bundled sample media. */
  url: string;
  mimeType: string;
  kind: MediaKind;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  createdAt: string;
}

export interface PlatformOverride {
  /** Caption for this destination. `null` means "use master content". */
  content: string | null;
}

export interface TargetResult {
  status: TargetStatus;
  platformPostId: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  publishedAt: string | null;
  /** Marks the outcome as produced by the local simulation, not a real API. */
  simulated: boolean;
}

export interface Post {
  id: string;
  masterContent: string;
  platforms: PlatformId[];
  overrides: Partial<Record<PlatformId, PlatformOverride>>;
  mediaIds: string[];
  status: PostStatus;
  /** UTC instant. Null when the post is not scheduled. */
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  targetResults: Partial<Record<PlatformId, TargetResult>>;
}

export type AccountConnectionStatus = "connected" | "expired" | "disconnected";

export interface SocialAccount {
  id: string;
  platform: PlatformId;
  displayName: string;
  handle: string;
  initials: string;
  connectionStatus: AccountConnectionStatus;
  accountType: string;
  connectedAt: string;
}

export type DateFormat = "system" | "iso" | "dmy" | "mdy";

export interface UserSettings {
  displayName: string;
  timezone: string;
  theme: "light" | "dark" | "system";
  dateFormat: DateFormat;
  weekStartsOn: 0 | 1;
  /** Show the simulated-publishing banner in the workspace. */
  confirmSimulatedPublish: boolean;
}

export interface AppState {
  posts: Post[];
  media: MediaAsset[];
  accounts: SocialAccount[];
  settings: UserSettings;
  activePostId: string | null;
}

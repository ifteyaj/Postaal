import type { PlatformId } from "@/lib/types";

export interface PlatformDefinition {
  id: PlatformId;
  label: string;
  /**
   * Published character limit for a single post/feed caption.
   *
   * These are the current published limits for each network. They must be
   * re-verified against official platform documentation before any real
   * publishing connector is enabled (see `docs/engineering/SOCIAL-INTEGRATIONS.md`).
   */
  characterLimit: number;
  /** Maximum number of media items attachable to a single post. */
  mediaLimit: number;
  /** Platforms that do not accept a caption-only post. */
  requiresMedia: boolean;
  brandColor: string;
}

export const PLATFORMS: Record<PlatformId, PlatformDefinition> = {
  x: {
    id: "x",
    label: "X",
    characterLimit: 280,
    mediaLimit: 4,
    requiresMedia: false,
    brandColor: "#090A0B",
  },
  instagram: {
    id: "instagram",
    label: "Instagram",
    characterLimit: 2200,
    mediaLimit: 10,
    requiresMedia: false,
    brandColor: "#C52ACF",
  },
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    characterLimit: 3000,
    mediaLimit: 9,
    requiresMedia: false,
    brandColor: "#087DBB",
  },
  facebook: {
    id: "facebook",
    label: "Facebook",
    characterLimit: 63206,
    mediaLimit: 10,
    requiresMedia: false,
    brandColor: "#147DFF",
  },
};

export const PLATFORM_LIST: PlatformDefinition[] = [
  PLATFORMS.x,
  PLATFORMS.instagram,
  PLATFORMS.linkedin,
  PLATFORMS.facebook,
];

export function isPlatformId(value: string): value is PlatformId {
  return value === "x" || value === "instagram" || value === "linkedin" || value === "facebook";
}

export function getPlatform(id: PlatformId): PlatformDefinition {
  return PLATFORMS[id];
}

/** The tightest limit across the selected destinations. */
export function effectiveCharacterLimit(platforms: readonly PlatformId[]): number {
  if (platforms.length === 0) return PLATFORMS.x.characterLimit;
  return Math.min(...platforms.map((id) => PLATFORMS[id].characterLimit));
}

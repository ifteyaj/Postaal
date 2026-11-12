import type { MediaAsset, PlatformId, Post, SocialAccount } from "@/lib/types";

/**
 * Normalized preview view model.
 *
 * Mirrors the preview contract in `docs/engineering/ARCHITECTURE.md`: a
 * preview is built from content only and never requires an access token or a
 * publishing API call.
 */
export interface PreviewIdentity {
  displayName: string;
  handle: string;
  initials: string;
  /** True when the identity is a labelled sample rather than a real account. */
  isSample: boolean;
}

export interface PreviewModel {
  platform: PlatformId;
  identity: PreviewIdentity;
  caption: string;
  media: MediaAsset[];
  /** Simulated rendering instant. */
  timestamp: Date;
  /** Previews are simulations, never proof of platform rendering. */
  isSimulated: true;
}

export const SAMPLE_IDENTITY: PreviewIdentity = {
  displayName: "Postaal",
  handle: "@postaal_app",
  initials: "P",
  isSample: true,
};

/** A valid, empty post used to render previews before anything is composed. */
export function emptyPost(): Post {
  const now = new Date().toISOString();
  return {
    id: "empty",
    masterContent: "",
    platforms: [],
    overrides: {},
    mediaIds: [],
    status: "draft",
    scheduledAt: null,
    createdAt: now,
    updatedAt: now,
    targetResults: {},
  };
}

/** Caption for a destination: the override when present, otherwise master. */
export function resolveCaption(post: Post, platform: PlatformId): string {
  const override = post.overrides[platform];
  if (override && typeof override.content === "string" && override.content.length > 0) {
    return override.content;
  }
  return post.masterContent;
}

/** True when a destination uses a caption other than the master content. */
export function hasOverride(post: Post, platform: PlatformId): boolean {
  const override = post.overrides[platform];
  return Boolean(override && typeof override.content === "string" && override.content.length > 0);
}

export function buildPreviewModel({
  post,
  platform,
  media,
  accounts,
  now = new Date(),
}: {
  post: Post;
  platform: PlatformId;
  media: MediaAsset[];
  accounts: SocialAccount[];
  now?: Date;
}): PreviewModel {
  const account = accounts.find((candidate) => candidate.platform === platform);
  const identity: PreviewIdentity = account
    ? {
        displayName: account.displayName,
        handle: account.handle,
        initials: account.initials,
        isSample: false,
      }
    : SAMPLE_IDENTITY;

  const assets = new Map(media.map((asset) => [asset.id, asset]));
  const attached = post.mediaIds
    .map((id) => assets.get(id))
    .filter((asset): asset is MediaAsset => Boolean(asset));

  return {
    platform,
    identity,
    caption: resolveCaption(post, platform),
    media: attached,
    timestamp: now,
    isSimulated: true,
  };
}

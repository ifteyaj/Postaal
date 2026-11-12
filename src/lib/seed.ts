import type {
  AppState,
  MediaAsset,
  Post,
  SocialAccount,
  UserSettings,
} from "@/lib/types";
import { DEFAULT_TIMEZONE } from "@/lib/time";

export const SAMPLE_MEDIA_PATH = "/media/sample-building.png";

export const DEFAULT_SETTINGS: UserSettings = {
  displayName: "Ifteyaj Ahmed",
  timezone: DEFAULT_TIMEZONE,
  theme: "light",
  dateFormat: "system",
  weekStartsOn: 0,
  confirmSimulatedPublish: true,
};

function minutesFromNow(minutes: number): string {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

function hoursFromNow(hours: number): string {
  return minutesFromNow(hours * 60);
}

export function createSeedState(): AppState {
  const sampleMedia: MediaAsset = {
    id: "media-sample-building",
    name: "sample-building.png",
    url: SAMPLE_MEDIA_PATH,
    mimeType: "image/png",
    kind: "image",
    sizeBytes: 334_209,
    width: 940,
    height: 551,
    createdAt: minutesFromNow(-60 * 24 * 5),
  };

  const accounts: SocialAccount[] = [
    {
      id: "account-x-postaal",
      platform: "x",
      displayName: "Postaal",
      handle: "@postaal_app",
      initials: "P",
      connectionStatus: "connected",
      accountType: "Personal account",
      connectedAt: minutesFromNow(-60 * 24 * 30),
    },
    {
      id: "account-instagram-postaal",
      platform: "instagram",
      displayName: "Postaal",
      handle: "@postaal.app",
      initials: "P",
      connectionStatus: "connected",
      accountType: "Business account",
      connectedAt: minutesFromNow(-60 * 24 * 30),
    },
    {
      id: "account-linkedin-postaal",
      platform: "linkedin",
      displayName: "Postaal",
      handle: "postaal",
      initials: "P",
      connectionStatus: "expired",
      accountType: "Company page",
      connectedAt: minutesFromNow(-60 * 24 * 30),
    },
    {
      id: "account-facebook-postaal",
      platform: "facebook",
      displayName: "Postaal",
      handle: "Postaal",
      initials: "P",
      connectionStatus: "connected",
      accountType: "Page",
      connectedAt: minutesFromNow(-60 * 24 * 30),
    },
  ];

  const posts: Post[] = [
    {
      id: "post-draft-launch",
      masterContent:
        "Create once. Preview everywhere. Publish anywhere.\n\nPostaal keeps every caption, preview and scheduled post in one calm workspace.",
      platforms: ["x", "instagram"],
      overrides: {},
      mediaIds: [sampleMedia.id],
      status: "draft",
      scheduledAt: null,
      createdAt: minutesFromNow(-60 * 5),
      updatedAt: minutesFromNow(-60 * 2),
      targetResults: {},
    },
    {
      id: "post-scheduled-launch",
      masterContent:
        "Shipping update: platform previews now render live captions, media and per-destination overrides.",
      platforms: ["x", "linkedin", "facebook"],
      overrides: {
        x: { content: "Preview update: live captions, media and per-destination overrides now render in the studio preview." },
      },
      mediaIds: [sampleMedia.id],
      status: "scheduled",
      scheduledAt: hoursFromNow(26),
      createdAt: minutesFromNow(-60 * 20),
      updatedAt: minutesFromNow(-60 * 20),
      targetResults: {
        x: {
          status: "pending",
          platformPostId: null,
          errorCode: null,
          errorMessage: null,
          publishedAt: null,
          simulated: true,
        },
      },
    },
    {
      id: "post-scheduled-beauty",
      masterContent:
        "Behind the scenes from the new studio layout. Everything on one canvas, nothing in the way.",
      platforms: ["instagram"],
      overrides: {},
      mediaIds: [sampleMedia.id],
      status: "scheduled",
      scheduledAt: hoursFromNow(74),
      createdAt: minutesFromNow(-60 * 48),
      updatedAt: minutesFromNow(-60 * 48),
      targetResults: {},
    },
    {
      id: "post-published-launch",
      masterContent:
        "Postaal is live. Compose once, preview every platform, and publish from a single workspace.",
      platforms: ["x", "instagram"],
      overrides: {},
      mediaIds: [sampleMedia.id],
      status: "published",
      scheduledAt: null,
      createdAt: minutesFromNow(-60 * 24 * 4),
      updatedAt: minutesFromNow(-60 * 24 * 2),
      targetResults: {
        x: {
          status: "published",
          platformPostId: "sim_9f2c41",
          errorCode: null,
          errorMessage: null,
          publishedAt: minutesFromNow(-60 * 24 * 2),
          simulated: true,
        },
        instagram: {
          status: "published",
          platformPostId: "sim_7b1d08",
          errorCode: null,
          errorMessage: null,
          publishedAt: minutesFromNow(-60 * 24 * 2),
          simulated: true,
        },
      },
    },
    {
      id: "post-partial-launch",
      masterContent:
        "Weekly roundup: what changed in the studio this week and what lands next.",
      platforms: ["x", "linkedin", "facebook"],
      overrides: {},
      mediaIds: [sampleMedia.id],
      status: "partial",
      scheduledAt: null,
      createdAt: minutesFromNow(-60 * 24 * 2),
      updatedAt: minutesFromNow(-60 * 24),
      targetResults: {
        x: {
          status: "published",
          platformPostId: "sim_3ac118",
          errorCode: null,
          errorMessage: null,
          publishedAt: minutesFromNow(-60 * 24),
          simulated: true,
        },
        linkedin: {
          status: "failed",
          platformPostId: null,
          errorCode: "CONNECTION_EXPIRED",
          errorMessage:
            "The LinkedIn authorisation expired. Reconnect the account and retry this destination.",
          publishedAt: null,
          simulated: true,
        },
        facebook: {
          status: "published",
          platformPostId: "sim_55d0b7",
          errorCode: null,
          errorMessage: null,
          publishedAt: minutesFromNow(-60 * 24),
          simulated: true,
        },
      },
    },
    {
      id: "post-failed-launch",
      masterContent: "A note that could not be delivered to every destination.",
      platforms: ["facebook"],
      overrides: {},
      mediaIds: [],
      status: "failed",
      scheduledAt: null,
      createdAt: minutesFromNow(-60 * 24 * 5),
      updatedAt: minutesFromNow(-60 * 24 * 5),
      targetResults: {
        facebook: {
          status: "failed",
          platformPostId: null,
          errorCode: "SIMULATED_FAILURE",
          errorMessage:
            "Simulated destination failure. Successful destinations are unaffected.",
          publishedAt: null,
          simulated: true,
        },
      },
    },
  ];

  return {
    posts,
    media: [sampleMedia],
    accounts,
    settings: { ...DEFAULT_SETTINGS },
    activePostId: "post-draft-launch",
  };
}

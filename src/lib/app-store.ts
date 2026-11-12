import { createSeedState, DEFAULT_SETTINGS } from "@/lib/seed";
import {
  loadAccounts,
  loadActivePostId,
  loadMedia,
  loadPosts,
  loadSettings,
  persistState,
} from "@/lib/storage";
import type {
  AppState,
  MediaAsset,
  PlatformId,
  Post,
  SocialAccount,
  UserSettings,
} from "@/lib/types";

/**
 * Browser-backed application store.
 *
 * The workspace state lives outside React so that every consumer reads the
 * same snapshot, writes are persisted once, and there is no setState-in-effect
 * hydration cascade. A future backend can replace the persistence layer
 * without touching the components.
 */
export interface StoreSnapshot {
  state: AppState;
  hydrated: boolean;
  storageHealthy: boolean;
}

/** Stable snapshot used for server rendering and the first client paint. */
const SERVER_SNAPSHOT: StoreSnapshot = {
  state: {
    posts: [],
    media: [],
    accounts: [],
    settings: { ...DEFAULT_SETTINGS },
    activePostId: null,
  },
  hydrated: false,
  storageHealthy: true,
};

function mergePersistedState(): AppState {
  const seed = createSeedState();
  const posts = loadPosts();
  const media = loadMedia();
  const accounts = loadAccounts();
  const settings = loadSettings();
  const activePostId = loadActivePostId();

  const merged: AppState = {
    posts: posts ?? seed.posts,
    media: media ?? seed.media,
    accounts: accounts ?? seed.accounts,
    settings: { ...seed.settings, ...(settings ?? {}) },
    activePostId: activePostId ?? seed.activePostId,
  };

  if (
    merged.activePostId &&
    !merged.posts.some((post) => post.id === merged.activePostId)
  ) {
    merged.activePostId = merged.posts[0]?.id ?? null;
  }

  return merged;
}

let snapshot: StoreSnapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  snapshot = {
    state: mergePersistedState(),
    hydrated: true,
    storageHealthy: true,
  };
}

function emit() {
  for (const listener of listeners) listener();
}

function commit(next: AppState) {
  snapshot = { ...snapshot, state: next };
  if (snapshot.hydrated) {
    snapshot = {
      ...snapshot,
      storageHealthy: persistState(next),
    };
  }
  emit();
}

export const appStore = {
  getSnapshot(): StoreSnapshot {
    return snapshot;
  },
  getServerSnapshot(): StoreSnapshot {
    return SERVER_SNAPSHOT;
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  createPost(): string {
    const id = `post-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    const now = new Date().toISOString();
    const post: Post = {
      id,
      masterContent: "",
      platforms: ["x"],
      overrides: {},
      mediaIds: [],
      status: "draft",
      scheduledAt: null,
      createdAt: now,
      updatedAt: now,
      targetResults: {},
    };
    commit({
      ...snapshot.state,
      posts: [post, ...snapshot.state.posts],
      activePostId: id,
    });
    return id;
  },

  updatePost(
    id: string,
    patch: Partial<Post> | ((post: Post) => Partial<Post>),
  ): void {
    commit({
      ...snapshot.state,
      posts: snapshot.state.posts.map((post) => {
        if (post.id !== id) return post;
        const resolved = typeof patch === "function" ? patch(post) : patch;
        return { ...post, ...resolved, updatedAt: new Date().toISOString() };
      }),
    });
  },

  deletePost(id: string): void {
    const posts = snapshot.state.posts.filter((post) => post.id !== id);
    commit({
      ...snapshot.state,
      posts,
      activePostId:
        snapshot.state.activePostId === id
          ? (posts[0]?.id ?? null)
          : snapshot.state.activePostId,
    });
  },

  duplicatePost(id: string): string | null {
    const source = snapshot.state.posts.find((post) => post.id === id);
    if (!source) return null;

    const newId = `${source.id}-copy-${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const copy: Post = {
      ...source,
      id: newId,
      status: "draft",
      scheduledAt: null,
      createdAt: now,
      updatedAt: now,
      targetResults: {},
    };
    commit({
      ...snapshot.state,
      posts: [copy, ...snapshot.state.posts],
      activePostId: newId,
    });
    return newId;
  },

  setActivePost(id: string | null): void {
    commit({ ...snapshot.state, activePostId: id });
  },

  schedulePost(id: string, scheduledAtUtc: string): void {
    appStore.updatePost(id, { status: "scheduled", scheduledAt: scheduledAtUtc });
  },

  cancelSchedule(id: string): void {
    appStore.updatePost(id, { status: "draft", scheduledAt: null });
  },

  publishPost(id: string): void {
    const now = new Date().toISOString();
    const targetResults = Object.fromEntries(
      (snapshot.state.posts.find((post) => post.id === id)?.platforms ?? []).map(
        (platform) => [
          platform,
          {
            status: "publishing" as const,
            platformPostId: null,
            errorCode: null,
            errorMessage: null,
            publishedAt: null,
            simulated: true,
          },
        ],
      ),
    );

    commit({
      ...snapshot.state,
      posts: snapshot.state.posts.map((post) =>
        post.id === id
          ? { ...post, status: "publishing", scheduledAt: null, targetResults, updatedAt: now }
          : post,
      ),
    });

    window.setTimeout(() => {
      const post = snapshot.state.posts.find((candidate) => candidate.id === id);
      if (!post) return;

      const publishedAt = new Date().toISOString();
      const results: Post["targetResults"] = {};

      for (const platform of post.platforms) {
        const account = snapshot.state.accounts.find(
          (candidate) => candidate.platform === platform,
        );
        if (account && account.connectionStatus !== "connected") {
          results[platform] = {
            status: "failed",
            platformPostId: null,
            errorCode: "CONNECTION_EXPIRED",
            errorMessage:
              "This destination is not connected. Reconnect the account and retry only this destination.",
            publishedAt: null,
            simulated: true,
          };
          continue;
        }

        results[platform] = {
          status: "published",
          platformPostId: `sim_${Math.random().toString(36).slice(2, 8)}`,
          errorCode: null,
          errorMessage: null,
          publishedAt,
          simulated: true,
        };
      }

      const statuses = post.platforms.map(
        (platform) => results[platform]?.status,
      );
      const publishedCount = statuses.filter((s) => s === "published").length;
      const failedCount = statuses.filter((s) => s === "failed").length;
      const status =
        publishedCount === 0 && failedCount > 0
          ? "failed"
          : failedCount > 0
            ? "partial"
            : "published";

      commit({
        ...snapshot.state,
        posts: snapshot.state.posts.map((candidate) =>
          candidate.id === id
            ? { ...candidate, status, targetResults: results, updatedAt: publishedAt }
            : candidate,
        ),
      });
    }, 1100);
  },

  retryTarget(id: string, platform: PlatformId): void {
    const post = snapshot.state.posts.find((candidate) => candidate.id === id);
    if (!post) return;

    const account = snapshot.state.accounts.find(
      (candidate) => candidate.platform === platform,
    );
    const publishedAt = new Date().toISOString();
    const connected = !account || account.connectionStatus === "connected";

    const targetResults: Post["targetResults"] = {
      ...post.targetResults,
      [platform]: connected
        ? {
            status: "published",
            platformPostId: `sim_${Math.random().toString(36).slice(2, 8)}`,
            errorCode: null,
            errorMessage: null,
            publishedAt,
            simulated: true,
          }
        : {
            status: "failed",
            platformPostId: null,
            errorCode: "CONNECTION_EXPIRED",
            errorMessage:
              "This destination is still not connected. Reconnect the account and retry again.",
            publishedAt: null,
            simulated: true,
          },
    };

    const statuses = post.platforms.map(
      (candidate) => targetResults[candidate]?.status,
    );
    const publishedCount = statuses.filter((s) => s === "published").length;
    const failedCount = statuses.filter((s) => s === "failed").length;
    const status =
      publishedCount === 0 && failedCount > 0
        ? "failed"
        : failedCount > 0
          ? "partial"
          : "published";

    commit({
      ...snapshot.state,
      posts: snapshot.state.posts.map((candidate) =>
        candidate.id === id
          ? { ...candidate, status, targetResults, updatedAt: publishedAt }
          : candidate,
      ),
    });
  },

  addMedia(asset: MediaAsset): void {
    commit({
      ...snapshot.state,
      media: [asset, ...snapshot.state.media],
    });
  },

  removeMedia(id: string): void {
    commit({
      ...snapshot.state,
      media: snapshot.state.media.filter((asset) => asset.id !== id),
      posts: snapshot.state.posts.map((post) => ({
        ...post,
        mediaIds: post.mediaIds.filter((mediaId) => mediaId !== id),
      })),
    });
  },

  updateSettings(patch: Partial<UserSettings>): void {
    commit({
      ...snapshot.state,
      settings: { ...snapshot.state.settings, ...patch },
    });
  },

  updateAccount(id: string, patch: Partial<SocialAccount>): void {
    commit({
      ...snapshot.state,
      accounts: snapshot.state.accounts.map((account) =>
        account.id === id ? { ...account, ...patch } : account,
      ),
    });
  },

  resetWorkspace(): void {
    commit(createSeedState());
  },
};

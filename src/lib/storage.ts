import type { AppState, MediaAsset, Post, SocialAccount, UserSettings } from "@/lib/types";

const STORAGE_KEYS = {
  posts: "postaal.posts.v1",
  media: "postaal.media.v1",
  accounts: "postaal.accounts.v1",
  settings: "postaal.settings.v1",
  activePostId: "postaal.activePostId.v1",
} as const;

export const STORAGE_AVAILABLE_KEY = "postaal.storageAvailable";

function canUseStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const probe = "__postaal_probe__";
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function isStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  return canUseStorage();
}

function readJson<T>(key: string): T | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): boolean {
  if (!canUseStorage()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Most likely a quota error caused by large embedded media.
    return false;
  }
}

export function loadPosts(): Post[] | null {
  return readJson<Post[]>(STORAGE_KEYS.posts);
}

export function loadMedia(): MediaAsset[] | null {
  return readJson<MediaAsset[]>(STORAGE_KEYS.media);
}

export function loadAccounts(): SocialAccount[] | null {
  return readJson<SocialAccount[]>(STORAGE_KEYS.accounts);
}

export function loadSettings(): UserSettings | null {
  return readJson<UserSettings>(STORAGE_KEYS.settings);
}

export function loadActivePostId(): string | null {
  return readJson<string | null>(STORAGE_KEYS.activePostId);
}

export function persistState(state: AppState): boolean {
  const okPosts = writeJson(STORAGE_KEYS.posts, state.posts);
  const okMedia = writeJson(STORAGE_KEYS.media, state.media);
  const okAccounts = writeJson(STORAGE_KEYS.accounts, state.accounts);
  const okSettings = writeJson(STORAGE_KEYS.settings, state.settings);
  const okActive = writeJson(STORAGE_KEYS.activePostId, state.activePostId);
  return okPosts && okMedia && okAccounts && okSettings && okActive;
}

export function clearPersistedState(): void {
  if (!canUseStorage()) return;
  for (const key of Object.values(STORAGE_KEYS)) {
    window.localStorage.removeItem(key);
  }
}

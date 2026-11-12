"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { appStore } from "@/lib/app-store";
import type {
  AppState,
  MediaAsset,
  PlatformId,
  Post,
  SocialAccount,
  UserSettings,
} from "@/lib/types";

export interface AppDataContextValue extends AppState {
  /** True once the persisted state has been read from the browser. */
  hydrated: boolean;
  /** False when browser storage is unavailable or rejected the write. */
  storageHealthy: boolean;
  createPost: () => string;
  updatePost: (
    id: string,
    patch: Partial<Post> | ((post: Post) => Partial<Post>),
  ) => void;
  deletePost: (id: string) => void;
  duplicatePost: (id: string) => string | null;
  setActivePost: (id: string | null) => void;
  schedulePost: (id: string, scheduledAtUtc: string) => void;
  cancelSchedule: (id: string) => void;
  publishPost: (id: string) => void;
  retryTarget: (id: string, platform: PlatformId) => void;
  addMedia: (asset: MediaAsset) => void;
  removeMedia: (id: string) => void;
  updateSettings: (patch: Partial<UserSettings>) => void;
  updateAccount: (id: string, patch: Partial<SocialAccount>) => void;
  resetWorkspace: () => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    appStore.subscribe,
    appStore.getSnapshot,
    appStore.getServerSnapshot,
  );

  const value = useMemo<AppDataContextValue>(
    () => ({
      ...snapshot.state,
      hydrated: snapshot.hydrated,
      storageHealthy: snapshot.storageHealthy,
      createPost: appStore.createPost,
      updatePost: appStore.updatePost,
      deletePost: appStore.deletePost,
      duplicatePost: appStore.duplicatePost,
      setActivePost: appStore.setActivePost,
      schedulePost: appStore.schedulePost,
      cancelSchedule: appStore.cancelSchedule,
      publishPost: appStore.publishPost,
      retryTarget: appStore.retryTarget,
      addMedia: appStore.addMedia,
      removeMedia: appStore.removeMedia,
      updateSettings: appStore.updateSettings,
      updateAccount: appStore.updateAccount,
      resetWorkspace: appStore.resetWorkspace,
    }),
    [snapshot],
  );

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used inside <AppDataProvider>");
  }
  return context;
}

"use client";

import { useRef, useState } from "react";
import { Trash2, Upload } from "lucide-react";

import { useAppData } from "@/components/providers/app-data-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createMediaAsset,
  formatFileSize,
  readFileAsDataUrl,
  readImageDimensions,
  validateImageFile,
} from "@/lib/media";
import type { MediaAsset } from "@/lib/types";

export function MediaLibraryView() {
  const { media, posts, addMedia, removeMedia } = useAppData();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingDelete, setPendingDelete] = useState<MediaAsset | null>(null);

  const usageCount = (assetId: string) =>
    posts.filter((post) => post.mediaIds.includes(assetId)).length;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file) return;

    const validation = await validateImageFile(file);
    if (!validation.ok) {
      toast({
        title: "Upload rejected",
        description: validation.error,
        variant: "danger",
      });
      return;
    }

    const url = await readFileAsDataUrl(file);
    const dimensions = await readImageDimensions(url);
    addMedia(
      createMediaAsset(
        `media-${Date.now().toString(36)}`,
        file.name,
        url,
        validation.mimeType,
        validation.sizeBytes,
        dimensions,
      ),
    );
    toast({
      title: "Media uploaded",
      description: `${file.name} (${formatFileSize(file.size)})`,
      variant: "success",
    });
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Button type="button" onClick={() => inputRef.current?.click()}>
          <Upload aria-hidden="true" />
          Upload media
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          className="sr-only"
          aria-label="Upload an image"
          onChange={(event) => {
            void handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <p className="text-xs text-ink-lavender">
          PNG, JPEG, GIF or WebP. Up to 2 MB per file in this prototype.
        </p>
      </div>

      {media.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center shadow-card">
          <p className="text-sm font-medium text-ink">Your library is empty</p>
          <p className="mt-1 text-sm text-ink-lavender">
            Upload an image to reuse it across posts.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {media.map((asset) => (
            <li
              key={asset.id}
              className="overflow-hidden rounded-xl border border-border bg-surface shadow-card"
            >
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.url}
                  alt={asset.name}
                  className="aspect-square w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPendingDelete(asset)}
                  aria-label={`Delete ${asset.name}`}
                  className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-white/95 text-[#343B53] shadow-sm transition-colors hover:bg-white hover:text-danger"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </button>
              </div>
              <div className="px-3 py-2.5">
                <p className="truncate text-sm font-medium text-ink">
                  {asset.name}
                </p>
                <p className="mt-0.5 text-xs text-ink-lavender">
                  {formatFileSize(asset.sizeBytes)}
                  {asset.width && asset.height
                    ? ` - ${asset.width}x${asset.height}`
                    : ""}
                </p>
                <p className="mt-0.5 text-xs text-ink-lavender">
                  Used in {usageCount(asset.id)}{" "}
                  {usageCount(asset.id) === 1 ? "post" : "posts"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this media?</DialogTitle>
            <DialogDescription>
              {pendingDelete
                ? `${pendingDelete.name} will be removed and detached from ${
                    usageCount(pendingDelete.id) === 1
                      ? "1 post"
                      : `${usageCount(pendingDelete.id)} posts`
                  }.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                if (pendingDelete) {
                  removeMedia(pendingDelete.id);
                  toast({ title: "Media deleted" });
                }
                setPendingDelete(null);
              }}
            >
              <Trash2 aria-hidden="true" />
              Delete media
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { Plus, X } from "lucide-react";
import { useRef, useState } from "react";

import { useAppData } from "@/components/providers/app-data-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createMediaAsset,
  formatFileSize,
  readFileAsDataUrl,
  readImageDimensions,
  validateImageFile,
} from "@/lib/media";
import type { MediaAsset } from "@/lib/types";

export function MediaUploader({
  mediaIds,
  onAttach,
  onDetach,
}: {
  mediaIds: string[];
  onAttach: (asset: MediaAsset) => void;
  onDetach: (mediaId: string) => void;
}) {
  const { media } = useAppData();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const attached = mediaIds
    .map((id) => media.find((asset) => asset.id === id))
    .filter((asset): asset is MediaAsset => Boolean(asset));

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file) return;

    const validation = await validateImageFile(file);
    if (!validation.ok) {
      toast({ title: "Upload rejected", description: validation.error, variant: "danger" });
      return;
    }

    const url = await readFileAsDataUrl(file);
    const dimensions = await readImageDimensions(url);
    const asset = createMediaAsset(
      `media-${Date.now().toString(36)}`,
      file.name,
      url,
      validation.mimeType,
      validation.sizeBytes,
      dimensions,
    );

    onAttach(asset);
    toast({
      title: "Media added",
      description: `${file.name} (${formatFileSize(file.size)})`,
      variant: "success",
    });
  }

  return (
    <section aria-labelledby="media-heading">
      <h2
        id="media-heading"
        className="text-lg leading-[25px] font-semibold text-ink"
      >
        Media
      </h2>

      <div className="mt-3.5 flex flex-wrap items-start gap-3.5">
        {attached.map((asset) => (
          <div
            key={asset.id}
            className="group relative h-[113px] w-[141px] shrink-0 overflow-hidden rounded-md border border-border bg-control"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset.url}
              alt={asset.name}
              className="size-full object-cover"
            />
            <button
              type="button"
              onClick={() => onDetach(asset.id)}
              aria-label={`Remove ${asset.name}`}
              className="absolute top-2 right-2 flex size-[21px] items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:bg-control"
            >
              <X className="size-[14px] text-[#343B53]" aria-hidden="true" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-[113px] w-[147px] shrink-0 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-control transition-colors hover:bg-hover"
        >
          <Plus className="size-[26px] text-ink" aria-hidden="true" />
          <span className="text-sm text-ink">Add Media</span>
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add media</DialogTitle>
            <DialogDescription>
              Upload a new image or reuse something already in your media
              library.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="upload">
            <TabsList>
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="library">Library</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-4">
              <div className="rounded-md border border-dashed border-border bg-control p-6 text-center">
                <p className="text-sm text-ink">
                  PNG, JPEG, GIF or WebP. Up to 2 MB in this prototype.
                </p>
                <p className="mt-1 text-xs text-ink-lavender">
                  The file contents are verified before the image is accepted.
                </p>
                <Button
                  type="button"
                  className="mt-4"
                  onClick={() => inputRef.current?.click()}
                >
                  Choose file
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
              </div>
            </TabsContent>

            <TabsContent value="library" className="mt-4">
              {media.length === 0 ? (
                <p className="rounded-md border border-border bg-control p-6 text-center text-sm text-ink-lavender">
                  Your media library is empty. Upload an image to get started.
                </p>
              ) : (
                <ul className="grid max-h-[22rem] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
                  {media.map((asset) => (
                    <li key={asset.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onAttach(asset);
                          setOpen(false);
                          toast({
                            title: "Media attached",
                            description: asset.name,
                            variant: "success",
                          });
                        }}
                        className="group w-full overflow-hidden rounded-md border border-border transition-colors hover:border-accent"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="aspect-square w-full object-cover"
                        />
                        <span className="block truncate px-2 py-1.5 text-left text-xs text-ink-lavender">
                          {asset.name}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </section>
  );
}

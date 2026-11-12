import type { MediaAsset } from "@/lib/types";

/**
 * Client-side media validation for the prototype.
 *
 * The file type is detected from the file signature rather than trusting the
 * extension or the browser supplied MIME type. A production implementation
 * must repeat this validation on the server before persisting an asset.
 */

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

export const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
] as const;

export type SniffResult =
  | { ok: true; mimeType: string; extension: string }
  | { ok: false; error: string };

function sniffImageType(bytes: Uint8Array): SniffResult {
  if (bytes.length >= 8) {
    const signature = Array.from(bytes.slice(0, 8));
    if (
      signature[0] === 0x89 &&
      signature[1] === 0x50 &&
      signature[2] === 0x4e &&
      signature[3] === 0x47
    ) {
      return { ok: true, mimeType: "image/png", extension: "png" };
    }
    if (
      signature[0] === 0xff &&
      signature[1] === 0xd8 &&
      signature[2] === 0xff
    ) {
      return { ok: true, mimeType: "image/jpeg", extension: "jpg" };
    }
    if (
      signature[0] === 0x47 &&
      signature[1] === 0x49 &&
      signature[2] === 0x46 &&
      signature[3] === 0x38
    ) {
      return { ok: true, mimeType: "image/gif", extension: "gif" };
    }
    if (
      signature[0] === 0x52 &&
      signature[1] === 0x49 &&
      signature[2] === 0x46 &&
      signature[3] === 0x46 &&
      signature[8] === 0x57 &&
      signature[9] === 0x45 &&
      signature[10] === 0x42 &&
      signature[11] === 0x50
    ) {
      return { ok: true, mimeType: "image/webp", extension: "webp" };
    }
  }

  return {
    ok: false,
    error:
      "Unsupported file. Upload a PNG, JPEG, GIF or WebP image so the file contents can be verified.",
  };
}

export async function validateImageFile(
  file: File,
): Promise<SniffResult & { sizeBytes: number }> {
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `This image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The prototype stores media in the browser and accepts up to 2 MB.`,
      sizeBytes: file.size,
    };
  }

  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const result = sniffImageType(bytes);

  if (!result.ok) {
    return { ...result, sizeBytes: file.size };
  }

  return { ...result, sizeBytes: file.size };
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function readImageDimensions(
  url: string,
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () =>
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

export function createMediaAsset(
  id: string,
  name: string,
  url: string,
  mimeType: string,
  sizeBytes: number,
  dimensions: { width: number; height: number } | null,
): MediaAsset {
  return {
    id,
    name,
    url,
    mimeType,
    kind: "image",
    sizeBytes,
    width: dimensions?.width ?? null,
    height: dimensions?.height ?? null,
    createdAt: new Date().toISOString(),
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

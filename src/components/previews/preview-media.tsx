import type { MediaAsset } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Renders attached media inside a platform preview.
 *
 * Media is shown at the aspect ratio the platform would use so the crop
 * behaviour is understandable, and is never presented as a live asset.
 */
export function PreviewMedia({
  asset,
  aspect = "auto",
  className,
}: {
  asset: MediaAsset;
  /** `square` mimics feed crops, `wide` mimics link previews. */
  aspect?: "square" | "wide" | "auto";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden bg-[#F1F1F5]",
        aspect === "square" ? "aspect-square" : aspect === "wide" ? "aspect-[1.91/1]" : "",
        className,
      )}
    >
      {asset.kind === "video" ? (
        <video
          src={asset.url}
          className="size-full object-cover"
          controls
          muted
          playsInline
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={asset.url}
          alt={asset.name}
          className="size-full object-cover"
        />
      )}
    </div>
  );
}

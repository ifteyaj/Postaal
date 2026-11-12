import { Bookmark, Heart, MessageCircle, MoreHorizontal, Send } from "lucide-react";

import { PreviewMedia } from "@/components/previews/preview-media";
import type { PreviewModel } from "@/lib/preview-model";

/**
 * Instagram feed preview.
 *
 * Uses the feed ordering: header, square media, action row, then the caption
 * line. Interaction counts are omitted so the preview never invents metrics.
 */
export function InstagramPostPreview({ model }: { model: PreviewModel }) {
  const media = model.media[0];
  const handle = model.identity.handle.replace(/^@/, "");

  return (
    <article
      className="w-full overflow-hidden rounded-xl border border-border bg-white text-[#101323]"
      aria-label="Instagram post preview"
    >
      <header className="flex items-center gap-3 px-4 py-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#111729] text-sm font-semibold text-white">
          {model.identity.initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-5 font-semibold">
            {model.identity.displayName}
          </p>
          <p className="text-xs leading-4 text-[#747A98]">
            {handle} - simulated
          </p>
        </div>
        <MoreHorizontal
          className="size-5 shrink-0 text-black"
          aria-label="More options"
        />
      </header>

      {media ? (
        <PreviewMedia asset={media} aspect="square" />
      ) : (
        <div className="flex aspect-square items-center justify-center bg-[#F1F1F5] text-xs text-[#747A98]">
          No media attached
        </div>
      )}

      <div className="px-4 py-3">
        <div className="flex items-center gap-4 text-[#101323]">
          <Heart className="size-6" aria-hidden="true" />
          <MessageCircle className="size-6" aria-hidden="true" />
          <Send className="size-6" aria-hidden="true" />
          <Bookmark className="ml-auto size-6" aria-hidden="true" />
        </div>

        <p className="mt-3 text-sm leading-[19px]">
          <span className="font-semibold">{handle}</span>{" "}
          <span className="break-words whitespace-pre-wrap">{model.caption}</span>
          {model.caption.length > 120 ? (
            <span className="text-[#747A98]"> more</span>
          ) : null}
        </p>
      </div>

      {model.identity.isSample ? (
        <p className="border-t border-border px-4 py-2.5 text-[11px] text-[#747A98]">
          Sample identity - connect an Instagram account to preview as your
          profile.
        </p>
      ) : null}
    </article>
  );
}

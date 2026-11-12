import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Share2,
} from "lucide-react";

import { PreviewMedia } from "@/components/previews/preview-media";
import type { PreviewModel } from "@/lib/preview-model";

const ACTION_ICON = "size-5 text-[#747A98]";

/**
 * X post preview.
 *
 * Mirrors the X feed layout: avatar row with display name and handle, the
 * caption, optional media, then the action row. Engagement counts are
 * intentionally omitted so the preview never shows invented metrics.
 */
export function XPostPreview({ model }: { model: PreviewModel }) {
  const media = model.media[0];

  return (
    <article
      className="w-full overflow-hidden rounded-xl border border-border bg-white text-[#101323]"
      aria-label="X post preview"
    >
      <div className="flex flex-col gap-4 px-7 pt-6 pb-5">
        <header className="flex items-center gap-3">
          <span className="flex size-[49px] shrink-0 items-center justify-center rounded-full bg-[#030505] text-[34px] leading-none font-bold text-white">
            {model.identity.initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-lg leading-[25px] font-semibold">
              {model.identity.displayName}
            </p>
            <p className="text-sm leading-[20px] text-[#747A98]">
              {model.identity.handle}
            </p>
          </div>
          <MoreHorizontal
            className="size-5 shrink-0 text-black"
            aria-label="More options"
          />
        </header>

        <p className="text-[19px] leading-[27px] break-words whitespace-pre-wrap">
          {model.caption}
        </p>

        {media ? (
          <PreviewMedia
            asset={media}
            className="rounded-md"
          />
        ) : null}
      </div>

      <footer className="flex items-center justify-between px-8 pb-5">
        <MessageCircle className={ACTION_ICON} aria-hidden="true" />
        <Repeat2 className={ACTION_ICON} aria-hidden="true" />
        <Heart className={ACTION_ICON} aria-hidden="true" />
        <Bookmark className={ACTION_ICON} aria-hidden="true" />
        <Share2 className={ACTION_ICON} aria-hidden="true" />
      </footer>

      {model.identity.isSample ? (
        <p className="border-t border-border px-7 py-2.5 text-[11px] text-[#747A98]">
          Sample identity - connect an X account to preview as your profile.
        </p>
      ) : null}
    </article>
  );
}

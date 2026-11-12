import {
  Globe2,
  MessageCircle,
  MoreHorizontal,
  Send,
  ThumbsUp,
} from "lucide-react";

import { PreviewMedia } from "@/components/previews/preview-media";
import type { PreviewModel } from "@/lib/preview-model";

/**
 * Facebook feed preview.
 *
 * Uses the Facebook card layout: identity row with audience selector, body
 * copy, media, then the Like / Comment / Share bar.
 */
export function FacebookPostPreview({ model }: { model: PreviewModel }) {
  const media = model.media[0];

  return (
    <article
      className="w-full overflow-hidden rounded-lg border border-[#CED0D4] bg-white text-[#050505]"
      aria-label="Facebook post preview"
    >
      <div className="flex flex-col gap-2 px-3 pt-3 pb-2">
        <header className="flex items-start gap-2">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#147DFF] text-sm font-semibold text-white">
            {model.identity.initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] leading-5 font-semibold">
              {model.identity.displayName}
            </p>
            <p className="flex items-center gap-1 text-xs leading-4 text-[#65676B]">
              Simulated - 2h
              <Globe2 className="size-3" aria-label="Public" />
            </p>
          </div>
          <MoreHorizontal
            className="size-5 shrink-0 text-[#65676B]"
            aria-label="More options"
          />
        </header>

        <p className="text-[15px] leading-[21px] break-words whitespace-pre-wrap">
          {model.caption}
        </p>
      </div>

      {media ? (
        <div className="w-full overflow-hidden bg-[#F0F2F5]">
          <PreviewMedia asset={media} />
        </div>
      ) : null}

      <footer className="mt-2 flex items-center border-t border-[#CED0D4] px-2 py-1.5 text-[#65676B]">
        <span className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-semibold">
          <ThumbsUp className="size-4" aria-hidden="true" />
          Like
        </span>
        <span className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-semibold">
          <MessageCircle className="size-4" aria-hidden="true" />
          Comment
        </span>
        <span className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-semibold">
          <Send className="size-4" aria-hidden="true" />
          Share
        </span>
      </footer>

      {model.identity.isSample ? (
        <p className="border-t border-[#CED0D4] px-3 py-2.5 text-[11px] text-[#65676B]">
          Sample identity - connect a Facebook page to preview as your page.
        </p>
      ) : null}
    </article>
  );
}

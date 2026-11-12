import { MessageSquare, Repeat2, Send, ThumbsUp } from "lucide-react";

import { PreviewMedia } from "@/components/previews/preview-media";
import type { PreviewModel } from "@/lib/preview-model";

/**
 * LinkedIn feed preview.
 *
 * Uses the LinkedIn card layout: identity row with headline, body copy,
 * media, then the social action bar.
 */
export function LinkedInPostPreview({ model }: { model: PreviewModel }) {
  const media = model.media[0];

  return (
    <article
      className="w-full overflow-hidden rounded-lg border border-[#E0E0E0] bg-white text-[#000000E6]"
      aria-label="LinkedIn post preview"
    >
      <div className="flex flex-col gap-2 px-4 pt-4 pb-3">
        <header className="flex items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#087DBB] text-base font-semibold text-white">
            {model.identity.initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-5 font-semibold text-[#000000E6]">
              {model.identity.displayName}
            </p>
            <p className="text-xs leading-4 text-[#00000099]">
              {model.identity.handle}
            </p>
            <p className="text-xs leading-4 text-[#00000099]">
              Simulated - 2h
            </p>
          </div>
        </header>

        <p className="text-sm leading-[19px] break-words whitespace-pre-wrap text-[#000000E6]">
          {model.caption}
        </p>
      </div>

      {media ? (
        <div className="w-full overflow-hidden bg-[#F3F2EF]">
          <PreviewMedia asset={media} />
        </div>
      ) : null}

      <footer className="mt-3 flex items-center justify-around border-t border-[#E0E0E0] px-2 py-1.5 text-[#00000099]">
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          <ThumbsUp className="size-4" aria-hidden="true" />
          Like
        </span>
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          <MessageSquare className="size-4" aria-hidden="true" />
          Comment
        </span>
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          <Repeat2 className="size-4" aria-hidden="true" />
          Repost
        </span>
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          <Send className="size-4" aria-hidden="true" />
          Send
        </span>
      </footer>

      {model.identity.isSample ? (
        <p className="border-t border-[#E0E0E0] px-4 py-2.5 text-[11px] text-[#00000099]">
          Sample identity - connect a LinkedIn page to preview as your page.
        </p>
      ) : null}
    </article>
  );
}

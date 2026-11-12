"use client";

import {
  Hash,
  Link2,
  Smile,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useRef } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { effectiveCharacterLimit } from "@/lib/platforms";
import type { PlatformId } from "@/lib/types";
import { cn } from "@/lib/utils";

export type AiAction = "caption" | "hashtags" | "shorten" | "improve";

const AI_ACTIONS: Array<{ id: AiAction; label: string; description: string }> = [
  {
    id: "caption",
    label: "Write a caption",
    description: "Draft a caption for this post",
  },
  {
    id: "hashtags",
    label: "Suggest hashtags",
    description: "Add topic hashtags to the caption",
  },
  {
    id: "shorten",
    label: "Shorten for X",
    description: "Trim the caption to fit 280 characters",
  },
  {
    id: "improve",
    label: "Improve wording",
    description: "Tighten the sentence structure",
  },
];

export function ContentEditor({
  value,
  onChange,
  platforms,
  onRequestAi,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  platforms: PlatformId[];
  onRequestAi: (action: AiAction) => void;
  error?: string | null;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const limit = effectiveCharacterLimit(platforms);
  const length = value.length;
  const overLimit = length > limit;

  function insertAtCursor(text: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(`${value}${text}`);
      return;
    }
    const start = textarea.selectionStart ?? value.length;
    const end = textarea.selectionEnd ?? value.length;
    const next = `${value.slice(0, start)}${text}${value.slice(end)}`;
    onChange(next);
    requestAnimationFrame(() => {
      textarea.focus();
      const caret = start + text.length;
      textarea.setSelectionRange(caret, caret);
    });
  }

  return (
    <section aria-labelledby="your-content-heading">
      <h2
        id="your-content-heading"
        className="text-lg leading-[25px] font-semibold text-ink"
      >
        Your Content
      </h2>

      <div className="mt-3.5 overflow-hidden rounded-md border border-border bg-surface">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            rows={5}
            spellCheck
            aria-label="Post caption"
            aria-describedby="character-counter"
            placeholder="Write something worth sharing..."
            className="min-h-[161px] w-full resize-none border-0 bg-transparent px-4 pt-3.5 pb-9 text-lg leading-[25px] text-ink outline-none placeholder:text-ink-lavender focus-visible:outline-none"
          />
          <span
            id="character-counter"
            aria-live="polite"
            className={cn(
              "pointer-events-none absolute right-4 bottom-1 text-xs leading-[17px]",
              overLimit ? "text-danger" : "text-ink-lavender",
            )}
          >
            {length} / {limit}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-border pr-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="ml-2 flex h-[37px] items-center gap-2.5 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-ink transition-colors hover:bg-control"
              >
                <Sparkles className="size-[18px] text-accent" aria-hidden="true" />
                Generate with AI
                <ChevronDown className="size-4 text-ink" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {AI_ACTIONS.map((action) => (
                <DropdownMenuItem
                  key={action.id}
                  onSelect={() => onRequestAi(action.id)}
                  className="flex-col items-start gap-0.5 py-2"
                >
                  <span className="text-sm font-medium text-ink">
                    {action.label}
                  </span>
                  <span className="text-xs text-ink-lavender">
                    {action.description}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-3">
            <ToolbarButton
              label="Insert emoji"
              onClick={() => insertAtCursor("😊 ")}
            >
              <Smile className="size-5 text-ink-muted" aria-hidden="true" />
            </ToolbarButton>
            <ToolbarButton
              label="Insert hashtag"
              onClick={() => insertAtCursor("#")}
            >
              <Hash className="size-5 text-ink-muted" aria-hidden="true" />
            </ToolbarButton>
            <ToolbarButton
              label="Insert link"
              onClick={() => insertAtCursor("[link title](https://)")}
            >
              <Link2 className="size-5 text-ink-muted" aria-hidden="true" />
            </ToolbarButton>
          </div>
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-xs text-danger">
          {error}
        </p>
      ) : null}
    </section>
  );
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex size-8 items-center justify-center rounded-md transition-colors hover:bg-control"
    >
      {children}
    </button>
  );
}

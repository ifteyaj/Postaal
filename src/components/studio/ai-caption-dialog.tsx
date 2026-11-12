"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { AiAction } from "@/components/studio/content-editor";

const TONES = ["Professional", "Friendly", "Playful", "Bold"] as const;
const LENGTHS = ["Short", "Medium", "Long"] as const;

const OPENERS: Record<string, string> = {
  Professional: "We are excited to share an update.",
  Friendly: "Big news, and we could not wait to tell you.",
  Playful: "Guess what just landed?",
  Bold: "This changes how you publish.",
};

const BODIES: Record<string, string> = {
  Short: "One workspace, every platform, one preview.",
  Medium:
    "Compose once, check the preview on each platform, then schedule it for the moment that fits.",
  Long:
    "Postaal keeps the caption, the media, the preview and the schedule in one place. Write once, see how it lands on every destination, adjust the copy where it matters, and publish when the timing is right.",
};

const HASHTAGS = "#socialmedia #contentcreator #socialscheduling";

const ACTION_LABELS: Record<AiAction, string> = {
  caption: "Write a caption",
  hashtags: "Suggest hashtags",
  shorten: "Shorten for X",
  improve: "Improve wording",
};

/**
 * Mock AI caption assistant.
 *
 * The generator is local and deterministic. No AI provider is contacted and
 * the dialog says so explicitly.
 */
export function AiCaptionDialog({
  open,
  onOpenChange,
  action,
  currentContent,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: AiAction;
  currentContent: string;
  onApply: (content: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <AiCaptionDialogContent
          onOpenChange={onOpenChange}
          action={action}
          currentContent={currentContent}
          onApply={onApply}
        />
      ) : null}
    </Dialog>
  );
}

function AiCaptionDialogContent({
  onOpenChange,
  action,
  currentContent,
  onApply,
}: {
  onOpenChange: (open: boolean) => void;
  action: AiAction;
  currentContent: string;
  onApply: (content: string) => void;
}) {
  const [tone, setTone] = useState<(typeof TONES)[number]>("Professional");
  const [length, setLength] = useState<(typeof LENGTHS)[number]>("Medium");
  const [suggestion, setSuggestion] = useState("");
  const [generating, setGenerating] = useState(false);

  function generate() {
    setGenerating(true);
    window.setTimeout(() => {
      const opener = OPENERS[tone] ?? OPENERS.Professional!;
      const body = BODIES[length] ?? BODIES.Medium!;

      if (action === "hashtags") {
        const base = currentContent.trim() || `${opener} ${body}`;
        setSuggestion(`${base}\n\n${HASHTAGS}`);
      } else if (action === "shorten") {
        setSuggestion(`${opener} ${body}\n\n${HASHTAGS}`);
      } else if (action === "improve") {
        setSuggestion(
          `${opener} ${body} All of it from a single, focused workspace.`,
        );
      } else {
        setSuggestion(`${opener}\n\n${body}\n\n${HASHTAGS}`);
      }
      setGenerating(false);
    }, 500);
  }

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Sparkles className="size-4 text-accent" aria-hidden="true" />
          {ACTION_LABELS[action]}
        </DialogTitle>
        <DialogDescription>
          This assistant is a local simulation. Postaal does not contact an AI
          provider in this prototype, so the suggestion is generated on your
          device.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ai-tone">Tone</Label>
          <Select
            value={tone}
            onValueChange={(value) => setTone(value as typeof tone)}
          >
            <SelectTrigger id="ai-tone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TONES.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ai-length">Length</Label>
          <Select
            value={length}
            onValueChange={(value) => setLength(value as typeof length)}
          >
            <SelectTrigger id="ai-length">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LENGTHS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ai-suggestion">Suggestion</Label>
        <Textarea
          id="ai-suggestion"
          rows={6}
          value={suggestion}
          onChange={(event) => setSuggestion(event.target.value)}
          placeholder={
            generating ? "Writing..." : "Generate a suggestion to review it here."
          }
          className="min-h-[8rem]"
        />
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={generate}
          disabled={generating}
        >
          <Sparkles aria-hidden="true" />
          {generating ? "Generating" : "Generate"}
        </Button>
        <Button
          type="button"
          onClick={() => {
            onApply(suggestion);
            onOpenChange(false);
          }}
          disabled={suggestion.trim().length === 0}
        >
          Use this caption
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

import { Badge, type BadgeVariant } from "@/components/ui/badge";
import type { PostStatus } from "@/lib/types";

const STATUS_META: Record<
  PostStatus,
  { label: string; variant: BadgeVariant }
> = {
  draft: { label: "Draft", variant: "neutral" },
  scheduled: { label: "Scheduled", variant: "info" },
  publishing: { label: "Publishing", variant: "warning" },
  published: { label: "Published", variant: "success" },
  partial: { label: "Partially published", variant: "warning" },
  failed: { label: "Failed", variant: "danger" },
};

export function PostStatusBadge({
  status,
  className,
}: {
  status: PostStatus;
  className?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <Badge variant={meta.variant} className={className}>
      {meta.label}
    </Badge>
  );
}

export function statusLabel(status: PostStatus): string {
  return STATUS_META[status].label;
}

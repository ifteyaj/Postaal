import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { QueueView } from "@/components/queue/queue-view";

export const metadata: Metadata = {
  title: "Queue",
};

export default function QueuePage() {
  return (
    <>
      <PageHeader
        title="Queue"
        description="Drafts, scheduled posts and publishing outcomes in one list."
      />
      <QueueView />
    </>
  );
}

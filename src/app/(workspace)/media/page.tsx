import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { MediaLibraryView } from "@/components/media/media-library-view";

export const metadata: Metadata = {
  title: "Media Library",
};

export default function MediaPage() {
  return (
    <>
      <PageHeader
        title="Media Library"
        description="Every image you have uploaded, ready to reuse."
      />
      <MediaLibraryView />
    </>
  );
}

import type { Metadata } from "next";

import { CalendarView } from "@/components/calendar/calendar-view";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Calendar",
};

export default function CalendarPage() {
  return (
    <>
      <PageHeader
        title="Calendar"
        description="See everything you have scheduled, month by month."
      />
      <CalendarView />
    </>
  );
}

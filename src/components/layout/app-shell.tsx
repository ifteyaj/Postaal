"use client";

import { useState } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-page">
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-border-strong px-4 lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation">
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[202px] p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <AppSidebar />
            </SheetContent>
          </Sheet>
          <span className="text-lg font-semibold text-ink">Postaal</span>
        </div>

        <TopBar />

        <main className="flex-1 px-6 pt-6 pb-10 lg:px-[46px]">{children}</main>
      </div>
    </div>
  );
}

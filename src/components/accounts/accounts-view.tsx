"use client";

import { useState } from "react";
import { Link2, RefreshCw } from "lucide-react";

import { PlatformLogo } from "@/components/brand/platform-logo";
import { useAppData } from "@/components/providers/app-data-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PLATFORM_LIST, PLATFORMS } from "@/lib/platforms";
import type { AccountConnectionStatus, PlatformId } from "@/lib/types";

const STATUS_META: Record<
  AccountConnectionStatus,
  { label: string; variant: "success" | "warning" | "neutral" }
> = {
  connected: { label: "Connected", variant: "success" },
  expired: { label: "Needs attention", variant: "warning" },
  disconnected: { label: "Not connected", variant: "neutral" },
};

export function AccountsView() {
  const { accounts, updateAccount } = useAppData();
  const { toast } = useToast();
  const [connectPlatform, setConnectPlatform] =
    useState<PlatformId | null>(null);

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        {PLATFORM_LIST.map((platform) => {
          const account = accounts.find(
            (candidate) => candidate.platform === platform.id,
          );

          return (
            <section
              key={platform.id}
              className="rounded-xl border border-border bg-surface p-5 shadow-card"
            >
              <div className="flex items-center gap-3">
                <PlatformLogo platform={platform.id} title={null} />
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-ink">
                    {platform.label}
                  </h2>
                  <p className="text-xs text-ink-lavender">
                    {account ? account.accountType : "No account type"}
                  </p>
                </div>
                <div className="ml-auto">
                  {account ? (
                    <Badge variant={STATUS_META[account.connectionStatus].variant}>
                      {STATUS_META[account.connectionStatus].label}
                    </Badge>
                  ) : (
                    <Badge variant="neutral">Not connected</Badge>
                  )}
                </div>
              </div>

              {account ? (
                <div className="mt-4 flex items-center gap-3 rounded-md border border-border bg-control p-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-avatar text-sm font-semibold text-white">
                    {account.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">
                      {account.displayName}
                    </p>
                    <p className="text-xs text-ink-lavender">{account.handle}</p>
                  </div>
                  {account.connectionStatus !== "connected" ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="ml-auto"
                      onClick={() => {
                        updateAccount(account.id, {
                          connectionStatus: "connected",
                        });
                        toast({
                          title: `${PLATFORMS[platform.id].label} reconnected`,
                          description:
                            "Simulation only. No real authorization was performed.",
                          variant: "success",
                        });
                      }}
                    >
                      <RefreshCw aria-hidden="true" />
                      Reconnect
                    </Button>
                  ) : null}
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => setConnectPlatform(platform.id)}
                >
                  <Link2 aria-hidden="true" />
                  Connect {platform.label}
                </Button>
              )}
            </section>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-ink-lavender">
        Previews work without a connected account and fall back to a clearly
        labelled sample identity. Publishing is simulated in this prototype, so
        no platform authorization is performed.
      </p>

      <Dialog
        open={connectPlatform !== null}
        onOpenChange={(open) => {
          if (!open) setConnectPlatform(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Connect {connectPlatform ? PLATFORMS[connectPlatform].label : ""}
            </DialogTitle>
            <DialogDescription>
              Account authorization is not implemented in this prototype.
              Connecting a real account requires a validated provider
              integration with confirmed scopes, media rules and app review.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConnectPlatform(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

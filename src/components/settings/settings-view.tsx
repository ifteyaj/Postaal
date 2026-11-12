"use client";

import { useState } from "react";
import { useTheme } from "next-themes";

import { useAppData } from "@/components/providers/app-data-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getSupportedTimezones, timeZoneLabel } from "@/lib/time";
import type { DateFormat } from "@/lib/types";

const DATE_FORMATS: Array<{ id: DateFormat; label: string }> = [
  { id: "system", label: "System default" },
  { id: "iso", label: "2026-11-13" },
  { id: "dmy", label: "13/11/2026" },
  { id: "mdy", label: "11/13/2026" },
];

export function SettingsView() {
  const { settings, updateSettings, resetWorkspace } = useAppData();
  const { toast } = useToast();
  const { setTheme } = useTheme();
  const [displayName, setDisplayName] = useState(settings.displayName);

  const timezones = getSupportedTimezones();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            How you appear inside Postaal. Preferences are stored in this
            browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="display-name">Display name</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={settings.timezone}
              onValueChange={(value) => updateSettings({ timezone: value })}
            >
              <SelectTrigger id="timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {timezones.map((zone) => (
                  <SelectItem key={zone} value={zone}>
                    {zone} ({timeZoneLabel(zone)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-ink-lavender">
              Scheduled instants are stored in UTC and displayed in this
              timezone.
            </p>
          </div>

          <Button
            type="button"
            className="self-start"
            onClick={() => {
              updateSettings({ displayName: displayName.trim() || "Postaal" });
              toast({
                title: "Preferences saved",
                description: "Stored locally in this browser.",
                variant: "success",
              });
            }}
          >
            Save preferences
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance and format</CardTitle>
          <CardDescription>
            Choose how Postaal looks and how dates are written.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={settings.theme}
              onValueChange={(value) => {
                const theme = value as "light" | "dark" | "system";
                updateSettings({ theme });
                setTheme(theme);
              }}
            >
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">Match system</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="date-format">Date format</Label>
            <Select
              value={settings.dateFormat}
              onValueChange={(value) =>
                updateSettings({ dateFormat: value as DateFormat })
              }
            >
              <SelectTrigger id="date-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_FORMATS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-start justify-between gap-4 rounded-md border border-border bg-control p-3">
            <div className="min-w-0">
              <Label htmlFor="confirm-publish" className="text-sm">
                Warn before simulated publishing
              </Label>
              <p className="mt-0.5 text-xs text-ink-lavender">
                Shows a notice that publishing in this prototype is simulated.
              </p>
            </div>
            <Switch
              id="confirm-publish"
              checked={settings.confirmSimulatedPublish}
              onCheckedChange={(checked) =>
                updateSettings({ confirmSimulatedPublish: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Workspace data</CardTitle>
          <CardDescription>
            This prototype keeps drafts, media and simulated results in browser
            storage only. Nothing is uploaded and no social post is ever sent.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetWorkspace();
              toast({
                title: "Workspace reset",
                description: "Sample posts, media and accounts were restored.",
              });
            }}
          >
            Reset to sample data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

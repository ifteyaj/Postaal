"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  Image as ImageIcon,
  Link2,
  List,
  Pencil,
  Settings,
} from "lucide-react";

import { PostaalLogo } from "@/components/brand/postaal-logo";
import { useAppData } from "@/components/providers/app-data-provider";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/studio", label: "Studio", icon: Pencil },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/queue", label: "Queue", icon: List },
  { href: "/media", label: "Media Library", icon: ImageIcon },
  { href: "/accounts", label: "Accounts", icon: Link2 },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const { settings } = useAppData();

  const initials = settings.displayName.trim().charAt(0).toUpperCase() || "P";

  return (
    <aside className="flex h-dvh w-[202px] shrink-0 flex-col border-r border-border-soft bg-sidebar">
      <div className="flex h-[76px] items-center gap-[13px] px-8">
        <PostaalLogo />
        <span className="text-[19px] font-semibold leading-none text-ink">
          Postaal
        </span>
      </div>

      <nav aria-label="Primary" className="px-[15px] pt-[34px]">
        <ul className="flex flex-col gap-[11px]">
          {NAV_ITEMS.slice(0, 1).map((item) => (
            <NavItem key={item.href} {...item} active={pathname === item.href} />
          ))}
        </ul>

        <ul className="mt-[11px] flex flex-col gap-px">
          {NAV_ITEMS.slice(1).map((item) => (
            <NavItem
              key={item.href}
              {...item}
              active={
                pathname === item.href || pathname.startsWith(`${item.href}/`)
              }
            />
          ))}
        </ul>
      </nav>

      <div className="mt-auto px-[29px] pb-6">
        <button
          type="button"
          className="flex w-full items-center gap-[14px] rounded-lg py-1 text-left transition-colors hover:bg-control"
        >
          <span className="flex size-[29px] shrink-0 items-center justify-center rounded-full bg-avatar text-[13px] text-white">
            {initials}
          </span>
          <span className="flex-1 truncate text-[13px] font-medium text-ink">
            {settings.displayName}
          </span>
          <ChevronDown
            className="size-[14px] shrink-0 text-ink"
            aria-hidden="true"
          />
        </button>
      </div>
    </aside>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof Pencil;
  active: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex h-12 items-center gap-5 rounded-lg pl-5 text-sm transition-colors",
          active
            ? "bg-nav-selected font-medium text-accent"
            : "font-normal text-ink hover:bg-control",
        )}
      >
        <Icon
          className={cn(
            "size-5 shrink-0",
            active ? "text-accent" : "text-ink",
          )}
          strokeWidth={2}
          aria-hidden="true"
        />
        <span>{label}</span>
      </Link>
    </li>
  );
}

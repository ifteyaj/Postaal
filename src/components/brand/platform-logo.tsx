import type { ReactElement } from "react";

import type { PlatformId } from "@/lib/types";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  /** Accessible label. Pass `null` for decorative usage. */
  title?: string | null;
};

function titleAttr(title: string | null | undefined, fallback: string) {
  return title === null ? undefined : (title ?? fallback);
}

/** X in a black rounded tile, as used in the platform selector. */
export function XTileLogo({ className, title }: LogoProps) {
  return (
    <svg
      viewBox="0 0 28 28"
      role={title === null ? "presentation" : "img"}
      aria-label={titleAttr(title, "X")}
      className={cn("size-7 shrink-0", className)}
    >
      {title !== null ? <title>{title ?? "X"}</title> : null}
      <rect width="28" height="28" rx="8" fill="#090A0B" />
      <path
        d="M6.5 5.5 21.5 22.5M21.5 5.5 6.5 22.5"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Plain X glyph, as used in the preview tabs. */
export function XMarkLogo({ className, title }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      role={title === null ? "presentation" : "img"}
      aria-label={titleAttr(title, "X")}
      className={cn("size-[18px] shrink-0", className)}
    >
      {title !== null ? <title>{title ?? "X"}</title> : null}
      <path
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Instagram in its brand gradient tile. */
export function InstagramLogo({ className, title }: LogoProps) {
  const gradientId = "postaal-instagram-gradient";
  return (
    <svg
      viewBox="0 0 28 28"
      role={title === null ? "presentation" : "img"}
      aria-label={titleAttr(title, "Instagram")}
      className={cn("size-7 shrink-0", className)}
    >
      {title !== null ? <title>{title ?? "Instagram"}</title> : null}
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFC44F" />
          <stop offset="40%" stopColor="#FF3B69" />
          <stop offset="70%" stopColor="#C52ACF" />
          <stop offset="100%" stopColor="#6248FF" />
        </linearGradient>
      </defs>
      <rect width="28" height="28" rx="8" fill={`url(#${gradientId})`} />
      <rect
        x="6"
        y="6"
        width="16"
        height="16"
        rx="5"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
      />
      <circle cx="14" cy="14" r="3.9" fill="none" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="18.6" cy="9.4" r="1.25" fill="#FFFFFF" />
    </svg>
  );
}

/** LinkedIn in its brand tile. */
export function LinkedInLogo({ className, title }: LogoProps) {
  return (
    <svg
      viewBox="0 0 28 28"
      role={title === null ? "presentation" : "img"}
      aria-label={titleAttr(title, "LinkedIn")}
      className={cn("size-7 shrink-0", className)}
    >
      {title !== null ? <title>{title ?? "LinkedIn"}</title> : null}
      <rect width="28" height="28" rx="8" fill="#087DBB" />
      <path
        fill="#FFFFFF"
        d="M7.6 10.4h2.9v9.1H7.6v-9.1Zm1.45-4.6a1.68 1.68 0 1 1 0 3.36 1.68 1.68 0 0 1 0-3.36Zm3.5 4.6h2.78v1.25h.04c.39-.72 1.34-1.48 2.76-1.48 2.95 0 3.5 1.9 3.5 4.37v4.97h-2.9v-4.41c0-1.05-.02-2.4-1.48-2.4-1.48 0-1.71 1.14-1.71 2.32v4.49h-2.9v-9.11Z"
      />
    </svg>
  );
}

/** Facebook in its brand circle. */
export function FacebookLogo({ className, title }: LogoProps) {
  return (
    <svg
      viewBox="0 0 28 28"
      role={title === null ? "presentation" : "img"}
      aria-label={titleAttr(title, "Facebook")}
      className={cn("size-7 shrink-0", className)}
    >
      {title !== null ? <title>{title ?? "Facebook"}</title> : null}
      <circle cx="14" cy="14" r="14" fill="#147DFF" />
      <path
        fill="#FFFFFF"
        d="M15.6 23.5v-8.01h2.69l.4-3.13H15.6V10.1c0-.9.48-1.49 1.5-1.49h1.6V5.79c-.28-.04-1.23-.12-2.34-.12-2.32 0-3.9 1.41-3.9 4v2.69H9.6v3.13h2.26v8.01h3.74Z"
      />
    </svg>
  );
}

const PLATFORM_LOGOS: Record<
  PlatformId,
  (props: LogoProps) => ReactElement
> = {
  x: XTileLogo,
  instagram: InstagramLogo,
  linkedin: LinkedInLogo,
  facebook: FacebookLogo,
};

/** The brand tile used for a platform in selectors and lists. */
export function PlatformLogo({
  platform,
  className,
  title,
}: {
  platform: PlatformId;
  className?: string;
  title?: string | null;
}) {
  const Logo = PLATFORM_LOGOS[platform];
  return <Logo className={className} title={title} />;
}

/** The small mark used for a platform in preview tabs and badges. */
export function PlatformTabLogo({
  platform,
  className,
  title,
}: {
  platform: PlatformId;
  className?: string;
  title?: string | null;
}) {
  if (platform === "x") {
    return <XMarkLogo className={className} title={title} />;
  }
  return <PlatformLogo platform={platform} className={className} title={title} />;
}

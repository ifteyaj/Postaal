import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { AppDataProvider } from "@/components/providers/app-data-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Postaal",
    template: "%s - Postaal",
  },
  description:
    "Postaal is a self-hosted social media workspace. Create once, preview everywhere, publish anywhere.",
  applicationName: "Postaal",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F9F9FC" },
    { media: "(prefers-color-scheme: dark)", color: "#0C0E18" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={roboto.variable}>
      <body className="min-h-dvh bg-page text-ink antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={200}>
            <AppDataProvider>
              <ToastProvider>{children}</ToastProvider>
            </AppDataProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

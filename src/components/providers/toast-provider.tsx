"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

import { cn } from "@/lib/utils";

export type ToastVariant = "default" | "success" | "warning" | "danger";

export interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastRecord extends ToastInput {
  id: string;
}

interface ToastContextValue {
  toast: (input: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<ToastVariant, string> = {
  default: "border-border bg-surface text-ink",
  success: "border-success/40 bg-surface text-ink",
  warning: "border-warning/40 bg-surface text-ink",
  danger: "border-danger/40 bg-surface text-ink",
};

const VARIANT_ICONS: Record<ToastVariant, typeof Info> = {
  default: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  danger: TriangleAlert,
};

const VARIANT_ICON_COLORS: Record<ToastVariant, string> = {
  default: "text-ink-muted",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = `toast-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-3), { ...input, id }]);
      window.setTimeout(() => dismiss(id), 5000);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((item) => {
          const Icon = VARIANT_ICONS[item.variant ?? "default"];
          return (
            <div
              key={item.id}
              role="status"
              aria-live="polite"
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-tab",
                VARIANT_STYLES[item.variant ?? "default"],
              )}
            >
              <Icon
                className={cn(
                  "mt-0.5 size-4 shrink-0",
                  VARIANT_ICON_COLORS[item.variant ?? "default"],
                )}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{item.title}</p>
                {item.description ? (
                  <p className="mt-0.5 text-xs text-ink-lavender">
                    {item.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="rounded-md p-1 text-ink-lavender transition-colors hover:bg-control hover:text-ink"
                aria-label="Dismiss notification"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return context;
}

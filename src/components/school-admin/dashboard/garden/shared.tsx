"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  ClipboardCheck,
  ClipboardList,
  MessageSquare,
  RotateCw,
  Settings2,
  type LucideIcon,
} from "lucide-react";
import { G_FOCUS, GSkeleton, gBtnOutlineSm } from "@/components/school-parent/garden/ui";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import type { DashboardFocusItem, DashboardMetric } from "@/lib/school-admin/dashboard-summary";

/*
 * Shared bits for the Garden admin dashboard. Admin tuning of the parent
 * Garden kit: denser rows, tabular numbers, pastels only on chips and icons.
 */

/** Page container for Garden admin pages (inside the admin main scroller). */
export const ADMIN_GARDEN_CONTAINER_CLASS =
  "mx-auto flex w-full max-w-[1320px] flex-col gap-5 px-4 py-6 sm:px-8 lg:px-10 lg:py-8";

export const FOCUS_ICONS: Record<DashboardFocusItem["icon"], LucideIcon> = {
  application: ClipboardList,
  schedule: Calendar,
  message: MessageSquare,
  setup: Settings2,
  attendance: ClipboardCheck,
};

/** Pastel per focus kind, used on the small icon chip only. */
export const FOCUS_TINTS: Record<DashboardFocusItem["icon"], string> = {
  application: "bg-[var(--sf-butter)]",
  schedule: "bg-[var(--sf-sky)]",
  message: "bg-[var(--sf-lav)]",
  setup: "bg-[var(--sf-peach)]",
  attendance: "bg-[var(--sf-mint)]",
};

/** Where each dashboard metric leads (existing admin pages). */
export function metricHref(slug: string, metric: DashboardMetric): string | null {
  switch (metric.id) {
    case "active-applications":
      return schoolAdminPath(slug, "admissions", "submissions");
    case "shadow-days":
      return `${schoolAdminPath(slug, "schedule")}?tab=shadow`;
    case "collected-month":
      return schoolAdminPath(slug, "admissions", "payments");
    case "unread-messages":
      return schoolAdminPath(slug, "messages");
    default:
      return null;
  }
}

export const METRIC_BARS: Record<DashboardMetric["accent"], string> = {
  forest: "bg-[var(--sf-forest)]",
  sky: "bg-[#5b8fc7]",
  gold: "bg-[#d9a400]",
  berry: "bg-[var(--sf-clay)]",
};

/** "just now" / "2 min ago", re-rendered every 30s. */
export function useRelativeTime(timestamp: number): string {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000));
  if (seconds < 45) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return `${hours} hr ago`;
}

/** Inline load-failure state with a retry button (load failures never toast). */
export function GardenLoadError({
  title,
  description,
  onRetry,
  retrying = false,
}: {
  title: string;
  description?: string;
  onRetry: () => void;
  retrying?: boolean;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-[18px] border-[1.5px] border-dashed border-[var(--sf-ink)]/20 bg-[var(--sf-paper)] p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <p className="m-0 text-[15px] font-extrabold text-[var(--sf-ink)]">{title}</p>
        {description ? (
          <p className="m-0 mt-1 text-[13px] font-semibold text-[var(--sf-soft)]">{description}</p>
        ) : null}
      </div>
      <button type="button" onClick={onRetry} disabled={retrying} className={gBtnOutlineSm}>
        <RotateCw className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`} aria-hidden />
        {retrying ? "Trying again…" : "Try again"}
      </button>
    </div>
  );
}

/** Skeleton stack for a lazily loaded tab. */
export function GardenPanelSkeleton({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-5" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <GSkeleton className="h-[320px]" />
        <GSkeleton className="h-[320px]" />
      </div>
    </div>
  );
}

/** A plain row button/link class for list rows inside cards. */
export const ROW_INTERACTIVE = `group flex w-full items-center gap-3 rounded-[14px] px-3 py-3 text-left transition-colors hover:bg-[var(--sf-accent-wash)] ${G_FOCUS} focus-visible:ring-inset focus-visible:ring-offset-0`;

"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, Loader2 } from "lucide-react";
import MobilePushNotificationHistoryDrawer, {
  formatKindRecipientSummary,
} from "@/components/admin/MobilePushNotificationHistoryDrawer";
import type { ActivityDatePreset } from "@/lib/activity-log";
import type { MobilePushAnalyticsResult } from "@/lib/admin/mobile-push-analytics";
import type { MobilePushNotificationKind } from "@/lib/notifications/mobile-push-catalog";

type SurfaceFilter = "" | "parent_portal" | "teacher_portal" | "school_admin";

type MobilePushNotificationsCatalogPanelProps = {
  datePreset: ActivityDatePreset;
  organizationId: string;
  surfaceFilter: SurfaceFilter;
};

export default function MobilePushNotificationsCatalogPanel({
  datePreset,
  organizationId,
  surfaceFilter,
}: MobilePushNotificationsCatalogPanelProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MobilePushAnalyticsResult | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedKind, setSelectedKind] = useState<MobilePushNotificationKind | null>(
    null,
  );
  const [selectedLabel, setSelectedLabel] = useState("");

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ preset: datePreset });
      if (organizationId) params.set("organizationId", organizationId);
      if (surfaceFilter) params.set("surface", surfaceFilter);

      const res = await fetch(`/api/admin/mobile-push-analytics?${params.toString()}`);
      const body = (await res.json()) as MobilePushAnalyticsResult & {
        error?: string;
      };

      if (!res.ok) {
        setData(null);
        setError(body.error ?? "Failed to load push notification catalog.");
        return;
      }

      setData(body);
    } catch {
      setData(null);
      setError("Failed to load push notification catalog.");
    } finally {
      setLoading(false);
    }
  }, [datePreset, organizationId, surfaceFilter]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadSummary();
    });
  }, [loadSummary]);

  const openHistory = (kind: MobilePushNotificationKind, label: string) => {
    setSelectedKind(kind);
    setSelectedLabel(label);
    setDrawerOpen(true);
  };

  const closeHistory = () => {
    setDrawerOpen(false);
    setSelectedKind(null);
    setSelectedLabel("");
  };

  if (loading) {
    return (
      <p className="text-xs text-admin-muted py-6 text-center flex items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading push notifications…
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-xs text-admin-accent py-6 text-center" role="alert">
        {error}
      </p>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <>
      <div className="rounded-admin-md border border-admin-border bg-admin-surface overflow-hidden">
        <div className="px-3 py-2 border-b border-admin-border bg-admin-bg">
          <p className="text-xs text-admin-muted">
            MudKitchen mobile app push types sent via Expo. Sent, failed, no token,
            and total follow the header date preset.{" "}
            <span className="text-admin-text">Sent / failed today</span> is always
            calendar today (same org and portal filters). Legacy rows without a kind
            are excluded until backfilled.
          </p>
          {data.truncated ? (
            <p className="text-xs text-admin-warning mt-1">
              Period counts capped at 100k delivery rows — narrow filters for exact
              totals.
            </p>
          ) : null}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[720px]">
            <thead>
              <tr className="text-admin-muted border-b border-admin-border">
                <th className="text-left font-medium px-3 py-2">Notification</th>
                <th className="text-left font-medium px-3 py-2 w-24">Channel</th>
                <th className="text-left font-medium px-3 py-2 w-36">Recipients</th>
                <th className="text-right font-medium px-3 py-2 w-28">
                  Sent / failed today
                </th>
                <th className="text-right font-medium px-3 py-2 w-20">Sent</th>
                <th className="text-right font-medium px-3 py-2 w-20">Failed</th>
                <th className="text-right font-medium px-3 py-2 w-24">No token</th>
                <th className="text-right font-medium px-3 py-2 w-28">Total</th>
                <th className="text-right font-medium px-3 py-2 w-24" />
              </tr>
            </thead>
            <tbody>
              {data.kinds.map((row) => (
                <tr
                  key={row.kind}
                  className="border-b border-admin-border/60 last:border-0 align-top"
                >
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-admin-text">{row.label}</p>
                    <p className="text-[11px] text-admin-muted mt-0.5 max-w-md">
                      {row.description}
                    </p>
                  </td>
                  <td className="px-3 py-2.5 text-admin-text capitalize">
                    {row.channel}
                  </td>
                  <td className="px-3 py-2.5 text-admin-muted">
                    {formatKindRecipientSummary(row.recipientPortals)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    <span className="text-admin-text">
                      {row.sentTodayCount.toLocaleString()}
                    </span>
                    <span className="text-admin-muted"> / </span>
                    <span
                      className={
                        row.failedTodayCount > 0
                          ? "text-admin-error"
                          : "text-admin-muted"
                      }
                    >
                      {row.failedTodayCount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-admin-text">
                    {row.sentCount.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-admin-text">
                    {row.failedCount.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-admin-text">
                    {row.skippedNoTokenCount.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-admin-text">
                    {row.deliveryCount.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => openHistory(row.kind, row.label)}
                      className="inline-flex items-center gap-1 rounded-admin-md border border-admin-border bg-admin-bg px-2 py-1 text-[11px] font-semibold text-admin-text hover:bg-admin-neutral-bg"
                      aria-label={`View delivery history for ${row.label}`}
                    >
                      <Activity className="h-3.5 w-3.5" aria-hidden />
                      Activity
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <MobilePushNotificationHistoryDrawer
        open={drawerOpen}
        onClose={closeHistory}
        kind={selectedKind}
        label={selectedLabel}
        datePreset={datePreset}
        organizationId={organizationId}
        surfaceFilter={surfaceFilter}
        showOrganization={!organizationId}
      />
    </>
  );
}

"use client";

import { AdminDrawer } from "@/components/admin/ui/AdminDrawer";
import {
  mobileFeatureAnalyticsSurfaceLabel,
  type MobileFeatureAnalyticsUsersResult,
} from "@/lib/mobile-feature-analytics";

type MobileFeatureUsersDrawerProps = {
  open: boolean;
  loading: boolean;
  error: string | null;
  data: MobileFeatureAnalyticsUsersResult | null;
  filterSummary: string | null;
  onClose: () => void;
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function MobileFeatureUsersDrawer({
  open,
  loading,
  error,
  data,
  filterSummary,
  onClose,
}: MobileFeatureUsersDrawerProps) {
  const title = data
    ? `${data.label} — ${mobileFeatureAnalyticsSurfaceLabel(data.surface)}`
    : "Feature users";

  return (
    <AdminDrawer open={open} onClose={onClose} title={title} width="lg">
      <div className="p-4 space-y-4">
        {filterSummary ? (
          <p className="text-xs text-admin-muted">{filterSummary}</p>
        ) : null}

        {loading ? (
          <p className="text-xs text-admin-muted py-8 text-center">Loading users…</p>
        ) : error ? (
          <p className="text-xs text-admin-accent py-4" role="alert">
            {error}
          </p>
        ) : data && data.rows.length === 0 ? (
          <p className="text-xs text-admin-muted py-8 text-center">
            No users found for this feature in the selected period.
          </p>
        ) : data ? (
          <>
            {data.truncated ? (
              <p className="text-xs text-admin-warning">
                Results capped at 100k events; narrow the date range or organization for
                full accuracy.
              </p>
            ) : null}
            <p className="text-xs text-admin-faint tabular-nums">
              {data.rows.length} user{data.rows.length === 1 ? "" : "s"}
            </p>
            <div className="rounded-admin-md border border-admin-border overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-admin-muted border-b border-admin-border bg-admin-bg">
                    <th className="text-left font-medium px-3 py-2">User</th>
                    <th className="text-right font-medium px-3 py-2 w-16">Visits</th>
                    <th className="text-right font-medium px-3 py-2 w-32">First visit</th>
                    <th className="text-right font-medium px-3 py-2 w-32">Last visit</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row) => (
                    <tr
                      key={row.userId}
                      className="border-b border-admin-border/60 last:border-0"
                    >
                      <td className="px-3 py-2 text-admin-text">
                        <p className="font-medium">{row.name ?? "Unknown"}</p>
                        {row.email ? (
                          <p className="text-admin-muted break-all mt-0.5">{row.email}</p>
                        ) : (
                          <p className="text-admin-faint mt-0.5 font-mono text-[10px] break-all">
                            {row.userId}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-admin-text">
                        {row.visits.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right text-admin-muted whitespace-nowrap">
                        {formatDateTime(row.firstVisitAt)}
                      </td>
                      <td className="px-3 py-2 text-right text-admin-muted whitespace-nowrap">
                        {formatDateTime(row.lastVisitAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </div>
    </AdminDrawer>
  );
}

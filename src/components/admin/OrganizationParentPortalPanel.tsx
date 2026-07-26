"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import ParentPortalLoginBadge, {
  getParentPortalLoginStatusLabel,
} from "@/components/admissions/ParentPortalLoginBadge";
import type {
  ParentPortalLoginStatus,
  ParentPortalLoginSummary,
} from "@/lib/admissions/parent-portal-login-status";

type OrganizationParentPortalPanelProps = {
  organizationId: string;
};

function guardianDisplayName(status: ParentPortalLoginStatus): string {
  const name = [status.firstName, status.lastName].filter(Boolean).join(" ");
  return name || status.email || "Guardian";
}

export default function OrganizationParentPortalPanel({
  organizationId,
}: OrganizationParentPortalPanelProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<ParentPortalLoginStatus[]>([]);
  const [summary, setSummary] = useState<ParentPortalLoginSummary | null>(null);

  const loadStatuses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/parent-login-status`,
      );
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error ?? "Failed to load parent portal access.");
      }

      setStatuses((body.statuses as ParentPortalLoginStatus[]) ?? []);
      setSummary((body.summary as ParentPortalLoginSummary | undefined) ?? null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load parent portal access.",
      );
      setStatuses([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadStatuses();
    });
  }, [loadStatuses]);

  return (
    <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold text-admin-faint uppercase tracking-wide font-secondary">
          Parent portal access
        </h2>
        {!loading && summary ? (
          <span className="text-xs text-admin-muted font-secondary">
            {summary.signedIn} of {summary.total} guardians signed in
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-6 text-sm text-admin-faint font-secondary">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading parent portal access…
        </div>
      ) : error ? (
        <p className="text-sm text-admin-accent font-secondary">{error}</p>
      ) : statuses.length === 0 ? (
        <p className="text-sm text-admin-faint py-4">
          No parent guardians for this school yet.
        </p>
      ) : (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full min-w-[520px] text-sm font-secondary">
            <thead>
              <tr className="text-left text-xs text-admin-faint border-b border-admin-border">
                <th className="px-2 py-2 font-semibold">Guardian</th>
                <th className="px-2 py-2 font-semibold">Account</th>
                <th className="px-2 py-2 font-semibold">Last sign-in</th>
              </tr>
            </thead>
            <tbody>
              {statuses.map((status) => (
                <tr
                  key={status.guardianId}
                  className="border-b border-admin-border/70 last:border-b-0"
                >
                  <td className="px-2 py-2.5 align-top">
                    <p className="font-medium text-admin-text">
                      {guardianDisplayName(status)}
                    </p>
                    {status.email ? (
                      <p className="text-xs text-admin-muted mt-0.5 truncate max-w-[220px]">
                        {status.email}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-2 py-2.5 align-top">
                    <ParentPortalLoginBadge status={status} />
                  </td>
                  <td className="px-2 py-2.5 align-top text-xs text-admin-muted whitespace-nowrap">
                    {getParentPortalLoginStatusLabel(status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

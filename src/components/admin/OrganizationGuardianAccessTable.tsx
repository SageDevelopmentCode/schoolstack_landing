"use client";

import ParentPortalLoginBadge, {
  getParentPortalLoginStatusLabel,
} from "@/components/admissions/ParentPortalLoginBadge";
import type {
  ParentPortalLoginStatus,
  ParentPortalLoginSummary,
} from "@/lib/admissions/parent-portal-login-status";

type OrganizationGuardianAccessTableProps = {
  statuses: ParentPortalLoginStatus[];
  summary: ParentPortalLoginSummary | null;
};

function guardianDisplayName(status: ParentPortalLoginStatus): string {
  const name = [status.firstName, status.lastName].filter(Boolean).join(" ");
  return name || status.email || "Guardian";
}

export default function OrganizationGuardianAccessTable({
  statuses,
  summary,
}: OrganizationGuardianAccessTableProps) {
  return (
    <section className="bg-admin-surface border border-admin-border rounded-admin-md p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold text-admin-faint uppercase tracking-wide font-secondary">
          Guardian access
        </h2>
        {summary ? (
          <span className="text-xs text-admin-muted font-secondary">
            {summary.signedIn} of {summary.total} guardians signed in
          </span>
        ) : null}
      </div>

      {statuses.length === 0 ? (
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

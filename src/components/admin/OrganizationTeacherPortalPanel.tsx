"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, Loader2 } from "lucide-react";
import ParentPortalLoginBadge, {
  getParentPortalLoginStatusLabel,
  type ParentPortalLoginDisplayStatus,
} from "@/components/admissions/ParentPortalLoginBadge";
import { staffPreviewBasePath } from "@/lib/staff/staff-preview-access";
import type {
  StaffMemberRecord,
  StaffPortalRole,
} from "@/lib/staff/staff-members";
import type { StaffPortalLoginSummary } from "@/lib/staff/staff-portal-login-status";

type OrganizationTeacherPortalPanelProps = {
  organizationId: string;
  organizationSlug: string;
};

function staffDisplayName(member: StaffMemberRecord): string {
  return (
    [member.firstName, member.lastName].filter(Boolean).join(" ") ||
    member.email ||
    "Staff member"
  );
}

function portalRoleLabel(role: StaffPortalRole | null): string {
  if (role === "teacher") return "Teacher";
  if (role === "staff") return "Staff";
  return "—";
}

function staffPortalLoginBadgeStatus(
  member: StaffMemberRecord,
): ParentPortalLoginDisplayStatus {
  return {
    accountLinked: member.isLinked,
    hasEverSignedIn: member.hasEverSignedIn ?? false,
    lastSignInAt: member.lastSignInAt ?? null,
  };
}

function canPreviewStaff(member: StaffMemberRecord): boolean {
  return (
    member.portalRole != null && member.membershipStatus === "active"
  );
}

export default function OrganizationTeacherPortalPanel({
  organizationId,
  organizationSlug,
}: OrganizationTeacherPortalPanelProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [staffMembers, setStaffMembers] = useState<StaffMemberRecord[]>([]);
  const [summary, setSummary] = useState<StaffPortalLoginSummary | null>(null);

  const loadStatuses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/staff-login-status`,
      );
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error ?? "Failed to load teacher portal access.");
      }

      setStaffMembers((body.staffMembers as StaffMemberRecord[]) ?? []);
      setSummary((body.summary as StaffPortalLoginSummary | undefined) ?? null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load teacher portal access.",
      );
      setStaffMembers([]);
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
          Teacher portal access
        </h2>
        {!loading && summary ? (
          <span className="text-xs text-admin-muted font-secondary">
            {summary.signedIn} of {summary.withPortalAccess} staff signed in
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-6 text-sm text-admin-faint font-secondary">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading teacher portal access…
        </div>
      ) : error ? (
        <p className="text-sm text-admin-accent font-secondary">{error}</p>
      ) : staffMembers.length === 0 ? (
        <p className="text-sm text-admin-faint py-4">
          No staff members for this school yet.
        </p>
      ) : (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full min-w-[640px] text-sm font-secondary">
            <thead>
              <tr className="text-left text-xs text-admin-faint border-b border-admin-border">
                <th className="px-2 py-2 font-semibold">Staff</th>
                <th className="px-2 py-2 font-semibold">Role</th>
                <th className="px-2 py-2 font-semibold">Account</th>
                <th className="px-2 py-2 font-semibold">Last sign-in</th>
                <th className="px-2 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffMembers.map((member) => {
                const previewEnabled = canPreviewStaff(member);
                const previewHref = staffPreviewBasePath(
                  organizationSlug,
                  member.id,
                );

                return (
                  <tr
                    key={member.id}
                    className="border-b border-admin-border/70 last:border-b-0"
                  >
                    <td className="px-2 py-2.5 align-top">
                      <p className="font-medium text-admin-text">
                        {staffDisplayName(member)}
                      </p>
                      {member.email ? (
                        <p className="text-xs text-admin-muted mt-0.5 truncate max-w-[220px]">
                          {member.email}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-2 py-2.5 align-top">
                      <p className="text-sm text-admin-text">
                        {member.roleTitle || "—"}
                      </p>
                      <p className="text-xs text-admin-muted mt-0.5">
                        {portalRoleLabel(member.portalRole)}
                      </p>
                    </td>
                    <td className="px-2 py-2.5 align-top">
                      <ParentPortalLoginBadge
                        status={staffPortalLoginBadgeStatus(member)}
                      />
                    </td>
                    <td className="px-2 py-2.5 align-top text-xs text-admin-muted whitespace-nowrap">
                      {getParentPortalLoginStatusLabel(
                        staffPortalLoginBadgeStatus(member),
                      )}
                    </td>
                    <td className="px-2 py-2.5 align-top">
                      {previewEnabled ? (
                        <a
                          href={previewHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-md border border-admin-border bg-white px-2.5 py-1 text-xs font-medium text-admin-text transition hover:bg-admin-surface"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Preview
                        </a>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-md border border-admin-border/50 px-2.5 py-1 text-xs text-admin-faint"
                          title="Staff must have active portal access to preview"
                        >
                          <Eye className="h-3.5 w-3.5 opacity-40" />
                          Preview
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

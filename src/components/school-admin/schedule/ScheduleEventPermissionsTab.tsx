"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { Loader2, Search } from "lucide-react";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import {
  countStaffWithEventPermissions,
  getDefaultScheduleSettings,
  type OrganizationScheduleSettings,
} from "@/lib/school-events/schedule-settings";
import { portalRoleLabel, staffDisplayName } from "@/lib/staff/staff-display";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type ScheduleEventPermissionsTabProps = {
  organizationId: string;
  slug: string;
  onLoadingChange?: (loading: boolean) => void;
  onPermittedStaffCountChange?: (count: number) => void;
};

function SettingToggleRow({
  C,
  label,
  checked,
  disabled,
  onChange,
  description,
  showDivider = false,
}: {
  C: AdminThemeTokens;
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  showDivider?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={description ? `${label}. ${description}` : label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex w-full min-h-[44px] items-center justify-between gap-4 px-3 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      style={
        showDivider ? { borderBottom: `1px solid ${C.border}` } : undefined
      }
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium" style={{ color: C.textPrimary }}>
          {label}
        </span>
        {description ? (
          <span className="mt-0.5 block text-xs" style={{ color: C.textSecondary }}>
            {description}
          </span>
        ) : null}
      </span>
      <span
        aria-hidden="true"
        className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors"
        style={{ backgroundColor: checked ? C.accent : C.border }}
      >
        <span
          className="inline-block h-5 w-5 rounded-full bg-white transition-transform"
          style={{
            transform: checked ? "translateX(22px)" : "translateX(2px)",
          }}
        />
      </span>
    </button>
  );
}

function searchInputStyle(C: AdminThemeTokens): CSSProperties {
  return {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    borderRadius: C.r.md,
    fontSize: "14px",
    padding: "10px 12px 10px 36px",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
  };
}

export default function ScheduleEventPermissionsTab({
  organizationId,
  slug,
  onLoadingChange,
  onPermittedStaffCountChange,
}: ScheduleEventPermissionsTabProps) {
  const { theme, C } = useSchoolAdminStoryTheme();
  const [settings, setSettings] = useState<OrganizationScheduleSettings>(
    getDefaultScheduleSettings(),
  );
  const [staffMembers, setStaffMembers] = useState<StaffMemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [permissionsRes, staffRes] = await Promise.all([
        fetch(
          `/api/school-admin/schedule/permissions?organizationId=${encodeURIComponent(organizationId)}`,
        ),
        fetch(`/api/school/${encodeURIComponent(slug)}/staff`),
      ]);

      if (!permissionsRes.ok) {
        throw new Error("Failed to load schedule permissions.");
      }
      if (!staffRes.ok) {
        throw new Error("Failed to load staff roster.");
      }

      const permissionsJson = (await permissionsRes.json()) as {
        settings: OrganizationScheduleSettings;
      };
      const staffJson = (await staffRes.json()) as {
        staffMembers: StaffMemberRecord[];
      };

      setSettings(permissionsJson.settings);
      setStaffMembers(staffJson.staffMembers ?? []);
    } catch (err) {
      setLoadError(formatActionError(err, "Failed to load permissions."));
    } finally {
      setLoading(false);
    }
  }, [organizationId, slug]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadData();
    });
  }, [loadData]);

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  const activeStaff = useMemo(
    () =>
      staffMembers.filter((member) => member.employmentStatus === "active"),
    [staffMembers],
  );

  const displayPermittedCount = useMemo(
    () =>
      countStaffWithEventPermissions(
        activeStaff.map((member) => ({
          id: member.id,
          portalRole: member.portalRole,
          employmentStatus: member.employmentStatus,
        })),
        settings.event_permissions,
      ),
    [activeStaff, settings.event_permissions],
  );

  useEffect(() => {
    onPermittedStaffCountChange?.(displayPermittedCount);
  }, [displayPermittedCount, onPermittedStaffCountChange]);

  const filteredStaff = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return activeStaff;
    return activeStaff.filter((member) => {
      const name = staffDisplayName(member).toLowerCase();
      const title = (member.roleTitle ?? "").toLowerCase();
      return name.includes(query) || title.includes(query);
    });
  }, [activeStaff, searchQuery]);

  const toggleRole = (role: "teacher" | "staff", enabled: boolean) => {
    setSettings((current) => ({
      ...current,
      event_permissions: {
        ...current.event_permissions,
        roles: {
          ...current.event_permissions.roles,
          [role]: enabled,
        },
      },
    }));
  };

  const toggleStaffMember = (staffMemberId: string, enabled: boolean) => {
    setSettings((current) => {
      const ids = new Set(current.event_permissions.staff_member_ids);
      if (enabled) {
        ids.add(staffMemberId);
      } else {
        ids.delete(staffMemberId);
      }
      return {
        ...current,
        event_permissions: {
          ...current.event_permissions,
          staff_member_ids: Array.from(ids),
        },
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/school-admin/schedule/permissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, settings }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? "Failed to save permissions.");
      }

      const payload = (await response.json()) as {
        settings: OrganizationScheduleSettings;
      };
      setSettings(payload.settings);
      adminToast.success("Calendar permissions saved");
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to save permissions."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminCard theme={theme} className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: theme.muted }} />
      </AdminCard>
    );
  }

  if (loadError) {
    return (
      <AdminCard theme={theme} className="space-y-4">
        <p className="text-sm" style={{ color: theme.muted }}>
          {loadError}
        </p>
        <AdminButton theme={theme} variant="outline" onClick={() => void loadData()}>
          Try again
        </AdminButton>
      </AdminCard>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <AdminCard theme={theme} className="!p-0 overflow-hidden">
        <div className="border-b px-5 py-4" style={{ borderColor: C.border }}>
          <AdminDisplayHeading theme={theme} as="h3" size="section">
            Role access
          </AdminDisplayHeading>
          <p className="mt-1 text-xs" style={{ color: C.textSecondary }}>
            Applies to every active staff member with that portal role.
          </p>
        </div>
        <SettingToggleRow
          C={C}
          label="All teachers"
          description="Anyone with the Teacher portal role"
          checked={settings.event_permissions.roles.teacher}
          disabled={saving}
          onChange={(checked) => toggleRole("teacher", checked)}
          showDivider
        />
        <SettingToggleRow
          C={C}
          label="All staff"
          description="Anyone with the Staff portal role"
          checked={settings.event_permissions.roles.staff}
          disabled={saving}
          onChange={(checked) => toggleRole("staff", checked)}
        />
      </AdminCard>

      <AdminCard theme={theme} className="!p-0 overflow-hidden">
        <div className="border-b px-5 py-4" style={{ borderColor: C.border }}>
          <AdminDisplayHeading theme={theme} as="h3" size="section">
            Individual staff
          </AdminDisplayHeading>
          <p className="mt-1 text-xs" style={{ color: C.textSecondary }}>
            Grant access to specific people in addition to role-wide settings.
          </p>
          <div className="relative mt-3">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: C.textTertiary }}
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search staff…"
              aria-label="Search staff"
              style={searchInputStyle(C)}
            />
          </div>
        </div>

        {filteredStaff.length === 0 ? (
          <p className="px-5 py-6 text-sm" style={{ color: C.textSecondary }}>
            {activeStaff.length === 0
              ? "No active staff members yet."
              : "No staff match your search."}
          </p>
        ) : (
          <ul>
            {filteredStaff.map((member, index) => {
              const checked = settings.event_permissions.staff_member_ids.includes(
                member.id,
              );
              const name = staffDisplayName(member);
              return (
                <li
                  key={member.id}
                  style={
                    index < filteredStaff.length - 1
                      ? { borderBottom: `1px solid ${C.border}` }
                      : undefined
                  }
                >
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    aria-label={`${name} can manage calendar events`}
                    disabled={saving}
                    onClick={() => toggleStaffMember(member.id, !checked)}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded border"
                      style={{
                        borderColor: checked ? C.accent : C.border,
                        backgroundColor: checked ? C.accent : C.surface,
                        color: checked ? "#fff" : "transparent",
                      }}
                    >
                      {checked ? "✓" : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className="block text-sm font-medium"
                        style={{ color: C.textPrimary }}
                      >
                        {name}
                      </span>
                      {member.roleTitle ? (
                        <span
                          className="mt-0.5 block text-xs"
                          style={{ color: C.textSecondary }}
                        >
                          {member.roleTitle}
                        </span>
                      ) : null}
                    </span>
                    {member.portalRole ? (
                      <AdminChip theme={theme} tone="info" className="shrink-0">
                        {portalRoleLabel(member.portalRole)}
                      </AdminChip>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </AdminCard>

      <div className="flex justify-end">
        <AdminButton
          theme={theme}
          variant="primary"
          onClick={() => void handleSave()}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save permissions"
          )}
        </AdminButton>
      </div>
    </div>
  );
}

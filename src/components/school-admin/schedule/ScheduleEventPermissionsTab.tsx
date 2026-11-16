"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, UsersRound } from "lucide-react";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import {
  GardenFilterChips,
  GardenLoadError,
  GardenNotice,
  GardenSaveBar,
  GardenSwitch,
} from "@/components/school-admin/garden/kit";
import { GardenAvatar, GardenSearchInput } from "@/components/school-admin/garden/blocks";
import { useAdminAction } from "@/components/school-admin/garden/useAdminAction";
import { GCard, GChip, GSkeleton, G_FOCUS, gLinkSm } from "@/components/school-parent/garden/ui";
import {
  countStaffWithEventPermissions,
  getDefaultScheduleSettings,
  type OrganizationScheduleSettings,
} from "@/lib/school-events/schedule-settings";
import { portalRoleLabel, staffDisplayName } from "@/lib/staff/staff-display";
import type { StaffMemberRecord } from "@/lib/staff/staff-members";
import { formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";

type ScheduleEventPermissionsTabProps = {
  organizationId: string;
  slug: string;
  onLoadingChange?: (loading: boolean) => void;
  onPermittedStaffCountChange?: (count: number) => void;
};

type StaffFilter = "all" | "selected";

/**
 * Calendar permissions (admin Garden). Same API as before (GET/PATCH
 * /api/school-admin/schedule/permissions + the staff roster). Changes are
 * batched: a save bar shows how many changed, with Discard and Save.
 */
export default function ScheduleEventPermissionsTab({
  organizationId,
  slug,
  onLoadingChange,
  onPermittedStaffCountChange,
}: ScheduleEventPermissionsTabProps) {
  useSchoolAdminStoryTheme();
  const action = useAdminAction();
  const [settings, setSettings] = useState<OrganizationScheduleSettings>(getDefaultScheduleSettings());
  const [saved, setSaved] = useState<OrganizationScheduleSettings>(getDefaultScheduleSettings());
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [staffMembers, setStaffMembers] = useState<StaffMemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<StaffFilter>("all");
  const saving = action.pendingKey === "schedule-permissions";

  const onLoadingRef = useRef(onLoadingChange);
  const onCountRef = useRef(onPermittedStaffCountChange);
  useEffect(() => {
    onLoadingRef.current = onLoadingChange;
    onCountRef.current = onPermittedStaffCountChange;
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [permissionsRes, staffRes] = await Promise.all([
        fetch(`/api/school-admin/schedule/permissions?organizationId=${encodeURIComponent(organizationId)}`),
        fetch(`/api/school/${encodeURIComponent(slug)}/staff`),
      ]);
      if (!permissionsRes.ok) throw new Error("Failed to load schedule permissions.");
      if (!staffRes.ok) throw new Error("Failed to load staff roster.");
      const permissionsJson = (await permissionsRes.json()) as { settings: OrganizationScheduleSettings };
      const staffJson = (await staffRes.json()) as { staffMembers: StaffMemberRecord[] };
      setSettings(permissionsJson.settings);
      setSaved(permissionsJson.settings);
      setStaffMembers(staffJson.staffMembers ?? []);
    } catch (err) {
      setLoadError(formatActionError(err, "Failed to load permissions."));
      void reportPortalOperationalError(
        "school_admin",
        { organizationId, operation: "schedule.permissions.load", error: "" },
        err,
      );
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
    onLoadingRef.current?.(loading);
  }, [loading]);

  const activeStaff = useMemo(
    () => staffMembers.filter((member) => member.employmentStatus === "active"),
    [staffMembers],
  );

  const countFor = useCallback(
    (value: OrganizationScheduleSettings) =>
      countStaffWithEventPermissions(
        activeStaff.map((member) => ({
          id: member.id,
          portalRole: member.portalRole,
          employmentStatus: member.employmentStatus,
        })),
        value.event_permissions,
      ),
    [activeStaff],
  );
  const displayPermittedCount = useMemo(() => countFor(settings), [countFor, settings]);
  const savedPermittedCount = useMemo(() => countFor(saved), [countFor, saved]);

  // The header reports what's saved, not unsaved edits.
  useEffect(() => {
    if (!loading) onCountRef.current?.(savedPermittedCount);
  }, [loading, savedPermittedCount]);

  const perms = settings.event_permissions;
  const changeCount =
    (perms.roles.teacher !== saved.event_permissions.roles.teacher ? 1 : 0) +
    (perms.roles.staff !== saved.event_permissions.roles.staff ? 1 : 0) +
    new Set([
      ...perms.staff_member_ids.filter((id) => !saved.event_permissions.staff_member_ids.includes(id)),
      ...saved.event_permissions.staff_member_ids.filter((id) => !perms.staff_member_ids.includes(id)),
    ]).size;
  const dirty = changeCount > 0;

  const filteredStaff = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return activeStaff.filter((member) => {
      if (filter === "selected" && !perms.staff_member_ids.includes(member.id)) return false;
      if (!query) return true;
      const name = staffDisplayName(member).toLowerCase();
      const title = (member.roleTitle ?? "").toLowerCase();
      return name.includes(query) || title.includes(query);
    });
  }, [activeStaff, filter, perms.staff_member_ids, searchQuery]);

  const toggleRole = (role: "teacher" | "staff", enabled: boolean) => {
    setSettings((current) => ({
      ...current,
      event_permissions: {
        ...current.event_permissions,
        roles: { ...current.event_permissions.roles, [role]: enabled },
      },
    }));
  };

  const toggleStaffMember = (staffMemberId: string, enabled: boolean) => {
    setSettings((current) => {
      const ids = new Set(current.event_permissions.staff_member_ids);
      if (enabled) ids.add(staffMemberId);
      else ids.delete(staffMemberId);
      return {
        ...current,
        event_permissions: { ...current.event_permissions, staff_member_ids: Array.from(ids) },
      };
    });
  };

  const handleSave = async () => {
    const next = settings;
    await action.run(
      async () => {
        try {
          const response = await fetch("/api/school-admin/schedule/permissions", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ organizationId, settings: next }),
          });
          if (!response.ok) {
            const payload = (await response.json().catch(() => null)) as { error?: string } | null;
            throw new Error(payload?.error ?? "Failed to save permissions.");
          }
          const payload = (await response.json()) as { settings: OrganizationScheduleSettings };
          // Applied here (not after run) so a successful Retry also clears the save bar.
          setSettings(payload.settings);
          setSaved(payload.settings);
          setSavedAt(Date.now());
          return payload.settings;
        } catch (err) {
          void reportPortalOperationalError(
            "school_admin",
            { organizationId, operation: "schedule.permissions.save", error: "" },
            err,
          );
          throw err;
        }
      },
      {
        key: "schedule-permissions",
        success: (savedSettings) => {
          const count = countFor(savedSettings);
          return {
            title: "Calendar permissions saved.",
            description:
              count === 0
                ? "Only admins can add and edit school events now."
                : `${count} staff ${count === 1 ? "member" : "members"} can add and edit school events.`,
          };
        },
        error: {
          title: "Couldn't save calendar permissions.",
          description: "Your changes are still here and nothing was saved.",
          fallback: "Failed to save permissions.",
        },
      },
    );
  };

  if (loading) {
    return (
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_1.4fr]" aria-busy="true" aria-label="Loading permissions">
        <GSkeleton className="h-[220px] rounded-[24px]" />
        <GSkeleton className="h-[360px] rounded-[24px]" />
      </div>
    );
  }

  if (loadError) {
    return (
      <GCard index={1}>
        <GardenLoadError title="Couldn't load calendar permissions." description={`${loadError} Nothing has changed.`} onRetry={() => void loadData()} />
      </GCard>
    );
  }

  const roleCovers = (member: StaffMemberRecord) =>
    (member.portalRole === "teacher" && perms.roles.teacher) || (member.portalRole === "staff" && perms.roles.staff);

  return (
    <div className="flex flex-col gap-5" data-testid="schedule-permissions">
      <GardenNotice tone={displayPermittedCount > 0 ? "success" : "info"} icon={UsersRound} role="status">
        {displayPermittedCount === 0 ? (
          <>Only admins can add and edit school events right now.</>
        ) : (
          <>
            <b className="tabular-nums">{displayPermittedCount}</b> staff {displayPermittedCount === 1 ? "member" : "members"} can add
            and edit school events{dirty ? " once you save" : ""}.
          </>
        )}
      </GardenNotice>

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_1.4fr]">
        <GCard index={1} kicker="By role" title="Role access">
          <p className="m-0 -mt-2 mb-4 text-[13px] font-semibold text-[var(--sf-soft)]">
            Applies to every active staff member with that portal role.
          </p>
          <div className="flex flex-col gap-3 rounded-[16px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-3.5">
            <GardenSwitch
              checked={perms.roles.teacher}
              disabled={saving}
              onChange={(checked) => toggleRole("teacher", checked)}
              label="All teachers"
              description="Anyone with the Teacher portal role"
              data-testid="schedule-permissions-teachers"
            />
            <div className="border-t border-[var(--sf-ink)]/[0.08] pt-3">
              <GardenSwitch
                checked={perms.roles.staff}
                disabled={saving}
                onChange={(checked) => toggleRole("staff", checked)}
                label="All staff"
                description="Anyone with the Staff portal role"
                data-testid="schedule-permissions-staff"
              />
            </div>
          </div>
        </GCard>

        <GCard index={2} kicker="By person" title="Individual staff">
          <p className="m-0 -mt-2 mb-4 text-[13px] font-semibold text-[var(--sf-soft)]">
            Grant access to specific people in addition to role-wide settings.
          </p>
          {activeStaff.length === 0 ? (
            <GardenNotice tone="info">No active staff members yet.</GardenNotice>
          ) : (
            <>
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                <GardenSearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search staff…" label="Search staff" className="sm:flex-1" />
                <GardenFilterChips
                  options={[
                    { key: "all", label: "Everyone", count: activeStaff.length },
                    ...(perms.staff_member_ids.length > 0 || filter === "selected"
                      ? [{ key: "selected", label: "Picked", count: perms.staff_member_ids.length }]
                      : []),
                  ]}
                  value={filter}
                  onChange={(key) => setFilter(key as StaffFilter)}
                  ariaLabel="Filter staff"
                />
              </div>
              {filteredStaff.length === 0 ? (
                <div className="rounded-[16px] border-[1.5px] border-dashed border-[var(--sf-ink)]/15 bg-[var(--sf-paper)] px-4 py-6 text-center">
                  <p className="m-0 text-[14px] font-extrabold text-[var(--sf-ink)]">No staff match your search.</p>
                  <button
                    type="button"
                    className={`${gLinkSm} mt-1`}
                    onClick={() => {
                      setSearchQuery("");
                      setFilter("all");
                    }}
                  >
                    Show everyone
                  </button>
                </div>
              ) : (
                <ul className="m-0 -mx-2 flex list-none flex-col gap-0.5 p-0">
                  {filteredStaff.map((member) => {
                    const checked = perms.staff_member_ids.includes(member.id);
                    const name = staffDisplayName(member);
                    const viaRole = roleCovers(member);
                    return (
                      <li key={member.id}>
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={checked}
                          aria-label={`${name} can manage calendar events`}
                          disabled={saving}
                          onClick={() => toggleStaffMember(member.id, !checked)}
                          className={`flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left transition-colors hover:bg-[var(--sf-accent-wash)] disabled:cursor-not-allowed disabled:opacity-60 ${G_FOCUS} focus-visible:ring-inset ${
                            checked ? "bg-[var(--sf-accent-wash)]" : ""
                          }`}
                        >
                          <span
                            aria-hidden
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-2 ${
                              checked ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white" : "border-[var(--sf-ink)]/30 bg-white"
                            }`}
                          >
                            {checked ? <Check className="h-3 w-3" strokeWidth={3.5} /> : null}
                          </span>
                          <GardenAvatar name={name} size="sm" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[14px] font-extrabold text-[var(--sf-ink)]">{name}</span>
                            <span className="block truncate text-[12.5px] font-semibold text-[var(--sf-soft)]">
                              {member.roleTitle ?? ""}
                              {viaRole ? `${member.roleTitle ? " · " : ""}already has access through their role` : ""}
                            </span>
                          </span>
                          {member.portalRole ? <GChip tone="info">{portalRoleLabel(member.portalRole)}</GChip> : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </GCard>
      </div>

      <GardenSaveBar
        dirty={dirty}
        saving={saving}
        savedAt={savedAt}
        onSave={() => void handleSave()}
        onDiscard={() => setSettings(saved)}
        saveLabel={changeCount > 1 ? `Save ${changeCount} changes` : "Save permissions"}
        data-testid="schedule-permissions-save-bar"
      />
    </div>
  );
}

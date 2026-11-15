"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAdminAction, NOT_SAVED } from "@/components/school-admin/garden/useAdminAction";
import {
  deriveStaffRosterMetrics,
  filterStaffByRosterFilter,
  firstStaffNeedingReview,
  type StaffRosterFilter,
} from "@/lib/school-admin/admin-staff-roster-metrics";
import { formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { schoolTeacherLoginPath } from "@/lib/organization-settings/teacher-routes";
import { employmentStatusLabel, portalRoleLabel, staffDisplayName } from "@/lib/staff/staff-display";
import type { StaffEmploymentStatus, StaffMemberRecord, StaffPortalRole } from "@/lib/staff/staff-members";
import { SITE_URL } from "@/lib/site";

/*
 * Staff view-model (admin Garden). List + selection (`?staff=`), roster
 * filters, add / edit / portal access with the feedback contract.
 */

export type StaffEditDraft = {
  firstName: string;
  lastName: string;
  roleTitle: string;
  portalRole: StaffPortalRole;
  employmentStatus: StaffEmploymentStatus;
};

export type StaffAddDraft = {
  firstName: string;
  lastName: string;
  email: string;
  roleTitle: string;
  portalRole: StaffPortalRole;
};

export function draftFromMember(member: StaffMemberRecord): StaffEditDraft {
  return {
    firstName: member.firstName,
    lastName: member.lastName,
    roleTitle: member.roleTitle ?? "",
    portalRole: member.portalRole ?? "teacher",
    employmentStatus: member.employmentStatus,
  };
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  return ((await response.json().catch(() => ({}))) ?? {}) as Record<string, unknown>;
}

export function useStaffModel({
  organizationId,
  slug,
  initialStaff,
  initialSelectedStaffId,
  previewMode,
}: {
  organizationId: string;
  slug: string;
  initialStaff?: StaffMemberRecord[];
  initialSelectedStaffId?: string | null;
  previewMode: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const deepLinkStaffId = searchParams.get("staff");
  const hasInitialStaff = initialStaff !== undefined;

  const [staffMembers, setStaffMembers] = useState<StaffMemberRecord[]>(initialStaff ?? []);
  const [loading, setLoading] = useState(!hasInitialStaff);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedIdState] = useState<string | null>(
    initialSelectedStaffId ?? deepLinkStaffId ?? initialStaff?.[0]?.id ?? null,
  );
  const [filter, setFilter] = useState<StaffRosterFilter>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<StaffEditDraft | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => Date.now());
  const action = useAdminAction();
  const requestIdRef = useRef(0);

  // Demo / preview: follow new initial props (previous-props pattern).
  const [prevInitial, setPrevInitial] = useState(initialStaff);
  if (initialStaff !== prevInitial) {
    setPrevInitial(initialStaff);
    if (initialStaff) {
      setStaffMembers(initialStaff);
      setLoading(false);
      setSelectedIdState((current) =>
        initialSelectedStaffId ??
        (current && initialStaff.some((m) => m.id === current) ? current : initialStaff[0]?.id ?? null),
      );
    }
  }

  const loginUrl = `${SITE_URL}${schoolTeacherLoginPath(slug)}`;

  const loadStaff = useCallback(
    async (options?: { silent?: boolean; selectEmail?: string }) => {
      if (previewMode) return;
      const requestId = ++requestIdRef.current;
      const silent = options?.silent ?? false;
      if (silent) setRefreshing(true);
      else setLoading(true);
      try {
        const response = await fetch(`/api/school/${slug}/staff`);
        const body = await readJson(response);
        if (!response.ok) throw new Error((body.error as string) ?? "Failed to load staff.");
        if (requestId !== requestIdRef.current) return;
        const members = ((body.staffMembers as StaffMemberRecord[]) ?? []) as StaffMemberRecord[];
        setStaffMembers(members);
        setError(null);
        setLastUpdatedAt(Date.now());
        setSelectedIdState((current) => {
          if (options?.selectEmail) {
            const added = members.find((m) => m.email?.toLowerCase() === options.selectEmail);
            if (added) return added.id;
          }
          if (current && members.some((m) => m.id === current)) return current;
          return members[0]?.id ?? null;
        });
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(formatActionError(err, "Failed to load staff."));
        void reportPortalOperationalError(
          "school_admin",
          { organizationId, operation: "staff.load", error: "" },
          err,
        );
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [organizationId, previewMode, slug],
  );

  useEffect(() => {
    if (previewMode || hasInitialStaff) return;
    queueMicrotask(() => {
      void loadStaff();
    });
  }, [hasInitialStaff, loadStaff, previewMode]);

  const selectStaff = useCallback(
    (id: string) => {
      setSelectedIdState(id);
      setEditing(false);
      setDraft(null);
      if (previewMode) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set("staff", id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, previewMode, router, searchParams],
  );

  // A deep link to someone who isn't on the list falls back to the first person.
  const selectedMember =
    staffMembers.find((member) => member.id === selectedId) ?? staffMembers[0] ?? null;

  const metrics = useMemo(() => deriveStaffRosterMetrics(staffMembers), [staffMembers]);
  const filteredMembers = useMemo(() => filterStaffByRosterFilter(staffMembers, filter), [staffMembers, filter]);
  const firstNeedingReview = useMemo(() => firstStaffNeedingReview(staffMembers), [staffMembers]);

  /* ---- add ---- */
  const openAdd = useCallback(() => {
    setAddError(null);
    setAddOpen(true);
  }, []);

  const addStaff = useCallback(
    async (input: StaffAddDraft) => {
      setAddError(null);
      const email = input.email.trim().toLowerCase();
      const name = `${input.firstName.trim()} ${input.lastName.trim()}`.trim();
      const result = await action.run(
        async () => {
          try {
            const response = await fetch(`/api/school/${slug}/staff`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(input),
            });
            const body = await readJson(response);
            if (!response.ok) throw new Error((body.error as string) ?? "Failed to add staff access.");
          } catch (err) {
            setAddError(formatActionError(err, "Failed to add staff access."));
            void reportPortalOperationalError(
              "school_admin",
              { organizationId, operation: "staff.add", error: "" },
              err,
            );
            throw err;
          }
        },
        {
          key: "staff-add",
          id: "staff-add",
          retry: false,
          success: {
            title: `${name || "Staff member"} added.`,
            description: `They can sign in at ${loginUrl} with ${email}.`,
          },
          successAction: {
            label: "Copy link",
            onClick: () => void navigator.clipboard?.writeText(loginUrl).catch(() => undefined),
          },
          error: {
            title: "Couldn't add the staff member.",
            description: "Check the details in the form and try again.",
            fallback: "Failed to add staff access.",
          },
        },
      );
      if (result.ok) {
        setAddOpen(false);
        void loadStaff({ silent: true, selectEmail: email });
      }
      return result.ok;
    },
    [action, loadStaff, loginUrl, organizationId, slug],
  );

  /* ---- edit ---- */
  const startEdit = useCallback(() => {
    if (!selectedMember) return;
    setDraft(draftFromMember(selectedMember));
    setEditing(true);
  }, [selectedMember]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
    setDraft(null);
  }, []);

  const saveEdit = useCallback(async () => {
    if (!selectedMember || !draft) return;
    const member = selectedMember;
    const next = draft;
    const result = await action.run(
      async () => {
        try {
          const response = await fetch(`/api/school/${slug}/staff/${member.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(next),
          });
          const body = await readJson(response);
          if (!response.ok) throw new Error((body.error as string) ?? "Failed to update staff member.");
          setStaffMembers((current) =>
            current.map((m) =>
              m.id === member.id
                ? {
                    ...m,
                    firstName: next.firstName,
                    lastName: next.lastName,
                    roleTitle: next.roleTitle,
                    portalRole: next.portalRole,
                    employmentStatus: next.employmentStatus,
                  }
                : m,
            ),
          );
        } catch (err) {
          void reportPortalOperationalError(
            "school_admin",
            { organizationId, operation: "staff.update", error: "" },
            err,
          );
          throw err;
        }
      },
      {
        key: "staff-save",
        id: `staff-save-${member.id}`,
        flashKey: member.id,
        success: {
          title: `${staffDisplayName({ firstName: next.firstName, lastName: next.lastName })} updated.`,
          description: `${next.roleTitle || "No job title"} · ${employmentStatusLabel(next.employmentStatus)} · ${portalRoleLabel(next.portalRole)} portal.`,
        },
        error: {
          title: "Couldn't save the profile.",
          description: `${NOT_SAVED} Your edits are still in the form.`,
          fallback: "Failed to update staff member.",
        },
      },
    );
    if (result.ok) {
      setEditing(false);
      setDraft(null);
      void loadStaff({ silent: true });
    }
  }, [action, draft, loadStaff, organizationId, selectedMember, slug]);

  /* ---- portal access ---- */
  const portalAction = useCallback(
    async (kind: "deactivatePortalAccess" | "reactivatePortalAccess") => {
      if (!selectedMember) return;
      const member = selectedMember;
      const name = staffDisplayName(member);
      const result = await action.run(
        async () => {
          try {
            const response = await fetch(`/api/school/${slug}/staff/${member.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: kind }),
            });
            const body = await readJson(response);
            if (!response.ok) throw new Error((body.error as string) ?? "Failed to update portal access.");
          } catch (err) {
            void reportPortalOperationalError(
              "school_admin",
              { organizationId, operation: "staff.update_portal_access", error: "" },
              err,
            );
            throw err;
          }
        },
        {
          key: `staff-portal-${kind}`,
          id: `staff-portal-${member.id}`,
          flashKey: member.id,
          success:
            kind === "deactivatePortalAccess"
              ? { title: `${name}'s portal access deactivated.`, description: "They can no longer sign in to the teacher portal." }
              : { title: `${name}'s portal access reactivated.`, description: "They can sign in again with a one-time code sent to their email." },
          error: {
            title: "Couldn't update portal access.",
            description: NOT_SAVED,
            fallback: "Failed to update portal access.",
          },
        },
      );
      if (result.ok) {
        setConfirmDeactivate(false);
        void loadStaff({ silent: true });
      }
    },
    [action, loadStaff, organizationId, selectedMember, slug],
  );

  return {
    loading,
    refreshing,
    error,
    loadStaff,
    lastUpdatedAt,
    staffMembers,
    filteredMembers,
    metrics,
    filter,
    setFilter,
    firstNeedingReview,
    selectedMember,
    selectStaff,
    loginUrl,
    addOpen,
    openAdd,
    closeAdd: () => setAddOpen(false),
    addError,
    addStaff,
    adding: action.pendingKey === "staff-add",
    editing,
    draft,
    setDraft,
    startEdit,
    cancelEdit,
    saveEdit,
    saving: action.pendingKey === "staff-save",
    portalBusy: action.pendingKey?.startsWith("staff-portal-") ?? false,
    portalAction,
    confirmDeactivate,
    setConfirmDeactivate,
    flashId: action.lastSavedKey,
    previewMode,
  };
}

export type StaffModel = ReturnType<typeof useStaffModel>;

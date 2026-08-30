"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  LayoutDashboard,
  Loader2,
  LogIn,
  Mail,
  Users,
  type LucideIcon,
} from "lucide-react";
import { submissionContactAvatarStyle } from "@/components/admissions/ParentPortalLoginIcon";
import ParentPortalLoginBadge from "@/components/admissions/ParentPortalLoginBadge";
import StaffAssignedStudentsSection from "@/components/school-admin/staff/StaffAssignedStudentsSection";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import { SubmissionDetailStoryProvider } from "@/components/school-admin/admissions/SubmissionDetailStoryContext";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import CopyableUrlRow from "@/components/ui/CopyableUrlRow";
import { initialsFromName } from "@/lib/messages/format";
import {
  employmentStatusLabel,
  portalRoleLabel,
  staffDisplayName,
  staffPortalLoginBadgeStatus,
} from "@/lib/staff/staff-display";
import type {
  StaffEmploymentStatus,
  StaffMemberRecord,
  StaffPortalRole,
} from "@/lib/staff/staff-members";
import {
  tabPanelTransition,
  tabPanelVariants,
} from "@/lib/school-admin/admin-modal-motion";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { schoolTeacherLoginPath } from "@/lib/organization-settings/teacher-routes";
import { SITE_URL } from "@/lib/site";

type StaffDetailPaneProps = {
  member: StaffMemberRecord;
  slug: string;
  organizationId: string;
  onUpdated: () => void | Promise<void>;
};

type StaffDetailTab = "profile" | "portal" | "students" | "contact";

type DetailTab = {
  id: StaffDetailTab;
  label: string;
  icon: LucideIcon;
};

const STAFF_DETAIL_TABS: DetailTab[] = [
  { id: "profile", label: "Profile", icon: LayoutDashboard },
  { id: "portal", label: "Portal access", icon: LogIn },
  { id: "students", label: "Learners & groups", icon: Users },
  { id: "contact", label: "Contact", icon: Mail },
];

function employmentChipTone(
  status: StaffMemberRecord["employmentStatus"],
): "success" | "warning" | "info" {
  if (status === "active") return "success";
  if (status === "on_leave") return "info";
  return "warning";
}

function portalStatusChip(
  member: StaffMemberRecord,
): { tone: "success" | "warning" | "info"; label: string } {
  const status = staffPortalLoginBadgeStatus(member);
  if (!status.accountLinked) {
    return { tone: "warning", label: "No account" };
  }
  if (!status.hasEverSignedIn) {
    return { tone: "info", label: "Never signed in" };
  }
  return { tone: "success", label: "Portal active" };
}

export default function StaffDetailPane({
  member,
  slug,
  organizationId,
  onUpdated,
}: StaffDetailPaneProps) {
  const { theme, C } = useSchoolAdminStoryTheme();
  const reducedMotion = useReducedMotion();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<StaffDetailTab>("profile");
  const [visitedTabs, setVisitedTabs] = useState<Set<StaffDetailTab>>(
    () => new Set(["profile"]),
  );
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState(member.firstName);
  const [editLastName, setEditLastName] = useState(member.lastName);
  const [editRoleTitle, setEditRoleTitle] = useState(member.roleTitle ?? "");
  const [editPortalRole, setEditPortalRole] = useState<StaffPortalRole>(
    member.portalRole ?? "teacher",
  );
  const [editEmploymentStatus, setEditEmploymentStatus] =
    useState<StaffEmploymentStatus>(member.employmentStatus);
  const [saveLoading, setSaveLoading] = useState(false);

  const inputStyle: React.CSSProperties = useMemo(
    () => ({
      borderColor: C.inputBorder,
      backgroundColor: C.input,
      color: C.textPrimary,
    }),
    [C],
  );

  const loginUrl = `${SITE_URL}${schoolTeacherLoginPath(slug)}`;
  const displayName = staffDisplayName(member);
  const avatarStyle = submissionContactAvatarStyle(displayName);
  const portalChip = portalStatusChip(member);

  const resetEditForm = useCallback((nextMember: StaffMemberRecord) => {
    setEditFirstName(nextMember.firstName);
    setEditLastName(nextMember.lastName);
    setEditRoleTitle(nextMember.roleTitle ?? "");
    setEditPortalRole(nextMember.portalRole ?? "teacher");
    setEditEmploymentStatus(nextMember.employmentStatus);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      resetEditForm(member);
      setIsEditing(false);
      setActiveTab("profile");
      setVisitedTabs(new Set(["profile"]));
    });
  }, [member.id, member, resetEditForm]);

  const navigateToTab = useCallback((tabId: StaffDetailTab) => {
    setVisitedTabs((previous) => {
      if (previous.has(tabId)) return previous;
      const next = new Set(previous);
      next.add(tabId);
      return next;
    });
    setActiveTab(tabId);
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSaveEdit = async () => {
    setSaveLoading(true);
    try {
      const response = await fetch(`/api/school/${slug}/staff/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: editFirstName,
          lastName: editLastName,
          roleTitle: editRoleTitle,
          portalRole: editPortalRole,
          employmentStatus: editEmploymentStatus,
        }),
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error ?? "Failed to update staff member.");
      }

      adminToast.success("Staff member updated.");
      setIsEditing(false);
      await onUpdated();
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to update staff member."));
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePortalAction = async (
    action: "deactivatePortalAccess" | "reactivatePortalAccess",
  ) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/school/${slug}/staff/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error ?? "Failed to update portal access.");
      }

      adminToast.success(
        action === "deactivatePortalAccess"
          ? "Staff portal access deactivated."
          : "Staff portal access reactivated.",
      );
      setConfirmDeactivate(false);
      await onUpdated();
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to update portal access."));
    } finally {
      setActionLoading(false);
    }
  };

  function renderProfileTab() {
    return (
      <section>
        {isEditing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-xs font-medium" style={{ color: C.textSecondary }}>
                  First name
                </span>
                <input
                  required
                  value={editFirstName}
                  onChange={(event) => setEditFirstName(event.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  style={inputStyle}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium" style={{ color: C.textSecondary }}>
                  Last name
                </span>
                <input
                  required
                  value={editLastName}
                  onChange={(event) => setEditLastName(event.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  style={inputStyle}
                />
              </label>
            </div>
            <label className="block space-y-1">
              <span className="text-xs font-medium" style={{ color: C.textSecondary }}>
                Job title
              </span>
              <input
                required
                value={editRoleTitle}
                onChange={(event) => setEditRoleTitle(event.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm"
                style={inputStyle}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium" style={{ color: C.textSecondary }}>
                Employment status
              </span>
              <select
                value={editEmploymentStatus}
                onChange={(event) =>
                  setEditEmploymentStatus(event.target.value as StaffEmploymentStatus)
                }
                className="w-full rounded-md border px-3 py-2 text-sm"
                style={inputStyle}
              >
                <option value="active">Active</option>
                <option value="on_leave">On leave</option>
                <option value="inactive">Inactive</option>
              </select>
              <p className="text-[11px]" style={{ color: C.textTertiary }}>
                To revoke sign-in access, deactivate on the Portal access tab.
              </p>
            </label>
          </div>
        ) : (
          <dl className="grid grid-cols-1 gap-0 sm:grid-cols-2">
            <div className="border-t py-2.5" style={{ borderColor: "#E9EFEA" }}>
              <dt className="text-[10px]" style={{ color: C.textTertiary }}>
                Name
              </dt>
              <dd className="mt-0.5 text-xs font-semibold" style={{ color: C.textPrimary }}>
                {displayName}
              </dd>
            </div>
            <div className="border-t py-2.5" style={{ borderColor: "#E9EFEA" }}>
              <dt className="text-[10px]" style={{ color: C.textTertiary }}>
                Job title
              </dt>
              <dd className="mt-0.5 text-xs font-semibold" style={{ color: C.textPrimary }}>
                {member.roleTitle || "—"}
              </dd>
            </div>
            <div className="border-t py-2.5" style={{ borderColor: "#E9EFEA" }}>
              <dt className="text-[10px]" style={{ color: C.textTertiary }}>
                Employment status
              </dt>
              <dd className="mt-0.5 text-xs font-semibold" style={{ color: C.textPrimary }}>
                {employmentStatusLabel(member.employmentStatus)}
              </dd>
            </div>
            <div className="border-t py-2.5" style={{ borderColor: "#E9EFEA" }}>
              <dt className="text-[10px]" style={{ color: C.textTertiary }}>
                Portal account
              </dt>
              <dd className="mt-0.5">
                <AdminChip theme={theme} tone={portalChip.tone}>
                  {portalChip.label}
                </AdminChip>
              </dd>
            </div>
          </dl>
        )}
      </section>
    );
  }

  function renderPortalTab() {
    return (
      <section>
        <dl className="space-y-2 text-sm">
          <div>
            <dt style={{ color: C.textTertiary }}>Role</dt>
            {isEditing ? (
              <dd className="mt-1">
                <select
                  value={editPortalRole}
                  onChange={(event) =>
                    setEditPortalRole(event.target.value as StaffPortalRole)
                  }
                  className="w-full max-w-xs rounded-md border px-3 py-2 text-sm"
                  style={inputStyle}
                >
                  <option value="teacher">Teacher</option>
                  <option value="staff">Staff</option>
                </select>
              </dd>
            ) : (
              <dd style={{ color: C.textPrimary }}>
                {portalRoleLabel(member.portalRole)}
              </dd>
            )}
          </div>
          <div>
            <dt style={{ color: C.textTertiary }}>Sign-in status</dt>
            <dd className="mt-1">
              <ParentPortalLoginBadge
                status={staffPortalLoginBadgeStatus(member)}
                C={C}
              />
            </dd>
          </div>
          <div>
            <dt style={{ color: C.textTertiary }}>Sign-in URL</dt>
            <dd>
              <CopyableUrlRow url={loginUrl} C={C} />
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex flex-wrap gap-2">
          {member.membershipStatus === "disabled" ||
          member.employmentStatus === "inactive" ? (
            <AdminButton
              theme={theme}
              variant="primary"
              size="compact"
              disabled={actionLoading}
              onClick={() => void handlePortalAction("reactivatePortalAccess")}
            >
              Reactivate portal access
            </AdminButton>
          ) : (
            <AdminButton
              theme={theme}
              variant="soft"
              size="compact"
              disabled={actionLoading}
              onClick={() => setConfirmDeactivate(true)}
            >
              Deactivate portal access
            </AdminButton>
          )}
        </div>
      </section>
    );
  }

  function renderStudentsTab() {
    return (
      <StaffAssignedStudentsSection
        key={member.id}
        slug={slug}
        organizationId={organizationId}
        staffMemberId={member.id}
        staffMemberName={displayName}
        staffIsActive={member.employmentStatus === "active"}
        C={C}
        embedded
        onAssignmentsChanged={() => void onUpdated()}
      />
    );
  }

  function renderContactTab() {
    return (
      <section>
        <dl className="space-y-2 text-sm">
          <div>
            <dt style={{ color: C.textTertiary }}>Email</dt>
            <dd style={{ color: C.textPrimary }}>{member.email || "—"}</dd>
            {isEditing ? (
              <p className="mt-1 text-[11px]" style={{ color: C.textTertiary }}>
                Email cannot be changed here.
              </p>
            ) : null}
          </div>
        </dl>
      </section>
    );
  }

  function renderTabPanel(tabId: StaffDetailTab) {
    if (tabId === "profile") return renderProfileTab();
    if (tabId === "portal") return renderPortalTab();
    if (tabId === "students") return renderStudentsTab();
    if (tabId === "contact") return renderContactTab();
    return null;
  }

  return (
    <>
      <AdminCard theme={theme} padding="none" className="min-w-0 overflow-hidden">
        <header
          className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderBottom: "1px solid #E0E8E0" }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="grid h-[59px] w-[59px] shrink-0 place-items-center rounded-[20px] text-[17px] font-extrabold"
              style={avatarStyle}
              aria-hidden="true"
            >
              {initialsFromName(displayName).slice(0, 2)}
            </span>
            <div className="min-w-0">
              <AdminSectionKicker theme={theme}>Staff profile</AdminSectionKicker>
              <AdminDisplayHeading
                theme={theme}
                as="h2"
                size="section"
                className="mt-1 truncate"
              >
                {displayName}
              </AdminDisplayHeading>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px]" style={{ color: theme.muted }}>
                  {member.roleTitle || "No job title"}
                </span>
                <span className="text-[11px] opacity-50">·</span>
                <AdminChip theme={theme} tone={portalChip.tone}>
                  {portalChip.label}
                </AdminChip>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {!isEditing ? (
              <AdminButton
                theme={theme}
                variant="outline"
                size="compact"
                disabled={actionLoading || saveLoading}
                onClick={() => {
                  resetEditForm(member);
                  setIsEditing(true);
                }}
              >
                Edit profile
              </AdminButton>
            ) : (
              <>
                <AdminButton
                  theme={theme}
                  variant="soft"
                  size="compact"
                  disabled={saveLoading}
                  onClick={() => {
                    resetEditForm(member);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </AdminButton>
                <AdminButton
                  theme={theme}
                  variant="primary"
                  size="compact"
                  disabled={saveLoading}
                  onClick={() => void handleSaveEdit()}
                >
                  {saveLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  ) : null}
                  Save
                </AdminButton>
              </>
            )}
          </div>
        </header>

        <div
          className="overflow-x-auto px-5"
          style={{ borderBottom: "1px solid #E1E8E1" }}
        >
          <div
            className="-mb-px flex gap-[3px]"
            role="tablist"
            aria-label="Staff sections"
          >
            {STAFF_DETAIL_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const tabId = `staff-pane-tab-${member.id}-${tab.id}`;
              const panelId = `staff-pane-panel-${member.id}-${tab.id}`;

              return (
                <button
                  key={tab.id}
                  id={tabId}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={panelId}
                  onClick={() => navigateToTab(tab.id)}
                  className="flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-[9px] py-[11px] text-[11px] font-bold transition-colors"
                  style={{
                    borderBottomColor: isActive ? theme.primary : "transparent",
                    color: isActive ? theme.primary : "#77858A",
                  }}
                >
                  <tab.icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <SubmissionDetailStoryProvider variant="story" theme={theme}>
          <div ref={scrollContainerRef} className="px-5 py-5">
            {STAFF_DETAIL_TABS.map((tab) =>
              visitedTabs.has(tab.id) ? (
                <div
                  key={tab.id}
                  id={`staff-pane-panel-${member.id}-${tab.id}`}
                  role="tabpanel"
                  aria-labelledby={`staff-pane-tab-${member.id}-${tab.id}`}
                  hidden={activeTab !== tab.id}
                >
                  <motion.div
                    variants={tabPanelVariants(reducedMotion ?? false)}
                    initial={false}
                    animate={activeTab === tab.id ? "animate" : "initial"}
                    transition={tabPanelTransition(reducedMotion ?? false)}
                  >
                    {renderTabPanel(tab.id)}
                  </motion.div>
                </div>
              ) : null,
            )}
          </div>
        </SubmissionDetailStoryProvider>
      </AdminCard>

      <ConfirmDialog
        open={confirmDeactivate}
        title="Deactivate portal access?"
        description={`${displayName} will no longer be able to sign in to the teacher portal.`}
        confirmLabel="Deactivate"
        variant="destructive"
        loading={actionLoading}
        onClose={() => setConfirmDeactivate(false)}
        onConfirm={() => void handlePortalAction("deactivatePortalAccess")}
        C={C}
      />
    </>
  );
}

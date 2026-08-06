"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Plus, Search, X } from "lucide-react";
import ParentPortalLoginBadge, {
  type ParentPortalLoginDisplayStatus,
} from "@/components/admissions/ParentPortalLoginBadge";
import { SchoolAdminSplitPaneSkeleton } from "@/components/school-admin/skeletons";
import ConfirmDialog from "@/components/school-admin/ConfirmDialog";
import CopyableUrlRow from "@/components/ui/CopyableUrlRow";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { schoolTeacherLoginPath } from "@/lib/organization-settings/teacher-routes";
import type {
  StaffEmploymentStatus,
  StaffMemberRecord,
  StaffPortalRole,
} from "@/lib/staff/staff-members";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { SITE_URL } from "@/lib/site";

type StaffPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
};

function staffDisplayName(member: StaffMemberRecord): string {
  return (
    [member.firstName, member.lastName].filter(Boolean).join(" ") ||
    member.email ||
    "Staff member"
  );
}

function employmentStatusLabel(status: StaffMemberRecord["employmentStatus"]): string {
  switch (status) {
    case "active":
      return "Active";
    case "inactive":
      return "Inactive";
    case "on_leave":
      return "On leave";
    default:
      return status;
  }
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

type AddStaffModalProps = {
  C: ReturnType<typeof buildAdminThemeTokens>;
  open: boolean;
  slug: string;
  onClose: () => void;
  onAdded: () => void;
};

function AddStaffModal({ C, open, slug, onClose, onAdded }: AddStaffModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [portalRole, setPortalRole] = useState<StaffPortalRole>("teacher");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      setFirstName("");
      setLastName("");
      setEmail("");
      setRoleTitle("");
      setPortalRole("teacher");
      setError(null);
    });
  }, [open]);

  const inputStyle: React.CSSProperties = {
    borderColor: C.inputBorder,
    backgroundColor: C.input,
    color: C.textPrimary,
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/school/${slug}/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          roleTitle,
          portalRole,
        }),
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error ?? "Failed to add staff access.");
      }

      const loginUrl = `${SITE_URL}${schoolTeacherLoginPath(slug)}`;
      adminToast.success(
        `Staff can sign in at ${loginUrl} with ${email.trim().toLowerCase()}.`,
      );
      onAdded();
      onClose();
    } catch (err) {
      const message = formatActionError(err, "Failed to add staff access.");
      setError(message);
      adminToast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[130] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            aria-label="Close"
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-md rounded-lg border p-5 shadow-xl"
            style={{
              backgroundColor: C.surface,
              borderColor: C.border,
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold" style={{ color: C.textPrimary }}>
                  Add staff
                </h2>
                <p className="mt-1 text-xs" style={{ color: C.textSecondary }}>
                  They can sign in with a one-time code sent to their email.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1"
                style={{ color: C.textTertiary }}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error ? (
              <p
                className="mb-3 rounded-md border px-3 py-2 text-xs"
                style={{
                  borderColor: C.errorBorder,
                  backgroundColor: C.errorBg,
                  color: C.error,
                }}
              >
                {error}
              </p>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1">
                  <span className="text-xs font-medium" style={{ color: C.textSecondary }}>
                    First name
                  </span>
                  <input
                    required
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
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
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    style={inputStyle}
                  />
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-xs font-medium" style={{ color: C.textSecondary }}>
                  Email
                </span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  style={inputStyle}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-medium" style={{ color: C.textSecondary }}>
                  Job title
                </span>
                <input
                  required
                  value={roleTitle}
                  onChange={(event) => setRoleTitle(event.target.value)}
                  placeholder="Lead Teacher"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  style={inputStyle}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-medium" style={{ color: C.textSecondary }}>
                  Portal role
                </span>
                <select
                  value={portalRole}
                  onChange={(event) =>
                    setPortalRole(event.target.value as StaffPortalRole)
                  }
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  style={inputStyle}
                >
                  <option value="teacher">Teacher</option>
                  <option value="staff">Staff</option>
                </select>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md px-3 py-2 text-sm font-medium"
                  style={getAdminButtonStyle(C, "secondary")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium disabled:opacity-60"
                  style={getAdminButtonStyle(C, "primary")}
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Add staff
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default function StaffPage({ branding, slug }: StaffPageProps) {
  const C = useMemo(() => buildAdminThemeTokens(branding), [branding]);
  const [staffMembers, setStaffMembers] = useState<StaffMemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editRoleTitle, setEditRoleTitle] = useState("");
  const [editPortalRole, setEditPortalRole] = useState<StaffPortalRole>("teacher");
  const [editEmploymentStatus, setEditEmploymentStatus] =
    useState<StaffEmploymentStatus>("active");
  const [saveLoading, setSaveLoading] = useState(false);

  const inputStyle: React.CSSProperties = useMemo(
    () => ({
      borderColor: C.inputBorder,
      backgroundColor: C.input,
      color: C.textPrimary,
    }),
    [C],
  );

  const resetEditForm = useCallback((member: StaffMemberRecord) => {
    setEditFirstName(member.firstName);
    setEditLastName(member.lastName);
    setEditRoleTitle(member.roleTitle ?? "");
    setEditPortalRole(member.portalRole ?? "teacher");
    setEditEmploymentStatus(member.employmentStatus);
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setIsEditing(false);
      return;
    }
    const member = staffMembers.find((item) => item.id === selectedId);
    if (!member) return;
    queueMicrotask(() => {
      resetEditForm(member);
      setIsEditing(false);
    });
  }, [selectedId, staffMembers, resetEditForm]);

  const loadStaff = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/school/${slug}/staff`);
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error ?? "Failed to load staff.");
      }

      const members = (body.staffMembers ?? []) as StaffMemberRecord[];
      setStaffMembers(members);
      setSelectedId((current) => {
        if (current && members.some((member) => member.id === current)) {
          return current;
        }
        return members[0]?.id ?? null;
      });
    } catch (err) {
      setError(formatActionError(err, "Failed to load staff."));
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadStaff();
    });
  }, [loadStaff]);

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return staffMembers;

    return staffMembers.filter((member) => {
      const haystack = [
        member.firstName,
        member.lastName,
        member.email,
        member.roleTitle,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [search, staffMembers]);

  const selectedMember = useMemo(
    () => staffMembers.find((member) => member.id === selectedId) ?? null,
    [selectedId, staffMembers],
  );

  const handleSaveEdit = async () => {
    if (!selectedMember) return;

    setSaveLoading(true);
    try {
      const response = await fetch(`/api/school/${slug}/staff/${selectedMember.id}`, {
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
      await loadStaff();
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to update staff member."));
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePortalAction = async (
    action: "deactivatePortalAccess" | "reactivatePortalAccess",
  ) => {
    if (!selectedMember) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/school/${slug}/staff/${selectedMember.id}`, {
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
      await loadStaff();
    } catch (err) {
      adminToast.error(formatActionError(err, "Failed to update portal access."));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <SchoolAdminSplitPaneSkeleton C={C} label="Loading staff" />;
  }

  const loginUrl = `${SITE_URL}${schoolTeacherLoginPath(slug)}`;

  return (
    <>
      <div className="flex h-full min-h-0" style={{ backgroundColor: C.surface }}>
        <div
          className="flex w-72 min-w-0 flex-shrink-0 flex-col border-r"
          style={{ borderColor: C.border }}
        >
          <div
            className="space-y-2 border-b p-3"
            style={{ borderColor: C.border }}
          >
            <div
              className="flex items-center gap-2 rounded-md border px-2.5 py-1.5"
              style={{
                borderColor: C.inputBorder,
                backgroundColor: C.input,
              }}
            >
              <Search className="h-3.5 w-3.5 flex-shrink-0" style={{ color: C.textTertiary }} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search staff..."
                className="w-full border-none bg-transparent text-sm outline-none"
                style={{ color: C.textPrimary }}
              />
            </div>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium"
              style={getAdminButtonStyle(C, "secondary")}
            >
              <Plus className="h-3.5 w-3.5" />
              Add staff
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {error ? (
              <p className="p-3 text-xs" style={{ color: C.error }}>
                {error}
              </p>
            ) : filteredStaff.length === 0 ? (
              <p className="p-3 text-xs" style={{ color: C.textTertiary }}>
                {staffMembers.length === 0
                  ? "No staff yet. Add your first team member to give them portal access."
                  : "No staff match your search."}
              </p>
            ) : (
              filteredStaff.map((member) => {
                const isActive = selectedId === member.id;
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      if (member.id !== selectedId) {
                        setIsEditing(false);
                      }
                      setSelectedId(member.id);
                    }}
                    className="w-full border-b px-3 py-3 text-left transition-colors"
                    style={{
                      borderColor: C.border,
                      borderLeft: `2px solid ${isActive ? C.accent : "transparent"}`,
                      backgroundColor: isActive ? C.accentLight : "transparent",
                    }}
                  >
                    <p className="truncate text-sm font-medium" style={{ color: C.textPrimary }}>
                      {staffDisplayName(member)}
                    </p>
                    <p className="mt-0.5 truncate text-[11px]" style={{ color: C.textTertiary }}>
                      {member.roleTitle || "—"}
                    </p>
                    <div className="mt-2">
                      <ParentPortalLoginBadge
                        status={staffPortalLoginBadgeStatus(member)}
                        C={C}
                        compact
                      />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1 overflow-y-auto">
          {!selectedMember ? (
            <div className="flex h-full items-center justify-center p-8 text-center">
              <p className="text-sm" style={{ color: C.textTertiary }}>
                Select a staff member to view details.
              </p>
            </div>
          ) : (
            <div className="p-6">
              <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: C.textPrimary }}>
                    {staffDisplayName(selectedMember)}
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
                    {selectedMember.roleTitle || "No job title"} ·{" "}
                    {employmentStatusLabel(selectedMember.employmentStatus)}
                  </p>
                </div>
                {!isEditing ? (
                  <button
                    type="button"
                    disabled={actionLoading || saveLoading}
                    onClick={() => {
                      resetEditForm(selectedMember);
                      setIsEditing(true);
                    }}
                    className="rounded-md px-3 py-2 text-xs font-medium disabled:opacity-60"
                    style={getAdminButtonStyle(C, "secondary")}
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={saveLoading}
                      onClick={() => {
                        resetEditForm(selectedMember);
                        setIsEditing(false);
                      }}
                      className="rounded-md px-3 py-2 text-xs font-medium disabled:opacity-60"
                      style={getAdminButtonStyle(C, "secondary")}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={saveLoading}
                      onClick={() => void handleSaveEdit()}
                      className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium disabled:opacity-60"
                      style={getAdminButtonStyle(C, "primary")}
                    >
                      {saveLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                      Save
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <section>
                  <h3
                    className="mb-3 text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: C.textTertiary }}
                  >
                    Profile
                  </h3>
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
                            setEditEmploymentStatus(
                              event.target.value as StaffEmploymentStatus,
                            )
                          }
                          className="w-full rounded-md border px-3 py-2 text-sm"
                          style={inputStyle}
                        >
                          <option value="active">Active</option>
                          <option value="on_leave">On leave</option>
                          <option value="inactive">Inactive</option>
                        </select>
                        <p className="text-[11px]" style={{ color: C.textTertiary }}>
                          To revoke sign-in access, use Deactivate portal access below.
                        </p>
                      </label>
                    </div>
                  ) : (
                    <dl className="space-y-2 text-sm">
                      <div>
                        <dt style={{ color: C.textTertiary }}>Name</dt>
                        <dd style={{ color: C.textPrimary }}>
                          {staffDisplayName(selectedMember)}
                        </dd>
                      </div>
                      <div>
                        <dt style={{ color: C.textTertiary }}>Job title</dt>
                        <dd style={{ color: C.textPrimary }}>
                          {selectedMember.roleTitle || "—"}
                        </dd>
                      </div>
                      <div>
                        <dt style={{ color: C.textTertiary }}>Employment status</dt>
                        <dd style={{ color: C.textPrimary }}>
                          {employmentStatusLabel(selectedMember.employmentStatus)}
                        </dd>
                      </div>
                    </dl>
                  )}
                </section>

                <section>
                  <h3
                    className="mb-3 text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: C.textTertiary }}
                  >
                    Contact
                  </h3>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt style={{ color: C.textTertiary }}>Email</dt>
                      <dd style={{ color: C.textPrimary }}>
                        {selectedMember.email || "—"}
                      </dd>
                      {isEditing ? (
                        <p className="mt-1 text-[11px]" style={{ color: C.textTertiary }}>
                          Email cannot be changed here.
                        </p>
                      ) : null}
                    </div>
                  </dl>
                </section>

                <section>
                  <h3
                    className="mb-3 text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: C.textTertiary }}
                  >
                    Portal access
                  </h3>
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
                          {portalRoleLabel(selectedMember.portalRole)}
                        </dd>
                      )}
                    </div>
                    <div>
                      <dt style={{ color: C.textTertiary }}>Sign-in status</dt>
                      <dd className="mt-1">
                        <ParentPortalLoginBadge
                          status={staffPortalLoginBadgeStatus(selectedMember)}
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
                    {selectedMember.membershipStatus === "disabled" ||
                    selectedMember.employmentStatus === "inactive" ? (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => void handlePortalAction("reactivatePortalAccess")}
                        className="rounded-md px-3 py-2 text-xs font-medium disabled:opacity-60"
                        style={getAdminButtonStyle(C, "primary")}
                      >
                        Reactivate portal access
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => setConfirmDeactivate(true)}
                        className="rounded-md px-3 py-2 text-xs font-medium disabled:opacity-60"
                        style={getAdminButtonStyle(C, "secondary")}
                      >
                        Deactivate portal access
                      </button>
                    )}
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </div>

      <AddStaffModal
        C={C}
        open={addOpen}
        slug={slug}
        onClose={() => setAddOpen(false)}
        onAdded={() => void loadStaff()}
      />

      <ConfirmDialog
        open={confirmDeactivate}
        title="Deactivate portal access?"
        description={`${selectedMember ? staffDisplayName(selectedMember) : "This staff member"} will no longer be able to sign in to the teacher portal.`}
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

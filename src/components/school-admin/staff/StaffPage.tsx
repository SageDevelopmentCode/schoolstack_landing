"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { SchoolAdminSplitPaneSkeleton } from "@/components/school-admin/skeletons";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import StaffDetailPane from "@/components/school-admin/staff/StaffDetailPane";
import StaffListSidebar from "@/components/school-admin/staff/StaffListSidebar";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import type { StaffMemberRecord, StaffPortalRole } from "@/lib/staff/staff-members";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { schoolTeacherLoginPath } from "@/lib/organization-settings/teacher-routes";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { SITE_URL } from "@/lib/site";

type StaffPageProps = {
  organizationId: string;
  branding: OrganizationBranding;
  slug: string;
};

type AddStaffModalProps = {
  open: boolean;
  slug: string;
  onClose: () => void;
  onAdded: () => void;
};

function AddStaffModal({ open, slug, onClose, onAdded }: AddStaffModalProps) {
  const { theme, C } = useSchoolAdminStoryTheme();
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
    borderColor: "#DCE4DC",
    backgroundColor: theme.white,
    color: theme.ink,
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
                <AdminButton theme={theme} variant="soft" type="button" onClick={onClose}>
                  Cancel
                </AdminButton>
                <AdminButton
                  theme={theme}
                  variant="primary"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Add staff
                </AdminButton>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default function StaffPage({ branding, slug, organizationId }: StaffPageProps) {
  void branding;
  const { theme, C } = useSchoolAdminStoryTheme();
  const searchParams = useSearchParams();
  const deepLinkStaffId = searchParams.get("staff");

  const [staffMembers, setStaffMembers] = useState<StaffMemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const loadStaff = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!silent) {
      setLoading(true);
    }
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
      if (!silent) {
        setLoading(false);
      }
    }
  }, [slug]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadStaff();
    });
  }, [loadStaff]);

  useEffect(() => {
    if (!deepLinkStaffId || loading) return;
    const match = staffMembers.find((member) => member.id === deepLinkStaffId);
    if (match) {
      queueMicrotask(() => setSelectedId(match.id));
    }
  }, [deepLinkStaffId, loading, staffMembers]);

  const selectedMember =
    staffMembers.find((member) => member.id === selectedId) ?? null;

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1350px] px-[clamp(16px,3vw,36px)] py-[18px] pb-8">
          {loading ? (
            <SchoolAdminSplitPaneSkeleton C={C} label="Loading staff" />
          ) : error ? (
            <AdminCard theme={theme} padding="canvas">
              <p className="text-sm" style={{ color: C.error }}>
                {error}
              </p>
            </AdminCard>
          ) : staffMembers.length === 0 ? (
            <AdminCard theme={theme} padding="canvas">
              <p className="text-sm leading-relaxed" style={{ color: theme.muted }}>
                No staff yet. Add your first team member to give them portal access.
              </p>
              <AdminButton
                theme={theme}
                variant="primary"
                className="mt-3"
                onClick={() => setAddOpen(true)}
              >
                Add staff →
              </AdminButton>
            </AdminCard>
          ) : (
            <>
              <StaffListSidebar
                members={staffMembers}
                selectedId={selectedId ?? ""}
                onSelect={setSelectedId}
                theme={theme}
                layout="strip"
                onAddStaff={() => setAddOpen(true)}
              />

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[280px_1fr]">
                <div className="hidden lg:block">
                  <StaffListSidebar
                    members={staffMembers}
                    selectedId={selectedId ?? ""}
                    onSelect={setSelectedId}
                    theme={theme}
                    onAddStaff={() => setAddOpen(true)}
                  />
                </div>

                {selectedMember ? (
                  <StaffDetailPane
                    key={selectedMember.id}
                    member={selectedMember}
                    slug={slug}
                    organizationId={organizationId}
                    onUpdated={() => loadStaff({ silent: true })}
                  />
                ) : (
                  <AdminCard theme={theme} padding="canvas">
                    <p className="text-sm" style={{ color: theme.muted }}>
                      Select a staff member from the list to view their profile.
                    </p>
                  </AdminCard>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <AddStaffModal
        open={addOpen}
        slug={slug}
        onClose={() => setAddOpen(false)}
        onAdded={() => void loadStaff()}
      />
    </div>
  );
}

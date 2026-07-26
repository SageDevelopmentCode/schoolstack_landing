"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, UserCheck, X } from "lucide-react";
import DetailPanelSection from "./DetailPanelSection";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { ApplicationDetail } from "@/lib/admissions/parent-portal-access";
import { extractParent2FromApplication } from "@/lib/admissions/parent2-fields";
import type { FamilyGuardianRecord } from "@/lib/admissions/family-guardians";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { SITE_URL } from "@/lib/site";

type FamilyGuardiansSectionProps = {
  C: AdminThemeTokens;
  organizationId: string;
  familyId: string | null;
  schoolSlug: string;
  detail: ApplicationDetail | null;
};

type AddGuardianModalProps = {
  C: AdminThemeTokens;
  open: boolean;
  organizationId: string;
  familyId: string;
  schoolSlug: string;
  initialFirstName: string;
  initialLastName: string;
  initialEmail: string;
  onClose: () => void;
  onAdded: () => void;
};

function AddGuardianModal({
  C,
  open,
  organizationId,
  familyId,
  schoolSlug,
  initialFirstName,
  initialLastName,
  initialEmail,
  onClose,
  onAdded,
}: AddGuardianModalProps) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [email, setEmail] = useState(initialEmail);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setFirstName(initialFirstName);
    setLastName(initialLastName);
    setEmail(initialEmail);
    setError(null);
  }, [open, initialFirstName, initialLastName, initialEmail]);

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
      const response = await fetch(`/api/admissions/families/${familyId}/guardians`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          email,
          firstName,
          lastName,
        }),
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error ?? "Failed to add parent access.");
      }

      const applyUrl = `${SITE_URL}/school/${schoolSlug}/apply`;
      adminToast.success(
        `Parent can sign in at ${applyUrl} with ${email.trim().toLowerCase()}.`,
      );
      onAdded();
      onClose();
    } catch (err) {
      const message = formatActionError(err, "Failed to add parent access.");
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
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            className="relative z-10 w-full max-w-md rounded-lg p-5 shadow-xl"
            style={{
              backgroundColor: C.surface,
              border: `1px solid ${C.border}`,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                  Add parent / guardian access
                </h3>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: C.textTertiary }}>
                  Creates a confirmed account so this person can sign in with a one-time code
                  at your parent portal.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded p-1"
                style={{ color: C.textTertiary }}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium" style={{ color: C.textSecondary }}>
                    First name
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    disabled={submitting}
                    className="rounded-md border px-3 py-2 text-sm"
                    style={inputStyle}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium" style={{ color: C.textSecondary }}>
                    Last name
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    disabled={submitting}
                    className="rounded-md border px-3 py-2 text-sm"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium" style={{ color: C.textSecondary }}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={submitting}
                  className="rounded-md border px-3 py-2 text-sm"
                  style={inputStyle}
                  autoComplete="email"
                />
              </div>

              {error ? (
                <p className="text-xs" style={{ color: C.error }}>{error}</p>
              ) : null}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="rounded-md px-3 py-2 text-sm font-medium"
                  style={getAdminButtonStyle(C, "secondary")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                  style={getAdminButtonStyle(C, "primary")}
                >
                  {submitting ? "Adding…" : "Add access"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default function FamilyGuardiansSection({
  C,
  organizationId,
  familyId,
  schoolSlug,
  detail,
}: FamilyGuardiansSectionProps) {
  const [guardians, setGuardians] = useState<FamilyGuardianRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const parent2Defaults = detail
    ? extractParent2FromApplication(detail.schema, detail.responses)
    : null;

  const loadGuardians = useCallback(async () => {
    if (!familyId) {
      setGuardians([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admissions/families/${familyId}/guardians`);
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error ?? "Failed to load guardians.");
      }

      setGuardians((body.guardians as FamilyGuardianRecord[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load guardians.");
      setGuardians([]);
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadGuardians();
    });
  }, [loadGuardians]);

  if (!familyId) {
    return (
      <DetailPanelSection
        C={C}
        title="Family portal access"
        description="Link a family record to manage who can sign in to the parent portal."
      >
        <p className="text-xs" style={{ color: C.textTertiary }}>
          No family is linked to this application yet.
        </p>
      </DetailPanelSection>
    );
  }

  return (
    <>
      <DetailPanelSection
        C={C}
        title="Family portal access"
        description="Parents and guardians who can sign in to view applications, enrollment, and the parent portal."
        actions={
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium"
            style={getAdminButtonStyle(C, "secondary")}
          >
            <Plus className="h-3.5 w-3.5" />
            Add parent
          </button>
        }
      >
        {loading ? (
          <p className="text-xs" style={{ color: C.textTertiary }}>Loading…</p>
        ) : error ? (
          <p className="text-xs" style={{ color: C.error }}>{error}</p>
        ) : guardians.length === 0 ? (
          <p className="text-xs" style={{ color: C.textTertiary }}>
            No guardians on this family yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {guardians.map((guardian) => {
              const displayName =
                [guardian.firstName, guardian.lastName].filter(Boolean).join(" ") ||
                guardian.email ||
                "Guardian";

              return (
                <li
                  key={guardian.id}
                  className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                  style={{ borderColor: C.border, backgroundColor: C.elevated }}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium" style={{ color: C.textPrimary }}>
                      {displayName}
                    </p>
                    {guardian.email ? (
                      <p className="truncate text-xs" style={{ color: C.textTertiary }}>
                        {guardian.email}
                      </p>
                    ) : null}
                  </div>
                  {guardian.isLinked ? (
                    <span
                      className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                      style={{
                        backgroundColor: C.successBg,
                        color: C.success,
                      }}
                    >
                      <UserCheck className="h-3 w-3" />
                      Active
                    </span>
                  ) : (
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
                      style={{
                        backgroundColor: C.warningBg,
                        color: C.warning,
                      }}
                    >
                      Pending
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </DetailPanelSection>

      <AddGuardianModal
        C={C}
        open={addOpen}
        organizationId={organizationId}
        familyId={familyId}
        schoolSlug={schoolSlug}
        initialFirstName={parent2Defaults?.firstName ?? ""}
        initialLastName={parent2Defaults?.lastName ?? ""}
        initialEmail={parent2Defaults?.email ?? ""}
        onClose={() => setAddOpen(false)}
        onAdded={() => void loadGuardians()}
      />
    </>
  );
}

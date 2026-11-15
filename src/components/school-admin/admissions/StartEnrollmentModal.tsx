"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, FileText, X } from "lucide-react";
import { SchoolAdminModalListSkeleton } from "@/components/school-admin/skeletons";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { GDialog } from "@/components/school-parent/garden/GDialog";
import { GKicker, GSkeleton, G_FOCUS, gBtnOutlineSm, gBtnPopSm } from "@/components/school-parent/garden/ui";
import { BusyLabel, GardenNotice } from "@/components/school-admin/garden/kit";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import { adminToast, formatActionError } from "@/lib/school-admin/admin-toast";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import type { VariantResolutionMap } from "@/lib/admissions/enrollment-checklist-variants";

type PreviewVariant = {
  id: string;
  label: string;
  isDefault: boolean;
  variantKey: string;
  sectionCount: number;
};

type PreviewGroup = {
  groupId: string;
  groupLabel: string;
  variants: PreviewVariant[];
};

type PreviewSharedItem = {
  id: string;
  label: string;
  type: string;
};

type StartEnrollmentPreview = {
  applicationId: string;
  status: string;
  templateName: string;
  groups: PreviewGroup[];
  sharedItems: PreviewSharedItem[];
};

type StartEnrollmentModalProps = {
  C: AdminThemeTokens;
  organizationId: string;
  open: boolean;
  applicationId: string;
  studentLabel: string | null;
  contactEmail: string | null;
  onClose: () => void;
  onStarted: () => void;
  /** Garden dialog (Admissions) needs the school theme. */
  appearance?: "story" | "garden";
  theme?: ParentThemeTokens;
};

export default function StartEnrollmentModal({
  C,
  appearance = "story",
  theme,
  organizationId,
  open,
  applicationId,
  studentLabel,
  contactEmail,
  onClose,
  onStarted,
}: StartEnrollmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<StartEnrollmentPreview | null>(null);
  const [resolutions, setResolutions] = useState<VariantResolutionMap>({});

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    queueMicrotask(() => {
      setLoading(true);
      setError(null);
    });

    fetch(`/api/admissions/applications/${applicationId}/start-enrollment`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) {
          throw new Error(body.error ?? "Failed to load enrollment options.");
        }
        if (cancelled) return;
        setPreview(body as StartEnrollmentPreview);
        const defaults: VariantResolutionMap = {};
        for (const group of (body as StartEnrollmentPreview).groups) {
          const defaultVariant =
            group.variants.find((variant) => variant.isDefault) ?? group.variants[0];
          if (defaultVariant) {
            defaults[group.groupId] = defaultVariant.id;
          }
        }
        setResolutions(defaults);
      })
      .catch((err) => {
        void reportPortalOperationalError("school_admin", {
          organizationId,
          operation: "admissions.enrollment.load_preview",
          error: "",
        }, err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load enrollment options.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [applicationId, open, organizationId]);

  const sharedSummary = useMemo(() => {
    if (!preview?.sharedItems.length) return null;
    return preview.sharedItems.map((item) => item.label).join(", ");
  }, [preview]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/admissions/applications/${applicationId}/start-enrollment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variantResolutions: resolutions }),
        },
      );
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.error ?? "Failed to start enrollment.");
      }
      onStarted();
      onClose();
      adminToast.dismiss(`start-enrollment-${applicationId}-error`);
      adminToast.success("Enrollment started", {
        id: `start-enrollment-${applicationId}`,
        description: "The family now has an enrollment checklist to complete.",
      });
    } catch (err) {
      const message = formatActionError(err, "Failed to start enrollment.");
      void reportPortalOperationalError("school_admin", {
        organizationId,
        operation: "admissions.enrollment.start",
        error: "",
      }, err);
      setError(message);
      adminToast.error("Couldn't start enrollment", {
        id: `start-enrollment-${applicationId}-error`,
        description: `${message} Nothing was sent to the family.`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (appearance === "garden" && theme) {
    const selectedCount = preview ? preview.groups.filter((group) => resolutions[group.groupId]).length : 0;
    return (
      <GDialog
        theme={theme}
        open={open}
        onClose={onClose}
        closeDisabled={submitting}
        size="lg"
        title="Start enrollment"
        description={
          <>
            {studentLabel ?? "Student"}
            {contactEmail ? <span className="opacity-70"> · {contactEmail}</span> : null}
          </>
        }
        data-testid="start-enrollment-dialog"
        footerBordered
        footer={
          <>
            <button type="button" onClick={onClose} disabled={submitting} className={gBtnOutlineSm}>
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || submitting || !preview}
              aria-busy={submitting || undefined}
              className={gBtnPopSm}
            >
              <BusyLabel busy={submitting} busyLabel="Starting…">
                Start enrollment
              </BusyLabel>
            </button>
          </>
        }
      >
        {loading ? (
          <div className="flex flex-col gap-2" role="status" aria-label="Loading enrollment options">
            {[0, 1, 2].map((i) => (
              <GSkeleton key={i} className="h-16 !rounded-[14px]" />
            ))}
          </div>
        ) : error && !preview ? (
          <GardenNotice tone="alert" role="alert" title="Enrollment options didn't load">
            {error} Close this window and try again.
          </GardenNotice>
        ) : preview ? (
          <div className="flex flex-col gap-5">
            <GardenNotice tone="info" title={preview.templateName}>
              Choose the agreement for each part, then start. The family gets this checklist in their portal.
            </GardenNotice>
            {preview.groups.map((group, groupIndex) => (
              <fieldset key={group.groupId} className="m-0 border-0 p-0">
                <legend className="mb-2 p-0">
                  <GKicker>
                    {groupIndex + 1}. {group.groupLabel}
                  </GKicker>
                </legend>
                <div className="flex flex-col gap-2" role="radiogroup" aria-label={group.groupLabel}>
                  {group.variants.map((variant) => {
                    const selected = resolutions[group.groupId] === variant.id;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() =>
                          setResolutions((prev) => ({ ...prev, [group.groupId]: variant.id }))
                        }
                        className={`flex w-full items-center gap-3 rounded-[16px] border-[1.5px] p-3 text-left transition-all ${
                          selected
                            ? "border-[var(--sf-clay)] bg-[var(--sf-accent-wash)] shadow-[0_2px_0_0_var(--sf-ink)]"
                            : "border-[var(--sf-ink)]/12 bg-white hover:border-[var(--sf-ink)]/30"
                        } ${G_FOCUS}`}
                      >
                        <span
                          aria-hidden
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border-[1.5px] border-[var(--sf-ink)]/12 ${
                            selected ? "bg-white" : "bg-[var(--sf-sky)]"
                          }`}
                        >
                          <FileText className="h-4 w-4 text-[var(--sf-ink)]/75" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14px] font-extrabold text-[var(--sf-ink)]">{variant.label}</span>
                          <span className="block text-[12.5px] font-semibold text-[var(--sf-soft)]">
                            {variant.sectionCount > 0
                              ? `${variant.sectionCount} section${variant.sectionCount === 1 ? "" : "s"}`
                              : "Agreement"}
                            {variant.isDefault ? " · default" : ""}
                          </span>
                          {selected && variant.variantKey === "conditional_support" ? (
                            <span className="mt-1 block text-[12.5px] font-semibold leading-snug text-[var(--sf-ink)]/75">
                              Families will also complete the Standard Enrollment Agreement first.
                            </span>
                          ) : null}
                        </span>
                        <span
                          aria-hidden
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                            selected ? "border-[var(--sf-ink)] bg-[var(--sf-clay)]" : "border-[var(--sf-ink)]/20 bg-white"
                          }`}
                        >
                          {selected ? <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} /> : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
            {sharedSummary ? (
              <div className="rounded-[16px] bg-[var(--sf-paper)] px-4 py-3">
                <GKicker>Families will also complete</GKicker>
                <p className="m-0 mt-1 text-[13.5px] font-semibold leading-relaxed text-[var(--sf-ink)]/80">
                  {sharedSummary}
                </p>
              </div>
            ) : null}
            {error ? (
              <p role="alert" className="m-0 text-[13px] font-bold text-[#9a3422]">
                {error}
              </p>
            ) : null}
            <p className="sr-only" aria-live="polite">
              {selectedCount} of {preview.groups.length} choices made
            </p>
          </div>
        ) : null}
      </GDialog>
    );
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
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
            className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-lg"
            style={{
              backgroundColor: C.surface,
              border: `1px solid ${C.border}`,
              boxShadow: C.shadowMedium,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex items-start justify-between gap-3 border-b px-5 py-4"
              style={{ borderColor: C.border }}
            >
              <div>
                <h3 className="text-base font-semibold" style={{ color: C.textPrimary }}>
                  Start enrollment
                </h3>
                <p className="mt-1 text-sm" style={{ color: C.textSecondary }}>
                  {studentLabel ?? "Student"}
                  {contactEmail ? (
                    <>
                      <span className="mx-1.5 opacity-50">·</span>
                      {contactEmail}
                    </>
                  ) : null}
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

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {loading ? (
                <SchoolAdminModalListSkeleton C={C} label="Loading enrollment options" />
              ) : error ? (
                <p className="text-sm" style={{ color: C.error }}>
                  {error}
                </p>
              ) : preview ? (
                <div className="space-y-5">
                  {preview.groups.map((group) => (
                    <div key={group.groupId} className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.textTertiary }}>
                        {group.groupLabel}
                      </p>
                      <div className="space-y-2">
                        {group.variants.map((variant) => {
                          const selected = resolutions[group.groupId] === variant.id;
                          return (
                            <button
                              key={variant.id}
                              type="button"
                              onClick={() =>
                                setResolutions((prev) => ({
                                  ...prev,
                                  [group.groupId]: variant.id,
                                }))
                              }
                              className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors"
                              style={{
                                borderColor: selected ? C.accent : C.border,
                                backgroundColor: selected ? C.accentLight : C.elevated,
                              }}
                            >
                              <div
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                                style={{
                                  backgroundColor: selected ? C.surface : C.bg,
                                  border: `1px solid ${selected ? C.accent : C.border}`,
                                }}
                              >
                                <FileText
                                  className="h-4 w-4"
                                  style={{ color: selected ? C.accent : C.textTertiary }}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium" style={{ color: C.textPrimary }}>
                                  {variant.label}
                                </p>
                                <p className="mt-0.5 text-xs" style={{ color: C.textSecondary }}>
                                  {variant.sectionCount > 0
                                    ? `${variant.sectionCount} section${variant.sectionCount === 1 ? "" : "s"}`
                                    : "Agreement"}
                                  {variant.isDefault ? " · default" : ""}
                                </p>
                                {selected && variant.variantKey === "conditional_support" ? (
                                  <p className="mt-1 text-xs leading-snug" style={{ color: C.textSecondary }}>
                                    Families will also complete the Standard Enrollment Agreement first.
                                  </p>
                                ) : null}
                              </div>
                              {selected ? (
                                <div
                                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                                  style={{ backgroundColor: C.accent }}
                                >
                                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                                </div>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {sharedSummary ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.textTertiary }}>
                        Families will also complete
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: C.textSecondary }}>
                        {sharedSummary}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div
              className="flex items-center justify-end gap-2 border-t px-5 py-4"
              style={{ borderColor: C.border }}
            >
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border px-4 py-2 text-sm font-medium"
                style={getAdminButtonStyle(C, "neutral")}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || submitting || !preview}
                className="rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-50"
                style={getAdminButtonStyle(C, "primary")}
              >
                {submitting ? "Starting…" : "Start enrollment"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

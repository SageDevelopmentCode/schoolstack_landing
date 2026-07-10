"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ClipboardList, FileText, Loader2, X } from "lucide-react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { VariantResolutionMap } from "@/lib/admissions/enrollment-checklist-variants";

type PreviewVariant = {
  id: string;
  label: string;
  isDefault: boolean;
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
  open: boolean;
  applicationId: string;
  studentLabel: string | null;
  contactEmail: string | null;
  onClose: () => void;
  onStarted: () => void;
};

export default function StartEnrollmentModal({
  C,
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
    setLoading(true);
    setError(null);

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
  }, [applicationId, open]);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start enrollment.");
    } finally {
      setSubmitting(false);
    }
  };

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
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-5 w-5 animate-spin" style={{ color: C.textTertiary }} />
                </div>
              ) : error ? (
                <p className="text-sm" style={{ color: C.error }}>
                  {error}
                </p>
              ) : preview ? (
                <div className="space-y-5">
                  <div
                    className="rounded-md border px-3 py-2.5 text-sm"
                    style={{
                      borderColor: C.border,
                      backgroundColor: C.elevated,
                      color: C.textSecondary,
                    }}
                  >
                    Checklist: <strong style={{ color: C.textPrimary }}>{preview.templateName}</strong>
                  </div>

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
                              className="flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors"
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
                    <div
                      className="rounded-md border px-3 py-2.5"
                      style={{ borderColor: C.border, backgroundColor: C.bg }}
                    >
                      <div className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" style={{ color: C.textTertiary }} />
                        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.textTertiary }}>
                          Families will also complete
                        </p>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
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
                style={{
                  borderColor: C.border,
                  color: C.textSecondary,
                  backgroundColor: C.bg,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || submitting || !preview}
                className="rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: C.accent }}
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

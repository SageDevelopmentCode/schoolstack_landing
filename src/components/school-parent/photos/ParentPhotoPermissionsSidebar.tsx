"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Loader2, X } from "lucide-react";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import {
  PHOTO_MEDIA_CONSENT_OPTIONS,
  type PhotoMediaConsent,
} from "@/lib/students/photo-media-consent";
import type { PhotoMediaConsentState } from "@/lib/students/load-student-photo-media-consents";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { PhotoPermissionLearner } from "@/components/school-parent/photos/photo-permissions-ui";

type ParentPhotoPermissionsSidebarProps = {
  theme: ParentThemeTokens;
  open: boolean;
  organizationId: string;
  learners: PhotoPermissionLearner[];
  consentsByStudentId: Record<string, PhotoMediaConsentState>;
  onClose: () => void;
  onSaved: (updates: Record<string, PhotoMediaConsentState>) => void;
};

function draftsFromConsents(
  learners: PhotoPermissionLearner[],
  consentsByStudentId: Record<string, PhotoMediaConsentState>,
): Record<string, PhotoMediaConsent | null> {
  return Object.fromEntries(
    learners.map((learner) => [
      learner.studentId,
      consentsByStudentId[learner.studentId]?.consent ?? null,
    ]),
  );
}

export default function ParentPhotoPermissionsSidebar({
  theme,
  open,
  organizationId,
  learners,
  consentsByStudentId,
  onClose,
  onSaved,
}: ParentPhotoPermissionsSidebarProps) {
  const titleId = "parent-photo-permissions-sidebar-title";
  const [drafts, setDrafts] = useState<Record<string, PhotoMediaConsent | null>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        setDrafts(draftsFromConsents(learners, consentsByStudentId));
        setError(null);
      });
    }
  }, [open, learners, consentsByStudentId]);

  const allSelected = useMemo(
    () => learners.every((learner) => drafts[learner.studentId] != null),
    [drafts, learners],
  );

  const requestClose = useCallback(() => {
    if (saving) return;
    onClose();
  }, [onClose, saving]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) requestClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, requestClose, saving]);

  const setDraftForStudent = (studentId: string, consent: PhotoMediaConsent) => {
    setDrafts((prev) => ({ ...prev, [studentId]: consent }));
  };

  const handleSave = async () => {
    if (!allSelected) {
      setError("Please select a permission level for each child.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const results = await Promise.all(
        learners.map(async (learner) => {
          const consent = drafts[learner.studentId];
          if (!consent) {
            throw new Error("Missing consent selection.");
          }
          const response = await fetch(
            `/api/parent-portal/students/${encodeURIComponent(learner.studentId)}/photo-media-consent`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ organizationId, consent }),
            },
          );
          const payload = (await response.json()) as {
            consent?: PhotoMediaConsent;
            updatedAt?: string;
            error?: string;
            code?: string;
          };
          if (!response.ok) {
            const message = payload.error ?? "Could not save photo permissions.";
            void reportPortalOperationalError(
              "parent_portal",
              {
                operation: "parent_photo_media_consent_update",
                error: message,
                code: payload.code,
                organizationId,
                entityType: "student",
                entityId: learner.studentId,
              },
              new Error(message),
              response.status,
              payload.code,
            );
            throw new Error(message);
          }
          return {
            studentId: learner.studentId,
            consent: payload.consent ?? consent,
            updatedAt: payload.updatedAt ?? new Date().toISOString(),
          };
        }),
      );

      const updates: Record<string, PhotoMediaConsentState> = {};
      for (const row of results) {
        updates[row.studentId] = {
          consent: row.consent,
          updatedAt: row.updatedAt,
        };
      }
      onSaved(updates);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save photo permissions.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[110]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          data-testid="parent-photo-permissions-sidebar"
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={requestClose}
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute inset-y-0 right-0 z-[15] flex w-[min(100%,28rem)] max-w-full flex-col overflow-hidden border-l"
            style={{
              backgroundColor: theme.white,
              borderColor: theme.line,
              boxShadow: theme.shadowCard,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex items-start justify-between gap-3 border-b px-5 py-4"
              style={{ borderColor: theme.line }}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: theme.primarySoft }}
                >
                  <Camera className="h-4 w-4" style={{ color: theme.primary }} aria-hidden />
                </div>
                <h2 id={titleId} className="text-sm font-semibold" style={{ color: theme.ink }}>
                  Photo permissions
                </h2>
              </div>
              <button
                type="button"
                onClick={requestClose}
                disabled={saving}
                aria-label="Close"
                className="border-0 bg-transparent p-0 disabled:opacity-50"
              >
                <X className="h-5 w-5" style={{ color: theme.muted }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="space-y-6">
                {learners.map((learner) => (
                  <section key={learner.studentId} aria-labelledby={`consent-heading-${learner.studentId}`}>
                    <h3
                      id={`consent-heading-${learner.studentId}`}
                      className="mb-2 text-[13px] font-semibold"
                      style={{ color: theme.ink }}
                    >
                      {learner.studentName}
                    </h3>
                    <div className="space-y-2">
                      {PHOTO_MEDIA_CONSENT_OPTIONS.map((option) => {
                        const selected = drafts[learner.studentId] === option.value;
                        return (
                          <label
                            key={option.value}
                            className="flex cursor-pointer gap-2.5 rounded-lg border p-2.5 transition-colors"
                            style={{
                              borderColor: selected ? theme.primary : theme.line,
                              backgroundColor: selected ? theme.primarySoft : theme.white,
                            }}
                          >
                            <input
                              type="radio"
                              name={`photo-media-consent-${learner.studentId}`}
                              value={option.value}
                              checked={selected}
                              onChange={() => setDraftForStudent(learner.studentId, option.value)}
                              className="mt-0.5"
                              style={{ accentColor: theme.primary }}
                            />
                            <div className="min-w-0">
                              <p className="text-[12px] font-semibold" style={{ color: theme.ink }}>
                                {option.label}
                              </p>
                              <p
                                className="mt-0.5 text-[11px] leading-snug"
                                style={{ color: theme.muted }}
                              >
                                {option.description}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
              {error ? (
                <p className="mt-4 text-sm" style={{ color: theme.alert }} role="alert">
                  {error}
                </p>
              ) : null}
            </div>

            <div
              className="flex flex-col gap-2 border-t px-5 py-4 sm:flex-row sm:justify-end"
              style={{ borderColor: theme.line }}
            >
              <ParentButton
                theme={theme}
                variant="outline"
                onClick={requestClose}
                disabled={saving}
              >
                Cancel
              </ParentButton>
              <ParentButton
                theme={theme}
                onClick={() => void handleSave()}
                disabled={saving || !allSelected}
                data-testid="parent-photo-permissions-save"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden />
                    Saving…
                  </>
                ) : (
                  "Save"
                )}
              </ParentButton>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

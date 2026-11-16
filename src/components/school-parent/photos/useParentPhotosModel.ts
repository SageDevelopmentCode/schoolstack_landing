"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { childFirstName } from "@/components/school-parent/children/parent-children-utils";
import type { PhotoPermissionLearner } from "@/components/school-parent/photos/photo-permissions-ui";
import type { FamilyChildOverview } from "@/lib/admissions/parent-portal-access";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import type { PhotoMediaConsentState } from "@/lib/students/load-student-photo-media-consents";
import type { PhotoMediaConsent } from "@/lib/students/photo-media-consent";

export type PhotoPermissionChange = {
  studentId: string;
  consent: PhotoMediaConsent;
};

export type PhotoPermissionSaveResult = {
  savedIds: string[];
  failures: { studentId: string; name: string; message: string }[];
};

const HIGHLIGHT_MS = 2600;

/**
 * View-model for the parent Photos tab: learners, consent state, counts,
 * the permissions panel, and saving (one PATCH per changed child).
 */
export function useParentPhotosModel({
  organizationId,
  eligibleChildren,
  initialConsentsByStudentId,
}: {
  organizationId: string;
  eligibleChildren: FamilyChildOverview[];
  initialConsentsByStudentId: Record<string, PhotoMediaConsentState>;
}) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [consentsByStudentId, setConsentsByStudentId] = useState(
    initialConsentsByStudentId,
  );
  const [recentlyUpdatedIds, setRecentlyUpdatedIds] = useState<string[]>([]);
  const [justCompletedAll, setJustCompletedAll] = useState(false);
  const highlightTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (highlightTimer.current) window.clearTimeout(highlightTimer.current);
    },
    [],
  );

  const learners = useMemo<PhotoPermissionLearner[]>(
    () =>
      eligibleChildren
        .filter((child): child is FamilyChildOverview & { studentId: string } =>
          Boolean(child.studentId),
        )
        .map((child) => ({
          studentId: child.studentId,
          studentName: child.studentName,
          child,
        })),
    [eligibleChildren],
  );

  const unsetLearners = useMemo(
    () => learners.filter((learner) => !consentsByStudentId[learner.studentId]?.consent),
    [consentsByStudentId, learners],
  );
  const total = learners.length;
  const setCount = total - unsetLearners.length;
  const allSet = total > 0 && unsetLearners.length === 0;

  const nameFor = useCallback(
    (studentId: string) => {
      const learner = learners.find((entry) => entry.studentId === studentId);
      return learner ? childFirstName(learner.studentName) : "your child";
    },
    [learners],
  );

  const savePermissions = useCallback(
    async (changes: PhotoPermissionChange[]): Promise<PhotoPermissionSaveResult> => {
      const wasAllSet = allSet;
      const settled = await Promise.allSettled(
        changes.map(async ({ studentId, consent }) => {
          const response = await fetch(
            `/api/parent-portal/students/${encodeURIComponent(studentId)}/photo-media-consent`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ organizationId, consent }),
            },
          );
          const payload = (await response.json().catch(() => ({}))) as {
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
                entityId: studentId,
              },
              new Error(message),
              response.status,
              payload.code,
            );
            throw new Error(message);
          }
          return {
            studentId,
            consent: payload.consent ?? consent,
            updatedAt: payload.updatedAt ?? new Date().toISOString(),
          };
        }),
      );

      const updates: Record<string, PhotoMediaConsentState> = {};
      const failures: PhotoPermissionSaveResult["failures"] = [];
      settled.forEach((result, index) => {
        const studentId = changes[index].studentId;
        if (result.status === "fulfilled") {
          updates[studentId] = {
            consent: result.value.consent,
            updatedAt: result.value.updatedAt,
          };
        } else {
          failures.push({
            studentId,
            name: nameFor(studentId),
            message:
              result.reason instanceof Error
                ? result.reason.message
                : "Could not save photo permissions.",
          });
        }
      });

      const savedIds = Object.keys(updates);
      if (savedIds.length > 0) {
        const next = { ...consentsByStudentId, ...updates };
        const nowAllSet =
          learners.length > 0 &&
          learners.every((learner) => Boolean(next[learner.studentId]?.consent));
        if (!wasAllSet && nowAllSet) setJustCompletedAll(true);
        setConsentsByStudentId((prev) => ({ ...prev, ...updates }));
        setRecentlyUpdatedIds(savedIds);
        if (highlightTimer.current) window.clearTimeout(highlightTimer.current);
        highlightTimer.current = window.setTimeout(
          () => setRecentlyUpdatedIds([]),
          HIGHLIGHT_MS,
        );
      }

      return { savedIds, failures };
    },
    [allSet, consentsByStudentId, learners, nameFor, organizationId],
  );

  return {
    learners,
    consentsByStudentId,
    unsetLearners,
    total,
    setCount,
    allSet,
    panelOpen,
    openPanel: () => setPanelOpen(true),
    closePanel: () => setPanelOpen(false),
    savePermissions,
    recentlyUpdatedIds,
    justCompletedAll,
  };
}

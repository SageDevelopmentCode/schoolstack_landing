"use client";

import { useState } from "react";
import type { ClassroomSignup, ClassroomSignupResponse } from "@/lib/classroom-signups/types";
import { isRoleFull, isSlotFull, responsesExcludingFamily } from "@/lib/classroom-signups/utils";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import { parentToast } from "@/lib/school-parent/parent-toast";
import { selectionSummary } from "./signups-garden-ui";

/** Toasts from the drawer sit top-center so they never cover its sticky action footer. */
const DRAWER_TOAST_POSITION = "top-center" as const;

/**
 * A family's response to one classroom signup: the selection state plus the
 * submit (POST) and withdraw (DELETE) calls. Same rules and payloads as the
 * previous ParentClassroomSignupResponseForm; adds Garden toasts.
 * Mount it fresh per loaded signup (state seeds from `existingResponse`).
 */
export function useSignupResponseForm({
  organizationId,
  signup,
  existingResponse,
  allResponses,
  studentOptions,
  readOnly,
  onSubmitted,
  onWithdrawn,
  onRejected,
}: {
  organizationId: string;
  signup: ClassroomSignup;
  existingResponse: ClassroomSignupResponse | null;
  allResponses: ClassroomSignupResponse[];
  studentOptions: { id: string; name: string }[];
  readOnly: boolean;
  onSubmitted: (response: ClassroomSignupResponse) => void;
  onWithdrawn: () => void;
  /** A submit was rejected (e.g. a slot filled meanwhile): refresh the counts. */
  onRejected?: () => void;
}) {
  const [studentId, setStudentId] = useState(existingResponse?.studentId ?? studentOptions[0]?.id ?? "");
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>(existingResponse?.selectedSlotIds ?? []);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(existingResponse?.selectedRoleIds ?? []);
  const [note, setNote] = useState(existingResponse?.note ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const hasResponse = existingResponse != null && existingResponse.status === "confirmed";

  const responsesForCapacityCheck = responsesExcludingFamily(allResponses, existingResponse?.familyId);

  const errorToastId = `parent-signup-error-${signup.id}`;

  const toggleSlot = (slotId: string) => {
    if (readOnly) return;
    const slot = signup.config.slots?.find((s) => s.id === slotId);
    if (!slot) return;
    if (isSlotFull(slotId, slot.capacity, responsesForCapacityCheck) && !selectedSlotIds.includes(slotId)) {
      return;
    }

    setLastError(null);
    if (signup.config.allowMultipleSelections) {
      setSelectedSlotIds((current) =>
        current.includes(slotId) ? current.filter((id) => id !== slotId) : [...current, slotId],
      );
    } else {
      setSelectedSlotIds([slotId]);
    }
  };

  const toggleRole = (roleId: string) => {
    if (readOnly) return;
    const role = signup.config.roles?.find((r) => r.id === roleId);
    if (!role) return;
    if (isRoleFull(roleId, role.quantityNeeded, responsesForCapacityCheck) && !selectedRoleIds.includes(roleId)) {
      return;
    }

    setLastError(null);
    setSelectedRoleIds((current) =>
      current.includes(roleId) ? current.filter((id) => id !== roleId) : [...current, roleId],
    );
  };

  const hasChoice =
    signup.signupType === "time_slots"
      ? selectedSlotIds.length > 0
      : signup.signupType === "roles"
        ? selectedRoleIds.length > 0
        : note.trim().length > 0;

  const canSubmit = !readOnly && hasChoice;

  const summary = selectionSummary(signup, selectedSlotIds, selectedRoleIds, note);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setLastError(null);

    let response: Response | undefined;
    try {
      response = await fetch(`/api/parent-portal/classroom-signups/${signup.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          studentId,
          selectedSlotIds,
          selectedRoleIds,
          note: note.trim() || null,
        }),
      });
      const payload = (await response.json()) as {
        response?: ClassroomSignupResponse;
        error?: string;
      };

      if (!response.ok || !payload.response) {
        throw new Error(payload.error ?? "Failed to submit response.");
      }

      parentToast.dismiss(errorToastId);
      parentToast.success(hasResponse ? "Signup updated" : "You're signed up", {
        id: `parent-signup-saved-${signup.id}`,
        position: DRAWER_TOAST_POSITION,
        description: `${signup.title}${summary ? ` · ${summary}` : ""}. You can change or withdraw while it's open.`,
      });
      onSubmitted(payload.response);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit response.";
      setLastError(message);
      parentToast.error("Couldn't save your signup", {
        id: errorToastId,
        position: DRAWER_TOAST_POSITION,
        description: `${message} Your choices are still here.`,
      });
      onRejected?.();
      void reportPortalOperationalError(
        "parent_portal",
        { organizationId, operation: "classroom_signups.submit", error: "" },
        error,
        response?.status,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async (): Promise<boolean> => {
    if (readOnly) return false;
    setWithdrawing(true);
    setLastError(null);

    let response: Response | undefined;
    try {
      const withdrawStudentId = existingResponse?.studentId ?? studentId;
      response = await fetch(
        `/api/parent-portal/classroom-signups/${signup.id}?${new URLSearchParams({
          organizationId,
          studentId: withdrawStudentId,
        }).toString()}`,
        { method: "DELETE" },
      );
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to withdraw response.");
      }
      parentToast.dismiss(errorToastId);
      parentToast.success("You've withdrawn", {
        id: `parent-signup-withdrawn-${signup.id}`,
        position: DRAWER_TOAST_POSITION,
        description: `${signup.title} is back in Needs response if you change your mind.`,
      });
      setSelectedSlotIds([]);
      setSelectedRoleIds([]);
      onWithdrawn();
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to withdraw response.";
      setLastError(message);
      parentToast.error("Couldn't withdraw", {
        id: errorToastId,
        position: DRAWER_TOAST_POSITION,
        description: `${message} You're still signed up.`,
      });
      void reportPortalOperationalError(
        "parent_portal",
        { organizationId, operation: "classroom_signups.withdraw", error: "" },
        error,
        response?.status,
      );
      return false;
    } finally {
      setWithdrawing(false);
    }
  };

  return {
    studentId,
    setStudentId,
    selectedSlotIds,
    selectedRoleIds,
    note,
    setNote,
    toggleSlot,
    toggleRole,
    hasResponse,
    hasChoice,
    canSubmit,
    summary,
    submitting,
    withdrawing,
    lastError,
    clearError: () => setLastError(null),
    handleSubmit,
    handleWithdraw,
  };
}

export type SignupResponseForm = ReturnType<typeof useSignupResponseForm>;

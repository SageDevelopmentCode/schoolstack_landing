"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import RoleCard from "@/components/classroom-signups/shared/RoleCard";
import SlotCard from "@/components/classroom-signups/shared/SlotCard";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import type {
  ClassroomSignup,
  ClassroomSignupResponse,
} from "@/lib/classroom-signups/types";
import {
  getRoleFillCount,
  getSlotFillCount,
  isRoleFull,
  isSlotFull,
} from "@/lib/classroom-signups/utils";

type ParentClassroomSignupResponseFormProps = {
  organizationId: string;
  signup: ClassroomSignup;
  existingResponse: ClassroomSignupResponse | null;
  allResponses: ClassroomSignupResponse[];
  studentOptions: { id: string; name: string }[];
  readOnly?: boolean;
  onSubmitted?: (response: ClassroomSignupResponse) => void;
  onWithdrawn?: () => void;
};

export default function ParentClassroomSignupResponseForm({
  organizationId,
  signup,
  existingResponse,
  allResponses,
  studentOptions,
  readOnly = false,
  onSubmitted,
  onWithdrawn,
}: ParentClassroomSignupResponseFormProps) {
  const { theme } = useParentTheme();

  const [studentId, setStudentId] = useState(
    existingResponse?.studentId ?? studentOptions[0]?.id ?? "",
  );
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>(
    existingResponse?.selectedSlotIds ?? [],
  );
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(
    existingResponse?.selectedRoleIds ?? [],
  );
  const [note, setNote] = useState(existingResponse?.note ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const hasResponse =
    existingResponse != null && existingResponse.status === "confirmed";

  const toggleSlot = (slotId: string) => {
    if (readOnly) return;
    const slot = signup.config.slots?.find((s) => s.id === slotId);
    if (!slot) return;
    if (isSlotFull(slotId, slot.capacity, allResponses) && !selectedSlotIds.includes(slotId)) {
      return;
    }

    if (signup.config.allowMultipleSelections) {
      setSelectedSlotIds((current) =>
        current.includes(slotId)
          ? current.filter((id) => id !== slotId)
          : [...current, slotId],
      );
    } else {
      setSelectedSlotIds([slotId]);
    }
  };

  const toggleRole = (roleId: string) => {
    if (readOnly) return;
    const role = signup.config.roles?.find((r) => r.id === roleId);
    if (!role) return;
    if (isRoleFull(roleId, role.quantityNeeded, allResponses) && !selectedRoleIds.includes(roleId)) {
      return;
    }

    setSelectedRoleIds((current) =>
      current.includes(roleId)
        ? current.filter((id) => id !== roleId)
        : [...current, roleId],
    );
  };

  const canSubmit = () => {
    if (readOnly) return false;
    if (signup.signupType === "time_slots") return selectedSlotIds.length > 0;
    if (signup.signupType === "roles") return selectedRoleIds.length > 0;
    return note.trim().length > 0;
  };

  const handleSubmit = async () => {
    if (!canSubmit()) return;
    setSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch(
        `/api/parent-portal/classroom-signups/${signup.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId,
            studentId,
            selectedSlotIds,
            selectedRoleIds,
            note: note.trim() || null,
          }),
        },
      );
      const payload = (await response.json()) as {
        response?: ClassroomSignupResponse;
        error?: string;
      };

      if (!response.ok || !payload.response) {
        throw new Error(payload.error ?? "Failed to submit response.");
      }

      setFeedback({ type: "success", message: "Your signup was saved." });
      onSubmitted?.(payload.response);
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to submit response.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (readOnly) return;
    setWithdrawing(true);
    setFeedback(null);

    try {
      const response = await fetch(
        `/api/parent-portal/classroom-signups/${signup.id}?organizationId=${encodeURIComponent(organizationId)}`,
        { method: "DELETE" },
      );
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to withdraw response.");
      }
      setFeedback({ type: "success", message: "Your response was withdrawn." });
      onWithdrawn?.();
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to withdraw response.",
      });
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="space-y-4">
      {studentOptions.length > 1 ? (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#76828A]">
            Student
          </label>
          <select
            value={studentId}
            disabled={readOnly || hasResponse}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full rounded-[10px] border px-3 py-2 text-sm"
            style={{ borderColor: "#DCE4DC" }}
          >
            {studentOptions.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {signup.signupType === "time_slots" ? (
        <div className="space-y-3">
          {(signup.config.slots ?? []).map((slot) => (
            <SlotCard
              key={slot.id}
              theme={theme}
              slot={slot}
              fillCount={getSlotFillCount(slot.id, allResponses)}
              selected={selectedSlotIds.includes(slot.id)}
              disabled={readOnly}
              onSelect={() => toggleSlot(slot.id)}
            />
          ))}
        </div>
      ) : null}

      {signup.signupType === "roles" ? (
        <div className="space-y-3">
          {(signup.config.roles ?? []).map((role) => (
            <RoleCard
              key={role.id}
              theme={theme}
              role={role}
              fillCount={getRoleFillCount(role.id, allResponses)}
              selected={selectedRoleIds.includes(role.id)}
              disabled={readOnly}
              onToggle={() => toggleRole(role.id)}
            />
          ))}
        </div>
      ) : null}

      {signup.signupType === "open" ? (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#76828A]">
            {signup.config.parentPrompt ?? "How can you help?"}
          </label>
          <textarea
            rows={4}
            value={note}
            disabled={readOnly}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-[10px] border px-3 py-2 text-sm"
            style={{ borderColor: "#DCE4DC" }}
          />
        </div>
      ) : null}

      {feedback ? (
        <ParentChip
          theme={theme}
          tone={feedback.type === "success" ? "success" : "warning"}
        >
          {feedback.message}
        </ParentChip>
      ) : null}

      {!readOnly ? (
        <div className="flex flex-wrap gap-2 pt-2">
          <AdminButton
            theme={theme}
            variant="primary"
            disabled={!canSubmit() || submitting}
            onClick={() => void handleSubmit()}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : hasResponse ? (
              "Update response"
            ) : (
              "Confirm signup"
            )}
          </AdminButton>
          {hasResponse ? (
            <AdminButton
              theme={theme}
              variant="outline"
              disabled={withdrawing}
              onClick={() => void handleWithdraw()}
            >
              {withdrawing ? "Withdrawing…" : "Withdraw"}
            </AdminButton>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

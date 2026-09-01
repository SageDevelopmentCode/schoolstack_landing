"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import RoleCard from "@/components/classroom-signups/shared/RoleCard";
import SlotCard from "@/components/classroom-signups/shared/SlotCard";
import ParentChip from "@/components/school-parent/ui/ParentChip";
import {
  getMockResponsesForSignup,
} from "@/lib/classroom-signups/mock-data";
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
  signup: ClassroomSignup;
  existingResponse: ClassroomSignupResponse | null;
  studentOptions: { id: string; name: string }[];
  readOnly?: boolean;
  onSubmitted?: (response: ClassroomSignupResponse) => void;
  onWithdrawn?: () => void;
};

export default function ParentClassroomSignupResponseForm({
  signup,
  existingResponse,
  studentOptions,
  readOnly = false,
  onSubmitted,
  onWithdrawn,
}: ParentClassroomSignupResponseFormProps) {
  const { theme } = useParentTheme();
  const allResponses = getMockResponsesForSignup(signup.id);

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

    await new Promise((resolve) => setTimeout(resolve, 500));

    const response: ClassroomSignupResponse = {
      id: existingResponse?.id ?? `resp-${Date.now()}`,
      signupId: signup.id,
      familyId: "family-demo",
      familyName: "Your family",
      guardianName: "You",
      guardianEmail: "parent@example.com",
      studentId,
      studentName:
        studentOptions.find((s) => s.id === studentId)?.name ?? "Student",
      selectedSlotIds,
      selectedRoleIds,
      note: note.trim() || null,
      status: "confirmed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setFeedback({ type: "success", message: "Signup confirmed!" });
    onSubmitted?.(response);
    setSubmitting(false);
  };

  const handleWithdraw = async () => {
    if (readOnly || !hasResponse) return;
    setWithdrawing(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setFeedback({ type: "success", message: "Signup withdrawn." });
    setSelectedSlotIds([]);
    setSelectedRoleIds([]);
    setNote("");
    onWithdrawn?.();
    setWithdrawing(false);
  };

  return (
    <div className="space-y-4">
      {hasResponse ? (
        <div className="flex items-center gap-2">
          <ParentChip theme={theme} tone="success">
            Signed up
          </ParentChip>
        </div>
      ) : null}

      {studentOptions.length > 1 ? (
        <div>
          <label
            htmlFor="student-select"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#76828A]"
          >
            Student
          </label>
          <select
            id="student-select"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            disabled={readOnly || hasResponse}
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
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#76828A]">
            Choose a time slot
          </p>
          {(signup.config.slots ?? []).map((slot) => (
            <SlotCard
              key={slot.id}
              theme={theme}
              slot={slot}
              fillCount={getSlotFillCount(slot.id, allResponses)}
              selected={selectedSlotIds.includes(slot.id)}
              disabled={submitting}
              readOnly={readOnly}
              onSelect={() => toggleSlot(slot.id)}
            />
          ))}
        </div>
      ) : null}

      {signup.signupType === "roles" ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#76828A]">
            Choose how you can help
          </p>
          {(signup.config.roles ?? []).map((role) => (
            <RoleCard
              key={role.id}
              theme={theme}
              role={role}
              fillCount={getRoleFillCount(role.id, allResponses)}
              selected={selectedRoleIds.includes(role.id)}
              disabled={submitting}
              readOnly={readOnly}
              onToggle={() => toggleRole(role.id)}
            />
          ))}
        </div>
      ) : null}

      {signup.signupType === "open" ? (
        <div>
          <label
            htmlFor="open-note"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#76828A]"
          >
            {signup.config.parentPrompt ?? "How would you like to help?"}
          </label>
          <textarea
            id="open-note"
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={readOnly || hasResponse}
            className="w-full rounded-[10px] border px-3 py-2 text-sm outline-none"
            style={{ borderColor: "#DCE4DC" }}
          />
        </div>
      ) : (
        <div>
          <label
            htmlFor="response-note"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#76828A]"
          >
            Note (optional)
          </label>
          <textarea
            id="response-note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={readOnly || hasResponse}
            placeholder="Any details for the teacher"
            className="w-full rounded-[10px] border px-3 py-2 text-sm outline-none"
            style={{ borderColor: "#DCE4DC" }}
          />
        </div>
      )}

      {feedback ? (
        <p
          className="text-sm font-medium"
          style={{
            color: feedback.type === "success" ? theme.primary : "#B5594A",
          }}
        >
          {feedback.message}
        </p>
      ) : null}

      {!readOnly ? (
        <div className="flex flex-wrap gap-2 pt-2">
          {!hasResponse ? (
            <AdminButton
              theme={theme}
              variant="primary"
              onClick={handleSubmit}
              disabled={!canSubmit() || submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Confirming…
                </>
              ) : (
                "Confirm signup"
              )}
            </AdminButton>
          ) : (
            <>
              <AdminButton
                theme={theme}
                variant="primary"
                onClick={handleSubmit}
                disabled={submitting}
              >
                Update signup
              </AdminButton>
              <AdminButton
                theme={theme}
                variant="outline"
                onClick={handleWithdraw}
                disabled={withdrawing}
              >
                {withdrawing ? "Withdrawing…" : "Withdraw"}
              </AdminButton>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

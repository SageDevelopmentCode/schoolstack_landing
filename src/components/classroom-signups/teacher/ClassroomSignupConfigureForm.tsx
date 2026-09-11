"use client";

import { Plus, Trash2 } from "lucide-react";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import SignupDatePicker from "@/components/classroom-signups/shared/SignupDatePicker";
import SignupTimePicker from "@/components/classroom-signups/shared/SignupTimePicker";
import { newAdmissionsId } from "@/lib/admissions/application-form-schema";
import { emptySignupConfig } from "@/lib/classroom-signups/templates";
import type {
  ClassroomSignupDraft,
  ClassroomSignupTimeSlot,
  ClassroomSignupType,
  TeacherClassroomOption,
} from "@/lib/classroom-signups/types";
import {
  CLASSROOM_STAFF_ROLE_LABELS,
  SIGNUP_TYPE_LABELS,
} from "@/lib/classroom-signups/types";
import {
  classroomNamesForSelection,
  estimateFamilyCountForClassrooms,
} from "@/lib/classroom-signups/utils";
import {
  nextSignupEndTimeFromStart,
  parseTimeToMinutes,
} from "@/lib/school-events/calendar-time";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export type ClassroomSignupFieldMode = "full" | "safe_only";

type ClassroomSignupConfigureFormProps = {
  theme: ParentThemeTokens;
  draft: ClassroomSignupDraft;
  onDraftChange: (patch: Partial<ClassroomSignupDraft>) => void;
  classroomOptions: TeacherClassroomOption[];
  fieldMode?: ClassroomSignupFieldMode;
};

function FieldLabel({ children }: { children: string }) {
  return (
    <label className="mb-1.5 block text-xs font-medium" style={{ color: "#76828A" }}>
      {children}
    </label>
  );
}

function SlotFieldLabel({ children }: { children: string }) {
  return (
    <span className="mb-1 block text-[10px] font-medium" style={{ color: "#76828A" }}>
      {children}
    </span>
  );
}

function newSlot(): ClassroomSignupTimeSlot {
  return {
    id: `slot-${newAdmissionsId()}`,
    label: "",
    date: "",
    startTime: "09:00",
    endTime: "09:30",
    capacity: 1,
  };
}

function newRole() {
  return {
    id: `role-${newAdmissionsId()}`,
    name: "",
    description: "",
    quantityNeeded: 1,
  };
}

function shouldBumpEndTime(startTime: string, endTime: string): boolean {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  if (start === null || end === null) return true;
  return end <= start;
}

function slotWithStartTime(
  slot: ClassroomSignupTimeSlot,
  startTime: string,
): ClassroomSignupTimeSlot {
  const next: ClassroomSignupTimeSlot = { ...slot, startTime };
  if (shouldBumpEndTime(startTime, slot.endTime)) {
    next.endTime = nextSignupEndTimeFromStart(startTime);
  }
  return next;
}

export default function ClassroomSignupConfigureForm({
  theme,
  draft,
  onDraftChange,
  classroomOptions,
  fieldMode = "full",
}: ClassroomSignupConfigureFormProps) {
  const safeOnly = fieldMode === "safe_only";
  const familyCount = draft.familyCount;

  const updateDraft = (patch: Partial<ClassroomSignupDraft>) => {
    onDraftChange(patch);
  };

  const handleTypeChange = (signupType: ClassroomSignupType) => {
    updateDraft({
      signupType,
      config: emptySignupConfig(signupType),
    });
  };

  const toggleClassroomSelection = (classroomId: string) => {
    const isSelected = draft.classroomIds.includes(classroomId);
    const classroomIds = isSelected
      ? draft.classroomIds.filter((id) => id !== classroomId)
      : [...draft.classroomIds, classroomId];

    updateDraft({
      audience: "classrooms",
      classroomIds,
      classroomId: null,
      classroomName:
        classroomNamesForSelection(classroomOptions, classroomIds) || null,
      familyCount: estimateFamilyCountForClassrooms(classroomOptions, classroomIds),
    });
  };

  return (
    <div className="space-y-4">
      <ParentCard theme={theme}>
        <FieldLabel>Title</FieldLabel>
        <input
          type="text"
          value={draft.title}
          onChange={(e) => updateDraft({ title: e.target.value })}
          placeholder="e.g. Reading buddies — October"
          className="w-full rounded-[10px] border px-3 py-2 text-sm outline-none"
          style={{ borderColor: "#DCE4DC" }}
        />

        <div className="mt-4">
          <FieldLabel>Description</FieldLabel>
          <textarea
            rows={4}
            value={draft.description}
            onChange={(e) => updateDraft({ description: e.target.value })}
            placeholder="Tell parents what you need and when."
            className="mt-1.5 w-full rounded-[10px] border px-3 py-2 text-sm outline-none"
            style={{ borderColor: "#DCE4DC" }}
          />
        </div>

        <div className="mt-4">
          <FieldLabel>Response deadline (optional)</FieldLabel>
        <SignupDatePicker
          theme={theme}
          value={draft.responseDeadline ? draft.responseDeadline.slice(0, 10) : ""}
          onChange={(date) =>
            updateDraft({
              responseDeadline: date ? `${date}T23:59:59.000Z` : null,
            })
          }
          ariaLabel="Response deadline"
          placeholder="No deadline"
          className="mt-1.5 max-w-xs"
        />
        </div>
      </ParentCard>

      {safeOnly ? (
        <p className="text-xs" style={{ color: theme.muted }}>
          This signup already has parent responses. Only the title, description,
          and deadline can be changed.
        </p>
      ) : (
        <>
          <ParentCard theme={theme}>
            <p className="mb-3 text-xs font-medium" style={{ color: "#76828A" }}>
              Signup type
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(SIGNUP_TYPE_LABELS) as ClassroomSignupType[]).map(
                (type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeChange(type)}
                    className="rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
                    style={
                      draft.signupType === type
                        ? {
                            backgroundColor: theme.primarySoft,
                            borderColor: "#BCD4C1",
                            color: theme.primary,
                          }
                        : {
                            backgroundColor: theme.white,
                            borderColor: "#DCE4DC",
                            color: "#5D6D73",
                          }
                    }
                  >
                    {SIGNUP_TYPE_LABELS[type]}
                  </button>
                ),
              )}
            </div>
          </ParentCard>

          <ParentCard theme={theme}>
            <p className="mb-1 text-xs font-medium" style={{ color: "#76828A" }}>
              Who should receive this?
            </p>
            <p className="mb-3 text-sm" style={{ color: theme.muted }}>
              Select the classrooms whose families should receive this signup.
            </p>
            {classroomOptions.length === 0 ? (
              <p className="text-sm" style={{ color: theme.muted }}>
                You are not assigned to any classrooms yet.
              </p>
            ) : (
              <div className="space-y-2">
                {classroomOptions.map((classroom) => {
                  const isSelected = draft.classroomIds.includes(classroom.id);
                  return (
                    <label
                      key={classroom.id}
                      className="flex cursor-pointer items-start gap-3 rounded-[12px] border p-3"
                      style={{
                        borderColor: isSelected ? theme.primary : "#DCE4DC",
                        backgroundColor: isSelected ? "#E9F2EA" : theme.white,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleClassroomSelection(classroom.id)}
                        className="mt-1 h-4 w-4 shrink-0 accent-[#3D6B4F]"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold" style={{ color: theme.ink }}>
                            {classroom.name}
                          </p>
                          {classroom.role ? (
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                              style={{
                                backgroundColor: "#E9F2EA",
                                color: theme.primary,
                              }}
                            >
                              {CLASSROOM_STAFF_ROLE_LABELS[classroom.role]}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs" style={{ color: theme.muted }}>
                          {classroom.familyCount}{" "}
                          {classroom.familyCount === 1 ? "family" : "families"}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
            {draft.classroomIds.length > 0 ? (
              <p className="mt-3 text-sm font-medium" style={{ color: theme.ink }}>
                {familyCount} {familyCount === 1 ? "family" : "families"} will see
                this signup
              </p>
            ) : null}
          </ParentCard>

          {draft.signupType === "time_slots" ? (
            <ParentCard theme={theme}>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-medium" style={{ color: "#76828A" }}>
                  Time slots
                </p>
                <button
                  type="button"
                  onClick={() =>
                    updateDraft({
                      config: {
                        ...draft.config,
                        slots: [...(draft.config.slots ?? []), newSlot()],
                      },
                    })
                  }
                  className="inline-flex items-center gap-1 text-xs font-semibold"
                  style={{ color: theme.primary }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add slot
                </button>
              </div>
              <div className="space-y-3">
                {(draft.config.slots ?? []).map((slot, index) => (
                  <div
                    key={slot.id}
                    className="grid gap-3 overflow-visible rounded-[12px] border p-3 sm:grid-cols-2"
                    style={{ borderColor: "#E7EBE2" }}
                  >
                    <div>
                      <SlotFieldLabel>Label</SlotFieldLabel>
                      <input
                        type="text"
                        placeholder="e.g. Friday morning"
                        value={slot.label}
                        onChange={(e) => {
                          const slots = [...(draft.config.slots ?? [])];
                          slots[index] = { ...slot, label: e.target.value };
                          updateDraft({ config: { ...draft.config, slots } });
                        }}
                        className="w-full rounded-[8px] border px-2 py-1.5 text-sm"
                        style={{ borderColor: "#DCE4DC" }}
                      />
                    </div>
                    <div>
                      <SlotFieldLabel>Date</SlotFieldLabel>
                      <SignupDatePicker
                        theme={theme}
                        value={slot.date}
                        onChange={(date) => {
                          const slots = [...(draft.config.slots ?? [])];
                          slots[index] = { ...slot, date };
                          updateDraft({ config: { ...draft.config, slots } });
                        }}
                        ariaLabel={`Date for slot ${index + 1}`}
                      />
                    </div>
                    <div>
                      <SlotFieldLabel>Start</SlotFieldLabel>
                      <SignupTimePicker
                        theme={theme}
                        value={slot.startTime}
                        onChange={(startTime) => {
                          const slots = [...(draft.config.slots ?? [])];
                          slots[index] = slotWithStartTime(slot, startTime);
                          updateDraft({ config: { ...draft.config, slots } });
                        }}
                        ariaLabel={`Start time for slot ${index + 1}`}
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="min-w-0 flex-1">
                        <SlotFieldLabel>End</SlotFieldLabel>
                        <SignupTimePicker
                          theme={theme}
                          value={slot.endTime}
                          scrollToTime={nextSignupEndTimeFromStart(slot.startTime)}
                          onChange={(endTime) => {
                            const slots = [...(draft.config.slots ?? [])];
                            slots[index] = { ...slot, endTime };
                            updateDraft({ config: { ...draft.config, slots } });
                          }}
                          ariaLabel={`End time for slot ${index + 1}`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const slots = (draft.config.slots ?? []).filter(
                            (_, i) => i !== index,
                          );
                          updateDraft({ config: { ...draft.config, slots } });
                        }}
                        className="mb-0.5 rounded p-1.5 hover:bg-red-50"
                        aria-label="Remove slot"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </ParentCard>
          ) : null}

          {draft.signupType === "roles" ? (
            <ParentCard theme={theme}>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-medium" style={{ color: "#76828A" }}>
                  Roles & tasks
                </p>
                <button
                  type="button"
                  onClick={() =>
                    updateDraft({
                      config: {
                        ...draft.config,
                        roles: [...(draft.config.roles ?? []), newRole()],
                      },
                    })
                  }
                  className="inline-flex items-center gap-1 text-xs font-semibold"
                  style={{ color: theme.primary }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add role
                </button>
              </div>
              <div className="space-y-3">
                {(draft.config.roles ?? []).map((role, index) => (
                  <div
                    key={role.id}
                    className="rounded-[12px] border p-3"
                    style={{ borderColor: "#E7EBE2" }}
                  >
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Role name"
                        value={role.name}
                        onChange={(e) => {
                          const roles = [...(draft.config.roles ?? [])];
                          roles[index] = { ...role, name: e.target.value };
                          updateDraft({ config: { ...draft.config, roles } });
                        }}
                        className="flex-1 rounded-[8px] border px-2 py-1.5 text-sm"
                        style={{ borderColor: "#DCE4DC" }}
                      />
                      <input
                        type="number"
                        min={1}
                        value={role.quantityNeeded}
                        onChange={(e) => {
                          const roles = [...(draft.config.roles ?? [])];
                          roles[index] = {
                            ...role,
                            quantityNeeded: Number(e.target.value) || 1,
                          };
                          updateDraft({ config: { ...draft.config, roles } });
                        }}
                        className="w-16 rounded-[8px] border px-2 py-1.5 text-sm"
                        style={{ borderColor: "#DCE4DC" }}
                        title="Quantity needed"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const roles = (draft.config.roles ?? []).filter(
                            (_, i) => i !== index,
                          );
                          updateDraft({ config: { ...draft.config, roles } });
                        }}
                        className="rounded p-1.5 hover:bg-red-50"
                        aria-label="Remove role"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={role.description}
                      onChange={(e) => {
                        const roles = [...(draft.config.roles ?? [])];
                        roles[index] = { ...role, description: e.target.value };
                        updateDraft({ config: { ...draft.config, roles } });
                      }}
                      className="mt-2 w-full rounded-[8px] border px-2 py-1.5 text-sm"
                      style={{ borderColor: "#DCE4DC" }}
                    />
                  </div>
                ))}
              </div>
            </ParentCard>
          ) : null}

          {draft.signupType === "open" ? (
            <ParentCard theme={theme}>
              <FieldLabel>Prompt for parents</FieldLabel>
              <input
                type="text"
                value={draft.config.parentPrompt ?? ""}
                onChange={(e) =>
                  updateDraft({
                    config: { ...draft.config, parentPrompt: e.target.value },
                  })
                }
                className="mt-1.5 w-full rounded-[10px] border px-3 py-2 text-sm outline-none"
                style={{ borderColor: "#DCE4DC" }}
              />
            </ParentCard>
          ) : null}
        </>
      )}
    </div>
  );
}

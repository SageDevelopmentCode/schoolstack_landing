"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentCard from "@/components/school-parent/ui/ParentCard";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import SignupTemplatePicker from "./SignupTemplatePicker";
import ClassroomSignupNotifyModal from "./ClassroomSignupNotifyModal";
import { SignupTypeChip } from "@/components/classroom-signups/shared/SignupTypeChip";
import SignupTimePicker from "@/components/classroom-signups/shared/SignupTimePicker";
import SignupDatePicker from "@/components/classroom-signups/shared/SignupDatePicker";
import { newAdmissionsId } from "@/lib/admissions/application-form-schema";
import {
  buildSignupFromTemplate,
  emptySignupConfig,
} from "@/lib/classroom-signups/templates";
import {
  MOCK_ASSIGNED_FAMILY_COUNT,
  MOCK_TEACHER_CLASSROOMS,
} from "@/lib/classroom-signups/mock-data";
import type {
  ClassroomSignup,
  ClassroomSignupAudience,
  ClassroomSignupDraft,
  ClassroomSignupTemplateId,
  ClassroomSignupTimeSlot,
  ClassroomSignupType,
} from "@/lib/classroom-signups/types";
import { SIGNUP_TYPE_LABELS } from "@/lib/classroom-signups/types";
import {
  nextSignupEndTimeFromStart,
  parseTimeToMinutes,
} from "@/lib/school-events/calendar-time";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { formatAudienceLabel } from "@/lib/classroom-signups/utils";

type WizardStep = 1 | 2 | 3;

type ClassroomSignupCreateWizardProps = {
  teacherName: string;
  onCancel: () => void;
  onPublished: (signup: ClassroomSignup) => void;
};

function StepIndicator({ step }: { step: WizardStep }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2.5">
      {([1, 2, 3] as WizardStep[]).map((n) => (
        <div
          key={n}
          className="h-2 rounded-full transition-all"
          style={{
            width: n === step ? 24 : 8,
            backgroundColor: n <= step ? "#3D6B4F" : "#DCE4DC",
          }}
        />
      ))}
    </div>
  );
}

function WizardHeader({
  theme,
  step,
  title,
  subtitle,
  backLabel,
  onBack,
}: {
  theme: ParentThemeTokens;
  step: WizardStep;
  title: string;
  subtitle?: string;
  backLabel: string;
  onBack: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium"
        style={{ color: theme.primary }}
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </button>
      <ParentSectionKicker theme={theme}>Create signup</ParentSectionKicker>
      <ParentDisplayHeading theme={theme} className="mb-2">
        {title}
      </ParentDisplayHeading>
      {subtitle ? (
        <p className="mb-4 text-sm" style={{ color: "#76828A" }}>
          {subtitle}
        </p>
      ) : null}
      <StepIndicator step={step} />
    </>
  );
}

function newSlot() {
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

function SlotFieldLabel({ children }: { children: string }) {
  return (
    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#76828A]">
      {children}
    </span>
  );
}

export default function ClassroomSignupCreateWizard({
  teacherName,
  onCancel,
  onPublished,
}: ClassroomSignupCreateWizardProps) {
  const { theme } = useParentTheme();
  const [step, setStep] = useState<WizardStep>(1);
  const [draft, setDraft] = useState<ClassroomSignupDraft | null>(null);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [publishedSignup, setPublishedSignup] = useState<ClassroomSignup | null>(
    null,
  );

  const familyCount = useMemo(() => {
    if (!draft) return MOCK_ASSIGNED_FAMILY_COUNT;
    if (draft.audience === "assigned") return MOCK_ASSIGNED_FAMILY_COUNT;
    const classroom = MOCK_TEACHER_CLASSROOMS.find(
      (c) => c.id === draft.classroomId,
    );
    return classroom?.familyCount ?? MOCK_ASSIGNED_FAMILY_COUNT;
  }, [draft]);

  const handleTemplateSelect = (templateId: ClassroomSignupTemplateId) => {
    setDraft(
      buildSignupFromTemplate(templateId, {
        familyCount: MOCK_ASSIGNED_FAMILY_COUNT,
      }),
    );
    setStep(2);
  };

  const updateDraft = (patch: Partial<ClassroomSignupDraft>) => {
    setDraft((current) => (current ? { ...current, ...patch } : current));
  };

  const handleTypeChange = (signupType: ClassroomSignupType) => {
    updateDraft({
      signupType,
      config: emptySignupConfig(signupType),
    });
  };

  const handleAudienceChange = (audience: ClassroomSignupAudience) => {
    const classroom = MOCK_TEACHER_CLASSROOMS[0];
    updateDraft({
      audience,
      classroomId: audience === "classroom" ? classroom.id : null,
      classroomName: audience === "classroom" ? classroom.name : null,
      familyCount:
        audience === "assigned"
          ? MOCK_ASSIGNED_FAMILY_COUNT
          : classroom.familyCount,
    });
  };

  const publishSignup = (openNotify: boolean): ClassroomSignup | null => {
    if (!draft || !draft.title.trim()) return null;

    const signup: ClassroomSignup = {
      ...draft,
      id: `signup-${newAdmissionsId()}`,
      organizationId: "org-demo",
      createdByStaffMemberId: "staff-demo",
      teacherName,
      familyCount,
      status: "open",
      publishedAt: new Date().toISOString(),
      closedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPublishedSignup(signup);
    if (openNotify) {
      setNotifyOpen(true);
    } else {
      onPublished(signup);
    }
    return signup;
  };

  if (step === 1) {
    return (
      <div>
        <WizardHeader
          theme={theme}
          step={1}
          title="Choose a template"
          subtitle="Start from a common classroom request or configure your own."
          backLabel="Back to signups"
          onBack={onCancel}
        />
        <SignupTemplatePicker theme={theme} onSelect={handleTemplateSelect} />
      </div>
    );
  }

  if (!draft) return null;

  if (step === 2) {
    return (
      <div>
        <WizardHeader
          theme={theme}
          step={2}
          title="Configure your signup"
          backLabel="Back to templates"
          onBack={() => setStep(1)}
        />

        <div className="mx-auto max-w-3xl">
        <div className="space-y-5">
          <ParentCard theme={theme}>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#76828A]">
              Title
            </label>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => updateDraft({ title: e.target.value })}
              placeholder="e.g. Reading buddies — October"
              className="w-full rounded-[10px] border px-3 py-2 text-sm outline-none"
              style={{ borderColor: "#DCE4DC" }}
            />

            <label className="mb-1.5 mt-4 block text-xs font-semibold uppercase tracking-wide text-[#76828A]">
              Description
            </label>
            <textarea
              rows={4}
              value={draft.description}
              onChange={(e) => updateDraft({ description: e.target.value })}
              placeholder="Tell parents what you need and when."
              className="w-full rounded-[10px] border px-3 py-2 text-sm outline-none"
              style={{ borderColor: "#DCE4DC" }}
            />

            <label className="mb-1.5 mt-4 block text-xs font-semibold uppercase tracking-wide text-[#76828A]">
              Response deadline (optional)
            </label>
            <SignupDatePicker
              theme={theme}
              value={
                draft.responseDeadline ? draft.responseDeadline.slice(0, 10) : ""
              }
              onChange={(date) =>
                updateDraft({
                  responseDeadline: date ? `${date}T23:59:59.000Z` : null,
                })
              }
              ariaLabel="Response deadline"
              placeholder="No deadline"
              className="max-w-xs"
            />
          </ParentCard>

          <ParentCard theme={theme}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#76828A]">
              Signup type
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(SIGNUP_TYPE_LABELS) as ClassroomSignupType[]).map(
                (type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeChange(type)}
                    className="rounded-[9px] border px-3 py-2 text-xs font-medium transition-colors"
                    style={
                      draft.signupType === type
                        ? {
                            backgroundColor: "#E9F2EA",
                            borderColor: "#BCD4C1",
                            color: theme.primary,
                            fontWeight: 700,
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
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#76828A]">
              Who should receive this?
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleAudienceChange("assigned")}
                className="w-full rounded-[12px] border p-3 text-left"
                style={{
                  borderColor:
                    draft.audience === "assigned" ? theme.primary : "#DCE4DC",
                  backgroundColor:
                    draft.audience === "assigned" ? "#E9F2EA" : theme.white,
                }}
              >
                <p className="text-sm font-semibold" style={{ color: theme.ink }}>
                  Families of my assigned students
                </p>
                <p className="text-xs" style={{ color: "#76828A" }}>
                  {MOCK_ASSIGNED_FAMILY_COUNT} families
                </p>
              </button>
              <button
                type="button"
                onClick={() => handleAudienceChange("classroom")}
                className="w-full rounded-[12px] border p-3 text-left"
                style={{
                  borderColor:
                    draft.audience === "classroom" ? theme.primary : "#DCE4DC",
                  backgroundColor:
                    draft.audience === "classroom" ? "#E9F2EA" : theme.white,
                }}
              >
                <p className="text-sm font-semibold" style={{ color: theme.ink }}>
                  Entire classroom
                </p>
                {draft.audience === "classroom" ? (
                  <select
                    value={draft.classroomId ?? ""}
                    onChange={(e) => {
                      const classroom = MOCK_TEACHER_CLASSROOMS.find(
                        (c) => c.id === e.target.value,
                      );
                      updateDraft({
                        classroomId: e.target.value,
                        classroomName: classroom?.name ?? null,
                        familyCount: classroom?.familyCount ?? 0,
                      });
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 rounded-[8px] border px-2 py-1 text-xs"
                    style={{ borderColor: "#DCE4DC" }}
                  >
                    {MOCK_TEACHER_CLASSROOMS.map((classroom) => (
                      <option key={classroom.id} value={classroom.id}>
                        {classroom.name} · {classroom.familyCount} families
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs" style={{ color: "#76828A" }}>
                    All families in a selected classroom
                  </p>
                )}
              </button>
            </div>
          </ParentCard>

          {draft.signupType === "time_slots" ? (
            <ParentCard theme={theme}>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#76828A]">
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
                <p className="text-xs font-semibold uppercase tracking-wide text-[#76828A]">
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
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#76828A]">
                Prompt for parents
              </label>
              <input
                type="text"
                value={draft.config.parentPrompt ?? ""}
                onChange={(e) =>
                  updateDraft({
                    config: { ...draft.config, parentPrompt: e.target.value },
                  })
                }
                className="w-full rounded-[10px] border px-3 py-2 text-sm outline-none"
                style={{ borderColor: "#DCE4DC" }}
              />
            </ParentCard>
          ) : null}
        </div>

        <div className="mt-8 flex flex-wrap justify-between gap-2 pt-2">
          <AdminButton
            theme={theme}
            variant="outline"
            onClick={() => {
              updateDraft({ status: "draft" });
              onCancel();
            }}
          >
            Save as draft
          </AdminButton>
          <AdminButton
            theme={theme}
            variant="primary"
            onClick={() => setStep(3)}
            disabled={!draft.title.trim()}
          >
            Review & publish
          </AdminButton>
        </div>
        </div>
      </div>
    );
  }

  const previewSignup: ClassroomSignup = {
    ...draft,
    id: "preview",
    organizationId: "org-demo",
    createdByStaffMemberId: "staff-demo",
    teacherName,
    familyCount,
    status: "open",
    publishedAt: null,
    closedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div>
      <WizardHeader
        theme={theme}
        step={3}
        title="Review & publish"
        backLabel="Back to configure"
        onBack={() => setStep(2)}
      />

      <div className="mx-auto max-w-3xl">
      <ParentCard theme={theme}>
        <div className="flex flex-wrap items-center gap-2">
          <SignupTypeChip theme={theme} type={draft.signupType} />
        </div>
        <h3
          className="mt-3 font-serif text-xl font-semibold"
          style={{ color: theme.ink }}
        >
          {draft.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "#76828A" }}>
          {draft.description}
        </p>
        <p className="mt-4 text-sm font-medium" style={{ color: theme.ink }}>
          Visible to {formatAudienceLabel(previewSignup)}
        </p>
      </ParentCard>

      <div className="mt-8 flex flex-wrap justify-end gap-2 pt-2">
        <AdminButton
          theme={theme}
          variant="outline"
          onClick={() => publishSignup(false)}
        >
          Publish
        </AdminButton>
        <AdminButton
          theme={theme}
          variant="primary"
          onClick={() => publishSignup(true)}
        >
          Publish & notify
        </AdminButton>
      </div>
      </div>

      {publishedSignup ? (
        <ClassroomSignupNotifyModal
          signup={publishedSignup}
          responses={[]}
          teacherName={teacherName}
          open={notifyOpen}
          onClose={() => {
            setNotifyOpen(false);
            onPublished(publishedSignup);
          }}
          onSent={() => onPublished(publishedSignup)}
        />
      ) : null}
    </div>
  );
}

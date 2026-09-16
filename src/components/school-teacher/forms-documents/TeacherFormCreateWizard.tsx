"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Transition, Variants } from "framer-motion";
import { ArrowLeft, FileUp, PenLine } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import { useParentTheme } from "@/components/school-parent/ParentThemeContext";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import SignupDatePicker from "@/components/classroom-signups/shared/SignupDatePicker";
import TeacherFormBuilderCanvas from "./TeacherFormBuilderCanvas";
import TeacherFormBuilderOutline from "./TeacherFormBuilderOutline";
import TeacherFormSettingToggle from "./TeacherFormSettingToggle";
import ParentFormDetailModal from "@/components/school-parent/forms-documents/ParentFormDetailModal";
import TeacherFormUploadStep from "./TeacherFormUploadStep";
import type { TeacherClassroomOption } from "@/lib/classroom-signups/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import {
  FIELD_TYPE_LABELS,
  type TeacherFormCreateType,
  type TeacherFormDraft,
  type TeacherFormField,
  type TeacherFormFieldType,
  type TeacherParentForm,
} from "@/lib/school-teacher/forms-documents/types";
import { reportPortalOperationalError } from "@/lib/portal-operational-errors";
import {
  buildStaffPreviewDetailFromDraft,
  createEmptyFormDraft,
  formatUploadFileSize,
  mergeReorderedFormFields,
} from "@/lib/school-teacher/forms-documents/utils";

type WizardStep = 1 | 2;

type TeacherFormCreateWizardProps = {
  organizationId: string;
  classroomOptions: TeacherClassroomOption[];
  apiBasePath?: string;
  allowSelectAllClassrooms?: boolean;
  operationalErrorSurface?: "teacher_portal" | "school_admin";
  onCancel: () => void;
  onPublished: (
    form: TeacherParentForm,
    signatureRows: import("@/lib/school-teacher/forms-documents/types").TeacherFormSignatureRow[],
  ) => void;
  onSaveDraft: (form: TeacherParentForm) => void;
};

function wizardStepVariants(reducedMotion: boolean): Variants {
  if (reducedMotion) {
    return {
      enter: { opacity: 0 },
      center: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }

  return {
    enter: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? 20 : -20,
    }),
    center: { opacity: 1, x: 0 },
    exit: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? -20 : 20,
    }),
  };
}

function wizardStepTransition(reducedMotion: boolean): Transition {
  return reducedMotion
    ? { duration: 0.15 }
    : { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] };
}

function StepIndicator({ step }: { step: WizardStep }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2.5">
      {([1, 2] as WizardStep[]).map((n) => (
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
      <div className="mb-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium"
          style={{ color: theme.primary }}
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </button>
      </div>
      <ParentSectionKicker theme={theme}>Create form</ParentSectionKicker>
      <ParentDisplayHeading theme={theme} className="mb-2">
        {title}
      </ParentDisplayHeading>
      {subtitle ? (
        <p className="mb-4 text-sm" style={{ color: theme.muted }}>
          {subtitle}
        </p>
      ) : null}
      <StepIndicator step={step} />
    </>
  );
}

function TypeSelectionCard({
  theme,
  selected,
  icon,
  title,
  description,
  onSelect,
}: {
  theme: ParentThemeTokens;
  selected: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="cursor-pointer rounded-2xl border p-5 text-left transition-all"
      style={{
        borderColor: selected ? theme.sage : theme.line,
        backgroundColor: selected ? theme.primarySoft : theme.white,
        boxShadow: selected ? theme.shadowCard : "none",
      }}
    >
      <div
        className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl"
        style={{
          backgroundColor: selected ? theme.white : theme.primarySoft,
          color: theme.primary,
        }}
      >
        {icon}
      </div>
      <p className="text-sm font-semibold" style={{ color: theme.ink }}>{title}</p>
      <p className="mt-1 text-xs leading-relaxed" style={{ color: theme.muted }}>
        {description}
      </p>
    </button>
  );
}

function SharedConfigFields({
  theme,
  draft,
  classroomOptions,
  allowSelectAllClassrooms = false,
  onUpdate,
}: {
  theme: ParentThemeTokens;
  draft: TeacherFormDraft;
  classroomOptions: TeacherClassroomOption[];
  allowSelectAllClassrooms?: boolean;
  onUpdate: (patch: Partial<TeacherFormDraft>) => void;
}) {
  const toggleClassroom = (classroomId: string) => {
    const next = draft.classroomIds.includes(classroomId)
      ? draft.classroomIds.filter((id) => id !== classroomId)
      : [...draft.classroomIds, classroomId];
    onUpdate({ classroomIds: next });
  };

  const selectAllClassrooms = () => {
    onUpdate({ classroomIds: classroomOptions.map((classroom) => classroom.id) });
  };

  return (
    <AdminCard theme={theme} padding="canvas" className="mb-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-medium" style={{ color: theme.muted }}>
            Form title *
          </span>
          <input
            type="text"
            value={draft.title}
            onChange={(event) => onUpdate({ title: event.target.value })}
            placeholder="e.g. Trampoline liability waiver"
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
            style={{
              borderColor: theme.line,
              color: theme.ink,
              backgroundColor: theme.cream,
            }}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-medium" style={{ color: theme.muted }}>
            Description
          </span>
          <textarea
            value={draft.description}
            onChange={(event) => onUpdate({ description: event.target.value })}
            rows={2}
            placeholder="Brief description for families"
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
            style={{
              borderColor: theme.line,
              color: theme.ink,
              backgroundColor: theme.cream,
            }}
          />
        </label>
        <div className="block">
          <span className="mb-1.5 block text-xs font-medium" style={{ color: theme.muted }}>
            Due date (optional)
          </span>
          <SignupDatePicker
            theme={theme}
            value={draft.dueDate ?? ""}
            onChange={(value) => onUpdate({ dueDate: value || null })}
            ariaLabel="Due date"
            placeholder="Select due date…"
          />
        </div>
        <div className="sm:col-span-2">
          <TeacherFormSettingToggle
            theme={theme}
            label="Require parent signature"
            description="Families must sign before the form is complete."
            checked={draft.requireSignature}
            onChange={(checked) => onUpdate({ requireSignature: checked })}
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-medium" style={{ color: theme.muted }}>
            Assign to classrooms *
          </p>
          {allowSelectAllClassrooms && classroomOptions.length > 1 ? (
            <button
              type="button"
              onClick={selectAllClassrooms}
              className="cursor-pointer text-xs font-semibold"
              style={{ color: theme.primary }}
            >
              Select all classrooms
            </button>
          ) : null}
        </div>
        {classroomOptions.length === 0 ? (
          <p className="text-sm" style={{ color: theme.muted }}>
            No assigned classrooms available.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {classroomOptions.map((classroom) => {
              const selected = draft.classroomIds.includes(classroom.id);
              return (
                <button
                  key={classroom.id}
                  type="button"
                  onClick={() => toggleClassroom(classroom.id)}
                  className="cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
                  style={
                    selected
                      ? {
                          backgroundColor: theme.primarySoft,
                          color: theme.primary,
                          borderColor: "#BCD4C1",
                        }
                      : {
                          backgroundColor: theme.white,
                          color: theme.muted,
                          borderColor: theme.line,
                        }
                  }
                >
                  {classroom.name} · {classroom.familyCount} families
                </button>
              );
            })}
          </div>
        )}
      </div>
    </AdminCard>
  );
}

function createInitialDraft(classroomOptions: TeacherClassroomOption[]): TeacherFormDraft {
  const draft = createEmptyFormDraft();
  if (classroomOptions.length === 1) {
    draft.classroomIds = [classroomOptions[0].id];
  }
  return draft;
}

function addFieldToDraft(
  draft: TeacherFormDraft,
  type: TeacherFormFieldType,
): TeacherFormField[] {
  const signatureField = draft.fields.find((field) => field.type === "signature");
  const otherFields = draft.fields.filter((field) => field.type !== "signature");
  const newField: TeacherFormField = {
    id: `field-${Date.now()}`,
    type,
    label: FIELD_TYPE_LABELS[type],
    required: type !== "checkbox",
    options: type === "multiple_choice" ? ["Option 1", "Option 2"] : undefined,
  };
  return signatureField ? [...otherFields, newField, signatureField] : [...otherFields, newField];
}

export default function TeacherFormCreateWizard({
  organizationId,
  classroomOptions,
  apiBasePath = "/api/teacher-portal/forms-documents",
  allowSelectAllClassrooms = false,
  operationalErrorSurface = "teacher_portal",
  onCancel,
  onPublished,
  onSaveDraft,
}: TeacherFormCreateWizardProps) {
  const { theme } = useParentTheme();
  const reducedMotion = useReducedMotion() ?? false;
  const [step, setStep] = useState<WizardStep>(1);
  const [direction, setDirection] = useState(1);
  const [draft, setDraft] = useState<TeacherFormDraft>(() =>
    createInitialDraft(classroomOptions),
  );
  const [activeFieldId, setActiveFieldId] = useState<string | null>(
    draft.fields[0]?.id ?? null,
  );
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);

  const staffPreviewDetail = useMemo(
    () =>
      previewOpen ? buildStaffPreviewDetailFromDraft(draft, classroomOptions) : null,
    [previewOpen, draft, classroomOptions],
  );

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      if (!previewOpen) {
        setUploadPreviewUrl((current) => {
          if (current) URL.revokeObjectURL(current);
          return null;
        });
        return;
      }

      if (
        draft.formType === "upload" &&
        draft.uploadFormat === "pdf" &&
        draft.uploadFile
      ) {
        objectUrl = URL.createObjectURL(draft.uploadFile);
        setUploadPreviewUrl((current) => {
          if (current) URL.revokeObjectURL(current);
          return objectUrl;
        });
        return;
      }

      setUploadPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return null;
      });
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [previewOpen, draft.formType, draft.uploadFormat, draft.uploadFile]);

  const canProceedStep1 = true;
  const canSave =
    draft.title.trim().length > 0 &&
    draft.classroomIds.length > 0 &&
    (draft.formType === "builder" ||
      (draft.formType === "upload" && draft.uploadFile != null));

  const canPublish = canSave;

  const updateDraft = (patch: Partial<TeacherFormDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  const goToStep = (nextStep: WizardStep, nextDirection: number) => {
    setDirection(nextDirection);
    setStep(nextStep);
  };

  const handlePublish = async (status: "active" | "draft") => {
    if (publishing) return;
    setPublishing(true);
    setPublishError(null);

    try {
      let response: Response;

      if (draft.formType === "upload") {
        if (!draft.uploadFile) {
          throw new Error("Upload a document before saving.");
        }

        const formData = new FormData();
        formData.set("organizationId", organizationId);
        formData.set("title", draft.title);
        formData.set("description", draft.description);
        formData.set("formType", draft.formType);
        formData.set("classroomIds", JSON.stringify(draft.classroomIds));
        formData.set("dueDate", draft.dueDate ?? "");
        formData.set("requireSignature", String(draft.requireSignature));
        formData.set("uploadFormat", draft.uploadFormat);
        formData.set("status", status);
        formData.set("file", draft.uploadFile);

        response = await fetch(apiBasePath, {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch(apiBasePath, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId,
            title: draft.title,
            description: draft.description,
            formType: draft.formType,
            classroomIds: draft.classroomIds,
            dueDate: draft.dueDate,
            requireSignature: draft.requireSignature,
            uploadFormat: draft.uploadFormat,
            fields: draft.fields,
            status,
          }),
        });
      }

      const payload = (await response.json()) as {
        form?: TeacherParentForm;
        signatureRows?: import("@/lib/school-teacher/forms-documents/types").TeacherFormSignatureRow[];
        error?: string;
      };

      if (!response.ok || !payload.form) {
        throw new Error(payload.error ?? "Failed to save form.");
      }

      if (status === "active") {
        onPublished(payload.form, payload.signatureRows ?? []);
      } else {
        onSaveDraft(payload.form);
      }
    } catch (error) {
      void reportPortalOperationalError(
        operationalErrorSurface,
        {
          organizationId,
          operation: "forms_documents.publish",
          error: "",
        },
        error,
      );
      setPublishError(
        error instanceof Error ? error.message : "Failed to save form.",
      );
    } finally {
      setPublishing(false);
    }
  };

  const stepVariants = wizardStepVariants(reducedMotion);
  const stepTransition = wizardStepTransition(reducedMotion);

  return (
    <div>
      <WizardHeader
        theme={theme}
        step={step}
        title={step === 1 ? "Choose how to create" : "Configure your form"}
        subtitle={
          step === 1
            ? "Upload a document or build a custom form for families to sign."
            : draft.formType === "upload"
              ? "Upload your file and set who should receive it."
              : "Add questions and choose which classrooms to send it to."
        }
        backLabel={step === 1 ? "Back to forms" : "Back"}
        onBack={() => {
          if (step === 1) onCancel();
          else goToStep(1, -1);
        }}
      />

      <AnimatePresence mode="wait" custom={direction}>
        {step === 1 ? (
          <motion.div
            key="step-1"
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={stepTransition}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TypeSelectionCard
                theme={theme}
                selected={draft.formType === "upload"}
                icon={<FileUp className="h-5 w-5" />}
                title="Upload a file"
                description="PDF or Word document families will review and sign."
                onSelect={() => updateDraft({ formType: "upload" })}
              />
              <TypeSelectionCard
                theme={theme}
                selected={draft.formType === "builder"}
                icon={<PenLine className="h-5 w-5" />}
                title="Build a form"
                description="Add questions and a signature field for families to complete."
                onSelect={() => updateDraft({ formType: "builder" as TeacherFormCreateType })}
              />
            </div>
            <div className="mt-8 flex justify-stretch sm:justify-end">
              <AdminButton
                theme={theme}
                variant="primary"
                disabled={!canProceedStep1}
                onClick={() => goToStep(2, 1)}
                className="w-full sm:w-auto"
              >
                Continue
              </AdminButton>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step-2"
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={stepTransition}
          >
            <SharedConfigFields
              theme={theme}
              draft={draft}
              classroomOptions={classroomOptions}
              allowSelectAllClassrooms={allowSelectAllClassrooms}
              onUpdate={updateDraft}
            />

            {draft.formType === "upload" ? (
              <TeacherFormUploadStep
                theme={theme}
                uploadFormat={draft.uploadFormat}
                uploadFileName={draft.uploadFileName}
                uploadFileSize={draft.uploadFileSize}
                onFormatChange={(format) =>
                  updateDraft({
                    uploadFormat: format,
                    uploadFileName: null,
                    uploadFileSize: null,
                    uploadFile: null,
                  })
                }
                onFileSelect={(file) =>
                  updateDraft({
                    uploadFile: file,
                    uploadFileName: file.name,
                    uploadFileSize: formatUploadFileSize(file.size),
                  })
                }
                onFileClear={() =>
                  updateDraft({
                    uploadFileName: null,
                    uploadFileSize: null,
                    uploadFile: null,
                  })
                }
              />
            ) : (
              <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
                <AdminCard theme={theme} padding="canvas" className="min-h-0 lg:min-h-[360px]">
                  <TeacherFormBuilderOutline
                    theme={theme}
                    fields={draft.fields}
                    activeFieldId={activeFieldId}
                    onSelectField={setActiveFieldId}
                    onAddField={(type) => {
                      const nextFields = addFieldToDraft(draft, type);
                      const added = nextFields.find(
                        (field) => !draft.fields.some((existing) => existing.id === field.id),
                      );
                      updateDraft({ fields: nextFields });
                      if (added) setActiveFieldId(added.id);
                    }}
                    onRemoveField={(fieldId) => {
                      const nextFields = draft.fields.filter((field) => field.id !== fieldId);
                      updateDraft({ fields: nextFields });
                      if (activeFieldId === fieldId) {
                        setActiveFieldId(nextFields[0]?.id ?? null);
                      }
                    }}
                    onReorderFields={(reordered) =>
                      updateDraft({
                        fields: mergeReorderedFormFields(reordered, draft.fields),
                      })
                    }
                  />
                </AdminCard>
                <TeacherFormBuilderCanvas
                  theme={theme}
                  fields={draft.fields}
                  activeFieldId={activeFieldId}
                  formTitle={draft.title}
                  onUpdateField={(fieldId, updates) => {
                    updateDraft({
                      fields: draft.fields.map((field) =>
                        field.id === fieldId ? { ...field, ...updates } : field,
                      ),
                    });
                  }}
                />
              </div>
            )}

            {publishError ? (
              <p className="mt-4 text-sm" style={{ color: theme.alert }}>
                {publishError}
              </p>
            ) : null}

            <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
              <AdminButton
                theme={theme}
                variant="outline"
                onClick={onCancel}
                disabled={publishing}
                className="w-full sm:w-auto"
              >
                Cancel
              </AdminButton>
              <AdminButton
                theme={theme}
                variant="outline"
                disabled={!canSave || publishing}
                onClick={() => setPreviewOpen(true)}
                className="w-full sm:w-auto"
              >
                Preview
              </AdminButton>
              <AdminButton
                theme={theme}
                variant="soft"
                disabled={!canSave || publishing}
                onClick={() => void handlePublish("draft")}
                className="w-full sm:w-auto"
              >
                Save draft
              </AdminButton>
              <AdminButton
                theme={theme}
                variant="primary"
                disabled={!canPublish || publishing}
                onClick={() => void handlePublish("active")}
                className="w-full sm:w-auto"
              >
                {publishing ? "Saving…" : "Send to families"}
              </AdminButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ParentFormDetailModal
        theme={theme}
        open={previewOpen}
        organizationId={organizationId}
        formId={staffPreviewDetail?.form.id ?? null}
        initialItem={null}
        staffPreviewDetail={staffPreviewDetail}
        uploadPreviewUrl={uploadPreviewUrl}
        onClose={() => setPreviewOpen(false)}
        onSubmitted={() => undefined}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { X } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import SignupDatePicker from "@/components/classroom-signups/shared/SignupDatePicker";
import TeacherFormAudienceOptionTabs from "./TeacherFormAudienceOptionTabs";
import TeacherFormAudienceSummaryStrip from "./TeacherFormAudienceSummaryStrip";
import TeacherFormClassroomPickerSheet from "./TeacherFormClassroomPickerSheet";
import TeacherFormFamilyPickerSheet from "./TeacherFormFamilyPickerSheet";
import type { TeacherClassroomOption } from "@/lib/classroom-signups/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { FormFamilyOption } from "@/lib/school-teacher/forms-documents/load-form-family-options";
import type {
  TeacherFormAudienceType,
  TeacherParentForm,
} from "@/lib/school-teacher/forms-documents/types";

type TeacherFormSendModalProps = {
  theme: ParentThemeTokens;
  open: boolean;
  form: TeacherParentForm;
  organizationId: string;
  classroomOptions: TeacherClassroomOption[];
  familySearchApiPath: string;
  allowSelectAllClassrooms?: boolean;
  loading?: boolean;
  onClose: () => void;
  onSend: (payload: {
    audienceType: TeacherFormAudienceType;
    classroomIds: string[];
    familyIds: string[];
    dueDate: string | null;
  }) => void;
};

const SEND_AUDIENCE_OPTIONS: TeacherFormAudienceType[] = ["classrooms", "families"];

type AudiencePickerMode = "classrooms" | "families" | null;

export default function TeacherFormSendModal({
  theme,
  open,
  form,
  organizationId,
  classroomOptions,
  familySearchApiPath,
  allowSelectAllClassrooms = false,
  loading = false,
  onClose,
  onSend,
}: TeacherFormSendModalProps) {
  const [audienceType, setAudienceType] = useState<TeacherFormAudienceType>(
    form.audienceType === "families" ? "families" : "classrooms",
  );
  const [classroomIds, setClassroomIds] = useState<string[]>(form.classroomIds);
  const [familyIds, setFamilyIds] = useState<string[]>(form.familyIds);
  const [selectedFamilies, setSelectedFamilies] = useState<FormFamilyOption[]>(
    form.familyIds.map((id, index) => ({
      id,
      name: form.familyNames[index] ?? "Family",
      studentNames: [],
    })),
  );
  const [dueDate, setDueDate] = useState<string | null>(form.dueDate);
  const [audiencePicker, setAudiencePicker] = useState<AudiencePickerMode>(null);

  if (!open) return null;

  const hasAudience =
    audienceType === "classrooms"
      ? classroomIds.length > 0
      : familyIds.length > 0;

  const handleAudienceChange = (mode: TeacherFormAudienceType) => {
    setAudienceType(mode);
    if (mode === "classrooms") {
      setFamilyIds([]);
      setSelectedFamilies([]);
      setAudiencePicker("classrooms");
    } else if (mode === "families") {
      setClassroomIds([]);
      setAudiencePicker("families");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[120] flex items-end justify-center p-4 sm:items-center">
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          className="relative z-[1] w-full max-w-xl overflow-hidden rounded-2xl border"
          style={{
            backgroundColor: theme.white,
            borderColor: theme.line,
            boxShadow: theme.shadowCard,
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="teacher-form-send-modal-title"
        >
          <div
            className="flex items-start justify-between gap-3 border-b px-5 py-4"
            style={{ borderColor: theme.line, backgroundColor: theme.paper }}
          >
            <div>
              <p className="text-xs font-medium" style={{ color: theme.muted }}>
                Send form
              </p>
              <h2
                id="teacher-form-send-modal-title"
                className="mt-1 text-base font-semibold"
                style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
              >
                {form.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 border-0 bg-transparent p-0"
            >
              <X className="h-5 w-5" style={{ color: theme.muted }} />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
            <AdminCard theme={theme} padding="canvas">
              <p className="mb-2 text-xs font-medium" style={{ color: theme.muted }}>
                Who should receive this form?
              </p>
              <TeacherFormAudienceOptionTabs
                theme={theme}
                options={SEND_AUDIENCE_OPTIONS}
                value={audienceType}
                onChange={handleAudienceChange}
              />

              <div className="mt-3">
                <TeacherFormAudienceSummaryStrip
                  theme={theme}
                  audienceType={audienceType}
                  classroomCount={classroomIds.length}
                  familyCount={familyIds.length}
                  onEdit={() =>
                    setAudiencePicker(
                      audienceType === "classrooms" ? "classrooms" : "families",
                    )
                  }
                />
              </div>

              <div className="mt-4">
                <span className="mb-1.5 block text-xs font-medium" style={{ color: theme.muted }}>
                  Due date (optional)
                </span>
                <SignupDatePicker
                  theme={theme}
                  value={dueDate ?? ""}
                  onChange={(value) => setDueDate(value || null)}
                  ariaLabel="Due date"
                  placeholder="Select due date…"
                  className="rounded-md"
                />
              </div>
            </AdminCard>
          </div>

          <div
            className="flex flex-col gap-2 border-t px-5 py-4 sm:flex-row sm:justify-end"
            style={{ borderColor: theme.line }}
          >
            <AdminButton
              theme={theme}
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </AdminButton>
            <AdminButton
              theme={theme}
              variant="primary"
              disabled={!hasAudience || loading}
              onClick={() =>
                onSend({
                  audienceType,
                  classroomIds,
                  familyIds,
                  dueDate,
                })
              }
              className="w-full sm:w-auto"
            >
              {loading ? "Sending…" : "Send to families"}
            </AdminButton>
          </div>
        </div>
      </div>

      <TeacherFormClassroomPickerSheet
        theme={theme}
        open={audiencePicker === "classrooms"}
        classroomOptions={classroomOptions}
        selectedClassroomIds={classroomIds}
        allowSelectAllClassrooms={allowSelectAllClassrooms}
        onClose={() => setAudiencePicker(null)}
        onChange={setClassroomIds}
      />

      <TeacherFormFamilyPickerSheet
        theme={theme}
        open={audiencePicker === "families"}
        organizationId={organizationId}
        familySearchApiPath={familySearchApiPath}
        selectedFamilyIds={familyIds}
        selectedFamilies={selectedFamilies}
        onClose={() => setAudiencePicker(null)}
        onChange={(nextFamilyIds, families) => {
          setFamilyIds(nextFamilyIds);
          setSelectedFamilies(families);
        }}
      />
    </>
  );
}

"use client";

import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import TeacherFormFamilyPicker from "./TeacherFormFamilyPicker";
import TeacherFormSlideOverShell from "./TeacherFormSlideOverShell";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { FormFamilyOption } from "@/lib/school-teacher/forms-documents/load-form-family-options";

type TeacherFormFamilyPickerSheetProps = {
  theme: ParentThemeTokens;
  open: boolean;
  organizationId: string;
  familySearchApiPath: string;
  selectedFamilyIds: string[];
  selectedFamilies: FormFamilyOption[];
  onClose: () => void;
  onChange: (familyIds: string[], families: FormFamilyOption[]) => void;
};

export default function TeacherFormFamilyPickerSheet({
  theme,
  open,
  organizationId,
  familySearchApiPath,
  selectedFamilyIds,
  selectedFamilies,
  onClose,
  onChange,
}: TeacherFormFamilyPickerSheetProps) {
  return (
    <TeacherFormSlideOverShell
      theme={theme}
      open={open}
      onClose={onClose}
      title="Choose families"
      subtitle="Select one or more families to receive this form."
      footer={
        <AdminButton theme={theme} variant="primary" onClick={onClose} className="w-full sm:ml-auto sm:w-auto">
          Done
        </AdminButton>
      }
    >
      <TeacherFormFamilyPicker
        theme={theme}
        organizationId={organizationId}
        familySearchApiPath={familySearchApiPath}
        selectedFamilyIds={selectedFamilyIds}
        selectedFamilies={selectedFamilies}
        onChange={onChange}
        layout="list"
      />
    </TeacherFormSlideOverShell>
  );
}

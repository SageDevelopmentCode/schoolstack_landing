"use client";

import { Plus } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import ParentDisplayHeading from "@/components/school-parent/ui/ParentDisplayHeading";
import ParentSectionKicker from "@/components/school-parent/ui/ParentSectionKicker";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type TeacherFormsDocumentsStoryHeaderProps = {
  theme: ParentThemeTokens;
  previewMode?: boolean;
  onCreate?: () => void;
};

export default function TeacherFormsDocumentsStoryHeader({
  theme,
  previewMode = false,
  onCreate,
}: TeacherFormsDocumentsStoryHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <ParentSectionKicker
          theme={theme}
          className="normal-case tracking-normal font-semibold"
        >
          Family forms
        </ParentSectionKicker>
        <ParentDisplayHeading theme={theme}>Forms & documents</ParentDisplayHeading>
        <p className="mt-1 text-sm" style={{ color: theme.muted }}>
          Create forms for families in your classrooms to review and sign.
        </p>
      </div>
      {!previewMode && onCreate ? (
        <AdminButton
          theme={theme}
          variant="primary"
          onClick={onCreate}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Create form
        </AdminButton>
      ) : null}
    </div>
  );
}

"use client";

import { ClipboardList, FileText, Loader2 } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type EnrollmentFlowsEmptyStateProps = {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  creating: boolean;
  canCreateApplyForm: boolean;
  canCreateChecklist: boolean;
  onCreateApply: () => void;
  onCreateChecklist: () => void;
};

export default function EnrollmentFlowsEmptyState({
  C: _C,
  theme,
  creating,
  canCreateApplyForm,
  canCreateChecklist,
  onCreateApply,
  onCreateChecklist,
}: EnrollmentFlowsEmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
      <div
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-full text-3xl"
        style={{ backgroundColor: theme.primarySoft }}
      >
        🌿
      </div>
      <AdminSectionKicker theme={theme}>Enrollment flows</AdminSectionKicker>
      <AdminDisplayHeading theme={theme} as="h1" size="section" className="mt-2">
        Set up your enrollment flows
      </AdminDisplayHeading>
      <p className="mt-3 max-w-md text-sm leading-relaxed" style={{ color: theme.muted }}>
        Create an apply form for families to submit applications, and an enrollment
        checklist for accepted families to complete enrollment steps.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <AdminButton
          theme={theme}
          variant="primary"
          onClick={onCreateApply}
          disabled={creating || !canCreateApplyForm}
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          Create apply form
        </AdminButton>
        <AdminButton
          theme={theme}
          variant="soft"
          onClick={onCreateChecklist}
          disabled={creating || !canCreateChecklist}
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ClipboardList className="h-4 w-4" />
          )}
          Create enrollment checklist
        </AdminButton>
      </div>
    </div>
  );
}

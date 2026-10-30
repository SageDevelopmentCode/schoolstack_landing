"use client";

import Link from "next/link";
import { ClipboardList, FileText, Loader2 } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type EnrollmentFlowsEmptyStateProps = {
  C: AdminThemeTokens;
  theme: ParentThemeTokens;
  slug: string;
  hasPrograms: boolean;
  creating: boolean;
  canCreateApplyForm: boolean;
  canCreateChecklist: boolean;
  onCreateApply: () => void;
  onCreateChecklist: () => void;
};

export default function EnrollmentFlowsEmptyState({
  C: _C,
  theme,
  slug,
  hasPrograms,
  creating,
  canCreateApplyForm,
  canCreateChecklist,
  onCreateApply,
  onCreateChecklist,
}: EnrollmentFlowsEmptyStateProps) {
  const programsPath = schoolAdminPath(slug, "admissions", "programs");
  const showCreateActions =
    creating || canCreateApplyForm || canCreateChecklist;

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

      {!hasPrograms ? (
        <AdminCard
          theme={theme}
          padding="canvas"
          className="mx-auto mt-8 w-full max-w-md text-center"
        >
          <p className="text-sm font-semibold" style={{ color: theme.ink }}>
            Create a program first
          </p>
          <p className="mt-1.5 text-sm leading-relaxed" style={{ color: theme.muted }}>
            You need at least one program before you can create an apply form or enrollment
            checklist.
          </p>
          <div className="mt-4 flex justify-center">
            <Link href={programsPath}>
              <AdminButton theme={theme} variant="primary">
                Go to Programs
              </AdminButton>
            </Link>
          </div>
        </AdminCard>
      ) : null}

      {showCreateActions ? (
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
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
      ) : null}
    </div>
  );
}

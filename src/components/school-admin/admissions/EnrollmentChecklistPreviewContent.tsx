"use client";

import type { ReactNode } from "react";
import EnrollmentChecklistExperience from "@/components/admissions/EnrollmentChecklistExperience";
import ApplicationFormPageShell from "@/components/admissions/ApplicationFormPageShell";
import { publicEnrollmentChecklistPath } from "@/lib/admissions/enrollment-checklist-templates";
import type { EnrollmentChecklistItem } from "@/lib/admissions/enrollment-checklist-schema";
import { buildAdminThemeTokens } from "@/lib/organization-settings/theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";

type EnrollmentChecklistPreviewContentProps = {
  branding: OrganizationBranding;
  schoolName: string;
  slug: string;
  enrollmentPath: string;
  title: string;
  items: EnrollmentChecklistItem[];
  allItems?: EnrollmentChecklistItem[];
  initialItemId?: string;
  headerAction: ReactNode;
};

export function EnrollmentChecklistPreviewHeader({
  C,
  previewPath,
  headerAction,
}: {
  C: AdminThemeTokens;
  previewPath: string;
  headerAction: ReactNode;
}) {
  return (
    <div
      className="flex shrink-0 items-center justify-between border-b px-4 py-3 sm:px-6"
      style={{
        borderColor: C.border,
        backgroundColor: C.surface,
      }}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
            style={{ backgroundColor: C.accentLight, color: C.accent }}
          >
            Preview
          </span>
          <span className="truncate text-sm" style={{ color: C.textTertiary }}>
            {previewPath}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs" style={{ color: C.textSecondary }}>
          This is how families will see your enrollment checklist.
        </p>
      </div>
      {headerAction}
    </div>
  );
}

export function EnrollmentChecklistPreviewContent({
  branding,
  schoolName,
  slug,
  enrollmentPath,
  title,
  items,
  allItems,
  initialItemId,
  headerAction,
}: EnrollmentChecklistPreviewContentProps) {
  const C = buildAdminThemeTokens(branding);
  const previewPath = publicEnrollmentChecklistPath(slug, enrollmentPath);

  return (
    <>
      <EnrollmentChecklistPreviewHeader
        C={C}
        previewPath={previewPath}
        headerAction={headerAction}
      />
      <div className="min-h-0 flex-1 overflow-hidden">
        <ApplicationFormPageShell branding={branding} fillParent>
          <EnrollmentChecklistExperience
            branding={branding}
            schoolName={schoolName}
            title={title}
            items={items}
            allItems={allItems}
            mode="preview"
            initialItemId={initialItemId}
          />
        </ApplicationFormPageShell>
      </div>
    </>
  );
}

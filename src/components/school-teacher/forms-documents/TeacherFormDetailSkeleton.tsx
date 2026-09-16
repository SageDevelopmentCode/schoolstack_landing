"use client";

import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { TeacherParentForm } from "@/lib/school-teacher/forms-documents/types";
import { TEACHER_FORM_DOCUMENT_PREVIEW_HEIGHT_CLASS } from "@/lib/school-teacher/forms-documents/utils";

type TeacherFormDetailSkeletonProps = {
  theme: ParentThemeTokens;
  formType: TeacherParentForm["formType"];
};

function SkeletonBlock({
  theme,
  className,
}: {
  theme: ParentThemeTokens;
  className: string;
}) {
  return (
    <div
      className={`animate-pulse rounded-xl ${className}`}
      style={{ backgroundColor: theme.line }}
      aria-hidden
    />
  );
}

export default function TeacherFormDetailSkeleton({
  theme,
  formType,
}: TeacherFormDetailSkeletonProps) {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-label="Loading form details">
      <AdminCard theme={theme} padding="canvas">
        <SkeletonBlock theme={theme} className="h-4 w-40" />
        <SkeletonBlock theme={theme} className="mt-3 h-2 w-full" />
      </AdminCard>

      {formType === "upload" ? (
        <AdminCard theme={theme} padding="canvas">
          <div className="flex items-start gap-3">
            <SkeletonBlock theme={theme} className="h-11 w-11 shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock theme={theme} className="h-4 w-48" />
              <SkeletonBlock theme={theme} className="h-3 w-24" />
            </div>
          </div>
          <SkeletonBlock
            theme={theme}
            className={`mt-5 w-full ${TEACHER_FORM_DOCUMENT_PREVIEW_HEIGHT_CLASS}`}
          />
        </AdminCard>
      ) : (
        <AdminCard theme={theme} padding="canvas">
          <SkeletonBlock theme={theme} className="mb-4 h-4 w-24" />
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonBlock key={index} theme={theme} className="h-14 w-full" />
            ))}
          </div>
        </AdminCard>
      )}

      <div>
        <SkeletonBlock theme={theme} className="mb-3 h-4 w-32" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={index} theme={theme} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

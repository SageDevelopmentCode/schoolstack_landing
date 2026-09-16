import { TEACHER_FORM_DOCUMENT_PREVIEW_HEIGHT_CLASS } from "@/lib/school-teacher/forms-documents/utils";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type ParentFormDetailSkeletonProps = {
  theme: ParentThemeTokens;
  previewHeightClass?: string;
  showSignSection?: boolean;
};

export default function ParentFormDetailSkeleton({
  theme,
  previewHeightClass = TEACHER_FORM_DOCUMENT_PREVIEW_HEIGHT_CLASS,
  showSignSection = false,
}: ParentFormDetailSkeletonProps) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading form">
      <div
        className="h-4 w-2/3 animate-pulse rounded"
        style={{ backgroundColor: theme.line }}
      />
      <div
        className="h-3 w-full animate-pulse rounded"
        style={{ backgroundColor: theme.line }}
      />
      <div
        className={`${previewHeightClass} w-full animate-pulse rounded-xl`}
        style={{ backgroundColor: theme.line }}
      />
      {showSignSection ? (
        <>
          <div
            className="mt-2 h-4 w-32 animate-pulse rounded"
            style={{ backgroundColor: theme.line }}
          />
          <div
            className="h-12 w-full animate-pulse rounded-xl"
            style={{ backgroundColor: theme.line }}
          />
          <div
            className="h-10 w-full animate-pulse rounded-lg"
            style={{ backgroundColor: theme.line }}
          />
        </>
      ) : (
        <div
          className="h-24 w-full animate-pulse rounded-xl"
          style={{ backgroundColor: theme.line }}
        />
      )}
    </div>
  );
}

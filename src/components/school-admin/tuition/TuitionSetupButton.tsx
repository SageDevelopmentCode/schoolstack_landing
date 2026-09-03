"use client";

import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { TuitionReadinessStatus } from "@/lib/tuition/tuition-readiness";

type TuitionSetupButtonProps = {
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  readiness: TuitionReadinessStatus;
  onClick: () => void;
};

export default function TuitionSetupButton({
  theme,
  readiness,
  onClick,
}: TuitionSetupButtonProps) {
  const allComplete = readiness.completedCount === readiness.totalCount;
  const needsAttention =
    !allComplete || readiness.unassignedEnrollmentCount > 0;

  return (
    <AdminButton
      theme={theme}
      variant={allComplete ? "outline" : "soft"}
      onClick={onClick}
      data-testid="tuition-setup-button"
    >
      {needsAttention ? (
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: theme.primary }}
          aria-hidden="true"
        />
      ) : null}
      Setup · {readiness.completedCount}/{readiness.totalCount}
    </AdminButton>
  );
}

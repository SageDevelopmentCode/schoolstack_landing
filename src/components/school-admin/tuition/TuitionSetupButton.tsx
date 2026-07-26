"use client";

import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { getAdminButtonStyle } from "@/lib/organization-settings/admin-button-styles";
import type { TuitionReadinessStatus } from "@/lib/tuition/tuition-readiness";

type TuitionSetupButtonProps = {
  C: AdminThemeTokens;
  readiness: TuitionReadinessStatus;
  onClick: () => void;
};

export default function TuitionSetupButton({
  C,
  readiness,
  onClick,
}: TuitionSetupButtonProps) {
  const allComplete = readiness.completedCount === readiness.totalCount;
  const needsAttention =
    !allComplete || readiness.unassignedEnrollmentCount > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      data-testid="tuition-setup-button"
      style={getAdminButtonStyle(C, allComplete ? "neutral" : "secondary")}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium"
    >
      {needsAttention ? (
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: C.accent }}
          aria-hidden="true"
        />
      ) : null}
      Setup · {readiness.completedCount}/{readiness.totalCount}
    </button>
  );
}

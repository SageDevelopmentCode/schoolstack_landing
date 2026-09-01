"use client";

import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { ClassroomSignupStatus, ClassroomSignupType } from "@/lib/classroom-signups/types";
import {
  SIGNUP_STATUS_LABELS,
  SIGNUP_TYPE_LABELS,
} from "@/lib/classroom-signups/types";
import ParentChip from "@/components/school-parent/ui/ParentChip";

type SignupTypeChipProps = {
  theme: ParentThemeTokens;
  type: ClassroomSignupType;
};

export function SignupTypeChip({ theme, type }: SignupTypeChipProps) {
  return (
    <ParentChip theme={theme} tone="info">
      {SIGNUP_TYPE_LABELS[type]}
    </ParentChip>
  );
}

type SignupStatusChipProps = {
  theme: ParentThemeTokens;
  status: ClassroomSignupStatus;
};

const STATUS_TONES: Record<
  ClassroomSignupStatus,
  "info" | "success" | "warning"
> = {
  draft: "warning",
  open: "success",
  closed: "info",
};

export function SignupStatusChip({ theme, status }: SignupStatusChipProps) {
  return (
    <ParentChip theme={theme} tone={STATUS_TONES[status]}>
      {SIGNUP_STATUS_LABELS[status]}
    </ParentChip>
  );
}

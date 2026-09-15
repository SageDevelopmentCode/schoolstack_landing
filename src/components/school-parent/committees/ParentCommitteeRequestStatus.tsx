"use client";

import ParentChip, { type ParentChipTone } from "@/components/school-parent/ui/ParentChip";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { CommitteeJoinRequestStatus } from "@/lib/committees/types";

const STATUS_CONFIG: Record<
  CommitteeJoinRequestStatus,
  { label: string; tone: ParentChipTone }
> = {
  pending: { label: "Request pending", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  declined: { label: "Declined", tone: "alert" },
  withdrawn: { label: "Withdrawn", tone: "info" },
};

export default function ParentCommitteeRequestStatus({
  status,
  theme,
}: {
  status: CommitteeJoinRequestStatus;
  theme: ParentThemeTokens;
}) {
  const config = STATUS_CONFIG[status];

  return (
    <ParentChip theme={theme} tone={config.tone}>
      {config.label}
    </ParentChip>
  );
}

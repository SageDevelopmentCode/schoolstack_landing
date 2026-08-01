"use client";

import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { CommitteeJoinRequestStatus } from "@/lib/committees/types";

const STATUS_CONFIG: Record<
  CommitteeJoinRequestStatus,
  { label: string; bg: (C: AdminThemeTokens) => string; color: (C: AdminThemeTokens) => string }
> = {
  pending: {
    label: "Request pending",
    bg: (C) => C.warningBg ?? C.accentLight,
    color: (C) => C.warning ?? C.accent,
  },
  approved: {
    label: "Approved",
    bg: (C) => C.successBg,
    color: (C) => C.success,
  },
  declined: {
    label: "Declined",
    bg: (C) => C.errorBg ?? C.border,
    color: (C) => C.error,
  },
  withdrawn: {
    label: "Withdrawn",
    bg: (C) => C.border,
    color: (C) => C.textSecondary,
  },
};

export default function ParentCommitteeRequestStatus({
  status,
  C,
}: {
  status: CommitteeJoinRequestStatus;
  C: AdminThemeTokens;
}) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
      style={{ backgroundColor: config.bg(C), color: config.color(C) }}
    >
      {config.label}
    </span>
  );
}

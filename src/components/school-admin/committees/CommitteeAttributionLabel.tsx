"use client";

import {
  formatCommitteeAttribution,
  resolveAttributionMember,
} from "@/lib/committees/attribution";
import type { CommitteeMember, CommitteeRole } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

export function CommitteeAttributionLabel({
  theme,
  createdByMemberId,
  createdByName,
  createdByRole,
  members,
  className = "text-[11px] mt-1",
}: {
  theme: ParentThemeTokens;
  createdByMemberId?: string | null;
  createdByName?: string;
  createdByRole?: CommitteeRole;
  members?: CommitteeMember[];
  className?: string;
}) {
  const member =
    createdByName && createdByRole
      ? { name: createdByName, role: createdByRole }
      : resolveAttributionMember(createdByMemberId, members ?? []);

  return (
    <p className={className} style={{ color: theme.muted }}>
      Added by {formatCommitteeAttribution(member)}
    </p>
  );
}

export function committeeOperationalSurface(isAdmin: boolean): "school_admin" | "parent_portal" {
  return isAdmin ? "school_admin" : "parent_portal";
}

"use client";

import { Plus } from "lucide-react";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type CommitteesStoryHeaderProps = {
  theme: ParentThemeTokens;
  activeCount: number;
  pendingRequestCount: number;
  onCreate: () => void;
};

export default function CommitteesStoryHeader({
  theme,
  activeCount,
  pendingRequestCount,
  onCreate,
}: CommitteesStoryHeaderProps) {
  const subtitleParts: string[] = [];
  if (activeCount > 0) {
    subtitleParts.push(
      `${activeCount} active committee${activeCount === 1 ? "" : "s"}`,
    );
  }
  if (pendingRequestCount > 0) {
    subtitleParts.push(
      `${pendingRequestCount} pending join request${pendingRequestCount === 1 ? "" : "s"}`,
    );
  }

  const subtitle =
    subtitleParts.join(" · ") ||
    "Structured parent workspaces for volunteer groups, coordinators, and festival teams.";

  return (
    <div className="mb-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end sm:gap-5">
      <div className="min-w-0">
        <AdminSectionKicker theme={theme}>My School</AdminSectionKicker>
        <AdminDisplayHeading theme={theme} as="h1" size="display" className="mt-1.5">
          Committees
        </AdminDisplayHeading>
        <p className="mt-2 text-[13px]" style={{ color: theme.muted }}>
          {subtitle}
        </p>
      </div>
      <AdminButton theme={theme} variant="primary" onClick={onCreate}>
        <Plus className="h-3.5 w-3.5" />
        Create committee
      </AdminButton>
    </div>
  );
}

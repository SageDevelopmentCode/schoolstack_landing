"use client";

import { Archive, Users } from "lucide-react";
import AdminCard from "@/components/school-admin/ui/story/AdminCard";
import AdminChip from "@/components/school-admin/ui/story/AdminChip";
import type { CommitteeListItem } from "@/lib/committees/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type CommitteeStoryCardProps = {
  committee: CommitteeListItem;
  theme: ParentThemeTokens;
  onOpen: () => void;
};

export default function CommitteeStoryCard({
  committee,
  theme,
  onOpen,
}: CommitteeStoryCardProps) {
  const statusTone =
    committee.status === "active"
      ? "success"
      : committee.status === "archived"
        ? "info"
        : "warning";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full cursor-pointer text-left transition-transform hover:-translate-y-px"
    >
      <AdminCard theme={theme} padding="default" className="h-full">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <h3
            className="text-sm font-bold"
            style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
          >
            {committee.name}
          </h3>
          <AdminChip theme={theme} tone={statusTone}>
            {committee.status}
          </AdminChip>
        </div>
        <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: theme.muted }}>
          {committee.description}
        </p>
        <div
          className="flex items-center gap-3 mt-3 text-xs"
          style={{ color: theme.muted }}
        >
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {committee.memberCount} member{committee.memberCount === 1 ? "" : "s"}
          </span>
          <span>{committee.termLabel}</span>
        </div>
        {committee.status === "archived" && (
          <span
            className="inline-flex items-center gap-1 mt-2 text-[10px] font-medium"
            style={{ color: theme.muted }}
          >
            <Archive className="w-3 h-3" />
            History preserved
          </span>
        )}
      </AdminCard>
    </button>
  );
}

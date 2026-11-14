"use client";

import { CommitteeCard, CommitteeChip } from "@/components/school-admin/committees/committee-ui";
import type { CommitteeProject } from "@/lib/committees/committee-project-mappers";
import { committeeProjectDisplayName } from "@/lib/committees/committee-projects-mock";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import CommitteeProjectCardActionsMenu from "./CommitteeProjectCardActionsMenu";

type CommitteeProjectStoryCardProps = {
  project: CommitteeProject;
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  readOnly?: boolean;
  onOpen: () => void;
  onEditDetails?: () => void;
  onDelete?: () => void;
};

function projectStatusTone(
  status: CommitteeProject["status"],
): "info" | "success" {
  return status === "active" ? "success" : "info";
}

function projectStatusLabel(status: CommitteeProject["status"]): string {
  return status === "active" ? "Active" : "Draft";
}

export default function CommitteeProjectStoryCard({
  project,
  theme,
  C,
  readOnly = false,
  onOpen,
  onEditDetails,
  onDelete,
}: CommitteeProjectStoryCardProps) {
  const itemCount = project.supplyItemCount ?? project.supplyItems.length;
  const description = project.description.trim();
  const showActions = !readOnly && onEditDetails && onDelete;

  return (
    <CommitteeCard
      theme={theme}
      padding="default"
      className="h-full transition-transform hover:-translate-y-px"
      data-testid={`committee-project-card-${project.id}`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={onOpen}
          className="min-w-0 flex-1 cursor-pointer border-0 bg-transparent p-0 text-left"
        >
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3
              className="text-sm font-bold"
              style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
            >
              {committeeProjectDisplayName(project)}
            </h3>
            <CommitteeChip theme={theme} tone={projectStatusTone(project.status)}>
              {projectStatusLabel(project.status)}
            </CommitteeChip>
          </div>
          {description ? (
            <p className="line-clamp-2 text-xs leading-relaxed" style={{ color: theme.muted }}>
              {description}
            </p>
          ) : (
            <p className="text-xs italic leading-relaxed" style={{ color: theme.muted }}>
              No description yet
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <CommitteeChip theme={theme} tone="purple">
              {itemCount} supply item{itemCount === 1 ? "" : "s"}
            </CommitteeChip>
          </div>
        </button>
        {showActions ? (
          <CommitteeProjectCardActionsMenu
            C={C}
            projectId={project.id}
            onEditDetails={onEditDetails}
            onDelete={onDelete}
          />
        ) : null}
      </div>
    </CommitteeCard>
  );
}

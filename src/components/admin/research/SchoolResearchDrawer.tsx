"use client";

import GSidePanel from "@/components/school-parent/garden/GSidePanel";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import { SchoolResearchRail } from "./SchoolResearchRail";
import type { WorkspaceRow } from "./useResearchWorkspaceModel";

/** "Research & plan" for the selected school: what we know about it and the plan's sourced facts. */
export function SchoolResearchDrawer({
  theme,
  row,
  open,
  onClose,
}: {
  theme: ParentThemeTokens;
  row: WorkspaceRow | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <GSidePanel
      theme={theme}
      open={open && Boolean(row)}
      onClose={onClose}
      title={row?.school.name ?? "Research"}
      kicker="Research & plan"
      subtitle={row?.plan ? `Plan researched ${row.plan.researchedAt}` : "No outreach plan yet"}
      testId="research-drawer"
      panelId="research-drawer-panel"
      closeLabel="Close research"
    >
      {row ? <SchoolResearchRail row={row} /> : null}
    </GSidePanel>
  );
}

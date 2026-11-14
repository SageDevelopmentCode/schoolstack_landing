"use client";

import { ArrowLeft, ClipboardList, FileText, Trash2 } from "lucide-react";
import type { CSSProperties } from "react";
import { SettingToggleRow } from "@/components/school-admin/notifications/NotificationChannelCard";
import { CommitteeButton, CommitteeHeading, G_COMMITTEE_INPUT } from "@/components/school-admin/committees/committee-ui";
import { useIsGardenCommittee } from "@/components/school-admin/committees/committee-surface";
import { GKicker, GTabBar, gLinkSm } from "@/components/school-parent/garden/ui";
import TuitionSubTabBar from "@/components/school-admin/tuition/TuitionSubTabBar";
import CommitteeWorkspaceSectionFrame from "@/components/school-admin/committees/CommitteeWorkspaceSectionFrame";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { ProgramCoopFamily } from "@/lib/admissions/program-coop-directory";
import type { CoopSupplyColorLegendEntry, CoopSupplyListItem } from "@/lib/admissions/program-coop-supply-list-mock";
import type { CommitteeProject } from "@/lib/committees/committee-project-mappers";
import { committeeProjectDisplayName } from "@/lib/committees/committee-projects-mock";
import CommitteeProjectSupplyListCard from "./CommitteeProjectSupplyListCard";

export type CommitteeProjectDetailTab = "details" | "supply_list";

const PROJECT_DETAIL_TABS = [
  { id: "supply_list" as const, label: "Supply list", icon: ClipboardList },
  { id: "details" as const, label: "Details", icon: FileText },
];

type CommitteeProjectDetailViewProps = {
  theme: ParentThemeTokens;
  C: AdminThemeTokens;
  project: CommitteeProject;
  memberFamilies: ReadonlyArray<ProgramCoopFamily>;
  activeTab: CommitteeProjectDetailTab;
  onTabChange: (tab: CommitteeProjectDetailTab) => void;
  onBack: () => void;
  readOnly?: boolean;
  supplyLoading?: boolean;
  onUpdateProject: (patch: Partial<CommitteeProject>) => void;
  onItemsChange: (items: CoopSupplyListItem[]) => void;
  onLegendChange: (legend: CoopSupplyColorLegendEntry[]) => void | Promise<void>;
  onSaveSupplyItem: (item: CoopSupplyListItem) => Promise<CoopSupplyListItem>;
  onCreateSupplyItem: (item: CoopSupplyListItem) => Promise<CoopSupplyListItem>;
  onRemoveSupplyItem: (item: CoopSupplyListItem) => Promise<void>;
  onDeleteProject?: () => void;
};

function controlStyle(C: AdminThemeTokens): CSSProperties {
  return {
    backgroundColor: C.input,
    border: `1px solid ${C.inputBorder}`,
    color: C.textPrimary,
    borderRadius: C.r.md,
    fontSize: "14px",
  };
}

export default function CommitteeProjectDetailView({
  theme,
  C,
  project,
  memberFamilies,
  activeTab,
  onTabChange,
  onBack,
  readOnly = false,
  supplyLoading = false,
  onUpdateProject,
  onItemsChange,
  onLegendChange,
  onSaveSupplyItem,
  onCreateSupplyItem,
  onRemoveSupplyItem,
  onDeleteProject,
}: CommitteeProjectDetailViewProps) {
  const garden = useIsGardenCommittee();
  return (
    <CommitteeWorkspaceSectionFrame width="full">
      {garden ? (
        <>
          <button type="button" onClick={onBack} className={gLinkSm} data-testid="committee-project-back">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            All projects
          </button>
          <GKicker className="mt-4">Project</GKicker>
          <h2 className="sf-display m-0 mt-1 text-[1.75rem] leading-[1.02] text-[var(--sf-ink)]">
            {committeeProjectDisplayName(project)}
          </h2>
          <div className="mt-4">
            <GTabBar
              items={PROJECT_DETAIL_TABS.map((tab) => ({
                key: tab.id,
                label: tab.label,
                icon: <tab.icon className="h-4 w-4" aria-hidden="true" />,
                testId: `committee-project-tab-${tab.id}`,
              }))}
              activeKey={activeTab}
              onChange={(key) => onTabChange(key as CommitteeProjectDetailTab)}
              ariaLabel="Project sections"
              data-testid="committee-project-tab-bar"
            />
          </div>
        </>
      ) : (
      <>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 border-0 bg-transparent p-0 text-[13px] font-medium transition-opacity hover:opacity-80"
        style={{ color: theme.muted }}
        data-testid="committee-project-back"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All projects
      </button>

      <CommitteeHeading theme={theme} as="h2" size="section" className="mt-4">
        {committeeProjectDisplayName(project)}
      </CommitteeHeading>

      <div className="mt-4">
        <TuitionSubTabBar
          theme={theme}
          tabs={PROJECT_DETAIL_TABS}
          activeTab={activeTab}
          onTabChange={onTabChange}
          ariaLabel="Project sections"
          testIdPrefix="committee-project"
        />
      </div>
      </>
      )}

      <div className="mt-6">
        {activeTab === "supply_list" ? (
          <div className="mx-auto max-w-4xl">
            <CommitteeProjectSupplyListCard
              C={C}
              theme={theme}
              items={project.supplyItems}
              colorLegend={project.colorLegend}
              memberFamilies={memberFamilies}
              readOnly={readOnly}
              loading={supplyLoading}
              onItemsChange={onItemsChange}
              onLegendChange={onLegendChange}
              onSaveItem={onSaveSupplyItem}
              onCreateItem={onCreateSupplyItem}
              onRemoveItem={onRemoveSupplyItem}
            />
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-3">
            <label className="block">
              <span
                className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.08em]"
                style={{ color: "#8B9699" }}
              >
                Project name
              </span>
              <input
                type="text"
                value={project.name}
                readOnly={readOnly}
                onChange={(event) => onUpdateProject({ name: event.target.value })}
                className={garden ? G_COMMITTEE_INPUT : "w-full px-3 py-2.5 outline-none focus:ring-2 focus:ring-offset-0"}
                style={garden ? undefined : controlStyle(C)}
                placeholder="e.g. Fall festival booths"
              />
            </label>
            <label className="block">
              <span
                className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.08em]"
                style={{ color: "#8B9699" }}
              >
                Description
              </span>
              <textarea
                value={project.description}
                readOnly={readOnly}
                onChange={(event) => onUpdateProject({ description: event.target.value })}
                rows={3}
                className={garden ? `${G_COMMITTEE_INPUT} resize-y` : "w-full resize-y px-3 py-2.5 outline-none focus:ring-2 focus:ring-offset-0"}
                style={garden ? undefined : controlStyle(C)}
                placeholder="What is this project for?"
              />
            </label>
            {!readOnly ? (
              <>
                <div
                  className="rounded-lg border pt-1"
                  style={{ borderColor: C.border, backgroundColor: C.surface }}
                >
                  <SettingToggleRow
                    C={C}
                    label="Active project"
                    description="When off, the project stays in draft on the projects list."
                    checked={project.status === "active"}
                    disabled={false}
                    onChange={(checked) =>
                      onUpdateProject({ status: checked ? "active" : "draft" })
                    }
                  />
                </div>
                {onDeleteProject ? (
                  <div className="border-t pt-4" style={{ borderColor: C.border }}>
                    <CommitteeButton
                      theme={theme}
                      variant="danger"
                      onClick={onDeleteProject}
                      data-testid="committee-project-details-delete"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete project
                    </CommitteeButton>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        )}
      </div>
    </CommitteeWorkspaceSectionFrame>
  );
}

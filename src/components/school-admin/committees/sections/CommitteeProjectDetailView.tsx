"use client";

import { ArrowLeft, ClipboardList, FileText, Trash2 } from "lucide-react";
import type { CSSProperties } from "react";
import { SettingToggleRow } from "@/components/school-admin/notifications/NotificationChannelCard";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
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
  return (
    <CommitteeWorkspaceSectionFrame width="full">
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

      <AdminDisplayHeading theme={theme} as="h2" size="section" className="mt-4">
        {committeeProjectDisplayName(project)}
      </AdminDisplayHeading>

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
                className="w-full px-3 py-2.5 outline-none focus:ring-2 focus:ring-offset-0"
                style={controlStyle(C)}
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
                className="w-full resize-y px-3 py-2.5 outline-none focus:ring-2 focus:ring-offset-0"
                style={controlStyle(C)}
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
                    <AdminButton
                      theme={theme}
                      variant="danger"
                      onClick={onDeleteProject}
                      data-testid="committee-project-details-delete"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete project
                    </AdminButton>
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

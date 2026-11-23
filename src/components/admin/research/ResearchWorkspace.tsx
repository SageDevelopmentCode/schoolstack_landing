"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import GardenToaster from "@/components/school-parent/garden/GardenToaster";
import { gBtnOutlineSm } from "@/components/school-parent/garden/ui";
import { AdminGardenPage, AdminGardenPageHeader, GardenEmptyState, GardenLoadError } from "@/components/school-admin/garden/kit";
import type { ResearchWorkspaceData } from "@/lib/admin-crm/research-types";
import { AddSchoolDrawer } from "./AddSchoolDrawer";
import { OutreachFunnelStrip } from "./OutreachFunnelStrip";
import { SchoolJourneyPanel } from "./SchoolJourneyPanel";
import { SchoolList } from "./SchoolList";
import { SchoolResearchDrawer } from "./SchoolResearchDrawer";
import { RESEARCH_GARDEN_THEME as THEME } from "./theme";
import { useResearchWorkspaceModel } from "./useResearchWorkspaceModel";

function todayLabel() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

/** /admin/research: the outreach funnel, the school list, one school's sequence and its research. */
export function ResearchWorkspace({ initial, loadError }: { initial: ResearchWorkspaceData; loadError: string | null }) {
  const model = useResearchWorkspaceModel(initial, loadError);
  const [adding, setAdding] = useState(false);
  const [researchOpen, setResearchOpen] = useState(false);
  const selected = model.selected;

  return (
    <div className="h-[calc(100dvh-3rem)]">
      <AdminGardenPage
        theme={THEME}
        data-testid="research-workspace"
        overlays={
          <>
            <AddSchoolDrawer
              theme={THEME}
              open={adding}
              saving={model.pendingKey === "add-school"}
              onClose={() => setAdding(false)}
              onSave={model.addSchool}
            />
            <SchoolResearchDrawer theme={THEME} row={selected} open={researchOpen} onClose={() => setResearchOpen(false)} />
          </>
        }
      >
        <AdminGardenPageHeader
          kicker={
            <>
              MudKitchen outreach<span className="hidden sm:inline"> · {todayLabel()}</span>
            </>
          }
          title={
            <>
              School <span className="text-[var(--sf-clay)]">outreach</span>
            </>
          }
          subtitle={model.statusLine}
          refresh={{
            onRefresh: () => void model.refresh(),
            refreshing: model.refreshing,
            lastUpdatedAt: model.lastUpdatedAt,
            label: "Refresh the CRM",
          }}
          actions={
            <button type="button" className={gBtnOutlineSm} onClick={() => setAdding(true)} data-testid="research-add-school-open">
              <Plus className="h-4 w-4" aria-hidden />
              Add school
            </button>
          }
        />

        {model.loadError && model.rows.length === 0 ? (
          <GardenLoadError
            title="Couldn't load the CRM."
            description={model.loadError}
            onRetry={() => void model.refresh()}
            retrying={model.refreshing}
          />
        ) : (
          <>
            <OutreachFunnelStrip
              counts={model.counts}
              filter={model.filter}
              onFilter={model.setFilter}
              todayCount={model.todayCount}
              pipelineCount={model.pipelineCount}
              totalCount={model.rows.length}
            />

            <div className="grid items-start gap-5 lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
              <SchoolList
                rows={model.filtered}
                selectedId={selected?.school.id ?? null}
                flashId={model.flashId}
                onSelect={model.select}
                search={model.search}
                onSearch={model.setSearch}
                filter={model.filter}
                onResetFilter={() => model.setFilter("pipeline")}
                traits={model.traits}
                traitCounts={model.traitCounts}
                onToggleTrait={model.toggleTrait}
                onClearTraits={model.clearTraits}
              />
              {selected ? (
                <SchoolJourneyPanel
                  key={selected.school.id}
                  row={selected}
                  theme={THEME}
                  pendingKey={model.pendingKey}
                  onSaveSchool={(patch, copy) => model.saveSchool(selected.school, patch, copy)}
                  onStatus={(status) => model.setStatus(selected.school, status)}
                  onOutreach={(next) => model.applyOutreach(selected.school.id, next)}
                  onOpenResearch={() => setResearchOpen(true)}
                />
              ) : (
                <GardenEmptyState title="Pick a school" description="Choose a school on the left to see its sequence." />
              )}
            </div>
          </>
        )}
      </AdminGardenPage>
      <GardenToaster theme={THEME} />
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, Plus, Zap } from "lucide-react";
import DemoAdminGardenShell from "@/components/demo/shared/DemoAdminGardenShell";
import { ROW_INTERACTIVE } from "@/components/school-admin/dashboard/garden/shared";
import { AdminGardenPage, AdminGardenPageHeader, GardenStatTiles } from "@/components/school-admin/garden/kit";
import { gFade } from "@/components/school-parent/garden/motion";
import { GCard, GChip, GTabBar, gBtnPopSm } from "@/components/school-parent/garden/ui";
import type { SchoolAdminDemoConfig } from "@/data/school-demos/demo-dashboard-types";
import {
  DEMO_AUTOMATION_PIPELINES,
  WIZARD_INITIAL_STATE,
  type AutomationFilter,
  type AutomationPipeline,
  type WizardState,
} from "@/data/school-demos/demo-marketing-automations";
import { DEMO_ADMIN_FEATURES, DEMO_PORTAL_SLUG } from "@/data/school-demos/demo-portal-shared";
import { schoolAdminPath } from "@/lib/organization-settings/admin-routes";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import MarketingAutomationWizard from "./MarketingAutomationWizard";
import MarketingPipelineDrawer from "./MarketingPipelineDrawer";
import { PipelineStatusChip, STEP_TINTS, StepIcon, formatCount } from "./parts";

/** The mock's explainer, reused as the page subtitle. */
const MARKETING_SUBTITLE =
  "These numbers show how your automations are performing — open rates and conversions tell you what's working.";

const FILTERS: { key: AutomationFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "paused", label: "Paused" },
  { key: "draft", label: "Draft" },
];

/** How long a just-created row stays on the mint flash. */
const NEW_ROW_FLASH_MS = 1600;

/** The demo sidebar lists Marketing (it's off for real schools until it ships). */
const MARKETING_DEMO_FEATURES: OrganizationFeatures = {
  ...DEMO_ADMIN_FEATURES,
  admin: { ...DEMO_ADMIN_FEATURES.admin, marketing: true },
};

/**
 * Home-page "Marketing" demo: a Garden rebuild of the old marketing
 * automations mock inside the real admin frame. Same sample data and copy;
 * the wizard creates pipelines in memory only. Nothing is fetched.
 */
export default function DemoAdminGardenMarketing({ config }: { config: SchoolAdminDemoConfig }) {
  const previewPathname = useMemo(() => schoolAdminPath(DEMO_PORTAL_SLUG, "marketing"), []);
  return (
    <DemoAdminGardenShell
      config={config}
      previewPathname={previewPathname}
      features={MARKETING_DEMO_FEATURES}
      data-testid="demo-admin-garden-marketing"
    >
      {({ theme, portalHost }) => <MarketingPage theme={theme} portalHost={portalHost} />}
    </DemoAdminGardenShell>
  );
}

function MarketingPage({ theme, portalHost }: { theme: ParentThemeTokens; portalHost: HTMLElement | null }) {
  const reduce = useReducedMotion() === true;
  const [pipelines, setPipelines] = useState<AutomationPipeline[]>(DEMO_AUTOMATION_PIPELINES);
  const [filter, setFilter] = useState<AutomationFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  /** Last opened pipeline, kept so the drawer can animate out with its content. */
  const [drawerPipeline, setDrawerPipeline] = useState<AutomationPipeline | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [wizardState, setWizardState] = useState<WizardState>(WIZARD_INITIAL_STATE);
  const [flashId, setFlashId] = useState<string | null>(null);

  useEffect(() => {
    if (!flashId) return;
    const timer = window.setTimeout(() => setFlashId(null), NEW_ROW_FLASH_MS);
    return () => window.clearTimeout(timer);
  }, [flashId]);

  const filtered = filter === "all" ? pipelines : pipelines.filter((p) => p.status === filter);

  // KPI maths exactly as the mock.
  const totalActive = pipelines.filter((p) => p.status === "active").length;
  const totalSent = pipelines.reduce((sum, p) => sum + p.stats.sent, 0);
  const withSent = pipelines.filter((p) => p.stats.sent > 0);
  const avgOpenRate =
    withSent.length > 0 ? Math.round(withSent.reduce((sum, p) => sum + p.stats.openRate, 0) / withSent.length) : 0;
  const totalConversions = pipelines.reduce((sum, p) => sum + p.stats.conversions, 0);

  const counts: Record<AutomationFilter, number> = {
    all: pipelines.length,
    active: totalActive,
    paused: pipelines.filter((p) => p.status === "paused").length,
    draft: pipelines.filter((p) => p.status === "draft").length,
  };

  const openPipeline = useCallback((pipeline: AutomationPipeline) => {
    setDrawerPipeline(pipeline);
    setSelectedId(pipeline.id);
  }, []);
  const closePipeline = useCallback(() => setSelectedId(null), []);

  const openWizard = () => {
    setWizardState(WIZARD_INITIAL_STATE);
    setIsCreating(true);
  };
  const closeWizard = useCallback(() => setIsCreating(false), []);
  const patchWizard = useCallback(
    (patch: Partial<WizardState>) => setWizardState((prev) => ({ ...prev, ...patch })),
    [],
  );
  const handleCreatePipeline = useCallback((pipeline: AutomationPipeline) => {
    setPipelines((prev) => [pipeline, ...prev]);
    setFilter("all");
    setFlashId(pipeline.id);
  }, []);

  return (
    <AdminGardenPage
      theme={theme}
      data-testid="demo-marketing-page"
      overlays={
        <>
          <MarketingPipelineDrawer
            theme={theme}
            pipeline={drawerPipeline}
            open={selectedId != null}
            onClose={closePipeline}
            portalHost={portalHost}
          />
          <MarketingAutomationWizard
            theme={theme}
            open={isCreating}
            state={wizardState}
            onChange={patchWizard}
            onClose={closeWizard}
            onCreatePipeline={handleCreatePipeline}
            portalContainer={portalHost}
          />
        </>
      }
    >
      <AdminGardenPageHeader
        kicker="Tools"
        title={<span className="text-[var(--sf-clay)]">Marketing</span>}
        subtitle={MARKETING_SUBTITLE}
        actions={
          <button type="button" onClick={openWizard} className={`${gBtnPopSm} whitespace-nowrap`} data-testid="demo-marketing-new">
            <Plus className="h-4 w-4" aria-hidden /> New automation
          </button>
        }
      />

      <GardenStatTiles
        layout="strip"
        ariaLabel="Automation performance"
        stats={[
          {
            id: "active",
            label: "Active pipelines",
            value: totalActive,
            onClick: () => setFilter("active"),
            active: filter === "active",
          },
          { id: "sent", label: "Total sent", value: formatCount(totalSent) },
          { id: "open", label: "Avg open rate", value: `${avgOpenRate}%` },
          { id: "conversions", label: "Conversions", value: formatCount(totalConversions) },
        ]}
      />

      <GCard
        index={2}
        kicker="Automations"
        title="Your pipelines"
        action={
          <span className="text-[13px] font-bold tabular-nums text-[var(--sf-soft)]">
            {filtered.length} pipeline{filtered.length !== 1 ? "s" : ""}
          </span>
        }
        data-testid="demo-marketing-pipelines"
      >
        <GTabBar
          className="mb-3"
          ariaLabel="Filter automations"
          activeKey={filter}
          onChange={(key) => setFilter(key as AutomationFilter)}
          items={FILTERS.map((f) => ({
            key: f.key,
            label: f.label,
            suffix: <span className="tabular-nums opacity-80">· {counts[f.key]}</span>,
          }))}
        />
        {/* Container queries: the row sits beside the admin sidebar (and inside a
            scaled demo canvas), so its width, not the viewport's, decides what fits. */}
        <ul className="@container m-0 flex list-none flex-col gap-1 p-0" aria-label="Automations">
          {filtered.map((pipeline, idx) => (
            <motion.li key={pipeline.id} {...gFade(idx * 0.3, reduce)} layout={reduce ? false : "position"}>
              <PipelineRow
                pipeline={pipeline}
                flash={flashId === pipeline.id}
                onOpen={() => openPipeline(pipeline)}
              />
            </motion.li>
          ))}
        </ul>
      </GCard>
    </AdminGardenPage>
  );
}

function PipelineRow({
  pipeline,
  flash,
  onOpen,
}: {
  pipeline: AutomationPipeline;
  flash: boolean;
  onOpen: () => void;
}) {
  const actionCount = pipeline.steps.filter((s) => s.type !== "wait").length;
  const sent = pipeline.stats.sent > 0;
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className={`${ROW_INTERACTIVE} border-[1.5px] ${
        flash ? "border-[var(--sf-forest)]/30 bg-[var(--sf-mint)]" : "border-transparent"
      }`}
      data-testid={`demo-marketing-row-${pipeline.id}`}
    >
      {/* Name, description, audience + trigger */}
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="min-w-0 truncate text-[15px] font-extrabold text-[var(--sf-ink)]">{pipeline.name}</span>
          <PipelineStatusChip status={pipeline.status} />
        </span>
        {pipeline.description ? (
          <span className="mt-0.5 block truncate text-[13px] font-semibold text-[var(--sf-soft)]">
            {pipeline.description}
          </span>
        ) : null}
        <span className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1.5">
          <GChip tone="neutral">{pipeline.audience}</GChip>
          <span className="inline-flex min-w-0 items-center gap-1 text-[12px] font-semibold text-[var(--sf-soft)]">
            <Zap className="h-3 w-3 shrink-0" aria-hidden />
            <span className="truncate">{pipeline.trigger}</span>
          </span>
        </span>
      </span>

      {/* Step mini timeline */}
      <span className="hidden shrink-0 items-center gap-1 @2xl:flex">
        {pipeline.steps.map((step, i) => (
          <span key={`${step.label}-${i}`} className="flex items-center gap-1" aria-hidden>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full ${STEP_TINTS[step.type]}`}>
              <StepIcon type={step.type} className="h-3 w-3" />
            </span>
            {i < pipeline.steps.length - 1 ? <span className="h-[1.5px] w-1.5 bg-[var(--sf-ink)]/15" /> : null}
          </span>
        ))}
        <span className="ml-1 hidden whitespace-nowrap text-[12px] font-semibold tabular-nums text-[var(--sf-soft)] @4xl:inline">
          {actionCount} action{actionCount !== 1 ? "s" : ""}
        </span>
      </span>

      {/* Metrics */}
      <span className="flex shrink-0 items-center gap-4 @2xl:gap-5">
        {sent ? (
          <>
            <Metric label="Sent" value={formatCount(pipeline.stats.sent)} className="hidden @xl:block" />
            <Metric label="Open rate" value={`${pipeline.stats.openRate}%`} className="hidden @xl:block" />
            <Metric label="Conversions" value={formatCount(pipeline.stats.conversions)} className="hidden @4xl:block" />
          </>
        ) : (
          <span className="hidden whitespace-nowrap text-[12px] font-semibold italic text-[var(--sf-soft)] @xl:inline">
            Draft — not yet sent
          </span>
        )}
        <ChevronRight
          className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/40 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </button>
  );
}

function Metric({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <span className={`text-right ${className}`}>
      <span className="block text-[11px] font-bold text-[var(--sf-soft)]">{label}</span>
      <span className="block text-[14px] font-extrabold tabular-nums text-[var(--sf-ink)]">{value}</span>
    </span>
  );
}

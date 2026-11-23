"use client";

import { ChevronRight } from "lucide-react";
import { G_FOCUS } from "@/components/school-parent/garden/ui";
import { GardenFilterChips } from "@/components/school-admin/garden/kit";
import {
  FUNNEL_SIDE_STAGES,
  FUNNEL_STAGE_LABEL,
  type FunnelStage,
} from "@/lib/admin-crm/outreach-journey";
import { listFilterLabel, type ListFilter } from "./useResearchWorkspaceModel";

type Counts = Record<FunnelStage, { total: number; actionable: number }>;

const SEQUENCE: { stage: FunnelStage; number: number }[] = [
  { stage: "step:first", number: 1 },
  { stage: "step:follow-1", number: 2 },
  { stage: "step:social", number: 3 },
  { stage: "step:follow-2", number: 4 },
  { stage: "step:close", number: 5 },
];

const CONVERSATION: FunnelStage[] = ["replied", "call_booked", "proposal", "won"];

/** Lane tints: pastel only on the dot / chip, per the admin Garden rules. */
const LANE_DOT: Partial<Record<FunnelStage, string>> = {
  needs_plan: "bg-[var(--sf-butter)]",
  letter: "bg-[var(--sf-moss)]",
  replied: "bg-[var(--sf-sky)]",
  call_booked: "bg-[var(--sf-lav)]",
  proposal: "bg-[var(--sf-peach)]",
  won: "bg-[var(--sf-mint)]",
};

function Tile({
  stage,
  count,
  active,
  onSelect,
  number,
}: {
  stage: FunnelStage;
  count: { total: number; actionable: number };
  active: boolean;
  onSelect: (stage: FunnelStage) => void;
  number?: number;
}) {
  const label = FUNNEL_STAGE_LABEL[stage];
  const empty = count.total === 0;
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={`${number ? `Step ${number}, ` : ""}${label}: ${count.total} school${count.total === 1 ? "" : "s"}${
        count.actionable ? `, ${count.actionable} to do today` : ""
      }. ${active ? "Showing" : "Show"} in the list`}
      onClick={() => onSelect(stage)}
      className={`group relative flex min-w-0 flex-1 flex-col items-start gap-1 rounded-[16px] border-[1.5px] px-3 py-2.5 text-left transition-all duration-200 ${
        active
          ? "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white shadow-[0_3px_0_0_var(--sf-ink)]"
          : `border-[var(--sf-ink)]/12 bg-white hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/35 ${empty ? "text-[var(--sf-ink)]/55" : "text-[var(--sf-ink)]"}`
      } min-h-[100px] ${G_FOCUS}`}
    >
      {number ? (
        <span
          className={`text-[10.5px] font-extrabold uppercase tracking-[0.14em] ${active ? "text-white/80" : "text-[var(--sf-soft)]"}`}
          aria-hidden
        >
          Step {number}
        </span>
      ) : null}
      <span className="flex w-full items-start gap-1.5">
        {!number && LANE_DOT[stage] ? (
          <span className={`mt-[3px] h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-[var(--sf-ink)]/30 ${LANE_DOT[stage]}`} aria-hidden />
        ) : null}
        <span className={`text-[13px] font-extrabold leading-tight ${active ? "text-white" : ""}`}>{label}</span>
      </span>
      <span className="mt-auto flex w-full flex-wrap items-end justify-between gap-x-2 gap-y-1">
        <span className="sf-display text-[1.7rem] leading-none tabular-nums">{count.total}</span>
        {count.actionable > 0 ? (
          <span
            className={`mb-0.5 inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-extrabold tabular-nums ${
              active ? "bg-white text-[var(--sf-clay-deep)]" : "bg-[var(--sf-peach)] text-[var(--sf-clay-deep)]"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--sf-clay)]" aria-hidden />
            {count.actionable} today
          </span>
        ) : null}
      </span>
    </button>
  );
}

function GroupLabel({ children }: { children: string }) {
  return (
    <p className="m-0 mb-1.5 px-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">{children}</p>
  );
}

function Arrow() {
  return (
    <span className="hidden shrink-0 self-center pt-6 text-[var(--sf-ink)]/30 lg:block" aria-hidden>
      <ChevronRight className="h-5 w-5" strokeWidth={2.6} />
    </span>
  );
}

/**
 * The outreach "tunnel": getting started (plan, handwritten letter) → the 5-step sequence, then
 * conversations on a second row. Each lane is a button that filters the list. Wraps into grids on
 * small screens instead of scrolling sideways.
 */
export function OutreachFunnelStrip({
  counts,
  filter,
  onFilter,
  todayCount,
  pipelineCount,
  totalCount,
}: {
  counts: Counts;
  filter: ListFilter;
  onFilter: (filter: ListFilter) => void;
  todayCount: number;
  pipelineCount: number;
  totalCount: number;
}) {
  const toggle = (stage: FunnelStage) => onFilter(filter === stage ? "pipeline" : stage);

  const scopeOptions = [
    { key: "today", label: listFilterLabel("today"), count: todayCount },
    { key: "pipeline", label: listFilterLabel("pipeline"), count: pipelineCount },
    { key: "all", label: listFilterLabel("all"), count: totalCount },
    ...FUNNEL_SIDE_STAGES.filter((s) => counts[s].total > 0).map((s) => ({
      key: s,
      label: FUNNEL_STAGE_LABEL[s],
      count: counts[s].total,
    })),
  ];

  return (
    <section
      aria-label="Outreach funnel"
      className="rounded-[24px] border-[1.5px] border-[var(--sf-ink)]/12 bg-[var(--sf-paper)] p-3 shadow-[0_3px_0_0_rgba(43,36,29,0.08)] sm:p-4"
      data-testid="research-funnel"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_auto_minmax(0,5fr)] lg:gap-3">
        <div className="flex min-w-0 flex-col">
          <GroupLabel>Getting started</GroupLabel>
          <div className="grid flex-1 grid-cols-2 gap-2">
            <Tile stage="needs_plan" count={counts.needs_plan} active={filter === "needs_plan"} onSelect={toggle} />
            <Tile stage="letter" count={counts.letter} active={filter === "letter"} onSelect={toggle} />
          </div>
        </div>
        <Arrow />
        <div className="flex min-w-0 flex-col">
          <GroupLabel>Sequence</GroupLabel>
          <div className="relative grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
            <span
              className="pointer-events-none absolute left-4 right-4 top-1/2 hidden h-[2px] -translate-y-1/2 border-t-2 border-dashed border-[var(--sf-ink)]/12 md:block"
              aria-hidden
            />
            {SEQUENCE.map(({ stage, number }) => (
              <Tile key={stage} stage={stage} number={number} count={counts[stage]} active={filter === stage} onSelect={toggle} />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 border-t border-dashed border-[var(--sf-ink)]/12 pt-3">
        <GroupLabel>Conversations</GroupLabel>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CONVERSATION.map((stage) => (
            <Tile key={stage} stage={stage} count={counts[stage]} active={filter === stage} onSelect={toggle} />
          ))}
        </div>
      </div>
      <GardenFilterChips
        className="mt-3 border-t border-dashed border-[var(--sf-ink)]/12 pt-3"
        ariaLabel="Show schools"
        options={scopeOptions}
        value={filter}
        onChange={(key) => onFilter(key as ListFilter)}
      />
    </section>
  );
}

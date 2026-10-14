"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, Info, Lock, Plus, RotateCcw } from "lucide-react";
import CalculatorDialog from "@/components/marketing/enrollment-calculator/CalculatorDialog";
import PlannerMenu, { type PlannerMenuSection } from "@/components/marketing/tuition-planner/PlannerMenu";
import PlannerResultColumn from "@/components/marketing/tuition-planner/PlannerResultColumn";
import ScenarioCard from "@/components/marketing/tuition-planner/ScenarioCard";
import TuitionPlannerShell from "@/components/marketing/tuition-planner/TuitionPlannerShell";
import { planAccentColor } from "@/components/marketing/tuition-planner/ScenarioComparison";
import {
  ASSUMPTIONS_NOTE,
  CAP_NOTE,
  FLOW_STEPS,
  NEXT_KICKER,
  NEXT_SUPPORT,
  NEXT_TITLE,
  PLANNER_HEADING,
  PLANNER_KICKER,
  PLANNER_SUPPORT,
  STARTING_NOTE,
  STORAGE_NOTE,
  WORKSPACE_SUPPORT,
  WORKSPACE_TITLE,
} from "@/components/marketing/tuition-planner/planner-copy";
import { plannerFocusClass, TUITION_PLANNER_THEME } from "@/components/marketing/tuition-planner/planner-theme";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import {
  compareScenario,
  computeScenario,
  scenarioInsights,
  selectedLiveSummary,
} from "@/lib/marketing/tuition-scenario-planner";
import {
  MAX_SCENARIOS,
  PLANNER_STORAGE_KEY,
  addScenario,
  baselineScenario,
  parsePlannerDraft,
  removeScenario,
  renameScenario,
  resetScenario,
  selectScenario,
  serializePlanner,
  setAdjustmentEnabled,
  setBaseline,
  starterPlanner,
  updateAdjustmentFields,
  updateGroupFields,
  moveScenario,
  type PlannerState,
  type ScenarioTemplate,
} from "@/lib/marketing/tuition-scenario-state";

const theme = TUITION_PLANNER_THEME;
const STORAGE_PENDING = "__mk_tuition_planner_pending__";

function subscribeToPlannerStorage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function readPlannerStorage(): string {
  try {
    return window.localStorage.getItem(PLANNER_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function addMenuSections(
  state: PlannerState,
  onAdd: (template: ScenarioTemplate, sourceId?: string) => void,
): PlannerMenuSection[] {
  return [
    {
      id: "templates",
      items: [
        {
          id: "from-baseline",
          label: "Start from current baseline",
          onSelect: () => onAdd("from-baseline"),
        },
        {
          id: "raise-tuition",
          label: "Raise tuition",
          description: "Baseline tuition plus $100 a month.",
          onSelect: () => onAdd("raise-tuition"),
        },
        {
          id: "raise-tuition-lose-student",
          label: "Raise tuition, one student leaves",
          description: "Plus $100 a month, with one fewer student.",
          onSelect: () => onAdd("raise-tuition-lose-student"),
        },
        {
          id: "grow-enrollment",
          label: "Keep tuition, add two students",
          onSelect: () => onAdd("grow-enrollment"),
        },
        {
          id: "part-time",
          label: "Add a part-time program",
          description: "Keeps full-time enrollment and adds a part-time group.",
          onSelect: () => onAdd("part-time"),
        },
      ],
    },
    {
      id: "duplicate",
      label: "Duplicate",
      items: state.scenarios.map((scenario) => ({
        id: `duplicate-${scenario.id}`,
        label: scenario.name,
        onSelect: () => onAdd("duplicate", scenario.id),
      })),
    },
  ];
}

export default function TuitionPlannerExperience() {
  const storedSnapshot = useSyncExternalStore(
    subscribeToPlannerStorage,
    readPlannerStorage,
    () => STORAGE_PENDING,
  );
  const [edits, setPlanner] = useState<PlannerState | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [toast, setToast] = useState("");
  const [liveText, setLiveText] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const cardNodes = useRef(new Map<string, HTMLElement>());
  const seenSummary = useRef<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [focusNonce, setFocusNonce] = useState(0);
  const planner = useMemo(() => {
    if (edits) return edits;
    if (storedSnapshot === STORAGE_PENDING) return null;
    return parsePlannerDraft(storedSnapshot || null) ?? starterPlanner();
  }, [edits, storedSnapshot]);

  useEffect(() => {
    if (!edits) return;
    try {
      window.localStorage.setItem(PLANNER_STORAGE_KEY, serializePlanner(edits));
    } catch {
      // Private browsing can reject storage. The planner still works for this visit.
    }
  }, [edits]);

  useEffect(() => {
    if (!focusId) return;
    const node = cardNodes.current.get(focusId);
    if (!node) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node.focus({ preventScroll: true });
    node.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      inline: "nearest",
      block: "nearest",
    });
  }, [focusId, focusNonce]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const view = useMemo(() => {
    if (!planner) return null;
    const baseline = baselineScenario(planner);
    const baselineResult = computeScenario(baseline.groups);
    return planner.scenarios.map((scenario, index) => {
      const result = computeScenario(scenario.groups);
      const isBaseline = scenario.id === planner.baselineId;
      return {
        scenario,
        result,
        isBaseline,
        index,
        comparison: compareScenario(result, baselineResult, isBaseline),
        insights: scenarioInsights(scenario, result, baseline, baselineResult),
      };
    });
  }, [planner]);

  const selected = view?.find((row) => row.scenario.id === planner?.selectedId) ?? view?.[0];
  const summary =
    selected && planner
      ? selectedLiveSummary(selected.scenario.name, selected.result, selected.comparison)
      : "";

  useEffect(() => {
    if (!summary) return;
    if (seenSummary.current === null) {
      seenSummary.current = summary;
      return;
    }
    if (seenSummary.current === summary) return;
    seenSummary.current = summary;
    const timeout = window.setTimeout(() => setLiveText(summary), 700);
    return () => window.clearTimeout(timeout);
  }, [summary]);

  const announce = (message: string) => {
    setAnnouncement("");
    window.setTimeout(() => setAnnouncement(message), 30);
    setToast("");
    window.setTimeout(() => setToast(message), 30);
  };

  const requestFocus = (id: string) => {
    setFocusId(id);
    setFocusNonce((nonce) => nonce + 1);
  };

  const handleAdd = (template: ScenarioTemplate, sourceId?: string) => {
    if (!planner) return;
    const result = addScenario(planner, template, sourceId);
    if (result.capped || !result.addedId) {
      announce(CAP_NOTE);
      return;
    }
    requestFocus(result.addedId);
    const created = result.state.scenarios.find((scenario) => scenario.id === result.addedId);
    setPlanner(result.state);
    announce(`${created?.name ?? "Scenario"} added. This is a hypothetical scenario.`);
  };

  const handleRemove = (scenarioId: string) => {
    if (!planner) return;
    const name = planner.scenarios.find((scenario) => scenario.id === scenarioId)?.name ?? "Scenario";
    const result = removeScenario(planner, scenarioId);
    if (result.blocked) {
      announce("Keep at least one scenario.");
      return;
    }
    if (result.focusId) requestFocus(result.focusId);
    setPlanner(result.state);
    announce(
      result.promotedBaselineName
        ? `${name} removed. ${result.promotedBaselineName} is now the baseline.`
        : `${name} removed.`,
    );
  };

  const atCap = (planner?.scenarios.length ?? 0) >= MAX_SCENARIOS;
  const baseline = planner ? baselineScenario(planner) : null;
  const baselineName = baseline?.name ?? "Current";

  return (
    <TuitionPlannerShell>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      <p className="sr-only" aria-live="polite">
        {liveText}
      </p>

      <header className="mb-7 flex items-end justify-between gap-7 max-[760px]:block">
        <div>
          <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.13em]" style={{ color: "#729077" }}>
            {PLANNER_KICKER}
          </p>
          <h1
            className="font-medium leading-[1.08] tracking-[-0.035em]"
            style={{
              color: theme.ink,
              fontFamily: theme.fontDisplay,
              fontSize: "clamp(32px, 4.4vw, 46px)",
            }}
          >
            {PLANNER_HEADING}
          </h1>
          <p
            className="mt-3.5 max-w-[590px] text-[14px] leading-[1.8]"
            style={{ color: theme.muted, fontFamily: theme.fontBody }}
          >
            {PLANNER_SUPPORT}
          </p>
        </div>
        <div className="flex flex-col items-end gap-3 max-[760px]:mt-4 max-[760px]:flex-row max-[760px]:items-center max-[760px]:justify-between">
          <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: theme.muted }}>
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            {STORAGE_NOTE}
          </span>
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className={`inline-flex items-center gap-1.5 rounded-[9px] border px-2.5 py-2 text-[11px] font-bold ${plannerFocusClass}`}
            style={{ color: theme.muted, borderColor: theme.line, backgroundColor: "transparent", fontFamily: theme.fontBody }}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Start over
          </button>
        </div>
      </header>

      <div className="mb-6 grid grid-cols-3 overflow-hidden rounded-[14px] border border-[#DCE5DC] bg-[#F1F5ED]" aria-label="How the planner works">
        {FLOW_STEPS.map((step, index) => (
          <div
            key={step.title}
            className={`flex items-center gap-3 px-5 py-4 max-[760px]:block max-[760px]:px-3 max-[760px]:py-3 ${
              index < FLOW_STEPS.length - 1 ? "border-r border-[#DCE5DC]" : ""
            }`}
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#DCE5DC] bg-white text-[11px] font-extrabold text-[#315E4F] max-[760px]:mb-2 max-[760px]:h-6 max-[760px]:w-6">
              {index + 1}
            </span>
            <div>
              <strong className="block text-[12px] font-bold max-[760px]:text-[10px] max-[760px]:leading-snug">
                {step.title}
              </strong>
              <p className="mt-0.5 text-[11px] leading-snug max-[760px]:hidden" style={{ color: theme.muted }}>
                {step.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      {!planner || !view || !selected || !baseline ? (
        <p className="text-[15px]" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
          Loading your scenarios.
        </p>
      ) : (
        <div data-testid="tuition-planner">
          <div className="grid items-start gap-5 min-[761px]:grid-cols-[minmax(0,1fr)_310px] min-[981px]:grid-cols-[minmax(0,1fr)_355px] min-[981px]:gap-[23px]">
            <section
              aria-label="Scenario editor"
              className="overflow-hidden rounded-[22px] border bg-white"
              style={{ borderColor: "#E0E7E0", boxShadow: theme.shadowCard }}
            >
              <header className="border-b px-6 pb-5 pt-6 max-[480px]:px-[17px]" style={{ borderColor: theme.line }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2
                      className="text-[26px] font-medium leading-[1.18] tracking-[-0.035em] max-[480px]:text-[24px]"
                      style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
                    >
                      {WORKSPACE_TITLE}
                    </h2>
                    <p className="mt-1.5 text-[12px] leading-relaxed" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
                      {WORKSPACE_SUPPORT}
                    </p>
                  </div>
                  <PlannerMenu
                    theme={theme}
                    variant="soft"
                    testId="add-scenario"
                    ariaLabel="Add plan"
                    disabled={atCap}
                    label={
                      <span className="inline-flex items-center gap-1.5">
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        Add plan
                      </span>
                    }
                    sections={addMenuSections(planner, handleAdd)}
                  />
                </div>
                {atCap ? (
                  <p className="mt-3 text-[12px]" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
                    {CAP_NOTE}
                  </p>
                ) : null}
                <div
                  role="tablist"
                  aria-label="Tuition plans"
                  className="mt-5 flex gap-1.5 overflow-auto rounded-[10px] bg-[#EAF2EB] p-1"
                >
                  {view.map((row) => {
                    const active = row.scenario.id === planner.selectedId;
                    return (
                      <button
                        key={row.scenario.id}
                        id={`tuition-plan-tab-${row.scenario.id}`}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        aria-controls="planner-editor"
                        onClick={() => setPlanner(selectScenario(planner, row.scenario.id))}
                        className={`flex min-w-[110px] flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[7px] px-3 py-2.5 text-[12px] font-bold max-[480px]:min-w-[108px] max-[480px]:px-2 max-[480px]:text-[11px] ${plannerFocusClass}`}
                        style={{
                          backgroundColor: active ? "#fff" : "transparent",
                          color: active ? theme.primary : "#728079",
                          boxShadow: active ? "0 1px 4px #dbe2dc" : undefined,
                          fontFamily: theme.fontBody,
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: planAccentColor(row.index) }}
                          aria-hidden="true"
                        />
                        {row.scenario.name}
                      </button>
                    );
                  })}
                </div>
              </header>
              <ScenarioCard
                key={selected.scenario.id}
                theme={theme}
                scenario={selected.scenario}
                baseline={baseline}
                baselineName={baselineName}
                result={selected.result}
                isBaseline={selected.isBaseline}
                atCap={atCap}
                canRemove={planner.scenarios.length > 1}
                canMoveEarlier={selected.index > 0}
                canMoveLater={selected.index < planner.scenarios.length - 1}
                labelledBy={`tuition-plan-tab-${selected.scenario.id}`}
                articleRef={(node) => {
                  if (node) cardNodes.current.set(selected.scenario.id, node);
                  else cardNodes.current.delete(selected.scenario.id);
                }}
                onRename={(name) => setPlanner(renameScenario(planner, selected.scenario.id, name))}
                onDuplicate={() => handleAdd("duplicate", selected.scenario.id)}
                onSetBaseline={() => {
                  const next = setBaseline(planner, selected.scenario.id);
                  setPlanner(next);
                  announce(`${selected.scenario.name} is now the baseline.`);
                }}
                onReset={() => {
                  setPlanner(resetScenario(planner, selected.scenario.id));
                  announce(`${selected.scenario.name} reset to its starting assumptions.`);
                }}
                onMove={(direction) => setPlanner(moveScenario(planner, selected.scenario.id, direction))}
                onRemove={() => handleRemove(selected.scenario.id)}
                onUpdateGroup={(groupId, patch) =>
                  setPlanner(updateGroupFields(planner, selected.scenario.id, groupId, patch))
                }
                onToggleAdjustment={(groupId, kind, enabled) =>
                  setPlanner(setAdjustmentEnabled(planner, selected.scenario.id, groupId, kind, enabled))
                }
                onUpdateAdjustment={(groupId, kind, patch) =>
                  setPlanner(updateAdjustmentFields(planner, selected.scenario.id, groupId, kind, patch))
                }
              />
            </section>

            <PlannerResultColumn
              theme={theme}
              baselineName={baselineName}
              selectedId={planner.selectedId}
              rows={view}
              onSelect={(id) => setPlanner(selectScenario(planner, id))}
            />
          </div>

          <div className="mt-7 flex max-w-[810px] items-start gap-3 border-t pt-5" style={{ borderColor: "#DEE5DA" }}>
            <Info className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "#729077" }} aria-hidden="true" />
            <div className="text-[11px] leading-[1.8]" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
              <p>{ASSUMPTIONS_NOTE}</p>
              <p className="mt-1">{STARTING_NOTE}</p>
              <p className="mt-2">
                Need the student count that covers your costs?{" "}
                <Link href="/how-many-students" className="font-bold" style={{ color: theme.primary }}>
                  Students needed
                </Link>
              </p>
            </div>
          </div>

          <section
            className="mb-11 mt-8 flex items-center justify-between gap-6 rounded-2xl border px-6 py-5 max-[480px]:block"
            style={{
              background: "linear-gradient(135deg, #EAF2EB, #F4F7EE)",
              borderColor: "#C7DFCB",
            }}
          >
            <div>
              <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.13em]" style={{ color: "#729077" }}>
                {NEXT_KICKER}
              </p>
              <h2
                className="text-[20px] font-medium tracking-[-0.035em] max-[480px]:text-[19px]"
                style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
              >
                {NEXT_TITLE}
              </h2>
              <p className="mt-1.5 text-[12px] leading-relaxed" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
                {NEXT_SUPPORT}
              </p>
            </div>
            <Link
              href="/get-started"
              className={`mt-0 inline-flex items-center justify-center gap-1.5 rounded-xl border bg-[#FFFDF7] px-4 py-2.5 text-[12px] font-bold max-[480px]:mt-4 max-[480px]:w-full ${plannerFocusClass}`}
              style={{ borderColor: "#B9CDBD", color: theme.primary, fontFamily: theme.fontBody }}
            >
              Explore MudKitchen
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        </div>
      )}

      {confirmReset ? (
        <CalculatorDialog
          theme={theme}
          kicker="Tuition planner"
          title="Start fresh?"
          onClose={() => setConfirmReset(false)}
          actions={
            <>
              <ParentButton theme={theme} variant="outline" onClick={() => setConfirmReset(false)}>
                Keep my plans
              </ParentButton>
              <ParentButton
                theme={theme}
                onClick={() => {
                  const next = starterPlanner();
                  requestFocus(next.selectedId);
                  setPlanner(next);
                  setConfirmReset(false);
                  try {
                    window.localStorage.removeItem(PLANNER_STORAGE_KEY);
                  } catch {
                    // Ignore storage failures.
                  }
                  announce("Scenarios reset to the starting point.");
                }}
              >
                Start over
              </ParentButton>
            </>
          }
        >
          <p className="text-[13px] leading-relaxed" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
            Remove your saved plans and return to the example starting point: $800 monthly tuition, 12 students, and
            10 billing months.
          </p>
        </CalculatorDialog>
      ) : null}

      {toast ? (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-30 max-w-[90%] -translate-x-1/2 rounded-xl px-4 py-3 text-center text-[12px] text-white"
          style={{ backgroundColor: theme.ink, boxShadow: theme.shadowCard }}
        >
          {toast}
        </div>
      ) : null}
    </TuitionPlannerShell>
  );
}

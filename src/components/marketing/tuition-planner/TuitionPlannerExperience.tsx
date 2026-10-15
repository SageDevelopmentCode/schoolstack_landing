"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import CalculatorDialog from "@/components/marketing/enrollment-calculator/CalculatorDialog";
import PlannerResultColumn from "@/components/marketing/tuition-planner/PlannerResultColumn";
import ScenarioCard from "@/components/marketing/tuition-planner/ScenarioCard";
import TuitionPlannerShell from "@/components/marketing/tuition-planner/TuitionPlannerShell";
import {
  ENROLLMENT_CROSS_LINK_LABEL,
  ENROLLMENT_CROSS_LINK_QUESTION,
  NEXT_KICKER,
  NEXT_SUPPORT,
  NEXT_TITLE,
  PLANNER_HEADING,
  PLANNER_KICKER,
  PLANNER_SUPPORT,
} from "@/components/marketing/tuition-planner/planner-copy";
import { plannerFocusClass, TUITION_PLANNER_THEME } from "@/components/marketing/tuition-planner/planner-theme";
import ParentButton from "@/components/school-parent/ui/ParentButton";
import { compareScenario, computeScenario, selectedLiveSummary } from "@/lib/marketing/tuition-scenario-planner";
import {
  PLANNER_STORAGE_KEY,
  addProgramGroup,
  baselineScenario,
  parsePlannerDraft,
  plannerBaselineOnly,
  removeProgramGroup,
  serializePlanner,
  setAdjustmentEnabledForAllGroups,
  starterPlanner,
  updateAdjustmentFieldsForAllGroups,
  updateAllBillingMonths,
  updateGroupFields,
  type PlannerState,
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

function hydratePlanner(raw: string | null): PlannerState {
  const parsed = parsePlannerDraft(raw);
  if (parsed) return parsed;
  return plannerBaselineOnly(starterPlanner());
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
  const editorRef = useRef<HTMLElement | null>(null);
  const seenSummary = useRef<string | null>(null);

  const planner = useMemo(() => {
    if (edits) return plannerBaselineOnly(edits);
    if (storedSnapshot === STORAGE_PENDING) return null;
    return hydratePlanner(storedSnapshot || null);
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
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const baseline = planner ? baselineScenario(planner) : null;
  const result = baseline ? computeScenario(baseline.groups) : null;

  const summary =
    baseline && result
      ? selectedLiveSummary(baseline.name, result, compareScenario(result, result, true))
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

  const updatePlanner = (next: PlannerState) => {
    setPlanner(plannerBaselineOnly(next));
  };

  const scrollToPlannerResults = useCallback(() => {
    document.getElementById("planner-live-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

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
        <div className="flex shrink-0 justify-end max-[760px]:mt-4">
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

      {!planner || !baseline || !result ? (
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
              <ScenarioCard
                key={baseline.id}
                theme={theme}
                scenario={baseline}
                result={result}
                articleRef={(node) => {
                  editorRef.current = node;
                }}
                onUpdateGroup={(groupId, patch) =>
                  updatePlanner(updateGroupFields(planner, baseline.id, groupId, patch))
                }
                onAddGroup={() => updatePlanner(addProgramGroup(planner, baseline.id))}
                onRemoveGroup={(groupId) => updatePlanner(removeProgramGroup(planner, baseline.id, groupId))}
                onUpdateAllBillingMonths={(billingMonths) =>
                  updatePlanner(updateAllBillingMonths(planner, baseline.id, billingMonths))
                }
                onToggleAdjustment={(kind, enabled) =>
                  updatePlanner(setAdjustmentEnabledForAllGroups(planner, baseline.id, kind, enabled))
                }
                onUpdateAdjustment={(kind, patch) =>
                  updatePlanner(updateAdjustmentFieldsForAllGroups(planner, baseline.id, kind, patch))
                }
                onViewResults={scrollToPlannerResults}
              />
            </section>

            <PlannerResultColumn
              theme={theme}
              row={{ scenario: baseline, result }}
            />
          </div>

          <div
            className="mt-7 rounded-2xl border px-5 py-4"
            style={{
              borderColor: "#C7DFCB",
              backgroundColor: "rgba(255, 253, 247, 0.85)",
            }}
          >
            <p
              className="text-[16px] font-medium leading-snug tracking-[-0.02em] max-[480px]:text-[15px]"
              style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
            >
              {ENROLLMENT_CROSS_LINK_QUESTION}
            </p>
            <Link
              href="/how-many-students"
              className={`mt-2.5 inline-flex items-center gap-1.5 text-[14px] font-bold underline-offset-2 hover:underline ${plannerFocusClass}`}
              style={{ color: theme.primary, fontFamily: theme.fontBody }}
            >
              {ENROLLMENT_CROSS_LINK_LABEL}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
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
                Keep my numbers
              </ParentButton>
              <ParentButton
                theme={theme}
                onClick={() => {
                  const next = starterPlanner();
                  setPlanner(next);
                  setConfirmReset(false);
                  try {
                    window.localStorage.removeItem(PLANNER_STORAGE_KEY);
                  } catch {
                    // Ignore storage failures.
                  }
                  announce("Numbers reset to the starting example.");
                }}
              >
                Start over
              </ParentButton>
            </>
          }
        >
          <p className="text-[13px] leading-relaxed" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
            Remove your saved numbers and return to the example starting point: $800 monthly tuition, 12 students, and
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

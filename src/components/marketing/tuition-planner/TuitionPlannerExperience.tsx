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
  PLANNER_SUPPORT,
} from "@/components/marketing/tuition-planner/planner-copy";
import { plannerFocusClass, TUITION_PLANNER_THEME } from "@/components/marketing/tuition-planner/planner-theme";
import MarketingToolHero from "@/components/marketing/shared/MarketingToolHero";
import EmailMyPlan from "@/components/lead-magnets/EmailMyPlan";
import { formatCalculatorMoney } from "@/lib/marketing/enrollment-calculator";
import { toolBtnOutline } from "@/components/marketing/shared/marketing-tool-garden";
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

      <div className="mb-7 flex flex-col gap-4 max-[760px]:block sm:flex-row sm:items-end sm:justify-between">
        <MarketingToolHero
          lead="What would your annual tuition revenue"
          accent="be?"
          description={PLANNER_SUPPORT}
          className="mb-0 flex-1"
        />
        <button type="button" onClick={() => setConfirmReset(true)} className={`${toolBtnOutline} shrink-0 max-[760px]:mt-6`}>
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Start over
        </button>
      </div>

      {!planner || !baseline || !result ? (
        <p className="text-[15px]" style={{ color: theme.muted, fontFamily: theme.fontBody }}>
          Loading your scenarios.
        </p>
      ) : (
        <div data-testid="tuition-planner">
          <div className="grid items-start gap-5 min-[761px]:grid-cols-[minmax(0,1fr)_310px] min-[981px]:grid-cols-[minmax(0,1fr)_355px] min-[981px]:gap-[23px]">
            <section
              aria-label="Scenario editor"
              className="overflow-hidden rounded-[26px] border-2 border-[var(--sf-ink)] bg-white shadow-[0_6px_0_0_var(--sf-ink)]"
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
            className="mt-8 rounded-[22px] border-2 border-dashed border-[var(--sf-ink)]/25 bg-[var(--sf-paper)] px-5 py-4"
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

          <EmailMyPlan
            toolId="tuition-planner"
            className="mt-8"
            getLines={() => {
              const money = (cents: number | null) => (cents === null ? "n/a" : formatCalculatorMoney(cents));
              return [
                "TUITION SCENARIO PLANNER",
                "",
                summary,
                "",
                `Students: ${result.totalStudents}`,
                `Gross annual tuition: ${money(result.grossCents)}`,
                ...(result.annualSiblingDiscountCents
                  ? [`Sibling discounts: -${money(result.annualSiblingDiscountCents)}`]
                  : []),
                ...(result.annualScholarshipCents ? [`Scholarships: -${money(result.annualScholarshipCents)}`] : []),
                `Estimated annual tuition revenue: ${money(result.netCents)}`,
                `Effective monthly tuition per student: ${money(result.effectiveMonthlyTuitionCents)}`,
                ...(result.messages.length ? ["", ...result.messages] : []),
              ];
            }}
          />

          <section
            className="mt-8 flex items-center justify-between gap-6 rounded-[26px] border-2 border-[var(--sf-ink)] bg-[var(--sf-peach)] px-6 py-5 shadow-[0_5px_0_0_var(--sf-ink)] max-[480px]:block"
          >
            <div>
              <p className="mb-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--sf-clay-deep)]">
                {NEXT_KICKER}
              </p>
              <h2 className="sf-display text-[1.6rem] leading-[1.05] text-[var(--sf-ink)] max-[480px]:text-[1.4rem]">
                {NEXT_TITLE}
              </h2>
              <p className="mt-1.5 text-[15px] leading-relaxed text-[var(--sf-ink)]/75">
                {NEXT_SUPPORT}
              </p>
            </div>
            <Link
              href="/get-started"
              className={`${toolBtnOutline} shrink-0 max-[480px]:mt-4 max-[480px]:w-full`}
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

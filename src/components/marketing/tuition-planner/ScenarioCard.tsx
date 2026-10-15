"use client";

import { useState } from "react";
import CalculatorInfoTip from "@/components/marketing/enrollment-calculator/CalculatorInfoTip";
import ScenarioQuestionFlow from "@/components/marketing/tuition-planner/ScenarioQuestionFlow";
import { MULTIPLE_PROGRAMS_NOTE } from "@/components/marketing/tuition-planner/planner-copy";
import type { GroupAdjustment, ProgramGroup, Scenario, ScenarioComputation } from "@/lib/marketing/tuition-scenario-planner";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type AdjustmentKind = "siblingDiscount" | "scholarship";

type ScenarioCardProps = {
  theme: ParentThemeTokens;
  scenario: Scenario;
  result: ScenarioComputation;
  onUpdateGroup: (
    groupId: string,
    patch: Partial<Pick<ProgramGroup, "monthlyTuitionCents" | "enrollment" | "billingMonths" | "label">>,
  ) => void;
  onAddGroup: () => void;
  onRemoveGroup: (groupId: string) => void;
  onUpdateAllBillingMonths: (billingMonths: number) => void;
  onToggleAdjustment: (kind: AdjustmentKind, enabled: boolean) => void;
  onUpdateAdjustment: (
    kind: AdjustmentKind,
    patch: Partial<Pick<GroupAdjustment, "mode" | "percentHundredths" | "amountCents" | "recipientCount">>,
  ) => void;
  articleRef: (node: HTMLElement | null) => void;
  onViewResults: () => void;
};

export default function ScenarioCard({
  theme,
  scenario,
  result,
  onUpdateGroup,
  onAddGroup,
  onRemoveGroup,
  onUpdateAllBillingMonths,
  onToggleAdjustment,
  onUpdateAdjustment,
  articleRef,
  onViewResults,
}: ScenarioCardProps) {
  const [stepByScenario, setStepByScenario] = useState<Record<string, number>>({});

  const stepIndex = stepByScenario[scenario.id] ?? 0;
  const setStepIndex = (index: number) => {
    setStepByScenario((current) => ({ ...current, [scenario.id]: index }));
  };

  return (
    <div
      ref={articleRef}
      id="planner-editor"
      role="region"
      aria-label="Tuition assumptions"
      tabIndex={-1}
      data-testid={`scenario-card-${scenario.id}`}
      className="scroll-mt-28 p-6 outline-none max-[480px]:px-[17px] max-[480px]:py-5"
    >
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <h2
          className="text-[23px] font-medium tracking-[-0.035em]"
          style={{ color: theme.ink, fontFamily: theme.fontDisplay }}
        >
          {scenario.name}
        </h2>
        {scenario.groups.length > 1 ? (
          <span className="inline-flex items-center gap-0.5">
            <MultipleProgramsChip />
            <CalculatorInfoTip
              theme={theme}
              content={MULTIPLE_PROGRAMS_NOTE}
              label="Multiple programs"
              placement="above"
            />
          </span>
        ) : null}
      </div>

      {result.messages.length > 0 ? (
        <ul className="mb-5 space-y-1" role="status">
          {result.messages.map((message) => (
            <li key={message} className="text-[13px] leading-relaxed" style={{ color: theme.alert, fontFamily: theme.fontBody }}>
              {message}
            </li>
          ))}
        </ul>
      ) : null}

      <ScenarioQuestionFlow
        theme={theme}
        scenario={scenario}
        result={result}
        stepIndex={stepIndex}
        onStepIndexChange={setStepIndex}
        onUpdateGroup={onUpdateGroup}
        onAddGroup={onAddGroup}
        onRemoveGroup={onRemoveGroup}
        onUpdateAllBillingMonths={onUpdateAllBillingMonths}
        onToggleAdjustment={onToggleAdjustment}
        onUpdateAdjustment={onUpdateAdjustment}
        onViewResults={onViewResults}
      />
    </div>
  );
}

function MultipleProgramsChip() {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-1 text-[10px] font-extrabold"
      style={{
        backgroundColor: "#EAF2EB",
        color: "#3D5C44",
        fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
      }}
    >
      Multiple programs
    </span>
  );
}

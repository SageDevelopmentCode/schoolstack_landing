import type { ProgramGroup, Scenario } from "@/lib/marketing/tuition-scenario-planner";

export type PlannerQuestionKind =
  | "tuition_all"
  | "enrollment_all"
  | "months"
  | "sibling_toggle"
  | "sibling_details"
  | "scholarship_toggle"
  | "scholarship_details"
  | "done";

export type PlannerQuestionStep = {
  kind: PlannerQuestionKind;
  /** Canonical group for school-wide discount steps (first group). */
  groupId?: string;
};

function canonicalGroup(scenario: Scenario): ProgramGroup | undefined {
  return scenario.groups[0];
}

export function buildPlannerQuestionSteps(scenario: Scenario): PlannerQuestionStep[] {
  const steps: PlannerQuestionStep[] = [];
  steps.push({ kind: "tuition_all" });
  steps.push({ kind: "enrollment_all" });
  steps.push({ kind: "months" });

  const ref = canonicalGroup(scenario);
  if (ref) {
    steps.push({ kind: "sibling_toggle", groupId: ref.id });
    if (ref.siblingDiscount.enabled) {
      steps.push({ kind: "sibling_details", groupId: ref.id });
    }
    steps.push({ kind: "scholarship_toggle", groupId: ref.id });
    if (ref.scholarship.enabled) {
      steps.push({ kind: "scholarship_details", groupId: ref.id });
    }
  }

  steps.push({ kind: "done" });
  return steps;
}

export function findGroup(scenario: Scenario, groupId: string | undefined): ProgramGroup | undefined {
  if (!groupId) return undefined;
  return scenario.groups.find((group) => group.id === groupId);
}

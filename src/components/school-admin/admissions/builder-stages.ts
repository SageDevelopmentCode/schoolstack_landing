import type { BuilderFocus } from "./builder-focus";
import type { ReadinessItem } from "./flows/flowReadiness";

/*
 * Stages of the application form builder. The builder shows one stage at a
 * time (stepper + Back/Next) instead of every editor at once. The stage is
 * always derived from `BuilderFocus`, so there is one source of truth.
 */

export type BuilderStage = "basics" | "questions" | "payments" | "afterSubmit" | "review";

export type BuilderStageInfo = {
  id: BuilderStage;
  label: string;
  description: string;
};

export const BUILDER_STAGES: readonly BuilderStageInfo[] = [
  {
    id: "basics",
    label: "Basics",
    description: "Name the form, welcome families and choose where it lives.",
  },
  {
    id: "questions",
    label: "Questions",
    description: "The steps and questions families answer.",
  },
  {
    id: "payments",
    label: "Fees & agreements",
    description: "What families pay and confirm before they submit.",
  },
  {
    id: "afterSubmit",
    label: "After submit",
    description: "What families do once their application is in.",
  },
  {
    id: "review",
    label: "Review & publish",
    description: "Check everything and share the form.",
  },
];

export const BUILDER_STAGE_IDS: readonly BuilderStage[] = BUILDER_STAGES.map((stage) => stage.id);

export function isBuilderStage(value: unknown): value is BuilderStage {
  return typeof value === "string" && (BUILDER_STAGE_IDS as readonly string[]).includes(value);
}

export function stageInfo(stage: BuilderStage): BuilderStageInfo {
  return BUILDER_STAGES.find((entry) => entry.id === stage) ?? BUILDER_STAGES[0];
}

export function stageIndex(stage: BuilderStage): number {
  return BUILDER_STAGE_IDS.indexOf(stage);
}

export function stageOfFocus(focus: BuilderFocus): BuilderStage {
  switch (focus.kind) {
    case "setup":
      return "basics";
    case "step":
    case "field":
      return "questions";
    case "fee":
    case "acknowledgments":
      return "payments";
    case "postSubmit":
      return "afterSubmit";
    case "review":
      return "review";
  }
}

/** Where the builder lands when the admin opens a stage. */
export function focusForStage(
  stage: BuilderStage,
  sections: ReadonlyArray<{ id: string }>,
  lastStepId?: string | null,
): BuilderFocus {
  switch (stage) {
    case "basics":
      return { kind: "setup" };
    case "questions": {
      const remembered = lastStepId ? sections.find((section) => section.id === lastStepId) : undefined;
      const step = remembered ?? sections[0];
      // No steps yet: the Questions stage still renders (empty state + Add step).
      return step ? { kind: "step", stepId: step.id } : { kind: "step", stepId: "" };
    }
    case "payments":
      return { kind: "fee" };
    case "afterSubmit":
      return { kind: "postSubmit" };
    case "review":
      return { kind: "review" };
  }
}

export type StageStatus = "done" | "todo" | "warning" | "none";

/**
 * Per-stage status built only from the publish readiness items (no new rules):
 * todo if a blocking item points into the stage, warning if a warning does,
 * done if the stage has items and all are done, none if nothing points there.
 * Review is done when nothing blocks publishing.
 */
export function stageStatuses(items: readonly ReadinessItem[]): Record<BuilderStage, StageStatus> {
  const result: Record<BuilderStage, StageStatus> = {
    basics: "none",
    questions: "none",
    payments: "none",
    afterSubmit: "none",
    review: "none",
  };
  const rank: Record<StageStatus, number> = { none: 0, done: 1, warning: 2, todo: 3 };
  for (const item of items) {
    if (!item.target) continue;
    const stage = stageOfFocus(item.target);
    if (rank[item.status] > rank[result[stage]]) {
      result[stage] = item.status;
    }
  }
  if (items.length > 0) {
    result.review = items.some((item) => item.status === "todo") ? "todo" : "done";
  }
  return result;
}

/** First stage holding a blocking item, else Basics (drafts open here). */
export function firstStageNeedingWork(items: readonly ReadinessItem[]): BuilderStage {
  for (const stage of BUILDER_STAGE_IDS) {
    if (stage === "review") continue;
    if (items.some((item) => item.status === "todo" && item.target && stageOfFocus(item.target) === stage)) {
      return stage;
    }
  }
  return "basics";
}

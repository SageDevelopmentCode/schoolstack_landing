/**
 * Where a prospect school is in the outreach funnel, for the /admin/research workspace.
 * Pure: built on `nextOutreachStep()`, so the funnel, the send API and the plan validator agree.
 */
import type { CrmStatus } from "@/lib/admin-crm/crm-status";
import { nextOutreachStep, type CompletedStep } from "@/lib/admin-crm/outreach-email";
import { SNAPSHOT_LINK_TOKEN, type OutreachPlan, type OutreachStep, type OutreachStepId } from "@/data/outreach/types";

export const OUTREACH_STEP_IDS: OutreachStepId[] = ["first", "follow-1", "social", "follow-2", "close"];

/** Funnel lanes, left to right. `step:*` means "this step is next". */
export type FunnelStage =
  | "not_started"
  | "needs_demo"
  | "needs_plan"
  | `step:${OutreachStepId}`
  | "finished"
  | "replied"
  | "call_booked"
  | "proposal"
  | "won"
  | "not_interested"
  | "nurturing"
  | "do_not_email";

/** The tunnel: the sequence, then the outcomes it should lead to. */
export const FUNNEL_MAIN_STAGES: FunnelStage[] = [
  "needs_plan",
  "step:first",
  "step:follow-1",
  "step:social",
  "step:follow-2",
  "step:close",
  "replied",
  "call_booked",
  "proposal",
  "won",
];

/** Quieter lanes shown beside the tunnel. */
export const FUNNEL_SIDE_STAGES: FunnelStage[] = [
  "finished",
  "nurturing",
  "not_interested",
  "do_not_email",
  "needs_demo",
  "not_started",
];

export const FUNNEL_STAGE_LABEL: Record<FunnelStage, string> = {
  not_started: "Not started",
  needs_demo: "Needs a demo",
  needs_plan: "Needs a plan",
  "step:first": "First email",
  "step:follow-1": "Walkthrough",
  "step:social": "Social hello",
  "step:follow-2": "Snapshot & proof",
  "step:close": "Close",
  finished: "Sequence finished",
  replied: "Replied",
  call_booked: "Call booked",
  proposal: "Proposal sent",
  won: "Won",
  not_interested: "Not interested",
  nurturing: "Nurturing",
  do_not_email: "Do not email",
};

export type JourneyStepStatus = "done" | "current" | "upcoming";

export type JourneyStep = {
  id: OutreachStepId;
  /** 1-based position in the plan. */
  number: number;
  label: string;
  kind: OutreachStep["kind"];
  status: JourneyStepStatus;
  /** When it was sent or logged. */
  at: string | null;
  /** When it is due (current step only, after the first email). */
  dueAt: string | null;
};

export type OutreachJourney = {
  stage: FunnelStage;
  /** Steps of the plan (empty without a plan). */
  steps: JourneyStep[];
  /** The step to do next, when the sequence is running. */
  next: JourneyStep | null;
  /** True when the next step can go out today (ready first email, or a follow-up that's due). */
  actionable: boolean;
  /** True when the next step is a follow-up that's due today or overdue. */
  due: boolean;
  isRecontact: boolean;
};

/** Short label for a plan step ("Re-intro" for a re-contact first email, "Snapshot" when it links one). */
export function journeyStepLabel(step: OutreachStep, plan: Pick<OutreachPlan, "priorContact">): string {
  switch (step.id) {
    case "first":
      return plan.priorContact ? "Re-intro" : "First email";
    case "follow-1":
      return "Walkthrough";
    case "social":
      return "Social hello";
    case "follow-2":
      return step.body.includes(SNAPSHOT_LINK_TOKEN) ? "Snapshot & proof" : "Proof";
    case "close":
      return "Close";
  }
}

const OUTCOME_STAGE: Partial<Record<CrmStatus, FunnelStage>> = {
  replied: "replied",
  demo_scheduled: "call_booked",
  proposal_sent: "proposal",
  won: "won",
  not_interested: "not_interested",
};

export function outreachJourney(input: {
  plan: OutreachPlan | null;
  completed: CompletedStep[];
  crmStatus: CrmStatus;
  hasDemo: boolean;
  now?: Date;
}): OutreachJourney {
  const { plan, completed, crmStatus, hasDemo } = input;
  const doneAt = new Map(completed.map((c) => [c.stepId, c.at]));
  const next = nextOutreachStep({ plan, completed, crmStatus, now: input.now });

  const steps: JourneyStep[] = (plan?.steps ?? []).map((step, index) => {
    const at = doneAt.get(step.id) ?? null;
    const isCurrent = !at && next.step?.id === step.id;
    return {
      id: step.id,
      number: index + 1,
      label: journeyStepLabel(step, plan!),
      kind: step.kind,
      status: at ? "done" : isCurrent ? "current" : "upcoming",
      at,
      dueAt: isCurrent ? next.dueAt : null,
    };
  });
  const current = steps.find((s) => s.status === "current") ?? null;
  const base = { steps, isRecontact: Boolean(plan?.priorContact) };

  const outcome = OUTCOME_STAGE[crmStatus];
  if (outcome) return { ...base, stage: outcome, next: null, actionable: false, due: false };
  if (plan?.doNotEmail) return { ...base, stage: "do_not_email", next: null, actionable: false, due: false };

  if (!plan) {
    const stage: FunnelStage = hasDemo
      ? crmStatus === "nurturing"
        ? "nurturing"
        : "needs_plan"
      : crmStatus === "not_contacted"
        ? "not_started"
        : crmStatus === "nurturing"
          ? "nurturing"
          : "needs_demo";
    return { ...base, stage, next: null, actionable: false, due: false };
  }

  if (!current) {
    // Every step is done (or the plan has no steps left): the sequence ran its course.
    return { ...base, stage: crmStatus === "nurturing" ? "nurturing" : "finished", next: null, actionable: false, due: false };
  }

  const due = next.stage === "due";
  return {
    ...base,
    stage: `step:${current.id}`,
    next: current,
    actionable: next.stage === "ready" || due,
    due,
  };
}

/** Counts per lane, plus how many in each lane can be worked today. */
export function funnelCounts(journeys: OutreachJourney[]): Record<FunnelStage, { total: number; actionable: number }> {
  const counts = Object.fromEntries(
    [...FUNNEL_MAIN_STAGES, ...FUNNEL_SIDE_STAGES].map((stage) => [stage, { total: 0, actionable: 0 }]),
  ) as Record<FunnelStage, { total: number; actionable: number }>;
  for (const journey of journeys) {
    const lane = counts[journey.stage];
    lane.total += 1;
    if (journey.actionable) lane.actionable += 1;
  }
  return counts;
}

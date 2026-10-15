/**
 * Scenario list operations for the tuition planner.
 * Derived revenue is never stored here — only assumptions.
 */

import {
  DEFAULT_BILLING_MONTHS,
  GROW_ENROLLMENT_BY,
  PART_TIME_ENROLLMENT,
  RAISE_TUITION_CENTS,
  STARTER_ENROLLMENT,
  STARTER_TUITION_CENTS,
  clampAdjustmentAmount,
  clampBillingMonths,
  clampEnrollment,
  clampPercentHundredths,
  clampRecipientCount,
  clampTuitionCents,
  emptyAdjustment,
  halfTuitionToNearestDollar,
  type DiscountMode,
  type GroupAdjustment,
  type ProgramGroup,
  type Scenario,
} from "@/lib/marketing/tuition-scenario-planner";

export const MAX_SCENARIOS = 8;
export const MAX_PROGRAM_GROUPS = 4;
export const PLANNER_STORAGE_KEY = "mudkitchen.tuition-planner.v1";
export const MAX_SCENARIO_NAME_LENGTH = 80;

const DEFAULT_SINGLE_GROUP_LABEL = "All students";

export type PlannerState = {
  scenarios: Scenario[];
  baselineId: string;
  selectedId: string;
};

export type ScenarioTemplate =
  | "from-baseline"
  | "raise-tuition"
  | "raise-tuition-lose-student"
  | "grow-enrollment"
  | "part-time"
  | "duplicate";

export type AddScenarioResult = {
  state: PlannerState;
  addedId: string | null;
  capped: boolean;
};

export type RemoveScenarioResult = {
  state: PlannerState;
  blocked: boolean;
  promotedBaselineName: string | null;
  focusId: string | null;
};

export function createPlannerId(): string {
  return crypto.randomUUID();
}

export function cloneAdjustment(adjustment: GroupAdjustment): GroupAdjustment {
  return { ...adjustment };
}

export function cloneGroup(group: ProgramGroup, id = createPlannerId()): ProgramGroup {
  return {
    ...group,
    id,
    siblingDiscount: cloneAdjustment(group.siblingDiscount),
    scholarship: cloneAdjustment(group.scholarship),
  };
}

export function cloneGroups(groups: ProgramGroup[]): ProgramGroup[] {
  return groups.map((group) => cloneGroup(group));
}

function createGroup(input: {
  id?: string;
  label?: string;
  monthlyTuitionCents: number;
  enrollment: number;
  billingMonths?: number;
  siblingDiscount?: GroupAdjustment;
  scholarship?: GroupAdjustment;
}): ProgramGroup {
  return {
    id: input.id ?? createPlannerId(),
    label: input.label ?? "Full-time",
    monthlyTuitionCents: input.monthlyTuitionCents,
    enrollment: input.enrollment,
    billingMonths: input.billingMonths ?? DEFAULT_BILLING_MONTHS,
    siblingDiscount: input.siblingDiscount
      ? cloneAdjustment(input.siblingDiscount)
      : emptyAdjustment(),
    scholarship: input.scholarship ? cloneAdjustment(input.scholarship) : emptyAdjustment(),
  };
}

function withOrigin(scenario: Omit<Scenario, "originGroups"> & { originGroups?: ProgramGroup[] }): Scenario {
  const originGroups = scenario.originGroups ?? cloneGroups(scenario.groups);
  return {
    id: scenario.id,
    name: scenario.name,
    groups: scenario.groups,
    originGroups,
  };
}

export function starterPlanner(): PlannerState {
  const currentGroup = createGroup({
    id: "current-group",
    label: DEFAULT_SINGLE_GROUP_LABEL,
    monthlyTuitionCents: STARTER_TUITION_CENTS,
    enrollment: STARTER_ENROLLMENT,
  });
  const current = withOrigin({
    id: "current",
    name: "Current",
    groups: [currentGroup],
  });
  return {
    scenarios: [current],
    baselineId: current.id,
    selectedId: current.id,
  };
}

/** Marketing planner keeps one editable baseline; drop extra scenarios from saved drafts. */
export function plannerBaselineOnly(state: PlannerState): PlannerState {
  const baseline = baselineScenario(state);
  return {
    scenarios: [baseline],
    baselineId: baseline.id,
    selectedId: baseline.id,
  };
}

export function baselineScenario(state: PlannerState): Scenario {
  return state.scenarios.find((scenario) => scenario.id === state.baselineId) ?? state.scenarios[0];
}

function normalizeName(name: string, fallback: string): string {
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (!trimmed) return fallback;
  return trimmed.slice(0, MAX_SCENARIO_NAME_LENGTH);
}

function scenarioFromGroups(name: string, groups: ProgramGroup[]): Scenario {
  const cloned = cloneGroups(groups);
  return withOrigin({
    id: createPlannerId(),
    name,
    groups: cloned,
  });
}

function raiseGroups(groups: ProgramGroup[]): ProgramGroup[] {
  return groups.map((group) =>
    cloneGroup({
      ...group,
      monthlyTuitionCents: clampTuitionCents(group.monthlyTuitionCents + RAISE_TUITION_CENTS),
    }),
  );
}

function templateGroups(state: PlannerState, template: ScenarioTemplate, sourceId?: string): {
  name: string;
  groups: ProgramGroup[];
} | null {
  if (template === "duplicate") {
    const source = state.scenarios.find((scenario) => scenario.id === sourceId);
    if (!source) return null;
    return {
      name: normalizeName(`${source.name} copy`, "Scenario copy"),
      groups: cloneGroups(source.groups),
    };
  }

  const baseline = baselineScenario(state);
  if (template === "from-baseline") {
    return {
      name: normalizeName(`${baseline.name} copy`, "Scenario copy"),
      groups: cloneGroups(baseline.groups),
    };
  }
  if (template === "raise-tuition") {
    return { name: "Tuition increase", groups: raiseGroups(baseline.groups) };
  }
  if (template === "raise-tuition-lose-student") {
    const groups = raiseGroups(baseline.groups);
    if (groups[0]) {
      groups[0] = {
        ...groups[0],
        enrollment: Math.max(0, groups[0].enrollment - 1),
      };
    }
    return { name: "Tuition increase, one student leaves", groups };
  }
  if (template === "grow-enrollment") {
    const groups = cloneGroups(baseline.groups);
    if (groups[0]) {
      groups[0] = {
        ...groups[0],
        enrollment: clampEnrollment(groups[0].enrollment + GROW_ENROLLMENT_BY),
      };
    }
    return { name: "Grow enrollment by two", groups };
  }

  const primary = baseline.groups[0];
  if (!primary) return null;
  const fullTime = cloneGroup({
    ...primary,
    label: "Full-time",
  });
  const partTime = createGroup({
    label: "Part-time",
    monthlyTuitionCents: halfTuitionToNearestDollar(primary.monthlyTuitionCents),
    enrollment: PART_TIME_ENROLLMENT,
    billingMonths: clampBillingMonths(primary.billingMonths),
  });
  return { name: "Part-time program", groups: [fullTime, partTime] };
}

export function addScenario(
  state: PlannerState,
  template: ScenarioTemplate,
  sourceId?: string,
): AddScenarioResult {
  if (state.scenarios.length >= MAX_SCENARIOS) {
    return { state, addedId: null, capped: true };
  }
  const built = templateGroups(state, template, sourceId);
  if (!built) return { state, addedId: null, capped: false };
  const scenario = scenarioFromGroups(built.name, built.groups);
  return {
    state: {
      ...state,
      scenarios: [...state.scenarios, scenario],
      selectedId: scenario.id,
    },
    addedId: scenario.id,
    capped: false,
  };
}

export function renameScenario(state: PlannerState, scenarioId: string, name: string): PlannerState {
  return {
    ...state,
    scenarios: state.scenarios.map((scenario) => {
      if (scenario.id !== scenarioId) return scenario;
      return { ...scenario, name: normalizeName(name, scenario.name) };
    }),
  };
}

export function removeScenario(state: PlannerState, scenarioId: string): RemoveScenarioResult {
  if (state.scenarios.length <= 1) {
    return { state, blocked: true, promotedBaselineName: null, focusId: state.scenarios[0]?.id ?? null };
  }
  const index = state.scenarios.findIndex((scenario) => scenario.id === scenarioId);
  if (index < 0) {
    return { state, blocked: false, promotedBaselineName: null, focusId: state.selectedId };
  }
  const remaining = state.scenarios.filter((scenario) => scenario.id !== scenarioId);
  const neighbor = remaining[Math.min(index, remaining.length - 1)];
  let baselineId = state.baselineId;
  let promotedBaselineName: string | null = null;
  if (state.baselineId === scenarioId) {
    baselineId = neighbor.id;
    promotedBaselineName = neighbor.name;
  }
  const selectedId = state.selectedId === scenarioId ? neighbor.id : state.selectedId;
  return {
    state: { scenarios: remaining, baselineId, selectedId },
    blocked: false,
    promotedBaselineName,
    focusId: neighbor.id,
  };
}

export function setBaseline(state: PlannerState, scenarioId: string): PlannerState {
  if (!state.scenarios.some((scenario) => scenario.id === scenarioId)) return state;
  return { ...state, baselineId: scenarioId, selectedId: scenarioId };
}

export function selectScenario(state: PlannerState, scenarioId: string): PlannerState {
  if (state.selectedId === scenarioId) return state;
  if (!state.scenarios.some((scenario) => scenario.id === scenarioId)) return state;
  return { ...state, selectedId: scenarioId };
}

export function moveScenario(
  state: PlannerState,
  scenarioId: string,
  direction: "earlier" | "later",
): PlannerState {
  const index = state.scenarios.findIndex((scenario) => scenario.id === scenarioId);
  if (index < 0) return state;
  const target = direction === "earlier" ? index - 1 : index + 1;
  if (target < 0 || target >= state.scenarios.length) return state;
  const scenarios = state.scenarios.slice();
  const current = scenarios[index];
  const neighbor = scenarios[target];
  if (!current || !neighbor) return state;
  scenarios[index] = neighbor;
  scenarios[target] = current;
  return { ...state, scenarios };
}

export function resetScenario(state: PlannerState, scenarioId: string): PlannerState {
  return {
    ...state,
    scenarios: state.scenarios.map((scenario) => {
      if (scenario.id !== scenarioId) return scenario;
      const groups = scenario.originGroups.map((originGroup, index) =>
        cloneGroup(originGroup, scenario.groups[index]?.id ?? createPlannerId()),
      );
      return { ...scenario, groups };
    }),
  };
}

function mapGroup(
  state: PlannerState,
  scenarioId: string,
  groupId: string,
  update: (group: ProgramGroup) => ProgramGroup,
): PlannerState {
  return {
    ...state,
    scenarios: state.scenarios.map((scenario) => {
      if (scenario.id !== scenarioId) return scenario;
      return {
        ...scenario,
        groups: scenario.groups.map((group) => (group.id === groupId ? update(group) : group)),
      };
    }),
  };
}

export function updateGroupFields(
  state: PlannerState,
  scenarioId: string,
  groupId: string,
  patch: Partial<Pick<ProgramGroup, "monthlyTuitionCents" | "enrollment" | "billingMonths" | "label">>,
): PlannerState {
  return mapGroup(state, scenarioId, groupId, (group) => ({
    ...group,
    label:
      patch.label === undefined
        ? group.label
        : patch.label.trim() === ""
          ? ""
          : normalizeName(patch.label, group.label),
    monthlyTuitionCents:
      patch.monthlyTuitionCents === undefined
        ? group.monthlyTuitionCents
        : clampTuitionCents(patch.monthlyTuitionCents),
    enrollment: patch.enrollment === undefined ? group.enrollment : clampEnrollment(patch.enrollment),
    billingMonths:
      patch.billingMonths === undefined ? group.billingMonths : clampBillingMonths(patch.billingMonths),
  }));
}

function scenarioById(state: PlannerState, scenarioId: string): Scenario | undefined {
  return state.scenarios.find((scenario) => scenario.id === scenarioId);
}

export function addProgramGroup(state: PlannerState, scenarioId: string): PlannerState {
  const scenario = scenarioById(state, scenarioId);
  if (!scenario || scenario.groups.length >= MAX_PROGRAM_GROUPS) return state;
  const primary = scenario.groups[0];
  return {
    ...state,
    scenarios: state.scenarios.map((item) => {
      if (item.id !== scenarioId) return item;
      let groups = [...item.groups];
      const sole = groups[0];
      if (groups.length === 1 && sole?.label === DEFAULT_SINGLE_GROUP_LABEL) {
        groups[0] = { ...sole, label: "" };
      }
      const newGroup = createGroup({
        label: "",
        monthlyTuitionCents: primary?.monthlyTuitionCents ?? STARTER_TUITION_CENTS,
        enrollment: 0,
        billingMonths: primary?.billingMonths ?? DEFAULT_BILLING_MONTHS,
      });
      groups = [...groups, newGroup];
      return { ...item, groups };
    }),
  };
}

export function removeProgramGroup(state: PlannerState, scenarioId: string, groupId: string): PlannerState {
  const scenario = scenarioById(state, scenarioId);
  if (!scenario || scenario.groups.length <= 1) return state;
  const remaining = scenario.groups.filter((group) => group.id !== groupId);
  if (remaining.length === scenario.groups.length) return state;
  const groups =
    remaining.length === 1 && remaining[0]
      ? [{ ...remaining[0], label: DEFAULT_SINGLE_GROUP_LABEL }]
      : remaining;
  return {
    ...state,
    scenarios: state.scenarios.map((item) => (item.id === scenarioId ? { ...item, groups } : item)),
  };
}

export function updateAllBillingMonths(
  state: PlannerState,
  scenarioId: string,
  billingMonths: number,
): PlannerState {
  const scenario = scenarioById(state, scenarioId);
  if (!scenario) return state;
  let next = state;
  for (const group of scenario.groups) {
    next = updateGroupFields(next, scenarioId, group.id, { billingMonths });
  }
  return next;
}

export function setAdjustmentEnabledForAllGroups(
  state: PlannerState,
  scenarioId: string,
  kind: "siblingDiscount" | "scholarship",
  enabled: boolean,
): PlannerState {
  const scenario = scenarioById(state, scenarioId);
  if (!scenario) return state;
  const totalEnrollment = scenario.groups.reduce(
    (sum, group) => sum + (group.enrollment > 0 ? group.enrollment : 0),
    0,
  );
  let next = state;
  scenario.groups.forEach((group, index) => {
    if (!enabled) {
      next = setAdjustmentEnabled(next, scenarioId, group.id, kind, false);
      return;
    }
    next = mapGroup(next, scenarioId, group.id, (current) => {
      const adjustment = current[kind];
      if (!blankAdjustment(adjustment)) {
        return {
          ...current,
          [kind]: {
            ...adjustment,
            enabled: true,
            recipientCount: index === 0 ? adjustment.recipientCount : 0,
          },
        };
      }
      const seedEnrollment = index === 0 ? totalEnrollment : 0;
      return { ...current, [kind]: withDefaults(kind, seedEnrollment) };
    });
  });
  return next;
}

export function updateAdjustmentFieldsForAllGroups(
  state: PlannerState,
  scenarioId: string,
  kind: "siblingDiscount" | "scholarship",
  patch: Partial<Pick<GroupAdjustment, "mode" | "percentHundredths" | "amountCents" | "recipientCount">>,
): PlannerState {
  const scenario = scenarioById(state, scenarioId);
  if (!scenario) return state;
  const firstGroupId = scenario.groups[0]?.id;
  let next = state;
  for (const group of scenario.groups) {
    if (patch.recipientCount !== undefined && group.id !== firstGroupId) {
      const { recipientCount: _ignored, ...ratePatch } = patch;
      next = updateAdjustmentFields(next, scenarioId, group.id, kind, {
        ...ratePatch,
        recipientCount: 0,
      });
      continue;
    }
    next = updateAdjustmentFields(next, scenarioId, group.id, kind, patch);
  }
  return next;
}

function blankAdjustment(adjustment: GroupAdjustment): boolean {
  return (
    !adjustment.enabled &&
    adjustment.percentHundredths === 0 &&
    adjustment.amountCents === 0 &&
    adjustment.recipientCount === 0
  );
}

function withDefaults(kind: "siblingDiscount" | "scholarship", enrollment: number): GroupAdjustment {
  if (kind === "siblingDiscount") {
    return {
      enabled: true,
      mode: "percent",
      percentHundredths: 1_000,
      amountCents: 0,
      recipientCount: enrollment > 0 ? 1 : 0,
    };
  }
  return {
    enabled: true,
    mode: "fixed",
    percentHundredths: 0,
    amountCents: 10_000,
    recipientCount: enrollment > 0 ? 1 : 0,
  };
}

export function setAdjustmentEnabled(
  state: PlannerState,
  scenarioId: string,
  groupId: string,
  kind: "siblingDiscount" | "scholarship",
  enabled: boolean,
): PlannerState {
  return mapGroup(state, scenarioId, groupId, (group) => {
    const current = group[kind];
    if (!enabled) {
      return { ...group, [kind]: { ...current, enabled: false } };
    }
    if (blankAdjustment(current)) {
      return { ...group, [kind]: withDefaults(kind, group.enrollment) };
    }
    return { ...group, [kind]: { ...current, enabled: true } };
  });
}

export function updateAdjustmentFields(
  state: PlannerState,
  scenarioId: string,
  groupId: string,
  kind: "siblingDiscount" | "scholarship",
  patch: Partial<Pick<GroupAdjustment, "mode" | "percentHundredths" | "amountCents" | "recipientCount">>,
): PlannerState {
  return mapGroup(state, scenarioId, groupId, (group) => {
    const current = group[kind];
    const mode: DiscountMode = patch.mode ?? current.mode;
    return {
      ...group,
      [kind]: {
        ...current,
        mode,
        percentHundredths:
          patch.percentHundredths === undefined
            ? current.percentHundredths
            : clampPercentHundredths(patch.percentHundredths),
        amountCents:
          patch.amountCents === undefined ? current.amountCents : clampAdjustmentAmount(patch.amountCents),
        recipientCount:
          patch.recipientCount === undefined
            ? current.recipientCount
            : clampRecipientCount(patch.recipientCount),
      },
    };
  });
}

function assumptionsSignature(state: PlannerState): string {
  return JSON.stringify({
    baselineId: state.baselineId,
    scenarios: state.scenarios.map((scenario) => ({
      name: scenario.name,
      groups: scenario.groups.map((group) => ({
        label: group.label,
        monthlyTuitionCents: group.monthlyTuitionCents,
        enrollment: group.enrollment,
        billingMonths: group.billingMonths,
        siblingDiscount: group.siblingDiscount,
        scholarship: group.scholarship,
      })),
    })),
  });
}

export function isStarterPlanner(state: PlannerState): boolean {
  return assumptionsSignature(state) === assumptionsSignature(starterPlanner());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseAdjustment(value: unknown): GroupAdjustment | null {
  if (!isRecord(value)) return null;
  const mode = value.mode === "fixed" || value.mode === "percent" ? value.mode : null;
  if (!mode) return null;
  if (typeof value.enabled !== "boolean") return null;
  if (typeof value.percentHundredths !== "number") return null;
  if (typeof value.amountCents !== "number") return null;
  if (typeof value.recipientCount !== "number") return null;
  return {
    enabled: value.enabled,
    mode,
    percentHundredths: clampPercentHundredths(value.percentHundredths),
    amountCents: clampAdjustmentAmount(value.amountCents),
    recipientCount: clampRecipientCount(value.recipientCount),
  };
}

function parseGroup(value: unknown): ProgramGroup | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || !value.id) return null;
  if (typeof value.label !== "string") return null;
  if (typeof value.monthlyTuitionCents !== "number") return null;
  if (typeof value.enrollment !== "number") return null;
  if (typeof value.billingMonths !== "number") return null;
  const siblingDiscount = parseAdjustment(value.siblingDiscount);
  const scholarship = parseAdjustment(value.scholarship);
  if (!siblingDiscount || !scholarship) return null;
  return {
    id: value.id,
    label: value.label.trim() === "" ? "" : normalizeName(value.label, "Full-time"),
    monthlyTuitionCents: clampTuitionCents(value.monthlyTuitionCents),
    enrollment: clampEnrollment(value.enrollment),
    billingMonths: clampBillingMonths(value.billingMonths),
    siblingDiscount,
    scholarship,
  };
}

function normalizeSchoolWideRecipientCounts(groups: ProgramGroup[]): ProgramGroup[] {
  if (groups.length <= 1) return groups;
  return groups.map((group, index) => {
    if (index === 0) return group;
    return {
      ...group,
      siblingDiscount: { ...group.siblingDiscount, recipientCount: 0 },
      scholarship: { ...group.scholarship, recipientCount: 0 },
    };
  });
}

function parseScenario(value: unknown): Scenario | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || !value.id) return null;
  if (typeof value.name !== "string") return null;
  if (!Array.isArray(value.groups) || value.groups.length < 1 || value.groups.length > MAX_PROGRAM_GROUPS) {
    return null;
  }
  if (
    !Array.isArray(value.originGroups) ||
    value.originGroups.length < 1 ||
    value.originGroups.length > MAX_PROGRAM_GROUPS
  ) {
    return null;
  }
  const groups = value.groups.map(parseGroup);
  const originGroups = value.originGroups.map(parseGroup);
  if (groups.some((group) => group === null) || originGroups.some((group) => group === null)) return null;
  const parsedGroups = normalizeSchoolWideRecipientCounts(groups as ProgramGroup[]);
  const parsedOriginGroups = normalizeSchoolWideRecipientCounts(originGroups as ProgramGroup[]);
  return {
    id: value.id,
    name: normalizeName(value.name, "Scenario"),
    groups: parsedGroups,
    originGroups: parsedOriginGroups,
  };
}

export function parsePlannerDraft(raw: string | null): PlannerState | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(parsed) || parsed.version !== 1) return null;
  if (!Array.isArray(parsed.scenarios) || parsed.scenarios.length < 1 || parsed.scenarios.length > MAX_SCENARIOS) {
    return null;
  }
  const scenarios = parsed.scenarios.map(parseScenario);
  if (scenarios.some((scenario) => scenario === null)) return null;
  const list = scenarios as Scenario[];
  const ids = new Set(list.map((scenario) => scenario.id));
  if (ids.size !== list.length) return null;
  if (typeof parsed.baselineId !== "string" || !ids.has(parsed.baselineId)) return null;
  const selectedId =
    typeof parsed.selectedId === "string" && ids.has(parsed.selectedId)
      ? parsed.selectedId
      : parsed.baselineId;
  return plannerBaselineOnly({ scenarios: list, baselineId: parsed.baselineId, selectedId });
}

export function serializePlanner(state: PlannerState): string {
  return JSON.stringify({ version: 1, ...plannerBaselineOnly(state) });
}

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  compareScenario,
  computeGroup,
  computeScenario,
  formatAnnualDifference,
  formatPercentageChange,
  halfTuitionToNearestDollar,
  percentageChange,
  scenarioInsights,
  type GroupAdjustment,
  type ProgramGroup,
  type Scenario,
} from "./tuition-scenario-planner";
import { buildPlannerQuestionSteps } from "@/components/marketing/tuition-planner/planner-question-steps";
import {
  addProgramGroup,
  addScenario,
  baselineScenario,
  isStarterPlanner,
  moveScenario,
  parsePlannerDraft,
  removeProgramGroup,
  removeScenario,
  renameScenario,
  resetScenario,
  serializePlanner,
  setAdjustmentEnabled,
  setAdjustmentEnabledForAllGroups,
  setBaseline,
  starterPlanner,
  updateAdjustmentFields,
  updateAllBillingMonths,
  updateGroupFields,
} from "./tuition-scenario-state";

function withHypotheticalScenario(state = starterPlanner()) {
  const added = addScenario(state, "from-baseline");
  assert.ok(added.addedId);
  const hypothetical = added.state.scenarios.find((item) => item.id === added.addedId);
  assert.ok(hypothetical?.groups[0]);
  return {
    state: added.state,
    hypotheticalId: added.addedId,
    hypotheticalGroupId: hypothetical.groups[0].id,
    hypotheticalName: hypothetical.name,
  };
}

function adjustment(patch: Partial<GroupAdjustment> = {}): GroupAdjustment {
  return {
    enabled: false,
    mode: "percent",
    percentHundredths: 0,
    amountCents: 0,
    recipientCount: 0,
    ...patch,
  };
}

function group(patch: Partial<ProgramGroup> = {}): ProgramGroup {
  return {
    id: patch.id ?? "group",
    label: patch.label ?? "Full-time",
    monthlyTuitionCents: patch.monthlyTuitionCents ?? 80_000,
    enrollment: patch.enrollment ?? 12,
    billingMonths: patch.billingMonths ?? 10,
    siblingDiscount: patch.siblingDiscount ?? adjustment(),
    scholarship: patch.scholarship ?? adjustment(),
  };
}

function scenario(id: string, groups: ProgramGroup[], name = id): Scenario {
  return { id, name, groups, originGroups: groups.map((item) => ({ ...item })) };
}

describe("tuition scenario revenue", () => {
  it("computes gross annual tuition as tuition × students × billing months", () => {
    const result = computeGroup(group());
    assert.equal(result.valid, true);
    assert.equal(result.grossCents, 80_000 * 12 * 10);
    assert.equal(result.netCents, 9_600_000);
    assert.equal(result.annualSiblingDiscountCents, 0);
    assert.equal(result.annualScholarshipCents, 0);
  });

  it("uses a different billing period without treating a monthly amount as annual", () => {
    const ten = computeScenario([group({ billingMonths: 10 })]);
    const twelve = computeScenario([group({ billingMonths: 12 })]);
    assert.equal(ten.netCents, 9_600_000);
    assert.equal(twelve.netCents, 80_000 * 12 * 12);
  });

  it("applies a percent sibling discount to the students who qualify", () => {
    const result = computeScenario([
      group({
        siblingDiscount: adjustment({
          enabled: true,
          mode: "percent",
          percentHundredths: 1_000,
          recipientCount: 3,
        }),
      }),
    ]);
    assert.equal(result.valid, true);
    assert.equal(result.annualSiblingDiscountCents, 8_000 * 3 * 10);
    assert.equal(result.netCents, 9_600_000 - 240_000);
    assert.equal(result.effectiveMonthlyTuitionCents, 78_000);
    assert.equal(result.hasReduction, true);
  });

  it("rounds a percent reduction once per student per month", () => {
    const result = computeGroup(
      group({
        monthlyTuitionCents: 80_000,
        enrollment: 1,
        billingMonths: 1,
        siblingDiscount: adjustment({
          enabled: true,
          mode: "percent",
          percentHundredths: 3_333,
          recipientCount: 1,
        }),
      }),
    );
    assert.equal(result.annualSiblingDiscountCents, 26_664);
    assert.equal(result.netCents, 80_000 - 26_664);
  });

  it("applies a fixed monthly sibling discount across billing months", () => {
    const result = computeScenario([
      group({
        siblingDiscount: adjustment({
          enabled: true,
          mode: "fixed",
          amountCents: 5_000,
          recipientCount: 2,
        }),
      }),
    ]);
    assert.equal(result.annualSiblingDiscountCents, 5_000 * 2 * 10);
    assert.equal(result.netCents, 9_600_000 - 100_000);
  });

  it("applies scholarships to different students than the sibling discount", () => {
    const result = computeScenario([
      group({
        siblingDiscount: adjustment({
          enabled: true,
          mode: "percent",
          percentHundredths: 1_000,
          recipientCount: 3,
        }),
        scholarship: adjustment({
          enabled: true,
          mode: "fixed",
          amountCents: 10_000,
          recipientCount: 2,
        }),
      }),
    ]);
    assert.equal(result.valid, true);
    assert.equal(result.annualSiblingDiscountCents, 240_000);
    assert.equal(result.annualScholarshipCents, 10_000 * 2 * 10);
    assert.equal(result.netCents, 9_600_000 - 240_000 - 200_000);
    assert.equal(result.effectiveMonthlyTuitionCents, Math.round(9_160_000 / 120));
  });

  it("rejects stacked discounts when the recipient counts do not fit", () => {
    const result = computeScenario([
      group({
        siblingDiscount: adjustment({
          enabled: true,
          mode: "percent",
          percentHundredths: 1_000,
          recipientCount: 8,
        }),
        scholarship: adjustment({
          enabled: true,
          mode: "fixed",
          amountCents: 5_000,
          recipientCount: 5,
        }),
      }),
    ]);
    assert.equal(result.valid, false);
    assert.equal(result.netCents, null);
    assert.match(result.messages[0] ?? "", /don't fit within 12 students/);
  });

  it("keeps an invalid discount configuration instead of inventing a negative tuition", () => {
    const result = computeGroup(
      group({
        siblingDiscount: adjustment({
          enabled: true,
          mode: "fixed",
          amountCents: 90_000,
          recipientCount: 1,
        }),
      }),
    );
    assert.equal(result.valid, false);
    assert.equal(result.netCents, null);
    assert.match(result.messages[0] ?? "", /higher than monthly tuition/);
  });

  it("flags more discount recipients than enrolled students", () => {
    const result = computeGroup(
      group({
        enrollment: 6,
        siblingDiscount: adjustment({
          enabled: true,
          mode: "percent",
          percentHundredths: 1_000,
          recipientCount: 8,
        }),
      }),
    );
    assert.equal(result.valid, false);
    assert.match(result.messages[0] ?? "", /8 students have a sibling discount/);
    assert.match(result.messages[0] ?? "", /6 students/);
  });

  it("handles zero enrollment, zero tuition, and decimal cents", () => {
    const noStudents = computeScenario([group({ enrollment: 0 })]);
    assert.equal(noStudents.valid, true);
    assert.equal(noStudents.netCents, 0);

    const free = computeScenario([group({ monthlyTuitionCents: 0 })]);
    assert.equal(free.valid, true);
    assert.equal(free.netCents, 0);

    const cents = computeScenario([
      group({ monthlyTuitionCents: 80_050, enrollment: 1, billingMonths: 1 }),
    ]);
    assert.equal(cents.grossCents, 80_050);
    assert.equal(cents.netCents, 80_050);
  });

  it("does not divide by zero when baseline revenue is zero", () => {
    const baseline = computeScenario([group({ monthlyTuitionCents: 0 })]);
    const proposed = computeScenario([group()]);
    assert.equal(baseline.netCents, 0);
    assert.equal(percentageChange(proposed.netCents ?? 0, 0), null);
    const comparison = compareScenario(proposed, baseline, false);
    assert.equal(comparison.differenceCents, 9_600_000);
    assert.equal(comparison.percentageLabel, "Percentage unavailable because the baseline is $0");
    assert.equal(formatAnnualDifference(0), "No change in annual revenue");
    assert.equal(formatPercentageChange(10), "+10%");
    assert.equal(formatPercentageChange(-9.6), "−9.6%");
  });

  it("compares revenue and percentage against the baseline", () => {
    const baseline = computeScenario([group()]);
    const proposed = computeScenario([group({ monthlyTuitionCents: 90_000 })]);
    const comparison = compareScenario(proposed, baseline, false);
    assert.equal(comparison.differenceCents, 1_200_000);
    assert.equal(comparison.differenceLabel, "+$12,000 per year");
    assert.equal(comparison.direction, "higher");
    assert.equal(comparison.percentageLabel, "+12.5%");
    assert.equal(compareScenario(baseline, baseline, true).differenceLabel, "Baseline for comparison");
  });

  it("sums a part-time program as its own group", () => {
    const result = computeScenario([
      group({ monthlyTuitionCents: 80_000, enrollment: 12, billingMonths: 10 }),
      group({
        id: "part",
        label: "Part-time",
        monthlyTuitionCents: 40_000,
        enrollment: 4,
        billingMonths: 10,
      }),
    ]);
    assert.equal(result.netCents, 9_600_000 + 1_600_000);
    assert.equal(halfTuitionToNearestDollar(80_100), 40_100);
    assert.equal(halfTuitionToNearestDollar(80_040), 40_000);
  });
});

describe("tuition scenario insights", () => {
  it("describes added students at the current tuition", () => {
    const baselineScenario = scenario("base", [group()]);
    const grown = scenario("grown", [group({ enrollment: 14 })]);
    const lines = scenarioInsights(
      grown,
      computeScenario(grown.groups),
      baselineScenario,
      computeScenario(baselineScenario.groups),
    );
    assert.match(lines[0] ?? "", /Two additional students at the current tuition/);
    assert.match(lines[0] ?? "", /\$16,000/);
  });

  it("says when a tuition increase offsets one fewer student", () => {
    const baselineScenario = scenario("base", [group()]);
    const raised = scenario("raised", [group({ monthlyTuitionCents: 90_000, enrollment: 11 })]);
    const lines = scenarioInsights(
      raised,
      computeScenario(raised.groups),
      baselineScenario,
      computeScenario(baselineScenario.groups),
    );
    assert.equal(lines[0], "This tuition increase offsets the revenue impact of one fewer student.");
    assert.match(lines[1] ?? "", /\$3,000 more/);
  });

  it("states the scholarship reduction without extra advice when that is the whole change", () => {
    const baselineScenario = scenario("base", [group()]);
    const aided = scenario("aided", [
      group({
        scholarship: adjustment({
          enabled: true,
          mode: "fixed",
          amountCents: 10_000,
          recipientCount: 1,
        }),
      }),
    ]);
    const lines = scenarioInsights(
      aided,
      computeScenario(aided.groups),
      baselineScenario,
      computeScenario(baselineScenario.groups),
    );
    assert.equal(lines.length, 1);
    assert.match(lines[0] ?? "", /scholarship assumptions reduce/);
    assert.match(lines[0] ?? "", /\$1,000/);
  });

  it("skips an insight when two scenarios collect the same revenue", () => {
    const baselineScenario = scenario("base", [group()]);
    const copy = scenario("copy", [group()]);
    assert.deepEqual(
      scenarioInsights(
        copy,
        computeScenario(copy.groups),
        baselineScenario,
        computeScenario(baselineScenario.groups),
      ),
      [],
    );
  });
});

describe("tuition scenario state", () => {
  it("seeds quick starts from the edited baseline", () => {
    const edited = updateGroupFields(starterPlanner(), "current", "current-group", {
      monthlyTuitionCents: 50_000,
      enrollment: 8,
    });
    const raised = addScenario(edited, "raise-tuition");
    const raisedScenario = raised.state.scenarios.find((item) => item.id === raised.addedId);
    assert.equal(raisedScenario?.groups[0]?.monthlyTuitionCents, 60_000);
    assert.equal(raisedScenario?.groups[0]?.enrollment, 8);
    assert.equal(raisedScenario?.name, "Tuition increase");

    const lost = addScenario(edited, "raise-tuition-lose-student");
    const lostScenario = lost.state.scenarios.find((item) => item.id === lost.addedId);
    assert.equal(lostScenario?.groups[0]?.enrollment, 7);
    assert.equal(lostScenario?.groups[0]?.monthlyTuitionCents, 60_000);

    const grown = addScenario(edited, "grow-enrollment");
    const grownScenario = grown.state.scenarios.find((item) => item.id === grown.addedId);
    assert.equal(grownScenario?.groups[0]?.monthlyTuitionCents, 50_000);
    assert.equal(grownScenario?.groups[0]?.enrollment, 10);
  });

  it("builds a mixed part-time scenario without sharing discount state", () => {
    const withDiscount = setAdjustmentEnabled(starterPlanner(), "current", "current-group", "siblingDiscount", true);
    const added = addScenario(withDiscount, "part-time");
    const created = added.state.scenarios.find((item) => item.id === added.addedId);
    assert.equal(created?.groups.length, 2);
    assert.equal(created?.groups[0]?.label, "Full-time");
    assert.equal(created?.groups[0]?.enrollment, 12);
    assert.equal(created?.groups[0]?.siblingDiscount.enabled, true);
    assert.equal(created?.groups[0]?.siblingDiscount.recipientCount, 1);
    assert.equal(created?.groups[1]?.label, "Part-time");
    assert.equal(created?.groups[1]?.monthlyTuitionCents, 40_000);
    assert.equal(created?.groups[1]?.enrollment, 4);
    assert.equal(created?.groups[1]?.siblingDiscount.enabled, false);

    const fullTimeId = created?.groups[0]?.id ?? "";
    const changed = updateAdjustmentFields(added.state, created?.id ?? "", fullTimeId, "siblingDiscount", {
      recipientCount: 4,
    });
    const baseline = changed.scenarios.find((item) => item.id === "current");
    const hypothetical = changed.scenarios.find((item) => item.id === created?.id);
    assert.equal(baseline?.groups[0]?.siblingDiscount.recipientCount, 1);
    assert.equal(hypothetical?.groups[0]?.siblingDiscount.recipientCount, 4);
  });

  it("duplicates a scenario into independent assumptions", () => {
    const { state, hypotheticalId } = withHypotheticalScenario();
    const duplicated = addScenario(state, "duplicate", hypotheticalId);
    const copy = duplicated.state.scenarios.find((item) => item.id === duplicated.addedId);
    assert.match(copy?.name ?? "", /copy$/i);
    const copyGroupId = copy?.groups[0]?.id ?? "";
    const changed = updateGroupFields(duplicated.state, copy?.id ?? "", copyGroupId, {
      monthlyTuitionCents: 10_000,
    });
    const original = changed.scenarios.find((item) => item.id === hypotheticalId);
    const clone = changed.scenarios.find((item) => item.id === copy?.id);
    assert.equal(original?.groups[0]?.monthlyTuitionCents, 80_000);
    assert.equal(clone?.groups[0]?.monthlyTuitionCents, 10_000);
    assert.notEqual(original?.groups[0]?.id, clone?.groups[0]?.id);
  });

  it("does not drop discount recipients when enrollment falls", () => {
    const { state: base, hypotheticalId, hypotheticalGroupId } = withHypotheticalScenario();
    let state = setAdjustmentEnabled(base, hypotheticalId, hypotheticalGroupId, "siblingDiscount", true);
    state = updateAdjustmentFields(state, hypotheticalId, hypotheticalGroupId, "siblingDiscount", {
      recipientCount: 8,
    });
    state = updateGroupFields(state, hypotheticalId, hypotheticalGroupId, { enrollment: 6 });
    const hypothetical = state.scenarios.find((item) => item.id === hypotheticalId);
    assert.equal(hypothetical?.groups[0]?.siblingDiscount.recipientCount, 8);
    assert.equal(hypothetical?.groups[0]?.enrollment, 6);
    const result = computeScenario(hypothetical?.groups ?? []);
    assert.equal(result.valid, false);
    assert.match(result.messages[0] ?? "", /8 students have a sibling discount/);
  });

  it("switches the baseline without rewriting scenario assumptions", () => {
    const { state, hypotheticalId } = withHypotheticalScenario();
    const switched = setBaseline(state, hypotheticalId);
    assert.equal(switched.baselineId, hypotheticalId);
    const current = switched.scenarios.find((item) => item.id === "current");
    assert.equal(current?.groups[0]?.monthlyTuitionCents, 80_000);
    const comparison = compareScenario(
      computeScenario(current?.groups ?? []),
      computeScenario(switched.scenarios.find((item) => item.id === hypotheticalId)?.groups ?? []),
      false,
    );
    assert.equal(comparison.differenceLabel, "No change in annual revenue");
    assert.equal(comparison.percentageLabel, null);
  });

  it("blocks deletion of the last scenario and promotes a new baseline", () => {
    const only = removeScenario(starterPlanner(), "current");
    assert.equal(only.blocked, true);
    assert.equal(only.state.scenarios.length, 1);

    const { state, hypotheticalId, hypotheticalName } = withHypotheticalScenario();
    const removed = removeScenario(state, "current");
    assert.equal(removed.blocked, false);
    assert.equal(removed.promotedBaselineName, hypotheticalName);
    assert.equal(removed.state.baselineId, hypotheticalId);
    assert.equal(removed.state.scenarios.length, 1);
    assert.equal(removed.state.scenarios.some((item) => item.id === "current"), false);
  });

  it("allows duplicate names, reorders, and resets to the original assumptions", () => {
    const { state, hypotheticalId, hypotheticalGroupId } = withHypotheticalScenario();
    const renamed = renameScenario(renameScenario(state, hypotheticalId, "Current"), "current", "Current");
    assert.equal(renamed.scenarios.filter((item) => item.name === "Current").length, 2);

    const moved = moveScenario(renamed, "current", "later");
    assert.equal(moved.scenarios[0]?.id, hypotheticalId);
    assert.equal(moved.scenarios[1]?.id, "current");
    assert.equal(moveScenario(moved, hypotheticalId, "earlier").scenarios[0]?.id, hypotheticalId);

    const edited = updateGroupFields(state, hypotheticalId, hypotheticalGroupId, {
      monthlyTuitionCents: 12_500,
      enrollment: 3,
    });
    const reset = resetScenario(edited, hypotheticalId);
    assert.equal(reset.scenarios.find((item) => item.id === hypotheticalId)?.groups[0]?.monthlyTuitionCents, 80_000);
    assert.equal(reset.scenarios.find((item) => item.id === hypotheticalId)?.groups[0]?.enrollment, 12);
    assert.equal(reset.scenarios.find((item) => item.id === "current")?.groups[0]?.monthlyTuitionCents, 80_000);
  });

  it("stops at eight scenarios and round-trips a draft without clamping recipients to enrollment", () => {
    let state = starterPlanner();
    for (let index = 0; index < 7; index += 1) {
      state = addScenario(state, "from-baseline").state;
    }
    assert.equal(state.scenarios.length, 8);
    const capped = addScenario(state, "from-baseline");
    assert.equal(capped.capped, true);
    assert.equal(capped.state.scenarios.length, 8);

    const overflow = updateAdjustmentFields(
      setAdjustmentEnabled(starterPlanner(), "current", "current-group", "scholarship", true),
      "current",
      "current-group",
      "scholarship",
      { recipientCount: 40 },
    );
    const parsed = parsePlannerDraft(serializePlanner(overflow));
    assert.ok(parsed);
    assert.equal(parsed?.scenarios.length, 1);
    assert.equal(parsed?.scenarios[0]?.groups[0]?.scholarship.recipientCount, 40);
    assert.equal(isStarterPlanner(starterPlanner()), true);
    assert.equal(isStarterPlanner(overflow), false);
    assert.equal(parsePlannerDraft("{"), null);
    assert.equal(parsePlannerDraft(JSON.stringify({ version: 2 })), null);
  });

  it("adds and removes age groups for the baseline scenario", () => {
    let state = starterPlanner();
    assert.equal(state.scenarios[0]?.groups[0]?.label, "All students");
    state = addProgramGroup(state, "current");
    assert.equal(state.scenarios[0]?.groups.length, 2);
    assert.equal(state.scenarios[0]?.groups[0]?.label, "");
    assert.equal(state.scenarios[0]?.groups[1]?.label, "");
    const secondId = state.scenarios[0]?.groups[1]?.id ?? "";
    state = removeProgramGroup(state, "current", secondId);
    assert.equal(state.scenarios[0]?.groups.length, 1);
    assert.equal(state.scenarios[0]?.groups[0]?.label, "All students");
  });

  it("syncs billing months and discounts across all program groups", () => {
    let state = addProgramGroup(starterPlanner(), "current");
    state = updateAllBillingMonths(state, "current", 9);
    for (const group of state.scenarios[0]?.groups ?? []) {
      assert.equal(group.billingMonths, 9);
    }
    state = setAdjustmentEnabledForAllGroups(state, "current", "siblingDiscount", true);
    for (const group of state.scenarios[0]?.groups ?? []) {
      assert.equal(group.siblingDiscount.enabled, true);
    }
  });

  it("round-trips up to four program groups in local storage", () => {
    let state = starterPlanner();
    state = addProgramGroup(state, "current");
    state = addProgramGroup(state, "current");
    state = addProgramGroup(state, "current");
    assert.equal(state.scenarios[0]?.groups.length, 4);
    const parsed = parsePlannerDraft(serializePlanner(state));
    assert.equal(parsed?.scenarios[0]?.groups.length, 4);
    state = addProgramGroup(state, "current");
    assert.equal(state.scenarios[0]?.groups.length, 4);
  });

  it("builds a short wizard with combined tuition and enrollment steps", () => {
    const steps = buildPlannerQuestionSteps(baselineScenario(starterPlanner()));
    assert.deepEqual(
      steps.map((item) => item.kind),
      ["tuition_all", "enrollment_all", "months", "sibling_toggle", "scholarship_toggle", "done"],
    );
    const withSibling = setAdjustmentEnabled(starterPlanner(), "current", "current-group", "siblingDiscount", true);
    const siblingSteps = buildPlannerQuestionSteps(baselineScenario(withSibling));
    assert.equal(siblingSteps.some((item) => item.kind === "sibling_details"), true);
  });

  it("does not let one scenario's tuition edit change another scenario's revenue", () => {
    const { state, hypotheticalId, hypotheticalGroupId } = withHypotheticalScenario();
    const changed = updateGroupFields(state, hypotheticalId, hypotheticalGroupId, {
      monthlyTuitionCents: 70_000,
    });
    const current = computeScenario(changed.scenarios.find((item) => item.id === "current")?.groups ?? []);
    const hypothetical = computeScenario(
      changed.scenarios.find((item) => item.id === hypotheticalId)?.groups ?? [],
    );
    assert.equal(current.netCents, 9_600_000);
    assert.equal(hypothetical.netCents, 70_000 * 12 * 10);
    const comparison = compareScenario(hypothetical, current, false);
    assert.equal(comparison.direction, "lower");
    assert.match(comparison.differenceLabel, /^−\$/);
  });
});

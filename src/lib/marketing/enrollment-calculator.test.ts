import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAX_CALCULATOR_CENTS,
  MAX_CALCULATOR_ENROLLMENT,
  computeEnrollmentEstimate,
  enrollmentExploreMax,
  formatCalculatorMoney,
  formatStudentCount,
  monthlyBreakdown,
  monthlyPosition,
  monthlyResultCents,
  studentsForAmount,
} from "./enrollment-calculator";

const exampleSchool = {
  tuitionCents: 80_000,
  fixedExpensesCents: 800_000,
  variableCostPerStudentCents: 5_000,
  ownerCompensationCents: 400_000,
  currentEnrollment: 12,
};

describe("enrollment calculator", () => {
  it("uses blended tuition when multiple tuition groups are provided", () => {
    const estimate = computeEnrollmentEstimate({
      tuitionCents: 0,
      fixedExpensesCents: 800_000,
      variableCostPerStudentCents: 5_000,
      ownerCompensationCents: 400_000,
      currentEnrollment: 0,
      tuitionGroups: [
        { tuitionCents: 100_000, enrollment: 10 },
        { tuitionCents: 80_000, enrollment: 10 },
      ],
    });
    assert.equal(estimate.currentEnrollment, 20);
    assert.equal(estimate.tuitionCents, 90_000);
    assert.equal(estimate.contributionCents, 85_000);
    assert.equal(estimate.compensationTarget, 15);
  });

  it("computes the example school", () => {
    const estimate = computeEnrollmentEstimate(exampleSchool);
    assert.equal(estimate.contributionCents, 75_000);
    assert.equal(estimate.viable, true);
    assert.equal(estimate.operatingBreakEven, 11);
    assert.equal(estimate.compensationTarget, 16);
    assert.equal(estimate.additionalStudents, 4);
    assert.equal(monthlyResultCents(exampleSchool, 12), -300_000);
    assert.equal(monthlyPosition(-300_000), "shortfall");
  });

  it("is exact when the amount divides evenly", () => {
    const estimate = computeEnrollmentEstimate({
      tuitionCents: 80_000,
      fixedExpensesCents: 75_000,
      variableCostPerStudentCents: 5_000,
      ownerCompensationCents: 0,
      currentEnrollment: 0,
    });
    assert.equal(estimate.operatingBreakEven, 1);
    assert.equal(estimate.compensationTarget, 1);
    assert.equal(monthlyResultCents(estimate, 1), 0);
    assert.equal(monthlyPosition(0), "even");
  });

  it("rounds a remainder up to the next student", () => {
    assert.equal(studentsForAmount(75_001, 75_000), 2);
    const estimate = computeEnrollmentEstimate({
      tuitionCents: 80_000,
      fixedExpensesCents: 75_001,
      variableCostPerStudentCents: 5_000,
      ownerCompensationCents: 75_000,
      currentEnrollment: 1,
    });
    assert.equal(estimate.operatingBreakEven, 2);
    assert.equal(estimate.compensationTarget, 3);
    assert.ok(
      estimate.operatingBreakEven !== null &&
        estimate.compensationTarget !== null &&
        estimate.operatingBreakEven <= estimate.compensationTarget,
    );
  });

  it("returns zero students when there is nothing to cover", () => {
    const estimate = computeEnrollmentEstimate({
      tuitionCents: 10_000,
      fixedExpensesCents: 0,
      variableCostPerStudentCents: 0,
      ownerCompensationCents: 0,
      currentEnrollment: 4,
    });
    assert.equal(estimate.viable, true);
    assert.equal(estimate.operatingBreakEven, 0);
    assert.equal(estimate.compensationTarget, 0);
    assert.equal(estimate.additionalStudents, 0);
    assert.equal(monthlyResultCents(estimate, 4), 40_000);
    assert.equal(monthlyPosition(40_000), "surplus");
  });

  it("covers owner pay alone when fixed expenses are zero", () => {
    const estimate = computeEnrollmentEstimate({
      tuitionCents: 5_000,
      fixedExpensesCents: 0,
      variableCostPerStudentCents: 0,
      ownerCompensationCents: 10_000,
      currentEnrollment: 0,
    });
    assert.equal(estimate.operatingBreakEven, 0);
    assert.equal(estimate.compensationTarget, 2);
    assert.equal(estimate.additionalStudents, 2);
    assert.equal(studentsForAmount(101, 100), 2);
  });

  it("does not divide when each student contributes nothing", () => {
    const equal = computeEnrollmentEstimate({
      tuitionCents: 5_000,
      fixedExpensesCents: 800_000,
      variableCostPerStudentCents: 5_000,
      ownerCompensationCents: 400_000,
      currentEnrollment: 10,
    });
    assert.equal(equal.contributionCents, 0);
    assert.equal(equal.viable, false);
    assert.equal(equal.operatingBreakEven, null);
    assert.equal(equal.compensationTarget, null);
    assert.equal(equal.additionalStudents, null);
    assert.equal(monthlyResultCents(equal, 10), -1_200_000);

    const below = computeEnrollmentEstimate({
      tuitionCents: 4_000,
      fixedExpensesCents: 100,
      variableCostPerStudentCents: 5_000,
      ownerCompensationCents: 0,
      currentEnrollment: 3,
    });
    assert.equal(below.viable, false);
    assert.equal(below.operatingBreakEven, null);
    assert.equal(monthlyResultCents(below, 3), 3 * (4_000 - 5_000) - 100);
  });

  it("handles an all-zero school without dividing", () => {
    const estimate = computeEnrollmentEstimate({
      tuitionCents: 0,
      fixedExpensesCents: 0,
      variableCostPerStudentCents: 0,
      ownerCompensationCents: 0,
      currentEnrollment: 0,
    });
    assert.equal(estimate.viable, false);
    assert.equal(estimate.operatingBreakEven, null);
    assert.equal(estimate.compensationTarget, null);
    assert.equal(monthlyResultCents(estimate, 0), 0);
  });

  it("never reports a negative number of additional students", () => {
    const estimate = computeEnrollmentEstimate({
      ...exampleSchool,
      currentEnrollment: 20,
    });
    assert.equal(estimate.compensationTarget, 16);
    assert.equal(estimate.additionalStudents, 0);
    assert.equal(monthlyResultCents(estimate, 17), 75_000);
  });

  it("matches revenue minus costs at the scenario enrollment", () => {
    const breakdown = monthlyBreakdown(exampleSchool, 12);
    assert.equal(breakdown.revenueCents, 960_000);
    assert.equal(breakdown.variableCostsCents, 60_000);
    assert.equal(breakdown.fixedExpensesCents, 800_000);
    assert.equal(breakdown.ownerCompensationCents, 400_000);
    assert.equal(breakdown.resultCents, -300_000);
    assert.equal(
      breakdown.resultCents,
      monthlyResultCents(exampleSchool, 12),
    );
  });

  it("keeps cent precision instead of rounding money to the nearest dollar", () => {
    assert.equal(monthlyResultCents({
      tuitionCents: 333,
      fixedExpensesCents: 0,
      variableCostPerStudentCents: 0,
      ownerCompensationCents: 0,
    }, 3), 999);
    assert.equal(formatCalculatorMoney(300_000), "$3,000");
    assert.equal(formatCalculatorMoney(150), "$1.50");
    assert.equal(formatCalculatorMoney(-300_000), "−$3,000");
    assert.equal(formatCalculatorMoney(0), "$0");
    assert.equal(monthlyPosition(1), "surplus");
    assert.equal(monthlyPosition(-1), "shortfall");
  });

  it("clamps invalid numbers and ignores non-finite input", () => {
    const estimate = computeEnrollmentEstimate({
      tuitionCents: Number.NaN,
      fixedExpensesCents: -50,
      variableCostPerStudentCents: Number.POSITIVE_INFINITY,
      ownerCompensationCents: 10.4,
      currentEnrollment: -3,
    });
    assert.equal(estimate.tuitionCents, 0);
    assert.equal(estimate.fixedExpensesCents, 0);
    assert.equal(estimate.variableCostPerStudentCents, 0);
    assert.equal(estimate.ownerCompensationCents, 10);
    assert.equal(estimate.currentEnrollment, 0);

    const capped = computeEnrollmentEstimate({
      tuitionCents: MAX_CALCULATOR_CENTS + 50_000,
      fixedExpensesCents: 0,
      variableCostPerStudentCents: 0,
      ownerCompensationCents: 0,
      currentEnrollment: MAX_CALCULATOR_ENROLLMENT + 25,
    });
    assert.equal(capped.tuitionCents, MAX_CALCULATOR_CENTS);
    assert.equal(capped.currentEnrollment, MAX_CALCULATOR_ENROLLMENT);
  });

  it("uses integer ceiling for a large amount that float division can mis-count", () => {
    assert.equal(studentsForAmount(10_000_000_000_001, 10_000_000_000_000), 2);
    assert.equal(studentsForAmount(9, 3), 3);
    assert.equal(studentsForAmount(0, 3), 0);
    assert.equal(studentsForAmount(100, 0), null);
    assert.equal(studentsForAmount(100, -5), null);
  });

  it("extends the explore range past the compensation target", () => {
    const max = enrollmentExploreMax(12, 11, 16, 12);
    assert.ok(max > 16);
    assert.ok(max >= 12);
    const atCap = enrollmentExploreMax(
      MAX_CALCULATOR_ENROLLMENT,
      null,
      null,
      MAX_CALCULATOR_ENROLLMENT,
    );
    assert.equal(atCap, MAX_CALCULATOR_ENROLLMENT);
  });

  it("formats student counts", () => {
    assert.equal(formatStudentCount(0), "0 students");
    assert.equal(formatStudentCount(1), "1 student");
    assert.equal(formatStudentCount(16), "16 students");
    assert.equal(formatStudentCount(1200), "1,200 students");
  });
});

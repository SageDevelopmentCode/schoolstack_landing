import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildParentBillingFamilySummary,
  pickInitialChildKey,
  pickNextPendingChildKey,
  resolveAnnualTuitionCents,
  resolveUpcomingDue,
} from "@/lib/tuition/parent-billing-summary";
import type { FamilyTuitionSelectionItem } from "@/lib/tuition/enrollment-selection";
import type { TuitionCharge, TuitionEnrollmentAssignment } from "@/lib/tuition/types";

function assignment(
  overrides: Partial<TuitionEnrollmentAssignment> = {},
): TuitionEnrollmentAssignment {
  return {
    id: "assignment-1",
    organizationId: "org-1",
    enrollmentId: "enrollment-1",
    familyId: "family-1",
    ratePlanId: "plan-1",
    rateTierId: "tier-1",
    paymentPlanId: "payment-plan-1",
    assignmentSource: "default",
    assignedByUserId: null,
    effectiveStart: "2026-08-01",
    effectiveEnd: null,
    status: "active",
    metadata: { pendingPaymentPlanSelection: true },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function charge(overrides: Partial<TuitionCharge> = {}): TuitionCharge {
  return {
    id: "charge-1",
    organizationId: "org-1",
    assignmentId: "assignment-1",
    familyId: "family-1",
    guardianId: null,
    label: "Tuition payment 1",
    baseAmountCents: 72000,
    amountCents: 72000,
    paidCents: 0,
    currency: "usd",
    dueDate: "2026-08-01",
    status: "scheduled",
    chargeType: "tuition",
    installmentNumber: 1,
    sentAt: null,
    paidAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function selectionItem(
  enrollmentId: string,
  studentName: string,
  annualCents: number,
): FamilyTuitionSelectionItem {
  return {
    studentName,
    context: {
      assignment: assignment({ id: `assignment-${enrollmentId}`, enrollmentId }),
      ratePlan: {
        id: "plan-1",
        organizationId: "org-1",
        programId: "program-1",
        name: "School Year 2026–27",
        billingBasis: "annual",
        amountCents: annualCents,
        currency: "usd",
        effectiveStart: "2026-08-01",
        effectiveEnd: "2027-05-31",
        status: "active",
        metadata: {},
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        tiers: [
          {
            id: "tier-1",
            organizationId: "org-1",
            ratePlanId: "plan-1",
            code: "standard",
            label: "Standard",
            amountCents: annualCents,
            sortOrder: 0,
            isDefault: true,
            metadata: {},
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        ],
        paymentPlans: [],
        feeComponents: [],
      },
    },
  };
}

describe("resolveAnnualTuitionCents", () => {
  it("uses tier annual amount from pending selection context", () => {
    assert.equal(
      resolveAnnualTuitionCents({
        selectionItem: selectionItem("enrollment-1", "Julia", 720000),
        tuitionCharges: [],
      }),
      720000,
    );
  });

  it("sums tuition charges when schedule is finalized", () => {
    assert.equal(
      resolveAnnualTuitionCents({
        selectionItem: null,
        tuitionCharges: [
          charge({ baseAmountCents: 360000, amountCents: 360000 }),
          charge({
            id: "charge-2",
            baseAmountCents: 360000,
            amountCents: 360000,
            installmentNumber: 2,
          }),
        ],
      }),
      720000,
    );
  });
});

describe("resolveUpcomingDue", () => {
  it("sums charges on the earliest due date and tracks total remaining", () => {
    const result = resolveUpcomingDue([
      charge({ amountCents: 360000, dueDate: "2026-08-01" }),
      charge({
        id: "charge-2",
        assignmentId: "assignment-2",
        amountCents: 72000,
        dueDate: "2026-08-01",
      }),
      charge({
        id: "charge-3",
        amountCents: 72000,
        dueDate: "2026-09-01",
        installmentNumber: 2,
      }),
    ]);

    assert.equal(result.upcomingDueCents, 432000);
    assert.equal(result.totalRemainingCents, 504000);
    assert.equal(result.nextCharge?.dueDate, "2026-08-01");
    assert.equal(result.nextCharge?.amountCents, 432000);
  });
});

describe("buildParentBillingFamilySummary", () => {
  it("rolls up upcoming due on earliest date and total remaining", () => {
    const summary = buildParentBillingFamilySummary({
      assignments: [
        {
          assignment: assignment({
            id: "assignment-1",
            enrollmentId: "enrollment-1",
            metadata: {},
          }),
          enrollmentId: "enrollment-1",
          studentName: "Julia Cecilia",
        },
        {
          assignment: assignment({
            id: "assignment-2",
            enrollmentId: "enrollment-2",
            metadata: {},
          }),
          enrollmentId: "enrollment-2",
          studentName: "Caleb Cecilia",
        },
      ],
      charges: [
        charge({ assignmentId: "assignment-1", amountCents: 50000 }),
        charge({
          id: "charge-2",
          assignmentId: "assignment-2",
          amountCents: 30000,
          dueDate: "2026-09-01",
        }),
      ],
      selectionItems: [],
    });

    assert.equal(summary.balanceDueCents, 50000);
    assert.equal(summary.totalRemainingCents, 80000);
    assert.equal(summary.children.length, 2);
    assert.equal(summary.children[0]?.balanceDueCents, 50000);
    assert.equal(summary.children[0]?.totalRemainingCents, 50000);
    assert.equal(summary.children[1]?.balanceDueCents, 30000);
    assert.equal(summary.children[1]?.totalRemainingCents, 30000);
    assert.equal(summary.nextCharge?.amountCents, 50000);
  });

  it("sums children on the same due date for family upcoming balance", () => {
    const summary = buildParentBillingFamilySummary({
      assignments: [
        {
          assignment: assignment({
            id: "assignment-1",
            enrollmentId: "enrollment-1",
            metadata: {},
          }),
          enrollmentId: "enrollment-1",
          studentName: "Julia Cecilia",
        },
        {
          assignment: assignment({
            id: "assignment-2",
            enrollmentId: "enrollment-2",
            metadata: {},
          }),
          enrollmentId: "enrollment-2",
          studentName: "Caleb Cecilia",
        },
      ],
      charges: [
        charge({
          assignmentId: "assignment-1",
          amountCents: 360000,
          dueDate: "2026-08-01",
        }),
        charge({
          id: "charge-2",
          assignmentId: "assignment-1",
          amountCents: 360000,
          dueDate: "2027-02-01",
          installmentNumber: 2,
        }),
        charge({
          id: "charge-3",
          assignmentId: "assignment-2",
          amountCents: 72000,
          dueDate: "2026-08-01",
        }),
        ...["2026-09-01", "2026-10-01", "2026-11-01", "2026-12-01", "2027-01-01", "2027-02-01", "2027-03-01", "2027-04-01", "2027-05-01"].map(
          (dueDate, index) =>
            charge({
              id: `charge-caleb-${index + 2}`,
              assignmentId: "assignment-2",
              amountCents: 72000,
              dueDate,
              installmentNumber: index + 2,
            }),
        ),
      ],
      selectionItems: [],
    });

    assert.equal(summary.balanceDueCents, 432000);
    assert.equal(summary.totalRemainingCents, 1440000);
    assert.equal(summary.children[0]?.balanceDueCents, 360000);
    assert.equal(summary.children[0]?.totalRemainingCents, 720000);
    assert.equal(summary.children[1]?.balanceDueCents, 72000);
    assert.equal(summary.children[1]?.totalRemainingCents, 720000);
    assert.equal(summary.nextCharge?.dueDate, "2026-08-01");
    assert.equal(summary.nextCharge?.amountCents, 432000);
  });

  it("marks children awaiting schedule and totals estimated annual tuition", () => {
    const summary = buildParentBillingFamilySummary({
      assignments: [
        {
          assignment: assignment({
            id: "assignment-1",
            enrollmentId: "enrollment-1",
          }),
          enrollmentId: "enrollment-1",
          studentName: "Julia Cecilia",
        },
        {
          assignment: assignment({
            id: "assignment-2",
            enrollmentId: "enrollment-2",
          }),
          enrollmentId: "enrollment-2",
          studentName: "Caleb Cecilia",
        },
      ],
      charges: [],
      selectionItems: [
        selectionItem("enrollment-1", "Julia Cecilia", 720000),
        selectionItem("enrollment-2", "Caleb Cecilia", 720000),
      ],
    });

    assert.equal(summary.hasPendingSchedule, true);
    assert.equal(summary.annualTuitionCents, 1440000);
    assert.equal(summary.children[0]?.status, "needs_schedule");
    assert.equal(summary.children[1]?.annualTuitionCents, 720000);
  });
});

describe("child tab helpers", () => {
  it("picks the first child needing a schedule", () => {
    const children = buildParentBillingFamilySummary({
      assignments: [
        {
          assignment: assignment({ enrollmentId: "enrollment-1" }),
          enrollmentId: "enrollment-1",
          studentName: "Julia",
        },
        {
          assignment: assignment({
            id: "assignment-2",
            enrollmentId: "enrollment-2",
          }),
          enrollmentId: "enrollment-2",
          studentName: "Caleb",
        },
      ],
      charges: [],
      selectionItems: [
        selectionItem("enrollment-2", "Caleb", 720000),
      ],
    }).children;

    assert.equal(pickInitialChildKey(children), "enrollment-2");
  });

  it("advances to the next pending child after confirmation", () => {
    const children = [
      {
        childKey: "enrollment-1",
        status: "needs_schedule" as const,
      },
      {
        childKey: "enrollment-2",
        status: "needs_schedule" as const,
      },
    ] as const;

    assert.equal(
      pickNextPendingChildKey(
        children as unknown as ReturnType<typeof buildParentBillingFamilySummary>["children"],
        "enrollment-1",
      ),
      "enrollment-2",
    );
  });
});

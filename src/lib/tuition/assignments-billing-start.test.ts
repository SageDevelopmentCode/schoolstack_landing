import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  enrollmentEnrolledStatusPatch,
  newEnrollmentAsEnrolledRow,
} from "@/lib/admissions/enrollment-enrolled-at";
import {
  assignmentBillingStartLocked,
  ensureAssignmentBillingStart,
  getBillingEnrollmentDate,
  resolveBillingStartForAssignment,
  shouldSetBillingStartLocked,
} from "./assignments";
import { resolveAssignmentBillingStart } from "./billing-start";
import type { TuitionEnrollmentAssignment } from "./types";

function assignmentRow(
  overrides: Partial<TuitionEnrollmentAssignment> = {},
): TuitionEnrollmentAssignment {
  return {
    id: "assign-1",
    organizationId: "org-1",
    enrollmentId: "enrollment-1",
    familyId: "family-1",
    ratePlanId: "rate-1",
    rateTierId: "tier-1",
    paymentPlanId: "plan-12",
    assignmentSource: "default",
    assignedByUserId: null,
    effectiveStart: null,
    effectiveEnd: null,
    status: "active",
    metadata: {},
    createdAt: "2026-07-27T00:00:00Z",
    updatedAt: "2026-07-27T00:00:00Z",
    ...overrides,
  };
}

function mockEnsureBillingStartSupabase(input: {
  assignment: TuitionEnrollmentAssignment;
  enrolledAt: string;
}) {
  let updatedStart: string | null = null;

  const supabase = {
    from: (table: string) => {
      if (table === "enrollments") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  enrolled_at: input.enrolledAt,
                  status: "enrolled",
                },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "tuition_rate_plans") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: {
                  id: "rate-1",
                  organization_id: "org-1",
                  program_id: "program-1",
                  name: "2026-27",
                  amount_cents: 720000,
                  currency: "USD",
                  status: "active",
                  effective_start: "2026-08-17",
                  effective_end: "2027-05-31",
                  created_at: "2026-01-01",
                  updated_at: "2026-01-01",
                },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "tuition_payment_plans") {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                data: [
                  {
                    id: "plan-12",
                    organization_id: "org-1",
                    rate_plan_id: "rate-1",
                    name: "12 payments",
                    installment_count: 12,
                    installment_amount_cents: 60000,
                    billing_day_of_month: 1,
                    is_default: true,
                    created_at: "2026-01-01",
                    updated_at: "2026-01-01",
                  },
                ],
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "tuition_fee_components") {
        return {
          select: () => ({
            eq: () => ({ data: [], error: null }),
          }),
        };
      }
      if (table === "tuition_rate_tiers") {
        return {
          select: () => ({
            eq: () => ({
              order: async () => ({ data: [], error: null }),
            }),
          }),
        };
      }
      if (table === "programs") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: { name: "Program" }, error: null }),
            }),
          }),
        };
      }
      if (table === "tuition_enrollment_assignments") {
        return {
          update: (patch: { effective_start: string }) => {
            updatedStart = patch.effective_start;
            return {
              eq: () => ({
                select: () => ({
                  single: async () => ({
                    data: {
                      id: input.assignment.id,
                      organization_id: input.assignment.organizationId,
                      enrollment_id: input.assignment.enrollmentId,
                      family_id: input.assignment.familyId,
                      rate_plan_id: input.assignment.ratePlanId,
                      rate_tier_id: input.assignment.rateTierId,
                      payment_plan_id: input.assignment.paymentPlanId,
                      assignment_source: input.assignment.assignmentSource,
                      assigned_by_user_id: null,
                      effective_start: patch.effective_start,
                      effective_end: null,
                      status: "active",
                      metadata: {},
                      created_at: input.assignment.createdAt,
                      updated_at: input.assignment.updatedAt,
                    },
                    error: null,
                  }),
                }),
              }),
            };
          },
        };
      }
      if (table === "activity_events") {
        return {
          insert: () => ({ error: null }),
        };
      }
      throw new Error(`Unexpected table ${table}`);
    },
  };

  return { supabase, getUpdatedStart: () => updatedStart };
}

describe("enrollment billing date scenarios", () => {
  const ratePlanStart = "2026-08-17";
  const billingDay = 1;

  it("early enroller gets August billing start from enrolled_at", () => {
    const result = resolveAssignmentBillingStart({
      ratePlanStart,
      enrollmentDate: new Date("2026-07-27T00:00:00Z"),
      billingDayOfMonth: billingDay,
    });
    assert.equal(result, "2026-08-01");
  });

  it("late August enroll-complete gets September billing start", () => {
    const result = resolveAssignmentBillingStart({
      ratePlanStart,
      enrollmentDate: new Date("2026-08-28T00:00:00Z"),
      billingDayOfMonth: billingDay,
    });
    assert.equal(result, "2026-09-01");
  });
});

describe("getBillingEnrollmentDate", () => {
  it("returns enrolled_at when set", async () => {
    const supabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: {
                enrolled_at: "2026-08-28T12:00:00Z",
                status: "enrolled",
              },
              error: null,
            }),
          }),
        }),
      }),
    };

    const date = await getBillingEnrollmentDate(
      supabase as never,
      "enrollment-1",
    );
    assert.equal(date?.toISOString(), "2026-08-28T12:00:00.000Z");
  });

  it("returns null while enrollment is pending", async () => {
    const supabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: { enrolled_at: null, status: "pending" },
              error: null,
            }),
          }),
        }),
      }),
    };

    const date = await getBillingEnrollmentDate(
      supabase as never,
      "enrollment-1",
    );
    assert.equal(date, null);
  });
});

describe("resolveBillingStartForAssignment", () => {
  it("returns null for pending enrollments", async () => {
    const supabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: { enrolled_at: null, status: "pending" },
              error: null,
            }),
          }),
        }),
      }),
    };

    const result = await resolveBillingStartForAssignment(supabase as never, {
      enrollmentId: "enrollment-1",
      ratePlanStart: "2026-08-17",
      billingDayOfMonth: 1,
    });
    assert.equal(result, null);
  });

  it("uses enrolled_at for enrolled students", async () => {
    const supabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: {
                enrolled_at: "2026-08-28T00:00:00Z",
                status: "enrolled",
              },
              error: null,
            }),
          }),
        }),
      }),
    };

    const result = await resolveBillingStartForAssignment(supabase as never, {
      enrollmentId: "enrollment-1",
      ratePlanStart: "2026-08-17",
      billingDayOfMonth: 1,
    });
    assert.equal(result, "2026-09-01");
  });
});

describe("ensureAssignmentBillingStart", () => {
  it("skips recompute when billing start is locked", async () => {
    const assignment = assignmentRow({
      effectiveStart: "2026-08-01",
      metadata: { billingStartLocked: true },
    });

    const result = await ensureAssignmentBillingStart({} as never, assignment);
    assert.equal(result, assignment);
  });

  it("updates effective_start from enrolled_at", async () => {
    const assignment = assignmentRow({ effectiveStart: "2026-08-01" });
    const { supabase, getUpdatedStart } = mockEnsureBillingStartSupabase({
      assignment,
      enrolledAt: "2026-08-28T00:00:00Z",
    });

    const result = await ensureAssignmentBillingStart(
      supabase as never,
      assignment,
    );
    assert.equal(getUpdatedStart(), "2026-09-01");
    assert.equal(result.effectiveStart, "2026-09-01");
  });

  it("does not pull back an admin-delayed billing start", async () => {
    const assignment = assignmentRow({ effectiveStart: "2026-10-01" });
    const { supabase, getUpdatedStart } = mockEnsureBillingStartSupabase({
      assignment,
      enrolledAt: "2026-07-27T00:00:00Z",
    });

    const result = await ensureAssignmentBillingStart(
      supabase as never,
      assignment,
    );
    assert.equal(getUpdatedStart(), null);
    assert.equal(result, assignment);
  });

  it("fills effective_start when missing", async () => {
    const assignment = assignmentRow({ effectiveStart: null });
    const { supabase, getUpdatedStart } = mockEnsureBillingStartSupabase({
      assignment,
      enrolledAt: "2026-07-27T00:00:00Z",
    });

    const result = await ensureAssignmentBillingStart(
      supabase as never,
      assignment,
    );
    assert.equal(getUpdatedStart(), "2026-08-01");
    assert.equal(result.effectiveStart, "2026-08-01");
  });
});

describe("assignmentBillingStartLocked", () => {
  it("returns true when metadata flag is set", () => {
    assert.equal(
      assignmentBillingStartLocked({ metadata: { billingStartLocked: true } }),
      true,
    );
  });
});

describe("shouldSetBillingStartLocked", () => {
  it("returns false when effectiveStart is omitted from PATCH", () => {
    assert.equal(shouldSetBillingStartLocked(null, undefined), false);
    assert.equal(shouldSetBillingStartLocked("2026-08-01", undefined), false);
  });

  it("returns false when incoming matches stored value", () => {
    assert.equal(
      shouldSetBillingStartLocked("2026-08-01", "2026-08-01"),
      false,
    );
    assert.equal(shouldSetBillingStartLocked(null, null), false);
  });

  it("returns true when incoming differs from stored value", () => {
    assert.equal(
      shouldSetBillingStartLocked(null, "2026-08-01"),
      true,
    );
    assert.equal(
      shouldSetBillingStartLocked("2026-08-01", "2026-09-01"),
      true,
    );
  });
});

describe("enrollmentEnrolledStatusPatch", () => {
  it("sets enrolled_at on first transition", () => {
    const patch = enrollmentEnrolledStatusPatch(null);
    assert.equal(patch.status, "enrolled");
    assert.ok(patch.enrolled_at);
  });

  it("preserves existing enrolled_at on re-update", () => {
    const patch = enrollmentEnrolledStatusPatch("2026-08-28T00:00:00Z");
    assert.equal(patch.status, "enrolled");
    assert.equal(patch.enrolled_at, undefined);
  });
});

describe("newEnrollmentAsEnrolledRow", () => {
  it("inserts with enrolled status and enrolled_at", () => {
    const row = newEnrollmentAsEnrolledRow({
      organization_id: "org-1",
      student_id: "student-1",
      program_id: "program-1",
    });
    assert.equal(row.status, "enrolled");
    assert.ok(row.enrolled_at);
  });
});

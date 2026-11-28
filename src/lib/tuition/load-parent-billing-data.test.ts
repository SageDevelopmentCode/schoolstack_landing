import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createFakeSupabase } from "@/test/fake-supabase";
import {
  BILLING_FIXTURE_FAMILY_ID,
  BILLING_FIXTURE_ORG_ID,
  BILLING_FIXTURE_USER_ID,
  buildParentBillingFixtureTables,
} from "./__fixtures__/parent-billing-fixture";
import expected from "./__fixtures__/parent-billing.expected.json";
import { loadParentBillingInitialDataWithClient } from "./load-parent-billing-data";

type Tables = Record<string, Record<string, unknown>[]>;

/** Payloads captured from the loader before the shared family read, per scenario. */
const SCENARIOS: Record<keyof typeof expected, (tables: Tables) => void> = {
  full: () => {},
  no_assignments: (tables) => {
    tables.tuition_enrollment_assignments = [];
  },
  no_students: (tables) => {
    tables.students = tables.students!.filter((student) => student.family_id !== BILLING_FIXTURE_FAMILY_ID);
  },
  no_guardian_no_account: (tables) => {
    tables.guardians = [];
    tables.tuition_billing_accounts = [];
    tables.tuition_billing_splits = [];
  },
  pending_unassigned: (tables) => {
    tables.tuition_enrollment_assignments = tables.tuition_enrollment_assignments!.filter(
      (assignment) => assignment.id !== "asg-1",
    );
  },
};

async function loadScenario(mutate: (tables: Tables) => void) {
  const tables = buildParentBillingFixtureTables();
  mutate(tables);
  // One fake for both clients so round trips are counted together.
  const fake = createFakeSupabase(tables);
  const data = await loadParentBillingInitialDataWithClient(
    fake.client,
    {
      organizationId: BILLING_FIXTURE_ORG_ID,
      familyId: BILLING_FIXTURE_FAMILY_ID,
      slug: "school",
      userId: BILLING_FIXTURE_USER_ID,
    },
    { catalogClient: fake.client },
  );
  return { data, fake };
}

describe("loadParentBillingInitialDataWithClient", () => {
  for (const [name, mutate] of Object.entries(SCENARIOS)) {
    it(`returns the same payload as before the shared family read (${name})`, async () => {
      const { data } = await loadScenario(mutate);
      assert.deepEqual(
        JSON.parse(JSON.stringify(data)),
        expected[name as keyof typeof expected],
      );
    });
  }

  it("reads the family's students, enrollments and assignments once", async () => {
    // Without the assignment that points outside the family, nothing needs a fallback read.
    const { fake } = await loadScenario((tables) => {
      tables.tuition_enrollment_assignments = tables.tuition_enrollment_assignments!.filter(
        (assignment) => assignment.id !== "asg-9",
      );
    });
    const counts = fake.countByTable();

    // Before: students ×4, enrollments ×4, assignments ×4 (one of those is the
    // adjustments lookup, which filters differently and still runs).
    assert.equal(counts.students, 1);
    assert.equal(counts.enrollments, 1);
    assert.equal(counts.tuition_enrollment_assignments, 2);
    // Before: the org's payment plans were read by readiness and the summary.
    const orgPaymentPlanReads = fake.log.filter(
      (entry) =>
        entry.table === "tuition_payment_plans" &&
        entry.filters.includes(`organization_id=${BILLING_FIXTURE_ORG_ID}`),
    );
    assert.equal(orgPaymentPlanReads.length, 1);
    // Before: 19 sequential round trips.
    assert.ok(fake.waveCount <= 6, `expected ≤ 6 round trips, got ${fake.waveCount}`);
  });

  it("still names a child whose assigned enrollment sits outside the family", async () => {
    const { data, fake } = await loadScenario(() => {});
    const child = data.familySummary.children.find((item) => item.childKey === "enr-9");
    assert.equal(child?.studentName, "Zed Other");
    // The fallback costs one enrollments and one students read.
    assert.equal(fake.countByTable().enrollments, 2);
    assert.equal(fake.countByTable().students, 2);
  });
});

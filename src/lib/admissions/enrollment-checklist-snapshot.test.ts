import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createFakeSupabase } from "@/test/fake-supabase";
import {
  buildParentHomeFixtureTables,
  HOME_FIXTURE_ORG_ID,
} from "@/lib/parent-portal/__fixtures__/parent-home-content-fixture";
import {
  createEnrollmentChecklistSnapshotLoader,
  listEnrollmentAgreementAmendmentsForApplications,
  listEnrollmentProgressForApplications,
  listIncompleteEnrollmentAgreementsForApplications,
} from "./enrollment-checklist-materialization";

describe("createEnrollmentChecklistSnapshotLoader", () => {
  it("reuses one read for the same or a smaller set of applications", async () => {
    const fake = createFakeSupabase(buildParentHomeFixtureTables());
    const loader = createEnrollmentChecklistSnapshotLoader(fake.client, HOME_FIXTURE_ORG_ID);

    const first = loader(["app-1", "app-2"]);
    assert.equal(loader(["app-2", "app-1", "app-2"]), first);
    assert.equal(loader(["app-1"]), first);
    assert.equal(loader([]), first);
    await first;

    assert.equal(fake.countByTable().enrollment_checklists, 1);
  });

  it("reads again when an application is not covered yet", async () => {
    const fake = createFakeSupabase(buildParentHomeFixtureTables());
    const loader = createEnrollmentChecklistSnapshotLoader(fake.client, HOME_FIXTURE_ORG_ID);

    const first = loader(["app-1"]);
    const second = loader(["app-1", "app-2"]);
    assert.notEqual(second, first);
    await Promise.all([first, second]);

    assert.equal(fake.countByTable().enrollment_checklists, 2);
  });
});

describe("checklist summaries from a shared snapshot", () => {
  it("match the standalone reads, filtered to the requested applications", async () => {
    const standalone = createFakeSupabase(buildParentHomeFixtureTables());
    const shared = createFakeSupabase(buildParentHomeFixtureTables());
    const loader = createEnrollmentChecklistSnapshotLoader(shared.client, HOME_FIXTURE_ORG_ID);
    // Load a superset first, as the home page does with the children list.
    await loader(["app-1", "app-2", "app-3"]);

    for (const applicationIds of [["app-1"], ["app-2"], ["app-1", "app-2"]]) {
      const options = { snapshotLoader: loader };
      assert.deepEqual(
        await listEnrollmentProgressForApplications(shared.client, HOME_FIXTURE_ORG_ID, applicationIds, options),
        await listEnrollmentProgressForApplications(standalone.client, HOME_FIXTURE_ORG_ID, applicationIds),
      );
      assert.deepEqual(
        await listEnrollmentAgreementAmendmentsForApplications(shared.client, HOME_FIXTURE_ORG_ID, applicationIds, options),
        await listEnrollmentAgreementAmendmentsForApplications(standalone.client, HOME_FIXTURE_ORG_ID, applicationIds),
      );
      assert.deepEqual(
        await listIncompleteEnrollmentAgreementsForApplications(shared.client, HOME_FIXTURE_ORG_ID, applicationIds, options),
        await listIncompleteEnrollmentAgreementsForApplications(standalone.client, HOME_FIXTURE_ORG_ID, applicationIds),
      );
    }

    assert.equal(shared.countByTable().enrollment_checklists, 1);
  });

  it("keeps the banner org filter on item rows from another organisation", async () => {
    const fake = createFakeSupabase(buildParentHomeFixtureTables());
    const amendments = await listEnrollmentAgreementAmendmentsForApplications(
      fake.client,
      HOME_FIXTURE_ORG_ID,
      ["app-2"],
    );

    // ii-6 has an amendment notice but belongs to org-2.
    assert.deepEqual(
      amendments.get("app-2")?.map((item) => item.checklistItemInstanceId),
      ["ii-4"],
    );
  });
});

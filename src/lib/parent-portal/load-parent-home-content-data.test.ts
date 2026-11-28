import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createFakeSupabase } from "@/test/fake-supabase";
import {
  buildParentHomeFixtureTables,
  HOME_FIXTURE_FAMILY_ID,
  HOME_FIXTURE_FEATURES,
  HOME_FIXTURE_ORG_ID,
  HOME_FIXTURE_USER_ID,
} from "./__fixtures__/parent-home-content-fixture";
import expected from "./__fixtures__/parent-home-content.expected.json";
import {
  loadParentHomeContentDataForAuthUser,
  loadParentHomePreviewContentData,
} from "./load-parent-home-content-data";

// The service-role client is built (when the loader runs, not on import) but
// never queried with this fixture: forms, Friday Branch and co-op are off.
process.env.NEXT_PUBLIC_SUPABASE_URL ??= "http://127.0.0.1:1";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service-role";

/** What the API sends: undefined fields drop out. */
function asJson(value: unknown) {
  return JSON.parse(JSON.stringify(value));
}

const CHECKLIST_TABLES = [
  "enrollment_checklists",
  "enrollment_checklist_items",
  "enrollment_checklist_templates",
  "enrollment_checklist_template_items",
] as const;

function checklistQueryCounts(counts: Record<string, number>) {
  return Object.fromEntries(CHECKLIST_TABLES.map((table) => [table, counts[table] ?? 0]));
}

/** One read of the checklist chain; the fixture uses two templates. */
const ONE_CHECKLIST_READ = {
  enrollment_checklists: 1,
  enrollment_checklist_items: 1,
  enrollment_checklist_templates: 2,
  enrollment_checklist_template_items: 2,
};

describe("loadParentHomeContentDataForAuthUser", () => {
  for (const programId of [undefined, "prog-1"] as const) {
    const label = programId ? "program portal" : "main portal";

    it(`returns the same payload as before the shared checklist read (${label})`, async () => {
      const fake = createFakeSupabase(buildParentHomeFixtureTables());
      const data = await loadParentHomeContentDataForAuthUser({
        supabase: fake.client,
        userId: HOME_FIXTURE_USER_ID,
        organizationId: HOME_FIXTURE_ORG_ID,
        familyId: HOME_FIXTURE_FAMILY_ID,
        slug: "school",
        features: HOME_FIXTURE_FEATURES,
        familyIds: [HOME_FIXTURE_FAMILY_ID],
        programId,
        programAccessVerified: programId ? true : undefined,
      });

      const key = programId ? "auth_prog-1" : "auth_main";
      assert.deepEqual(asJson(data), expected[key]);
    });

    it(`reads the checklist chain once for progress and both banners (${label})`, async () => {
      const fake = createFakeSupabase(buildParentHomeFixtureTables());
      await loadParentHomeContentDataForAuthUser({
        supabase: fake.client,
        userId: HOME_FIXTURE_USER_ID,
        organizationId: HOME_FIXTURE_ORG_ID,
        familyId: HOME_FIXTURE_FAMILY_ID,
        slug: "school",
        features: HOME_FIXTURE_FEATURES,
        familyIds: [HOME_FIXTURE_FAMILY_ID],
        programId,
        programAccessVerified: programId ? true : undefined,
      });

      // Before: 3 checklist reads, templates and their items read one by one.
      assert.deepEqual(checklistQueryCounts(fake.countByTable()), ONE_CHECKLIST_READ);
      // Before: 12 (main) / 10 (program) sequential round trips.
      assert.ok(fake.waveCount <= 5, `expected ≤ 5 round trips, got ${fake.waveCount}`);
    });
  }
});

describe("loadParentHomePreviewContentData", () => {
  it("returns the same payload and reads the checklist chain once", async () => {
    const fake = createFakeSupabase(buildParentHomeFixtureTables());
    const data = await loadParentHomePreviewContentData({
      supabase: fake.client,
      organizationId: HOME_FIXTURE_ORG_ID,
      familyId: HOME_FIXTURE_FAMILY_ID,
      slug: "school",
      features: HOME_FIXTURE_FEATURES,
      previewBasePath: "/admin/preview/school/family/fam-1",
    });

    assert.deepEqual(asJson(data), expected.preview);
    assert.deepEqual(checklistQueryCounts(fake.countByTable()), ONE_CHECKLIST_READ);
    // Before: 15.
    assert.ok(fake.waveCount <= 7, `expected ≤ 7 round trips, got ${fake.waveCount}`);
  });
});

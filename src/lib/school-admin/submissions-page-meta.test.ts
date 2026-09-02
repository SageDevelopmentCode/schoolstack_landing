import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  countActiveSubmissions,
  parseAdminSubmissionsPageMetaRow,
} from "./submissions-page-meta";

describe("submissions-page-meta", () => {
  it("countActiveSubmissions excludes withdrawn from the all filter total", () => {
    const counts = {
      draft: 3,
      submitted: 2,
      enrolled: 1,
      withdrawn: 4,
      declined: 1,
    };

    assert.equal(countActiveSubmissions(counts), 7);
  });

  it("countActiveSubmissions returns zero for empty counts", () => {
    assert.equal(countActiveSubmissions({}), 0);
  });

  it("parseAdminSubmissionsPageMetaRow maps RPC payload", () => {
    const meta = parseAdminSubmissionsPageMetaRow({
      status_counts: { draft: 2, submitted: 1 },
      form_options: [{ key: "apply", title: "Apply" }],
      latest_submitted: {
        id: "app-1",
        submitted_at: "2026-09-01T12:00:00.000Z",
        guardian_name: "Jamie Lee",
      },
    });

    assert.deepEqual(meta?.statusCounts, { draft: 2, submitted: 1 });
    assert.equal(meta?.activeSubmissionsCount, 3);
    assert.deepEqual(meta?.formOptions, [{ key: "apply", title: "Apply" }]);
    assert.equal(meta?.latestSubmitted?.id, "app-1");
    assert.equal(meta?.latestSubmitted?.guardianName, "Jamie Lee");
  });
});

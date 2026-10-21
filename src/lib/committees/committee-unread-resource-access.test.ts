import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { latestAccessibleResourceCreatedAt } from "./committee-unread-resource-access";
import type { CommitteeDutyRole } from "./types";

const dutyRoles: CommitteeDutyRole[] = [
  { id: "role-lead", title: "Committee Lead", description: "" },
  { id: "role-booth", title: "Booth Coordinator", description: "", assigneeId: "member-booth" },
];

describe("latestAccessibleResourceCreatedAt", () => {
  it("returns latest createdAt for open-access resources", () => {
    const latest = latestAccessibleResourceCreatedAt(
      [
        { createdAt: "2026-10-01T00:00:00.000Z", allowedDutyRoleIds: [] },
        { createdAt: "2026-10-16T00:00:00.000Z", allowedDutyRoleIds: [] },
      ],
      dutyRoles,
      "member-general",
    );
    assert.equal(latest, "2026-10-16T00:00:00.000Z");
  });

  it("ignores role-restricted resources when member lacks the duty role", () => {
    const latest = latestAccessibleResourceCreatedAt(
      [
        { createdAt: "2026-10-16T00:00:00.000Z", allowedDutyRoleIds: ["role-lead"] },
        { createdAt: "2026-10-10T00:00:00.000Z", allowedDutyRoleIds: [] },
      ],
      dutyRoles,
      "member-general",
    );
    assert.equal(latest, "2026-10-10T00:00:00.000Z");
  });

  it("includes role-restricted resources when member holds the assigned duty role", () => {
    const latest = latestAccessibleResourceCreatedAt(
      [
        { createdAt: "2026-10-16T00:00:00.000Z", allowedDutyRoleIds: ["role-booth"] },
        { createdAt: "2026-10-10T00:00:00.000Z", allowedDutyRoleIds: [] },
      ],
      dutyRoles,
      "member-booth",
    );
    assert.equal(latest, "2026-10-16T00:00:00.000Z");
  });

  it("returns null when member cannot access any resources", () => {
    const latest = latestAccessibleResourceCreatedAt(
      [{ createdAt: "2026-10-16T00:00:00.000Z", allowedDutyRoleIds: ["role-lead"] }],
      dutyRoles,
      "member-general",
    );
    assert.equal(latest, null);
  });
});

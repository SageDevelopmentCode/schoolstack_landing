import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  anonymizeClassroomSignupResponseForParent,
  toParentVisibleSignupResponses,
} from "./parent-response-visibility";
import type { ClassroomSignupResponse } from "./types";
import {
  getRoleFillCount,
  getSlotFillCount,
  isSlotFull,
  responsesExcludingFamily,
} from "./utils";

const fullResponse: ClassroomSignupResponse = {
  id: "response-1",
  signupId: "signup-1",
  familyId: "family-1",
  familyName: "Nguyen Family",
  guardianName: "Lan Nguyen",
  guardianEmail: "lan@example.com",
  studentId: "student-1",
  studentName: "Mia Nguyen",
  selectedSlotIds: ["slot-1"],
  selectedRoleIds: ["role-1"],
  note: "Can bring snacks",
  status: "confirmed",
  createdAt: "2026-09-01T00:00:00.000Z",
  updatedAt: "2026-09-01T00:00:00.000Z",
};

describe("parent-response-visibility", () => {
  it("keeps the viewer family response unchanged", () => {
    assert.deepEqual(
      toParentVisibleSignupResponses([fullResponse], "family-1"),
      [fullResponse],
    );
  });

  it("strips PII from other families", () => {
    const anonymized = anonymizeClassroomSignupResponseForParent(fullResponse);

    assert.equal(anonymized.familyName, "");
    assert.equal(anonymized.guardianName, "");
    assert.equal(anonymized.guardianEmail, "");
    assert.equal(anonymized.studentId, "");
    assert.equal(anonymized.studentName, "");
    assert.equal(anonymized.note, null);
    assert.deepEqual(anonymized.selectedSlotIds, ["slot-1"]);
    assert.deepEqual(anonymized.selectedRoleIds, ["role-1"]);
    assert.equal(anonymized.status, "confirmed");
  });

  it("still supports slot and role fill counts", () => {
    const otherFamily = anonymizeClassroomSignupResponseForParent({
      ...fullResponse,
      id: "response-2",
      familyId: "family-2",
      selectedSlotIds: ["slot-1"],
      selectedRoleIds: [],
    });
    const viewerFamily = {
      ...fullResponse,
      familyId: "family-3",
      selectedSlotIds: [],
      selectedRoleIds: ["role-1"],
    };

    const visibleResponses = toParentVisibleSignupResponses(
      [otherFamily, viewerFamily],
      "family-3",
    );

    assert.equal(getSlotFillCount("slot-1", visibleResponses), 1);
    assert.equal(getRoleFillCount("role-1", visibleResponses), 1);
    assert.equal(isSlotFull("slot-1", 1, visibleResponses), true);
  });

  it("excludes the editing family when checking slot capacity for re-select", () => {
    const editingFamilyResponse: ClassroomSignupResponse = {
      ...fullResponse,
      familyId: "family-1",
      selectedSlotIds: ["slot-1"],
    };

    assert.equal(isSlotFull("slot-1", 1, [editingFamilyResponse]), true);
    assert.equal(
      isSlotFull(
        "slot-1",
        1,
        responsesExcludingFamily([editingFamilyResponse], "family-1"),
      ),
      false,
    );
  });
});

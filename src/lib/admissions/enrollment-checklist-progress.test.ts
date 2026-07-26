import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveEnrollmentChecklistInitialItemId } from "./enrollment-checklist-progress";
import type {
  EnrollmentChecklistItem,
  EnrollmentChecklistItemInstance,
} from "./enrollment-checklist-schema";

function item(id: string): EnrollmentChecklistItem {
  return {
    id,
    itemKey: id,
    label: id,
    type: "form",
    required: true,
    metadata: {},
  };
}

function instance(
  templateItemId: string,
  status: EnrollmentChecklistItemInstance["status"],
): EnrollmentChecklistItemInstance {
  return {
    id: `${templateItemId}-instance`,
    checklistId: "checklist-1",
    templateItemId,
    itemKey: templateItemId,
    status,
    responses: {},
  };
}

describe("resolveEnrollmentChecklistInitialItemId", () => {
  const items = [item("a"), item("b"), item("c")];

  it("returns explicit item id when provided", () => {
    assert.equal(
      resolveEnrollmentChecklistInitialItemId(items, [], {
        explicitItemId: "b",
      }),
      "b",
    );
  });

  it("prefers last active template item when still incomplete", () => {
    const instances = [
      instance("a", "completed"),
      instance("b", "not_started"),
      instance("c", "not_started"),
    ];

    assert.equal(
      resolveEnrollmentChecklistInitialItemId(items, instances, {
        lastActiveTemplateItemId: "c",
      }),
      "c",
    );
  });

  it("falls back when last active item is completed", () => {
    const instances = [
      instance("a", "completed"),
      instance("b", "in_progress"),
      instance("c", "completed"),
    ];

    assert.equal(
      resolveEnrollmentChecklistInitialItemId(items, instances, {
        lastActiveTemplateItemId: "c",
      }),
      "b",
    );
  });

  it("opens first in-progress item when no last active item", () => {
    const instances = [
      instance("a", "completed"),
      instance("b", "in_progress"),
      instance("c", "not_started"),
    ];

    assert.equal(resolveEnrollmentChecklistInitialItemId(items, instances), "b");
  });

  it("opens first incomplete item when nothing is in progress", () => {
    const instances = [
      instance("a", "completed"),
      instance("b", "not_started"),
      instance("c", "not_started"),
    ];

    assert.equal(resolveEnrollmentChecklistInitialItemId(items, instances), "b");
  });

  it("returns first item when everything is complete", () => {
    const instances = [
      instance("a", "completed"),
      instance("b", "completed"),
      instance("c", "completed"),
    ];

    assert.equal(resolveEnrollmentChecklistInitialItemId(items, instances), "a");
  });
});

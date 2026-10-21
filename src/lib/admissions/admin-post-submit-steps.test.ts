import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getIncompletePostSubmitNotice,
  summarizePostSubmitSteps,
  type AdminPostSubmitStep,
} from "./admin-post-submit-steps";

function step(
  overrides: Partial<AdminPostSubmitStep> & Pick<AdminPostSubmitStep, "actionId">,
): AdminPostSubmitStep {
  return {
    type: "schedule_campus_tour",
    title: "Visit",
    required: true,
    sortIndex: 0,
    status: "pending",
    ...overrides,
  };
}

describe("getIncompletePostSubmitNotice", () => {
  it("returns null when there are no steps", () => {
    assert.equal(getIncompletePostSubmitNotice([]), null);
  });

  it("returns null when all steps are scheduled", () => {
    const notice = getIncompletePostSubmitNotice([
      step({ actionId: "a", status: "scheduled" }),
      step({ actionId: "b", status: "scheduled", sortIndex: 1 }),
    ]);
    assert.equal(notice, null);
  });

  it("returns pending tone when no steps are scheduled", () => {
    const notice = getIncompletePostSubmitNotice([
      step({ actionId: "a" }),
      step({ actionId: "b", sortIndex: 1 }),
    ]);
    assert.deepEqual(notice, { label: "0/2 done", tone: "pending" });
  });

  it("returns scheduled tone when some steps are incomplete", () => {
    const notice = getIncompletePostSubmitNotice([
      step({ actionId: "a", status: "scheduled" }),
      step({ actionId: "b", sortIndex: 1 }),
    ]);
    assert.deepEqual(notice, { label: "1/2 done", tone: "scheduled" });
  });
});

describe("summarizePostSubmitSteps", () => {
  it("matches notice helper for partial completion", () => {
    const steps = [
      step({ actionId: "a", status: "scheduled" }),
      step({ actionId: "b", sortIndex: 1 }),
    ];
    const summary = summarizePostSubmitSteps(steps);
    const notice = getIncompletePostSubmitNotice(steps);
    assert.equal(notice?.label, summary?.label);
    assert.equal(notice?.tone, summary?.tone);
  });
});

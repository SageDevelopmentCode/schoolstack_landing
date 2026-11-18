import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BUILDER_STAGE_IDS,
  firstStageNeedingWork,
  focusForStage,
  isBuilderStage,
  stageOfFocus,
  stageStatuses,
} from "@/components/school-admin/admissions/builder-stages";
import type { ReadinessItem } from "@/components/school-admin/admissions/flows/flowReadiness";

describe("stageOfFocus", () => {
  it("maps every focus kind to its stage", () => {
    assert.equal(stageOfFocus({ kind: "setup" }), "basics");
    assert.equal(stageOfFocus({ kind: "step", stepId: "s1" }), "questions");
    assert.equal(stageOfFocus({ kind: "field", stepId: "s1", fieldId: "f1" }), "questions");
    assert.equal(stageOfFocus({ kind: "fee" }), "payments");
    assert.equal(stageOfFocus({ kind: "acknowledgments" }), "payments");
    assert.equal(stageOfFocus({ kind: "postSubmit" }), "afterSubmit");
    assert.equal(stageOfFocus({ kind: "review" }), "review");
  });

  it("round-trips through focusForStage", () => {
    const sections = [{ id: "a" }, { id: "b" }];
    for (const stage of BUILDER_STAGE_IDS) {
      assert.equal(stageOfFocus(focusForStage(stage, sections)), stage);
    }
  });
});

describe("focusForStage", () => {
  const sections = [{ id: "a" }, { id: "b" }];

  it("opens the remembered step in Questions", () => {
    assert.deepEqual(focusForStage("questions", sections, "b"), { kind: "step", stepId: "b" });
  });

  it("falls back to the first step when the remembered one is gone", () => {
    assert.deepEqual(focusForStage("questions", sections, "gone"), { kind: "step", stepId: "a" });
    assert.deepEqual(focusForStage("questions", sections, null), { kind: "step", stepId: "a" });
  });
});

describe("stageStatuses", () => {
  const item = (status: ReadinessItem["status"], target: ReadinessItem["target"]): ReadinessItem => ({
    id: `${status}-${target?.kind}`,
    status,
    label: "x",
    target,
  });

  it("uses the worst status per stage and leaves untouched stages at none", () => {
    const statuses = stageStatuses([
      item("done", { kind: "setup" }),
      item("todo", { kind: "setup" }),
      item("done", { kind: "step", stepId: "a" }),
      item("warning", { kind: "fee" }),
    ]);
    assert.equal(statuses.basics, "todo");
    assert.equal(statuses.questions, "done");
    assert.equal(statuses.payments, "warning");
    assert.equal(statuses.afterSubmit, "none");
    assert.equal(statuses.review, "todo");
  });

  it("marks review done when nothing blocks", () => {
    const statuses = stageStatuses([item("done", { kind: "setup" }), item("warning", { kind: "fee" })]);
    assert.equal(statuses.review, "done");
  });
});

describe("firstStageNeedingWork", () => {
  it("returns the earliest stage with a blocking item", () => {
    assert.equal(
      firstStageNeedingWork([
        { id: "1", status: "todo", label: "x", target: { kind: "acknowledgments" } },
        { id: "2", status: "todo", label: "y", target: { kind: "step", stepId: "a" } },
      ]),
      "questions",
    );
  });

  it("returns basics when nothing blocks", () => {
    assert.equal(firstStageNeedingWork([{ id: "1", status: "warning", label: "x", target: { kind: "fee" } }]), "basics");
  });
});

describe("isBuilderStage", () => {
  it("accepts known stages only", () => {
    assert.equal(isBuilderStage("payments"), true);
    assert.equal(isBuilderStage("nope"), false);
    assert.equal(isBuilderStage(null), false);
  });
});

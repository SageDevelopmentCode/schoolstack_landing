import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { classifyAnswerStatus, countByStatus } from "./ops-check-answer-status";

describe("classifyAnswerStatus", () => {
  it("maps scores to status bands", () => {
    assert.equal(classifyAnswerStatus(0), "working");
    assert.equal(classifyAnswerStatus(1), "improving");
    assert.equal(classifyAnswerStatus(2), "improving");
    assert.equal(classifyAnswerStatus(3), "attention");
  });
});

describe("countByStatus", () => {
  it("aggregates scores", () => {
    assert.deepEqual(countByStatus([0, 1, 3, 2]), {
      working: 1,
      improving: 2,
      attention: 1,
    });
  });
});

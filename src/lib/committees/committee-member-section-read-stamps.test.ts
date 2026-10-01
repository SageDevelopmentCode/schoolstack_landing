import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  COMMITTEE_SECTION_NEVER_READ_AT,
  memberSectionKey,
  partitionPairsByExistingReads,
} from "./committee-member-section-read-stamps";

describe("memberSectionKey", () => {
  it("joins member and section ids", () => {
    assert.equal(memberSectionKey("member-a", "messages"), "member-a:messages");
  });
});

describe("partitionPairsByExistingReads", () => {
  it("splits pairs into update vs insert buckets", () => {
    const pairs = [
      { memberId: "m1", section: "messages" as const },
      { memberId: "m2", section: "tasks" as const },
      { memberId: "m1", section: "messages" as const },
    ];

    const { toUpdate, toInsert } = partitionPairsByExistingReads(pairs, [
      memberSectionKey("m1", "messages"),
    ]);

    assert.deepEqual(toUpdate, [{ memberId: "m1", section: "messages" }]);
    assert.deepEqual(toInsert, [{ memberId: "m2", section: "tasks" }]);
  });

  it("treats all pairs as insert when nothing exists", () => {
    const pairs = [{ memberId: "m1", section: "messages" as const }];
    const { toUpdate, toInsert } = partitionPairsByExistingReads(pairs, []);

    assert.deepEqual(toUpdate, []);
    assert.deepEqual(toInsert, pairs);
  });
});

describe("COMMITTEE_SECTION_NEVER_READ_AT", () => {
  it("is before any real committee workspace timestamps", () => {
    assert.ok(
      new Date(COMMITTEE_SECTION_NEVER_READ_AT).getTime() <
        new Date("2020-01-01T00:00:00.000Z").getTime(),
    );
  });
});

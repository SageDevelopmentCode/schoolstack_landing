import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  digestEligibleSectionCounts,
  isCommitteeSectionEligibleForUnreadDigest,
} from "./committee-unread-digest-eligibility";

describe("isCommitteeSectionEligibleForUnreadDigest", () => {
  it("rejects when there is no latest entity", () => {
    assert.equal(
      isCommitteeSectionEligibleForUnreadDigest({
        latestEntityAt: null,
        lastReadAt: null,
        lastDigestNotifiedAt: null,
      }),
      false,
    );
  });

  it("rejects when already read", () => {
    assert.equal(
      isCommitteeSectionEligibleForUnreadDigest({
        latestEntityAt: "2026-09-28T18:00:00.000Z",
        lastReadAt: "2026-09-28T19:00:00.000Z",
        lastDigestNotifiedAt: null,
      }),
      false,
    );
  });

  it("rejects when digest already covered latest", () => {
    assert.equal(
      isCommitteeSectionEligibleForUnreadDigest({
        latestEntityAt: "2026-09-28T18:00:00.000Z",
        lastReadAt: null,
        lastDigestNotifiedAt: "2026-09-28T19:00:00.000Z",
      }),
      false,
    );
  });

  it("accepts unread not yet digest-reminded", () => {
    assert.equal(
      isCommitteeSectionEligibleForUnreadDigest({
        latestEntityAt: "2026-09-28T20:00:00.000Z",
        lastReadAt: "2026-09-28T18:00:00.000Z",
        lastDigestNotifiedAt: "2026-09-28T19:00:00.000Z",
      }),
      true,
    );
  });
});

describe("digestEligibleSectionCounts", () => {
  it("returns per-section 0/1 flags", () => {
    const counts = digestEligibleSectionCounts({
      latestAt: {
        messages: "2026-09-28T20:00:00.000Z",
        tasks: "2026-09-20T12:00:00.000Z",
      },
      readAt: { tasks: "2026-09-21T12:00:00.000Z" },
      digestNotifiedAt: {},
    });

    assert.equal(counts.messages, 1);
    assert.equal(counts.tasks, 0);
    assert.equal(counts.resources, 0);
    assert.equal(counts.calendar, 0);
  });
});

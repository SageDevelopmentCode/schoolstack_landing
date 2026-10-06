import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getActivityEventsApproachingWindowEnd,
  getActivityEventsRetentionCutoff,
  getActivityEventsRetentionMonths,
  getActivityEventsRetentionWarnDays,
  purgeActivityEventsOlderThan,
} from "@/lib/activity-events-retention";

describe("activity events retention config", () => {
  it("defaults to 12 months and 30 warn days", () => {
    const previousMonths = process.env.ACTIVITY_EVENTS_RETENTION_MONTHS;
    const previousWarn = process.env.ACTIVITY_EVENTS_RETENTION_WARN_DAYS;
    delete process.env.ACTIVITY_EVENTS_RETENTION_MONTHS;
    delete process.env.ACTIVITY_EVENTS_RETENTION_WARN_DAYS;

    assert.equal(getActivityEventsRetentionMonths(), 12);
    assert.equal(getActivityEventsRetentionWarnDays(), 30);

    process.env.ACTIVITY_EVENTS_RETENTION_MONTHS = previousMonths;
    process.env.ACTIVITY_EVENTS_RETENTION_WARN_DAYS = previousWarn;
  });

  it("computes approaching window end from cutoff", () => {
    const cutoff = new Date("2024-01-15T12:00:00.000Z");
    const end = getActivityEventsApproachingWindowEnd(cutoff);
    assert.equal(end.toISOString(), "2024-02-14T12:00:00.000Z");
  });

  it("computes retention cutoff from fixed now", () => {
    const now = new Date("2026-10-05T12:00:00.000Z");
    const cutoff = getActivityEventsRetentionCutoff(now);
    assert.equal(cutoff.toISOString(), "2025-10-05T12:00:00.000Z");
  });
});

describe("purgeActivityEventsOlderThan", () => {
  it("deletes in batches until fewer rows than batch size", async () => {
    const deletedIds: string[] = [];
    let selectCalls = 0;

    const supabase = {
      from(table: string) {
        assert.equal(table, "activity_events");
        return {
          select() {
            return this;
          },
          lt() {
            return this;
          },
          order() {
            return this;
          },
          limit() {
            selectCalls += 1;
            const batch =
              selectCalls === 1
                ? [{ id: "a" }, { id: "b" }]
                : [{ id: "c" }];
            return Promise.resolve({ data: batch, error: null });
          },
          delete() {
            return this;
          },
          in(_column: string, ids: string[]) {
            deletedIds.push(...ids);
            return Promise.resolve({ error: null });
          },
        };
      },
    } as never;

    const result = await purgeActivityEventsOlderThan(supabase, {
      now: new Date("2026-10-05T12:00:00.000Z"),
      batchSize: 2,
      maxBatches: 10,
    });

    assert.equal(result.deletedCount, 3);
    assert.equal(result.batchesRun, 2);
    assert.equal(result.truncated, false);
    assert.deepEqual(deletedIds, ["a", "b", "c"]);
  });
});

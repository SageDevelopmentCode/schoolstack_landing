import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseTuitionOrgSettings,
  resolveTuitionOrgSettings,
} from "./org-settings";

describe("parseTuitionOrgSettings", () => {
  it("parses late fee settings from json", () => {
    const settings = parseTuitionOrgSettings({
      graceDays: 7,
      lateFeeAmountCents: 5000,
      lateFeeDayOfMonth: 10,
      lateFeeRecurring: true,
      lateFeeEnabled: true,
      reminderDaysBefore: [3],
    });

    assert.equal(settings.graceDays, 7);
    assert.equal(settings.lateFeeAmountCents, 5000);
    assert.equal(settings.lateFeeDayOfMonth, 10);
    assert.equal(settings.lateFeeRecurring, true);
    assert.equal(settings.lateFeeEnabled, true);
    assert.deepEqual(settings.reminderDaysBefore, [3]);
  });
});

describe("resolveTuitionOrgSettings", () => {
  it("fills defaults for missing values", () => {
    const resolved = resolveTuitionOrgSettings({});

    assert.equal(resolved.graceDays, 5);
    assert.equal(resolved.lateFeeAmountCents, 0);
    assert.equal(resolved.lateFeeDayOfMonth, 10);
    assert.equal(resolved.lateFeeRecurring, true);
    assert.equal(resolved.lateFeeEnabled, false);
    assert.deepEqual(resolved.reminderDaysBefore, [3]);
  });
});

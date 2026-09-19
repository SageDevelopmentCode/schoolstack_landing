import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatIncompleteAdmissionsReminderAboutType,
  formatIncompleteAdmissionsReminderDetails,
  formatIncompleteAdmissionsReminderLabel,
} from "./discord";

describe("formatIncompleteAdmissionsReminderLabel", () => {
  it("formats first and second reminders", () => {
    assert.equal(formatIncompleteAdmissionsReminderLabel(1), "1st reminder");
    assert.equal(formatIncompleteAdmissionsReminderLabel(2), "2nd reminder");
  });
});

describe("formatIncompleteAdmissionsReminderAboutType", () => {
  it("describes application-only reminders", () => {
    assert.equal(formatIncompleteAdmissionsReminderAboutType(1, 0), "Application");
  });

  it("describes enrollment-only reminders", () => {
    assert.equal(formatIncompleteAdmissionsReminderAboutType(0, 1), "Enrollment");
  });

  it("describes combined reminders", () => {
    assert.equal(
      formatIncompleteAdmissionsReminderAboutType(1, 2),
      "Application + Enrollment",
    );
  });
});

describe("formatIncompleteAdmissionsReminderDetails", () => {
  it("lists draft and enrollment items", () => {
    const details = formatIncompleteAdmissionsReminderDetails(
      ["2026 Application"],
      ["Autumn Evensen — Grade 1 (3/8 complete)"],
    );

    assert.match(details, /2026 Application/);
    assert.match(details, /Autumn Evensen — Grade 1 \(3\/8 complete\)/);
  });
});

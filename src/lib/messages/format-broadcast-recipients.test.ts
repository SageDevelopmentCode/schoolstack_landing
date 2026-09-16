import assert from "node:assert/strict";
import test from "node:test";
import { formatBroadcastRecipientSummary } from "./format-broadcast-recipients";

test("formatBroadcastRecipientSummary returns empty string for no names", () => {
  assert.equal(formatBroadcastRecipientSummary([]), "");
});

test("formatBroadcastRecipientSummary formats one name", () => {
  assert.equal(formatBroadcastRecipientSummary(["Julius Cecilia"]), "Julius Cecilia");
});

test("formatBroadcastRecipientSummary formats two names with and", () => {
  assert.equal(
    formatBroadcastRecipientSummary(["Julius Cecilia", "Sam Parent"]),
    "Julius Cecilia and Sam Parent",
  );
});

test("formatBroadcastRecipientSummary formats three names with Oxford comma", () => {
  assert.equal(
    formatBroadcastRecipientSummary(["Alice", "Bob", "Carol"]),
    "Alice, Bob, and Carol",
  );
});

test("formatBroadcastRecipientSummary collapses long lists to and N others", () => {
  assert.equal(
    formatBroadcastRecipientSummary(["Alice", "Bob", "Carol", "Dan", "Eve"]),
    "Alice, Bob, Carol, and 2 others",
  );
});

test("formatBroadcastRecipientSummary truncates when summary exceeds max length", () => {
  const longName = "Very Long Parent Name That Keeps Going";
  const summary = formatBroadcastRecipientSummary(
    [longName, longName, longName, longName],
    { maxLength: 40 },
  );

  assert.ok(summary.endsWith("…"));
  assert.ok(summary.length <= 40);
});

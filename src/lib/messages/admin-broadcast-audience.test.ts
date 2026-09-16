import assert from "node:assert/strict";
import test from "node:test";
import {
  dedupeBroadcastGuardianContacts,
  previewAdminBroadcastAudience,
} from "./admin-broadcast-audience";
import {
  hasAdminBroadcastAudienceSelection,
  parseAdminBroadcastAudience,
} from "./parse-admin-broadcast-audience";
import type { MessageContact } from "./types";

const guardianContact = (
  guardianId: string,
  familyId: string,
  name: string,
): MessageContact => ({
  key: `guardian:${guardianId}`,
  kind: "guardian",
  guardianId,
  familyId,
  name,
  color: "#4A6354",
});

test("dedupeBroadcastGuardianContacts keeps one guardian per family", () => {
  const contacts = dedupeBroadcastGuardianContacts([
    guardianContact("g1", "family-1", "Alex Parent"),
    guardianContact("g2", "family-1", "Jordan Parent"),
    guardianContact("g3", "family-2", "Sam Parent"),
  ]);

  assert.equal(contacts.length, 2);
  assert.deepEqual(
    contacts.map((contact) => contact.guardianId).sort(),
    ["g1", "g3"],
  );
});

test("dedupeBroadcastGuardianContacts dedupes duplicate guardian ids", () => {
  const contacts = dedupeBroadcastGuardianContacts([
    guardianContact("g1", "family-1", "Alex Parent"),
    guardianContact("g1", "family-1", "Alex Parent"),
  ]);

  assert.equal(contacts.length, 1);
  assert.equal(contacts[0]?.guardianId, "g1");
});

test("previewAdminBroadcastAudience returns count and recipient names", () => {
  const preview = previewAdminBroadcastAudience([
    guardianContact("g1", "family-1", "Alex Parent"),
    guardianContact("g2", "family-2", "Sam Parent"),
    guardianContact("g3", "family-3", "Taylor Parent"),
  ]);

  assert.equal(preview.count, 3);
  assert.deepEqual(preview.recipientNames, [
    "Alex Parent",
    "Sam Parent",
    "Taylor Parent",
  ]);
});

test("parseAdminBroadcastAudience normalizes audience arrays", () => {
  assert.deepEqual(
    parseAdminBroadcastAudience({
      programIds: [" prog-1 ", "prog-1", ""],
      classroomIds: ["class-1"],
      gradeValues: ["3", "3"],
      guardianIds: ["guardian-1"],
    }),
    {
      programIds: ["prog-1"],
      classroomIds: ["class-1"],
      gradeValues: ["3"],
      guardianIds: ["guardian-1"],
    },
  );
});

test("hasAdminBroadcastAudienceSelection is false for empty audience", () => {
  assert.equal(
    hasAdminBroadcastAudienceSelection(parseAdminBroadcastAudience({})),
    false,
  );
});

test("hasAdminBroadcastAudienceSelection is true when any filter is set", () => {
  assert.equal(
    hasAdminBroadcastAudienceSelection(
      parseAdminBroadcastAudience({ gradeValues: ["k"] }),
    ),
    true,
  );
});

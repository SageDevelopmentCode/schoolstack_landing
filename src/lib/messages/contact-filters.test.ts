import assert from "node:assert/strict";
import test from "node:test";
import {
  countContactsByAudience,
  filterContactsByAudience,
  filterContactsForPicker,
  getContactPickerEmptyMessage,
} from "./contact-filters";
import type { MessageContact } from "./types";

const contacts: MessageContact[] = [
  {
    key: "guardian:1",
    kind: "guardian",
    guardianId: "1",
    name: "Jane Parent",
    subtitle: "Helene",
    color: "#4A6354",
  },
  {
    key: "staff:1",
    kind: "staff_member",
    staffMemberId: "1",
    name: "Teacher One",
    subtitle: "Lead teacher",
    color: "#5E7C68",
  },
  {
    key: "guardian:2",
    kind: "guardian",
    guardianId: "2",
    name: "Sam Parent",
    subtitle: "Arrow",
    color: "#7FA888",
  },
];

test("countContactsByAudience returns all, parents, and staff counts", () => {
  assert.deepEqual(countContactsByAudience(contacts), {
    all: 3,
    parents: 2,
    staff: 1,
  });
});

test("filterContactsByAudience filters parents and staff", () => {
  assert.equal(filterContactsByAudience(contacts, "parents").length, 2);
  assert.equal(filterContactsByAudience(contacts, "staff").length, 1);
  assert.equal(filterContactsByAudience(contacts, "all").length, 3);
});

test("filterContactsForPicker applies audience then search", () => {
  const filtered = filterContactsForPicker(contacts, "parents", "helene");
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0]?.name, "Jane Parent");
});

test("getContactPickerEmptyMessage varies by audience and search", () => {
  assert.equal(getContactPickerEmptyMessage("all", true), "No contacts match this filter");
  assert.equal(getContactPickerEmptyMessage("parents", false), "No parents available");
  assert.equal(getContactPickerEmptyMessage("staff", false), "No staff available");
});

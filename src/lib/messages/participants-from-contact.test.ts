import assert from "node:assert/strict";
import test from "node:test";
import { contactKeyForThread } from "./participants-from-contact";

const guardianOfficeThread = [
  {
    kind: "guardian" as const,
    familyId: null,
    guardianId: "guardian-julius",
    staffMemberId: null,
  },
  {
    kind: "school_office" as const,
    familyId: null,
    guardianId: null,
    staffMemberId: null,
  },
];

const guardianStaffThread = [
  {
    kind: "guardian" as const,
    familyId: null,
    guardianId: "guardian-julius",
    staffMemberId: null,
  },
  {
    kind: "staff_member" as const,
    familyId: null,
    guardianId: null,
    staffMemberId: "staff-1",
  },
];

test("contactKeyForThread uses guardian id for admin guardian+office threads", () => {
  assert.equal(
    contactKeyForThread(guardianOfficeThread, "admin", {}),
    "guardian:guardian-julius",
  );
});

test("contactKeyForThread uses distinct key for admin guardian+staff threads", () => {
  assert.equal(
    contactKeyForThread(guardianStaffThread, "admin", {}),
    "guardian:guardian-julius:staff:staff-1",
  );
});

test("guardian picker key matches office thread but not staff thread for admin", () => {
  const pickerKey = "guardian:guardian-julius";

  assert.equal(contactKeyForThread(guardianOfficeThread, "admin", {}), pickerKey);
  assert.notEqual(contactKeyForThread(guardianStaffThread, "admin", {}), pickerKey);
});

test("contactKeyForThread keeps guardian id for teacher guardian+staff threads", () => {
  assert.equal(
    contactKeyForThread(guardianStaffThread, "teacher", { staffMemberId: "staff-1" }),
    "guardian:guardian-julius",
  );
});

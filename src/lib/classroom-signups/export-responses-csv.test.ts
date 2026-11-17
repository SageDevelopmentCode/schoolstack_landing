import assert from "node:assert/strict";
import test from "node:test";
import { buildSignupResponsesCsv, describeSignupSelection, signupResponsesCsvFilename } from "./export-responses-csv";
import type { ClassroomSignup, ClassroomSignupResponse } from "./types";

const signup = {
  title: "Field Trip: Chaperones!",
  signupType: "time_slots",
  config: { slots: [{ id: "s1", label: "Morning bus" }, { id: "s2", label: "Afternoon bus" }] },
} as unknown as ClassroomSignup;

function response(overrides: Partial<ClassroomSignupResponse>): ClassroomSignupResponse {
  return {
    id: "r",
    signupId: "x",
    familyId: "f",
    familyName: "Rivera Family",
    guardianName: "Maria Rivera",
    guardianEmail: "maria@example.com",
    studentId: "st",
    studentName: "Emma Rivera",
    selectedSlotIds: ["s1", "s2"],
    selectedRoleIds: [],
    note: null,
    status: "confirmed",
    createdAt: "2026-11-02T15:00:00Z",
    updatedAt: "2026-11-02T15:00:00Z",
    ...overrides,
  };
}

test("lists confirmed responses with their slots, quoted", () => {
  const csv = buildSignupResponsesCsv(signup, [
    response({ note: 'Can bring "snacks"' }),
    response({ familyName: "Gone Family", status: "withdrawn" }),
  ]);
  const lines = csv.split("\r\n");
  assert.equal(lines.length, 2);
  assert.equal(lines[0], '"Family","Guardian","Email","Student","Signed up for","Note","Submitted"');
  assert.equal(
    lines[1],
    '"Rivera Family","Maria Rivera","maria@example.com","Emma Rivera","Morning bus, Afternoon bus","Can bring ""snacks""","2026-11-02"',
  );
});

test("neutralises formula-looking cells", () => {
  const csv = buildSignupResponsesCsv(signup, [response({ familyName: "=HYPERLINK(1)" })]);
  assert.match(csv, /"'=HYPERLINK\(1\)"/);
});

test("describes roles and open signups", () => {
  const roles = { signupType: "roles", config: { roles: [{ id: "r1", name: "Snack helper" }] } } as unknown as ClassroomSignup;
  assert.equal(describeSignupSelection(roles, response({ selectedRoleIds: ["r1"] })), "Snack helper");
  const open = { signupType: "open", config: {} } as unknown as ClassroomSignup;
  assert.equal(describeSignupSelection(open, response({})), "Signed up");
});

test("filename is a slug of the title", () => {
  assert.equal(signupResponsesCsvFilename(signup), "field-trip-chaperones-responses.csv");
  assert.equal(signupResponsesCsvFilename({ title: "!!!" }), "signup-responses.csv");
});

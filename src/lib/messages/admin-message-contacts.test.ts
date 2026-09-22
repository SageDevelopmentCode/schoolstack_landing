import assert from "node:assert/strict";
import test from "node:test";
import {
  formatEnrolledStudentFirstNames,
  type AdminEnrolledStudentSummary,
} from "@/lib/school-admin/enrolled-students";
import {
  resolveGuardianProfilePhotoUrl,
  toMessageStudentRefs,
  toMessageStudentSummaries,
} from "./mappers";

function slimStudentSummary(
  overrides: Partial<AdminEnrolledStudentSummary> = {},
): AdminEnrolledStudentSummary {
  return {
    id: "student-1",
    firstName: "Jaxon",
    lastName: "Bramwell",
    grade: "1",
    dateOfBirth: null,
    status: "active",
    familyId: "family-1",
    familyName: "Bramwell Family",
    primaryContactName: null,
    primaryContactEmail: null,
    programNames: ["Primary"],
    classroomNames: ["Oak Room"],
    classroomIds: ["classroom-1"],
    enrolledAt: "2026-01-01",
    assignedTeachers: [],
    assignedTeacherNames: "",
    profilePhotoUrl: "https://example.com/jaxon.jpg",
    hasStandingHealthItems: false,
    ...overrides,
  };
}

test("slim enrollment summaries produce guardian subtitle first names", () => {
  const subtitle = formatEnrolledStudentFirstNames([
    slimStudentSummary(),
    slimStudentSummary({
      id: "student-2",
      firstName: "Helene",
      lastName: "Bramwell",
      profilePhotoUrl: null,
    }),
  ]);

  assert.equal(subtitle, "Jaxon · Helene");
});

test("slim enrollment summaries keep student refs for new thread placeholders", () => {
  const students = [slimStudentSummary()];
  assert.deepEqual(toMessageStudentRefs(students), [
    { id: "student-1", name: "Jaxon Bramwell" },
  ]);
  assert.equal(toMessageStudentSummaries(students)[0]?.programNames[0], "Primary");
  assert.deepEqual(toMessageStudentSummaries(students)[0]?.assignedTeachers, []);
});

test("slim enrollment summaries support guardian photo fallback", () => {
  const photo = resolveGuardianProfilePhotoUrl(null, [slimStudentSummary()]);
  assert.equal(photo, "https://example.com/jaxon.jpg");
});

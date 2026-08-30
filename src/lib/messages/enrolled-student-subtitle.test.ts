import assert from "node:assert/strict";
import test from "node:test";
import {
  formatEnrolledStudentSubtitle,
  type AdminEnrolledStudentSummary,
} from "@/lib/school-admin/enrolled-students";

function buildSummary(
  overrides: Partial<AdminEnrolledStudentSummary> = {},
): AdminEnrolledStudentSummary {
  return {
    id: "student-1",
    firstName: "Julia",
    lastName: "Cecilia",
    grade: "2",
    dateOfBirth: null,
    status: "active",
    familyId: "family-1",
    familyName: "Cecilia Family",
    primaryContactName: null,
    primaryContactEmail: null,
    programNames: [],
    classroomNames: [],
    enrolledAt: "2026-01-01",
    assignedTeachers: [],
    assignedTeacherNames: "",
    profilePhotoUrl: null,
    ...overrides,
  };
}

test("formatEnrolledStudentSubtitle joins student names in order", () => {
  const subtitle = formatEnrolledStudentSubtitle([
    buildSummary({ id: "1", firstName: "Caleb", lastName: "Cecilia" }),
    buildSummary({ id: "2", firstName: "Jon", lastName: "Cecilia" }),
    buildSummary({ id: "3", firstName: "Julia", lastName: "Cecilia" }),
  ]);

  assert.equal(subtitle, "Caleb Cecilia · Jon Cecilia · Julia Cecilia");
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  firstStudentProfilePhotoUrl,
  guardianDisplayPhotoUrl,
  resolveGuardianProfilePhotoUrl,
  type ParticipantDisplayContext,
} from "./mappers";

test("firstStudentProfilePhotoUrl returns first child with a photo", () => {
  const photo = firstStudentProfilePhotoUrl([
    { profilePhotoUrl: null },
    { profilePhotoUrl: "  " },
    { profilePhotoUrl: "https://example.com/child.jpg" },
    { profilePhotoUrl: "https://example.com/other.jpg" },
  ]);

  assert.equal(photo, "https://example.com/child.jpg");
});

test("resolveGuardianProfilePhotoUrl prefers guardian photo", () => {
  const photo = resolveGuardianProfilePhotoUrl("https://example.com/parent.jpg", [
    { profilePhotoUrl: "https://example.com/child.jpg" },
  ]);

  assert.equal(photo, "https://example.com/parent.jpg");
});

test("resolveGuardianProfilePhotoUrl falls back to child photo", () => {
  const photo = resolveGuardianProfilePhotoUrl(null, [
    { profilePhotoUrl: null },
    { profilePhotoUrl: "https://example.com/child.jpg" },
  ]);

  assert.equal(photo, "https://example.com/child.jpg");
});

test("resolveGuardianProfilePhotoUrl returns null when no photos exist", () => {
  const photo = resolveGuardianProfilePhotoUrl(null, [{ profilePhotoUrl: null }]);
  assert.equal(photo, null);
});

test("guardianDisplayPhotoUrl uses enrolled students for child fallback", () => {
  const context: ParticipantDisplayContext = {
    families: new Map(),
    staffMembers: new Map(),
    guardians: new Map([
      [
        "guardian-1",
        {
          firstName: "Jane",
          lastName: "Doe",
          familyId: "family-1",
          profilePhotoUrl: null,
        },
      ],
    ]),
    familyPrimaryGuardianIds: new Map(),
    familyFirstGuardianIds: new Map(),
    familyEnrolledStudents: new Map([
      [
        "family-1",
        [
          {
            id: "student-1",
            firstName: "Helene",
            lastName: "Doe",
            grade: "1",
            dateOfBirth: null,
            status: "active",
            familyId: "family-1",
            familyName: "Doe Family",
            primaryContactName: null,
            primaryContactEmail: null,
            programNames: [],
            classroomNames: [],
            classroomIds: [],
            enrolledAt: "2026-01-01",
            assignedTeachers: [],
            assignedTeacherNames: "",
            profilePhotoUrl: "https://example.com/helene.jpg",
            hasStandingHealthItems: false,
          },
        ],
      ],
    ]),
    schoolOfficeLabel: "School Office",
    currentUserId: "user-1",
  };

  assert.equal(
    guardianDisplayPhotoUrl("guardian-1", context),
    "https://example.com/helene.jpg",
  );
});

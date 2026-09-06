import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  attachContactGuardiansToCoopFamilies,
  formatProgramCoopLearnerLine,
  groupEnrollmentsIntoCoopFamilies,
} from "./program-coop-directory";

describe("groupEnrollmentsIntoCoopFamilies", () => {
  it("groups learners by family and puts the current family first", () => {
    const families = groupEnrollmentsIntoCoopFamilies(
      [
        {
          studentId: "student-b",
          firstName: "Mia",
          lastName: "Rivera",
          grade: "1",
          profilePhotoUrl: "https://example.com/mia.jpg",
          familyId: "family-b",
          familyName: "The Rivera family",
        },
        {
          studentId: "student-a",
          firstName: "Kinder",
          lastName: "Childy",
          grade: "k",
          profilePhotoUrl: null,
          familyId: "family-a",
          familyName: "The Cecilia family",
        },
        {
          studentId: "student-b2",
          firstName: "Leo",
          lastName: "Rivera",
          grade: "3",
          profilePhotoUrl: null,
          familyId: "family-b",
          familyName: "The Rivera family",
        },
      ],
      "family-a",
    );

    assert.equal(families.length, 2);
    assert.equal(families[0]?.familyId, "family-a");
    assert.equal(families[0]?.isCurrentFamily, true);
    assert.equal(families[0]?.contactGuardianId, null);
    assert.deepEqual(
      families[0]?.learners.map((learner) => learner.firstName),
      ["Kinder"],
    );
    assert.equal(families[0]?.learners[0]?.profilePhotoUrl, null);
    assert.deepEqual(
      families[1]?.learners.map((learner) => learner.firstName),
      ["Leo", "Mia"],
    );
    assert.equal(
      families[1]?.learners.find((learner) => learner.firstName === "Mia")
        ?.profilePhotoUrl,
      "https://example.com/mia.jpg",
    );
  });

  it("falls back to a last-name family label when families.name is missing", () => {
    const families = groupEnrollmentsIntoCoopFamilies(
      [
        {
          studentId: "student-c",
          firstName: "Sam",
          lastName: "Nguyen",
          grade: null,
          profilePhotoUrl: "https://example.com/sam.jpg",
          familyId: "family-c",
          familyName: null,
        },
      ],
      "family-other",
    );

    assert.equal(families[0]?.familyName, "The Nguyen family");
    assert.equal(families[0]?.learners[0]?.grade, null);
    assert.equal(
      families[0]?.learners[0]?.profilePhotoUrl,
      "https://example.com/sam.jpg",
    );
  });

  it("returns an empty list when there are no enrollments", () => {
    assert.deepEqual(groupEnrollmentsIntoCoopFamilies([], "family-a"), []);
  });
});

describe("attachContactGuardiansToCoopFamilies", () => {
  it("attaches primary guardian ids for other families only", () => {
    const families = attachContactGuardiansToCoopFamilies(
      [
        {
          familyId: "family-a",
          familyName: "The Cecilia family",
          isCurrentFamily: true,
          contactGuardianId: null,
          learners: [],
        },
        {
          familyId: "family-b",
          familyName: "The Rivera family",
          isCurrentFamily: false,
          contactGuardianId: null,
          learners: [],
        },
      ],
      {
        familyPrimaryGuardianIds: new Map([["family-b", "guardian-rivera"]]),
        familyFirstGuardianIds: new Map([["family-b", "guardian-rivera-first"]]),
      },
    );

    assert.equal(families[0]?.contactGuardianId, null);
    assert.equal(families[1]?.contactGuardianId, "guardian-rivera");
  });
});

describe("formatProgramCoopLearnerLine", () => {
  it("formats learner lines with and without grades", () => {
    assert.equal(
      formatProgramCoopLearnerLine({
        studentId: "student-a",
        firstName: "Kinder",
        grade: "k",
        profilePhotoUrl: null,
      }),
      "Kinder · Grade k",
    );
    assert.equal(
      formatProgramCoopLearnerLine({
        studentId: "student-b",
        firstName: "Sam",
        grade: null,
        profilePhotoUrl: null,
      }),
      "Sam",
    );
  });
});

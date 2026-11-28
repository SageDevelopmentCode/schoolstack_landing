import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ProgramParentPortalSettings } from "@/lib/admissions/program-parent-portal";
import {
  assertCoopProgramInAccess,
  resolveCoopFamilyFromAccess,
} from "@/lib/parent-portal/parent-coop-access";
import type { ParentPortalAccess } from "@/lib/parent-portal/parent-portal-access-rpc";

const PROGRAM = "prog-coop";

function accessWithSettings(
  settings: Partial<ProgramParentPortalSettings>,
  programId = PROGRAM,
): Pick<ParentPortalAccess, "enrolledPrograms"> {
  return {
    enrolledPrograms: [
      {
        id: programId,
        name: "Co-op",
        portal_slug: "coop",
        parent_portal_settings: settings as ProgramParentPortalSettings,
      },
    ],
  };
}

const FAMILIES = [
  { familyId: "fam-a", familyName: "The Avery family" },
  { familyId: "fam-b", familyName: "The Brook family" },
  { familyId: "fam-c", familyName: "Family" },
];

describe("assertCoopProgramInAccess", () => {
  it("passes for an isolated coop-mode program in the snapshot", () => {
    assert.doesNotThrow(() =>
      assertCoopProgramInAccess(
        accessWithSettings({ mode: "isolated", coop_mode: true }),
        PROGRAM,
      ),
    );
  });

  it("throws coop_not_enabled when the program is not in coop mode", () => {
    assert.throws(
      () =>
        assertCoopProgramInAccess(
          accessWithSettings({ mode: "isolated", coop_mode: false }),
          PROGRAM,
        ),
      { message: "coop_not_enabled" },
    );
    assert.throws(
      () => assertCoopProgramInAccess(accessWithSettings({ mode: "inherit" }), PROGRAM),
      { message: "coop_not_enabled" },
    );
  });

  it("throws coop_not_enabled when the program is not in the snapshot", () => {
    assert.throws(
      () =>
        assertCoopProgramInAccess(
          accessWithSettings({ mode: "isolated", coop_mode: true }, "other-program"),
          PROGRAM,
        ),
      { message: "coop_not_enabled" },
    );
  });
});

describe("resolveCoopFamilyFromAccess", () => {
  it("throws when none of the parent's families is enrolled", () => {
    assert.throws(() => resolveCoopFamilyFromAccess(FAMILIES, ["fam-x"]), {
      message: "No enrolled family found for this program.",
    });
    assert.throws(() => resolveCoopFamilyFromAccess([], ["fam-a"]), {
      message: "No enrolled family found for this program.",
    });
  });

  it("returns the one enrolled family and the full name map", () => {
    const result = resolveCoopFamilyFromAccess(FAMILIES, ["fam-x", "fam-b"]);
    assert.equal(result.familyId, "fam-b");
    assert.equal(result.familyName, "The Brook family");
    assert.deepEqual(Object.fromEntries(result.familyNameMap), {
      "fam-a": "The Avery family",
      "fam-b": "The Brook family",
      "fam-c": "Family",
    });
  });

  it("throws when more than one of the parent's families is enrolled", () => {
    assert.throws(() => resolveCoopFamilyFromAccess(FAMILIES, ["fam-a", "fam-c"]), {
      message: "Multiple families are enrolled in this program. Contact your school for help.",
    });
  });
});

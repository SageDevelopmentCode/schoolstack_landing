import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { areAuthorizedPickupContactsEquivalent } from "./contact-equivalence";

describe("areAuthorizedPickupContactsEquivalent", () => {
  it("matches contacts with equivalent names and phone formatting", () => {
    assert.equal(
      areAuthorizedPickupContactsEquivalent(
        { firstName: "Maria", lastName: "Lopez", phone: "(562) - 332 - 4611" },
        { firstName: " maria ", lastName: "lopez", phone: "5623324611" },
      ),
      true,
    );
  });

  it("treats missing phones as equivalent", () => {
    assert.equal(
      areAuthorizedPickupContactsEquivalent(
        { firstName: "Maria", lastName: "Lopez", phone: null },
        { firstName: "Maria", lastName: "Lopez", phone: "" },
      ),
      true,
    );
  });

  it("rejects different names or phone numbers", () => {
    assert.equal(
      areAuthorizedPickupContactsEquivalent(
        { firstName: "Maria", lastName: "Lopez", phone: "5623324611" },
        { firstName: "Maria", lastName: "Lopez", phone: "5623324612" },
      ),
      false,
    );
    assert.equal(
      areAuthorizedPickupContactsEquivalent(
        { firstName: "Maria", lastName: "Lopez", phone: "5623324611" },
        { firstName: "Mario", lastName: "Lopez", phone: "5623324611" },
      ),
      false,
    );
  });
});
